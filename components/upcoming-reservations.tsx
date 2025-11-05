"use client"

import { useReservas } from "@/hooks/use-reservations"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ClockIcon, UserIcon } from "@heroicons/react/24/outline"
import { Skeleton } from "@/components/ui/skeleton"

interface UpcomingReservationsProps {
  sala: string
}

export function UpcomingReservations({ sala }: UpcomingReservationsProps) {
  const today = new Date().toISOString().split("T")[0]
  const { data: reservas, isLoading } = useReservas(sala, today)

  const upcomingReservas = reservas
    ?.filter((r) => {
      const now = new Date()
      const reservaTime = new Date(`${r.fecha}T${r.horaInicio}`)
      return reservaTime > now
    })
    .slice(0, 3)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Próximas reservas</CardTitle>
          <CardDescription>Reservas de hoy para esta sala</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Próximas reservas</CardTitle>
        <CardDescription>Reservas de hoy para {sala}</CardDescription>
      </CardHeader>
      <CardContent>
        {!upcomingReservas || upcomingReservas.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No hay reservas próximas para hoy</p>
        ) : (
          <div className="space-y-4">
            {upcomingReservas.map((reserva) => (
              <div key={reserva.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <ClockIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {reserva.horaInicio} - {reserva.horaFin}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <UserIcon className="h-4 w-4" />
                    <span>{reserva.nombre}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
