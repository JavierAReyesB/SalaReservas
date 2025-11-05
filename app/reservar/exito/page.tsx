"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircleIcon, ArrowDownTrayIcon, HomeIcon } from "@heroicons/react/24/outline"
import { getReservas } from "@/lib/api/client"
import type { Reserva } from "@/lib/types"
import { downloadICS } from "@/lib/ics"
import { Skeleton } from "@/components/ui/skeleton"

export default function ExitoPage() {
  const searchParams = useSearchParams()
  const reservaId = searchParams.get("id")
  const [reserva, setReserva] = useState<Reserva | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadReserva() {
      if (!reservaId) {
        setLoading(false)
        return
      }

      try {
        const allReservas = await getReservas()
        const found = allReservas.find((r) => r.id === reservaId)
        setReserva(found || null)
      } catch (error) {
        console.error("Error loading reservation:", error)
      } finally {
        setLoading(false)
      }
    }

    loadReserva()
  }, [reservaId])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!reserva) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Reserva no encontrada</h1>
          <Button asChild>
            <Link href="/">Volver al inicio</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircleIcon className="h-16 w-16 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Reserva confirmada</CardTitle>
            <CardDescription>Tu reserva ha sido creada exitosamente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Reservation Details */}
            <div className="bg-muted/50 rounded-lg p-6 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Sala</p>
                  <p className="font-semibold">{reserva.sala}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fecha</p>
                  <p className="font-semibold">
                    {new Date(reserva.fecha).toLocaleDateString("es-ES", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Hora</p>
                  <p className="font-semibold">
                    {reserva.horaInicio} - {reserva.horaFin}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Reservado por</p>
                  <p className="font-semibold">{reserva.nombre}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button onClick={() => downloadICS(reserva)} className="w-full" size="lg">
                <ArrowDownTrayIcon className="mr-2 h-4 w-4" />
                Añadir a calendario (.ics)
              </Button>
              <Button asChild variant="outline" className="w-full bg-transparent" size="lg">
                <Link href="/">
                  <HomeIcon className="mr-2 h-4 w-4" />
                  Volver al inicio
                </Link>
              </Button>
            </div>

            {/* Additional Info */}
            <div className="text-center text-sm text-muted-foreground">
              <p>
                Se ha enviado un correo de confirmación a{" "}
                <span className="font-medium text-foreground">{reserva.correo}</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
