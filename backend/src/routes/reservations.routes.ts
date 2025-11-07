import { Router } from 'express';
import { ReservationsController } from '../controllers/reservations.controller';

export const reservationsRouter = Router();

reservationsRouter.post('/', ReservationsController.create);
reservationsRouter.get('/', ReservationsController.list);
reservationsRouter.delete('/:id', ReservationsController.delete);
