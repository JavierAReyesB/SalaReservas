import type { Reserva, ReservaFormData } from "../types"

const STORAGE_KEY = "sala-reservas"

// Helper to get reservas from localStorage
function loadReservasFromStorage(): Reserva[] {
  if (typeof window === "undefined") return []

  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) {
    // Initialize with some sample data for demo
    const sampleData: Reserva[] = [
      {
        id: "sample-1",
        sala: "andromeda",
        fecha: new Date().toISOString().split("T")[0],
        horaInicio: "10:00",
        horaFin: "12:00",
        nombre: "María García",
        correo: "maria@ejemplo.com",
        createdAt: new Date().toISOString(),
      },
      {
        id: "sample-2",
        sala: "boreal",
        fecha: new Date().toISOString().split("T")[0],
        horaInicio: "14:00",
        horaFin: "16:00",
        nombre: "Juan Pérez",
        correo: "juan@ejemplo.com",
        createdAt: new Date().toISOString(),
      },
    ]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleData))
    return sampleData
  }

  try {
    return JSON.parse(stored)
  } catch (e) {
    console.error("Error loading reservas:", e)
    return []
  }
}

function saveReservasToStorage(reservas: Reserva[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reservas))
  }
}

export async function getReservas(sala?: string, fecha?: string): Promise<Reserva[]> {
  const allReservas = loadReservasFromStorage()
  let filtered = [...allReservas]
  if (sala) {
    filtered = filtered.filter((r) => r.sala === sala)
  }
  if (fecha) {
    filtered = filtered.filter((r) => r.fecha === fecha)
  }
  return filtered.sort((a, b) => {
    if (a.fecha !== b.fecha) return a.fecha.localeCompare(b.fecha)
    return a.horaInicio.localeCompare(b.horaInicio)
  })
}

export async function createReserva(data: ReservaFormData): Promise<Reserva> {
  // Check for conflicts
  const existingReservas = await getReservas(data.sala, data.fecha)
  const hasConflict = existingReservas.some((r) => {
    const newStart = data.horaInicio
    const newEnd = data.horaFin
    const existingStart = r.horaInicio
    const existingEnd = r.horaFin
    return newStart < existingEnd && newEnd > existingStart
  })

  if (hasConflict) {
    throw new Error("Ya existe una reserva en ese horario. Por favor, elige otro horario.")
  }

  // Create new reservation
  const newReserva: Reserva = {
    ...data,
    id: `reserva-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
  }

  // Load all reservas, add new one, and save
  const allReservas = loadReservasFromStorage()
  allReservas.push(newReserva)
  saveReservasToStorage(allReservas)

  console.log("✅ Reserva creada:", newReserva)
  return newReserva
}

export async function deleteReserva(id: string): Promise<void> {
  const allReservas = loadReservasFromStorage()
  const filtered = allReservas.filter((r) => r.id !== id)
  saveReservasToStorage(filtered)
  console.log("🗑️ Reserva eliminada:", id)
}
