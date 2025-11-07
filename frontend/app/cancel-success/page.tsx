import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircleIcon } from "@heroicons/react/24/outline"

export default function CancelSuccessPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
            <CheckCircleIcon className="h-10 w-10 text-green-600" />
          </div>

          <h1 className="text-3xl font-bold mb-4">Reserva Cancelada</h1>

          <p className="text-muted-foreground mb-8">
            Tu reserva ha sido cancelada exitosamente. Recibirás un email de confirmación en breve.
          </p>

          <div className="space-y-3">
            <Button asChild className="w-full" size="lg">
              <Link href="/">Volver al inicio</Link>
            </Button>

            <Button asChild variant="outline" className="w-full" size="lg">
              <Link href="/reservar">Hacer una nueva reserva</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
