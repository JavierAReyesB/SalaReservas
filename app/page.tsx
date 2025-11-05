import { SALAS } from "@/lib/constants"
import { RoomCard } from "@/components/room-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { QrCodeIcon } from "@heroicons/react/24/outline"

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">Reserva tu sala de reuniones</h1>
          <p className="text-lg text-muted-foreground mb-8 text-pretty">
            Sistema simple y eficiente para gestionar las reservas de salas en tu empresa
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/reservar">Hacer una reserva</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/qr">
                <QrCodeIcon className="h-4 w-4 mr-2" />
                Ver códigos QR
              </Link>
            </Button>
          </div>
        </div>

        {/* Room Cards */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">Salas disponibles</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {SALAS.map((sala) => (
              <RoomCard key={sala.id} sala={sala} />
            ))}
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-muted/50 rounded-lg p-6 mt-12">
          <h3 className="text-xl font-semibold mb-3">¿Cómo funciona?</h3>
          <ol className="space-y-2 text-muted-foreground">
            <li className="flex gap-3">
              <span className="font-semibold text-foreground">1.</span>
              <span>Selecciona la sala que necesitas según la capacidad</span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-foreground">2.</span>
              <span>Elige la fecha y horario de tu reunión</span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-foreground">3.</span>
              <span>Completa tus datos y confirma la reserva</span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-foreground">4.</span>
              <span>Recibe la confirmación y añádela a tu calendario</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  )
}
