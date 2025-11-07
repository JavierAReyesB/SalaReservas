import { ObjectId } from 'mongodb';

export interface Room {
  _id?: ObjectId;
  id: string; // andromeda, boreal, cenit, delta, eclipse
  name: string; // Sala Andrómeda, Sala Boreal, etc.
  capacity: number;
  description: string;
  image: string;
  isActive: boolean;
}

export interface Reservation {
  _id?: ObjectId;
  roomId: ObjectId;
  fullName: string;
  email: string;
  start: Date;
  end: Date;
  createdAt: Date;
}

export interface CreateReservationPayload {
  roomId: string;
  fullName: string;
  email: string;
  // Option A: local date + time
  date?: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  // Option B: ISO 8601
  startISO?: string;
  endISO?: string;
}

export interface ReservationQuery {
  roomId?: string;
  from?: string; // ISO 8601
  to?: string; // ISO 8601
}
