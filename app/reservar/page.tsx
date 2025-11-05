import { ReservationForm } from "@/components/reservation-form"
import type { SalaId } from "@/lib/types"

interface ReservarPageProps {
  searchParams: Promise<{ room?: string }>
}

export default async function ReservarPage({ searchParams }: ReservarPageProps) {
  const params = await searchParams
  const defaultRoom = params.room as SalaId | undefined

  console.log("[v0] ReservarPage - searchParams:", params)
  console.log("[v0] ReservarPage - defaultRoom:", defaultRoom)

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Reservar sala</h1>
          <p className="text-muted-foreground">Completa el formulario para hacer tu reserva</p>
        </div>
        <ReservationForm defaultRoom={defaultRoom} />
      </div>
    </div>
  )
}
