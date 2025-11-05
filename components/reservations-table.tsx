"use client"

import { useState } from "react"
import type { Reserva } from "@/lib/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ClockIcon, UserIcon, EnvelopeIcon, TrashIcon } from "@heroicons/react/24/outline"
import { useDeleteReserva } from "@/hooks/use-reservations"
import { useToast } from "@/hooks/use-toast"

interface ReservationsTableProps {
  reservas: Reserva[]
  onDelete?: () => void
}

export function ReservationsTable({ reservas, onDelete }: ReservationsTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [reservaToDelete, setReservaToDelete] = useState<Reserva | null>(null)
  const deleteReserva = useDeleteReserva()
  const { toast } = useToast()
  if (reservas.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No se encontraron reservas con los filtros seleccionados</p>
      </div>
    )
  }

  const isUpcoming = (reserva: Reserva) => {
    const now = new Date()
    const reservaDateTime = new Date(`${reserva.fecha}T${reserva.horaInicio}:00`)
    return reservaDateTime > now
  }

  const handleDeleteClick = (reserva: Reserva) => {
    setReservaToDelete(reserva)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!reservaToDelete) return

    try {
      await deleteReserva.mutateAsync(reservaToDelete.id)
      toast({
        title: "Reserva cancelada",
        description: `La reserva de ${reservaToDelete.nombre} ha sido cancelada exitosamente.`,
      })
      setDeleteDialogOpen(false)
      setReservaToDelete(null)
      onDelete?.() // Refresh the list
    } catch (error) {
      toast({
        title: "Error al cancelar",
        description: error instanceof Error ? error.message : "No se pudo cancelar la reserva",
        variant: "destructive",
      })
    }
  }

  return (
    <>
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sala</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Horario</TableHead>
            <TableHead>Reservado por</TableHead>
            <TableHead>Contacto</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reservas.map((reserva) => (
            <TableRow key={reserva.id}>
              <TableCell className="font-medium">{reserva.sala}</TableCell>
              <TableCell>
                {new Date(reserva.fecha + "T12:00:00").toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <ClockIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {reserva.horaInicio} - {reserva.horaFin}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{reserva.nombre}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <EnvelopeIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{reserva.correo}</span>
                </div>
              </TableCell>
              <TableCell>
                {isUpcoming(reserva) ? (
                  <Badge variant="default">Próxima</Badge>
                ) : (
                  <Badge variant="secondary">Pasada</Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteClick(reserva)}
                  disabled={deleteReserva.isPending}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <TrashIcon className="h-4 w-4" />
                  <span className="sr-only">Cancelar reserva</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar esta reserva?</AlertDialogTitle>
            <AlertDialogDescription>
              {reservaToDelete && (
                <>
                  Esta acción no se puede deshacer. Se cancelará la reserva de{" "}
                  <strong>{reservaToDelete.nombre}</strong> para{" "}
                  <strong>{reservaToDelete.sala}</strong> el{" "}
                  <strong>
                    {new Date(reservaToDelete.fecha + "T12:00:00").toLocaleDateString("es-ES")} de{" "}
                    {reservaToDelete.horaInicio} a {reservaToDelete.horaFin}
                  </strong>
                  .
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, mantener reserva</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sí, cancelar reserva
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
