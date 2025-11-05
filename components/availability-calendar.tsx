"use client"

import { useState, useEffect } from "react"
import { useReservas } from "@/hooks/use-reservations"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import type { SalaId } from "@/lib/types"

interface AvailabilityCalendarProps {
  sala?: SalaId
  selectedDate?: string
  onDateChange?: (date: string) => void
}

export function AvailabilityCalendar({ sala, selectedDate, onDateChange }: AvailabilityCalendarProps) {
  const [date, setDate] = useState<Date>(selectedDate ? new Date(selectedDate + "T12:00:00") : new Date())
  const [isMounted, setIsMounted] = useState(false)

  // Prevent hydration errors by only rendering calendar on client
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Convert date to YYYY-MM-DD string without timezone issues
  const dateString = date.getFullYear() + "-" +
    String(date.getMonth() + 1).padStart(2, "0") + "-" +
    String(date.getDate()).padStart(2, "0")

  // Sync with external selectedDate changes (from form input)
  useEffect(() => {
    if (selectedDate) {
      const newDate = new Date(selectedDate + "T12:00:00")
      const newDateString = newDate.getFullYear() + "-" +
        String(newDate.getMonth() + 1).padStart(2, "0") + "-" +
        String(newDate.getDate()).padStart(2, "0")

      // Only update if the date actually changed to avoid unnecessary re-renders
      if (newDateString !== dateString) {
        setDate(newDate)
      }
    }
  }, [selectedDate, dateString])

  const { data: reservas, isLoading } = useReservas(sala, dateString)

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate)
      // Format date without timezone issues
      const newDateString = newDate.getFullYear() + "-" +
        String(newDate.getMonth() + 1).padStart(2, "0") + "-" +
        String(newDate.getDate()).padStart(2, "0")
      onDateChange?.(newDateString)
    }
  }

  // Generate time slots from 8:00 to 20:00
  const timeSlots = []
  for (let hour = 8; hour < 20; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, "0")}:00`)
  }

  // Check if a time slot is occupied
  const isSlotOccupied = (time: string) => {
    if (!reservas || !sala) return null

    const slot = reservas.find((reserva) => {
      const slotHour = parseInt(time.split(":")[0])
      const startHour = parseInt(reserva.horaInicio.split(":")[0])
      const endHour = parseInt(reserva.horaFin.split(":")[0])

      return slotHour >= startHour && slotHour < endHour
    })

    return slot
  }

  const formatDate = (dateStr: string) => {
    // Add time to avoid timezone issues
    const d = new Date(dateStr + "T12:00:00")
    return d.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Disponibilidad</CardTitle>
        <CardDescription>
          {sala ? `Revisa la disponibilidad de ${sala}` : "Selecciona una sala para ver disponibilidad"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Calendar */}
        <div className="flex justify-center">
          {isMounted ? (
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              disabled={(date) => {
                const today = new Date()
                today.setHours(0, 0, 0, 0)
                return date < today
              }}
              className="rounded-md border"
            />
          ) : (
            <div className="rounded-md border p-3">
              <Skeleton className="h-[280px] w-[280px]" />
            </div>
          )}
        </div>

        {/* Selected date info */}
        <div className="text-center">
          <p className="text-sm font-medium capitalize">{formatDate(dateString)}</p>
        </div>

        {/* Time slots */}
        {sala && (
          <>
            {isLoading ? (
              <div className="space-y-2">
                {timeSlots.map((time) => (
                  <Skeleton key={time} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {timeSlots.map((time) => {
                  const occupied = isSlotOccupied(time)
                  return (
                    <div
                      key={time}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        occupied
                          ? "bg-destructive/10 border-destructive/30"
                          : "bg-muted/30 border-border"
                      }`}
                    >
                      <span className="font-medium text-sm">{time}</span>
                      {occupied ? (
                        <div className="flex flex-col items-end gap-1">
                          <Badge variant="destructive" className="text-xs">
                            Ocupado
                          </Badge>
                          <span className="text-xs text-muted-foreground">{occupied.nombre}</span>
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          Disponible
                        </Badge>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {!sala && (
          <p className="text-sm text-muted-foreground text-center py-8">
            Selecciona una sala en el formulario para ver su disponibilidad
          </p>
        )}
      </CardContent>
    </Card>
  )
}
