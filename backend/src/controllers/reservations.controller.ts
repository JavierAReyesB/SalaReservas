import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { ReservationService } from '../services/reservations.service';
import { sendConfirmationEmail, sendCancellationEmail } from '../services/email.service';
import { collections } from '../db/mongo';
import { createReservationSchema, reservationQuerySchema } from '../schemas/reservations.schema';

export class ReservationsController {
  static async create(req: Request, res: Response) {
    try {
      const validation = createReservationSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: 'Validation failed',
          details: validation.error.format(),
        });
      }

      const reservation = await ReservationService.create(validation.data);

      // Send confirmation email asynchronously (don't wait for it)
      const room = await collections.rooms.findOne({ _id: reservation.roomId });
      if (room) {
        sendConfirmationEmail({ reservation, room }).catch((err) => {
          console.error('Failed to send confirmation email:', err);
        });
      }

      res.status(201).json(reservation);
    } catch (error: any) {
      console.error('Error creating reservation:', error);

      if (error.message.includes('conflict')) {
        return res.status(409).json({ error: error.message });
      }

      if (error.message.includes('not found')) {
        return res.status(404).json({ error: error.message });
      }

      res.status(500).json({ error: 'Failed to create reservation' });
    }
  }

  static async list(req: Request, res: Response) {
    try {
      const validation = reservationQuerySchema.safeParse(req.query);
      if (!validation.success) {
        return res.status(400).json({
          error: 'Invalid query parameters',
          details: validation.error.format(),
        });
      }

      const reservations = await ReservationService.list(validation.data);
      res.json(reservations);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      res.status(500).json({ error: 'Failed to fetch reservations' });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Validate and convert ID to ObjectId
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid reservation ID format' });
      }

      const objectId = new ObjectId(id);

      // Get reservation before deleting to send cancellation email
      const reservation = await collections.reservations.findOne({ _id: objectId });

      if (!reservation) {
        return res.status(404).json({ error: 'Reservation not found' });
      }

      // Get room information
      const room = await collections.rooms.findOne({ _id: reservation.roomId });

      // Delete the reservation
      const deleted = await ReservationService.delete(id);

      if (!deleted) {
        return res.status(404).json({ error: 'Reservation not found' });
      }

      // Send cancellation email asynchronously
      if (room) {
        sendCancellationEmail(reservation.email, room, new Date(reservation.start)).catch((err) => {
          console.error('Failed to send cancellation email:', err);
        });
      }

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting reservation:', error);
      res.status(500).json({ error: 'Failed to delete reservation' });
    }
  }
}
