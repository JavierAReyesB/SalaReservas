import { z } from 'zod';

export const createReservationSchema = z.object({
  roomId: z.string().min(1, 'roomId is required'),
  fullName: z.string().min(1, 'fullName is required').max(100),
  email: z.string().email('Invalid email format'),
  // Option A: local date + time
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD').optional(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'startTime must be HH:mm').optional(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'endTime must be HH:mm').optional(),
  // Option B: ISO timestamps
  startISO: z.string().datetime().optional(),
  endISO: z.string().datetime().optional(),
}).refine(
  (data) => {
    // Must provide either (date + times) or (ISO timestamps)
    const hasLocal = data.date && data.startTime && data.endTime;
    const hasISO = data.startISO && data.endISO;
    return hasLocal || hasISO;
  },
  {
    message: 'Must provide either (date, startTime, endTime) or (startISO, endISO)',
  }
);

export const reservationQuerySchema = z.object({
  roomId: z.string().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});
