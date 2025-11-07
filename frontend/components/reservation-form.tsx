"use client"

import { useState, useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { reservaSchema } from "@/lib/validations"
import type { ReservaFormData, SalaId } from "@/lib/types"
import { useCreateReserva, useReservas } from "@/hooks/use-reservations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { SALAS } from "@/lib/constants"
import { ArrowPathIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline"
import { AvailabilityCalendar } from "./availability-calendar"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ReservationFormProps {
  defaultRoom?: SalaId
}

export function ReservationForm({ defaultRoom }: ReservationFormProps) {
  console.log("[v0] ReservationForm - defaultRoom prop:", defaultRoom)

  const { toast } = useToast()
  const createReserva = useCreateReserva()
  const [selectedSala, setSelectedSala] = useState<SalaId | undefined>(defaultRoom)
  const [isMounted, setIsMounted] = useState(false)

  // Prevent hydration errors
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Helper function to get current time rounded to next hour
  const getCurrentTime = () => {
    const now = new Date()
    now.setMinutes(0)
    now.setSeconds(0)
    now.setMilliseconds(0)
    return now.toTimeString().slice(0, 5) // Returns "HH:MM"
  }

  // Helper function to add hours to a time string
  const addHours = (timeStr: string, hours: number) => {
    const [h, m] = timeStr.split(':').map(Number)
    const date = new Date()
    date.setHours(h, m, 0, 0)
    date.setHours(date.getHours() + hours)
    return date.toTimeString().slice(0, 5)
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ReservaFormData>({
    resolver: zodResolver(reservaSchema),
    defaultValues: {
      sala: defaultRoom,
      horaInicio: getCurrentTime(),
      horaFin: addHours(getCurrentTime(), 1),
    },
  })

  const sala = watch("sala")
  const fecha = watch("fecha")
  const horaInicio = watch("horaInicio")
  const horaFin = watch("horaFin")

  useEffect(() => {
    console.log("[v0] ReservationForm useEffect - defaultRoom:", defaultRoom)
    if (defaultRoom) {
      setValue("sala", defaultRoom, { shouldValidate: false })
      setSelectedSala(defaultRoom)
      console.log("[v0] ReservationForm - sala set to:", defaultRoom)
    }
  }, [defaultRoom, setValue])

  // Auto-adjust end time when start time changes
  useEffect(() => {
    if (horaInicio) {
      const currentHoraFin = horaFin
      const suggestedHoraFin = addHours(horaInicio, 1)

      // Only update if current end time is before or equal to start time
      if (!currentHoraFin || currentHoraFin <= horaInicio) {
        setValue("horaFin", suggestedHoraFin)
      }
    }
  }, [horaInicio, horaFin, setValue])

  console.log("[v0] ReservationForm - watched sala value:", sala)

  // Fetch existing reservations for the selected date and sala
  const { data: existingReservas } = useReservas(selectedSala, fecha)

  // Check for conflicts
  const conflict = useMemo(() => {
    if (!existingReservas || !horaInicio || !horaFin || !fecha || !selectedSala) {
      return null
    }

    // Find overlapping reservations
    const overlapping = existingReservas.find((reserva) => {
      // Convert times to minutes for easier comparison
      const parseTime = (time: string) => {
        const [hours, minutes] = time.split(":").map(Number)
        return hours * 60 + minutes
      }

      const newStart = parseTime(horaInicio)
      const newEnd = parseTime(horaFin)
      const existingStart = parseTime(reserva.horaInicio)
      const existingEnd = parseTime(reserva.horaFin)

      // Check if there's any overlap
      // Overlap occurs if: new starts before existing ends AND new ends after existing starts
      return newStart < existingEnd && newEnd > existingStart
    })

    return overlapping
  }, [existingReservas, horaInicio, horaFin, fecha, selectedSala])

  const onSubmit = async (data: ReservaFormData) => {
    // Double check for conflicts before submitting
    if (conflict) {
      toast({
        title: "Conflicto de horario",
        description: `Ya existe una reserva de ${conflict.nombre} en ese horario (${conflict.horaInicio} - ${conflict.horaFin}).`,
        variant: "destructive",
      })
      return
    }
    try {
      const reserva = await createReserva.mutateAsync(data)
      toast({
        title: "Reserva confirmada",
        description: `Tu reserva en ${data.sala} ha sido confirmada exitosamente.`,
      })

      // Redirect to success page
      window.location.href = `/reservar/exito?id=${reserva.id}`
    } catch (error) {
      toast({
        title: "Error al crear reserva",
        description: error instanceof Error ? error.message : "Ocurrió un error inesperado",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Nueva reserva</CardTitle>
          <CardDescription>Completa el formulario para reservar una sala</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Sala Selection */}
            <div className="space-y-2">
              <Label htmlFor="sala">Sala *</Label>
              {isMounted ? (
                <Select
                  value={sala}
                  onValueChange={(value) => {
                    setValue("sala", value as SalaId, { shouldValidate: true })
                    setSelectedSala(value as SalaId)
                  }}
                >
                  <SelectTrigger id="sala">
                    <SelectValue placeholder="Selecciona una sala" />
                  </SelectTrigger>
                  <SelectContent>
                    {SALAS.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.nombre} (Capacidad: {s.capacidad})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <span className="text-muted-foreground">Cargando...</span>
                </div>
              )}
              {errors.sala && <p className="text-sm text-destructive">{errors.sala.message}</p>}
            </div>

            {/* Date and Time */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fecha">Fecha *</Label>
                <Input id="fecha" type="date" {...register("fecha")} min={new Date().toISOString().split("T")[0]} />
                {errors.fecha && <p className="text-sm text-destructive">{errors.fecha.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="horaInicio">Hora de inicio *</Label>
                <Input id="horaInicio" type="time" {...register("horaInicio")} />
                {errors.horaInicio && <p className="text-sm text-destructive">{errors.horaInicio.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="horaFin">Hora de fin *</Label>
              <Input id="horaFin" type="time" {...register("horaFin")} />
              {errors.horaFin && <p className="text-sm text-destructive">{errors.horaFin.message}</p>}
            </div>

            {/* Personal Information */}
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre completo *</Label>
              <Input id="nombre" placeholder="Juan Pérez" {...register("nombre")} />
              {errors.nombre && <p className="text-sm text-destructive">{errors.nombre.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="correo">Correo electrónico *</Label>
              <Input id="correo" type="email" placeholder="juan@empresa.com" {...register("correo")} />
              {errors.correo && <p className="text-sm text-destructive">{errors.correo.message}</p>}
            </div>

            {/* Conflict Warning */}
            {conflict && (
              <Alert variant="destructive">
                <ExclamationTriangleIcon className="h-4 w-4" />
                <AlertTitle>Conflicto de horario</AlertTitle>
                <AlertDescription>
                  Ya existe una reserva de <strong>{conflict.nombre}</strong> en ese horario (
                  {conflict.horaInicio} - {conflict.horaFin}). Por favor, elige otro horario.
                </AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={createReserva.isPending || !!conflict}>
              {createReserva.isPending ? (
                <>
                  <ArrowPathIcon className="mr-2 h-4 w-4 animate-spin" />
                  Creando reserva...
                </>
              ) : conflict ? (
                "Horario no disponible"
              ) : (
                "Confirmar reserva"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Availability Calendar Sidebar */}
      <div className="lg:col-span-1">
        <AvailabilityCalendar
          sala={selectedSala}
          selectedDate={watch("fecha")}
          onDateChange={(date) => setValue("fecha", date, { shouldValidate: true })}
        />
      </div>
    </div>
  )
}
