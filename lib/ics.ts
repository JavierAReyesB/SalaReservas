import type { Reserva } from "./types"

export function generateICS(reserva: Reserva): string {
  const startDateTime = `${reserva.fecha.replace(/-/g, "")}T${reserva.horaInicio.replace(":", "")}00`
  const endDateTime = `${reserva.fecha.replace(/-/g, "")}T${reserva.horaFin.replace(":", "")}00`
  const now = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"

  const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Sistema de Reservas//ES
BEGIN:VEVENT
UID:${reserva.id}@reservas.app
DTSTAMP:${now}
DTSTART:${startDateTime}
DTEND:${endDateTime}
SUMMARY:Reserva ${reserva.sala}
DESCRIPTION:Reserva de ${reserva.nombre} en ${reserva.sala}
LOCATION:${reserva.sala}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`

  return ics
}

export function downloadICS(reserva: Reserva) {
  const icsContent = generateICS(reserva)
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" })
  const link = document.createElement("a")
  link.href = URL.createObjectURL(blob)
  link.download = `reserva-${reserva.sala}-${reserva.fecha}.ics`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
