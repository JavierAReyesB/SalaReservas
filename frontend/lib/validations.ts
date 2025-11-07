import { z } from "zod"

export const reservaSchema = z
  .object({
    sala: z.enum(["andromeda", "boreal", "cenit", "delta", "eclipse"], {
      required_error: "Debes seleccionar una sala",
    }),
    fecha: z.string().min(1, "La fecha es requerida"),
    horaInicio: z.string().min(1, "La hora de inicio es requerida"),
    horaFin: z.string().min(1, "La hora de fin es requerida"),
    nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    correo: z.string().email("Correo electrónico inválido"),
  })
  .refine(
    (data) => {
      // Validate that end time is after start time
      return data.horaFin > data.horaInicio
    },
    {
      message: "La hora de fin debe ser posterior a la hora de inicio",
      path: ["horaFin"],
    },
  )
  .refine(
    (data) => {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const reservaDate = new Date(data.fecha)
      const reservaDateTime = new Date(`${data.fecha}T${data.horaInicio}`)

      // If the reservation date is in the future (not today), allow any time
      if (reservaDate > today) {
        return true
      }

      // If the reservation is for today, check that the time is in the future
      if (reservaDate.getTime() === today.getTime()) {
        return reservaDateTime > now
      }

      // If the date is in the past, reject
      return false
    },
    {
      message: "La fecha y hora deben ser en el futuro",
      path: ["fecha"],
    },
  )
