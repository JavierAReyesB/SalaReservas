export type SalaId = "andromeda" | "boreal" | "cenit" | "delta" | "eclipse"

export interface Sala {
  id: SalaId
  nombre: string
  capacidad: number
  descripcion?: string
  imagen?: string
}

export interface Reserva {
  id: string
  sala: SalaId
  fecha: string // YYYY-MM-DD
  horaInicio: string // HH:mm
  horaFin: string // HH:mm
  nombre: string
  correo: string
  createdAt?: string
}

export interface ReservaFormData {
  sala: SalaId
  fecha: string
  horaInicio: string
  horaFin: string
  nombre: string
  correo: string
}
