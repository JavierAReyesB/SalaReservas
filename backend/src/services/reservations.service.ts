import { ObjectId } from 'mongodb';
import { collections } from '../db/mongo';
import type { Reservation, CreateReservationPayload, ReservationQuery } from '../types';
import { parseLocalDateTimeToUTC, parseISOToUTC, validateTimeRange } from '../utils/time';

export class ReservationService {
  /**
   * Check if a time slot has conflicts with existing reservations
   */
  static async hasConflict(roomId: ObjectId, start: Date, end: Date, excludeId?: ObjectId): Promise<boolean> {
    const query: any = {
      roomId,
      $or: [
        // Existing reservation starts before new ends AND ends after new starts
        {
          start: { $lt: end },
          end: { $gt: start },
        },
      ],
    };

    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const conflict = await collections.reservations.findOne(query);
    return conflict !== null;
  }

  /**
   * Create a new reservation
   */
  static async create(payload: CreateReservationPayload): Promise<Reservation> {
    // Parse dates
    let start: Date;
    let end: Date;

    if (payload.startISO && payload.endISO) {
      start = parseISOToUTC(payload.startISO);
      end = parseISOToUTC(payload.endISO);
    } else if (payload.date && payload.startTime && payload.endTime) {
      start = parseLocalDateTimeToUTC(payload.date, payload.startTime);
      end = parseLocalDateTimeToUTC(payload.date, payload.endTime);
    } else {
      throw new Error('Invalid date/time format');
    }

    // Validate time range
    if (!validateTimeRange(start, end)) {
      throw new Error('Start time must be before end time');
    }

    // Find room by string id (e.g., "andromeda") or ObjectId
    let room = await collections.rooms.findOne({ id: payload.roomId, isActive: true });

    if (!room) {
      // Try as ObjectId if string id didn't work
      try {
        const roomObjectId = new ObjectId(payload.roomId);
        room = await collections.rooms.findOne({ _id: roomObjectId, isActive: true });
      } catch {
        // Invalid ObjectId format
      }
    }

    if (!room) {
      throw new Error('Room not found or is inactive');
    }

    const roomId = room._id!;

    // Check for conflicts
    const hasConflict = await this.hasConflict(roomId, start, end);
    if (hasConflict) {
      throw new Error('Time slot conflicts with existing reservation');
    }

    // Create reservation
    const reservation: Omit<Reservation, '_id'> = {
      roomId,
      fullName: payload.fullName,
      email: payload.email,
      start,
      end,
      createdAt: new Date(),
    };

    const result = await collections.reservations.insertOne(reservation as any);

    return {
      ...reservation,
      _id: result.insertedId,
    };
  }

  /**
   * List reservations with optional filters
   */
  static async list(query: ReservationQuery): Promise<Reservation[]> {
    const filter: any = {};

    if (query.roomId) {
      // roomId can be either the string id (e.g., "andromeda") or ObjectId
      // First, try to find the room by its string id
      const room = await collections.rooms.findOne({ id: query.roomId });
      if (room && room._id) {
        filter.roomId = room._id;
      } else {
        // If not found by string id, try as ObjectId
        try {
          filter.roomId = new ObjectId(query.roomId);
        } catch {
          // Invalid ObjectId and not a valid room id - return empty results
          return [];
        }
      }
    }

    if (query.from || query.to) {
      filter.start = {};
      if (query.from) {
        filter.start.$gte = parseISOToUTC(query.from);
      }
      if (query.to) {
        filter.start.$lte = parseISOToUTC(query.to);
      }
    }

    return await collections.reservations
      .find(filter)
      .sort({ start: 1 })
      .toArray();
  }

  /**
   * Delete a reservation by ID
   */
  static async delete(id: string): Promise<boolean> {
    const result = await collections.reservations.deleteOne({
      _id: new ObjectId(id),
    });
    return result.deletedCount > 0;
  }
}
