import type { Reserva, ReservaFormData } from "../types"

// Use Next.js rewrite for same-origin requests (avoids CORS)
const API_URL = typeof window !== "undefined" ? "/api" : "http://localhost:4000"

// Backend types (matching backend schema)
interface BackendRoom {
  _id: string
  id: string
  name: string
  capacity: number
  description: string
  image: string
  isActive: boolean
}

interface BackendReservation {
  _id: string
  roomId: string
  fullName: string
  email: string
  start: string // ISO 8601
  end: string // ISO 8601
  createdAt: string
}

// Helper to convert backend reservation to frontend format
function backendToFrontend(backendReserva: BackendReservation, roomId?: string): Reserva {
  const startDate = new Date(backendReserva.start)
  const endDate = new Date(backendReserva.end)

  return {
    id: backendReserva._id,
    sala: roomId || backendReserva.roomId,
    fecha: startDate.toISOString().split("T")[0],
    horaInicio: startDate.toTimeString().slice(0, 5),
    horaFin: endDate.toTimeString().slice(0, 5),
    nombre: backendReserva.fullName,
    correo: backendReserva.email,
    createdAt: backendReserva.createdAt,
  }
}

// Helper to convert frontend format to backend format
function frontendToBackend(data: ReservaFormData) {
  // Create ISO timestamps from local date + time
  const startISO = `${data.fecha}T${data.horaInicio}:00.000Z`
  const endISO = `${data.fecha}T${data.horaFin}:00.000Z`

  return {
    roomId: data.sala,
    fullName: data.nombre,
    email: data.correo,
    startISO,
    endISO,
  }
}

export async function getReservas(sala?: string, fecha?: string): Promise<Reserva[]> {
  try {
    // Build query params
    const params = new URLSearchParams()
    if (sala) params.append("roomId", sala)
    if (fecha) {
      // Convert date to ISO range (start and end of day)
      const fromISO = `${fecha}T00:00:00.000Z`
      const toISO = `${fecha}T23:59:59.999Z`
      params.append("from", fromISO)
      params.append("to", toISO)
    }

    const url = `${API_URL}/reservations?${params.toString()}`

    // 🔍 DIAGNOSTIC: Log request details
    console.log("🔍 [getReservas] Request details:", {
      origin: typeof window !== "undefined" ? window.location.origin : "SSR",
      finalURL: url,
      params: Object.fromEntries(params.entries()),
    })

    const response = await fetch(url)

    // 🔍 DIAGNOSTIC: Log response details
    console.log("📥 [getReservas] Response details:", {
      status: response.status,
      statusText: response.statusText,
      headers: {
        "content-type": response.headers.get("content-type"),
        "access-control-allow-origin": response.headers.get("access-control-allow-origin"),
      },
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error("❌ [getReservas] Error response body:", errorBody)
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`)
    }

    const backendReservas: BackendReservation[] = await response.json()
    console.log("✅ [getReservas] Received reservations:", backendReservas.length)

    // Convert backend format to frontend format
    return backendReservas.map((r) => backendToFrontend(r)).sort((a, b) => {
      if (a.fecha !== b.fecha) return a.fecha.localeCompare(b.fecha)
      return a.horaInicio.localeCompare(b.horaInicio)
    })
  } catch (error) {
    console.error("❌ [getReservas] Fatal error:", error)
    throw new Error("No se pudieron cargar las reservas. Verifica que el backend esté corriendo.")
  }
}

export async function createReserva(data: ReservaFormData): Promise<Reserva> {
  try {
    const payload = frontendToBackend(data)
    const url = `${API_URL}/reservations`

    // 🔍 DIAGNOSTIC: Log request details
    console.log("📤 [createReserva] Request details:", {
      origin: typeof window !== "undefined" ? window.location.origin : "SSR",
      finalURL: url,
      payload,
    })

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    // 🔍 DIAGNOSTIC: Log response details
    console.log("📥 [createReserva] Response details:", {
      status: response.status,
      statusText: response.statusText,
      headers: {
        "content-type": response.headers.get("content-type"),
        "access-control-allow-origin": response.headers.get("access-control-allow-origin"),
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      console.error("❌ [createReserva] Error response:", errorData)

      if (response.status === 409) {
        throw new Error(errorData?.message || "Ya existe una reserva en ese horario. Por favor, elige otro horario.")
      }

      if (response.status === 404) {
        throw new Error(errorData?.message || "La sala seleccionada no existe.")
      }

      if (response.status === 400) {
        throw new Error(errorData?.message || "Datos de reserva inválidos.")
      }

      throw new Error(errorData?.message || `Error al crear reserva: ${response.status}`)
    }

    const backendReserva: BackendReservation = await response.json()
    console.log("✅ [createReserva] Reservation created:", backendReserva)

    return backendToFrontend(backendReserva, data.sala)
  } catch (error) {
    console.error("❌ [createReserva] Fatal error:", error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error("No se pudo crear la reserva. Verifica que el backend esté corriendo.")
  }
}

export async function deleteReserva(id: string): Promise<void> {
  try {
    const url = `${API_URL}/reservations/${id}`

    // 🔍 DIAGNOSTIC: Log request details
    console.log("🗑️ [deleteReserva] Request details:", {
      origin: typeof window !== "undefined" ? window.location.origin : "SSR",
      finalURL: url,
      id,
    })

    const response = await fetch(url, {
      method: "DELETE",
    })

    // 🔍 DIAGNOSTIC: Log response details
    console.log("📥 [deleteReserva] Response details:", {
      status: response.status,
      statusText: response.statusText,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      console.error("❌ [deleteReserva] Error response:", errorData)

      if (response.status === 404) {
        throw new Error("La reserva no existe o ya fue eliminada.")
      }

      throw new Error(errorData?.message || `Error al eliminar reserva: ${response.status}`)
    }

    console.log("✅ [deleteReserva] Reservation deleted:", id)
  } catch (error) {
    console.error("❌ [deleteReserva] Fatal error:", error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error("No se pudo eliminar la reserva. Verifica que el backend esté corriendo.")
  }
}

// Optional: Function to get available rooms
export async function getRooms(): Promise<BackendRoom[]> {
  try {
    const url = `${API_URL}/rooms`

    // 🔍 DIAGNOSTIC: Log request details
    console.log("🏢 [getRooms] Request details:", {
      origin: typeof window !== "undefined" ? window.location.origin : "SSR",
      finalURL: url,
    })

    const response = await fetch(url)

    // 🔍 DIAGNOSTIC: Log response details
    console.log("📥 [getRooms] Response details:", {
      status: response.status,
      statusText: response.statusText,
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error("❌ [getRooms] Error response body:", errorBody)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const rooms: BackendRoom[] = await response.json()
    console.log("✅ [getRooms] Received rooms:", rooms.length)
    return rooms
  } catch (error) {
    console.error("❌ [getRooms] Fatal error:", error)
    throw new Error("No se pudieron cargar las salas.")
  }
}
