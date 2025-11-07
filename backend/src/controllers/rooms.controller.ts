import { Request, Response } from 'express';
import { collections } from '../db/mongo';

export class RoomsController {
  static async list(req: Request, res: Response) {
    try {
      const rooms = await collections.rooms
        .find({ isActive: true })
        .sort({ name: 1 })
        .toArray();

      res.json(rooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      res.status(500).json({ error: 'Failed to fetch rooms' });
    }
  }
}
