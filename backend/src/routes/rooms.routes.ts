import { Router } from 'express';
import { RoomsController } from '../controllers/rooms.controller';

export const roomsRouter = Router();

roomsRouter.get('/', RoomsController.list);
