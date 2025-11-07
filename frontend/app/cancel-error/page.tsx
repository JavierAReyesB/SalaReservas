import Link from "next/link"
import { Button } from "@/components/ui/button"
import { XCircleIcon } from "@heroicons/react/24/outline"

export default function CancelErrorPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  const getErrorMessage = (error?: string) => {
    switch (error) {
      case 'missing-token':
        return 'Falta el token de cancelación. Por favor, usa el enlace completo del email.'
      case 'invalid-token':
        return 'El token de cancelación no es válido.'
      case 'cancel-failed':
        return 'No se pudo cancelar la reserva. Puede que ya haya sido cancelada o el enlace ha expirado.'
      case 'server-error':
        return 'Ocurrió un error al procesar tu solicitud. Por favor, intenta de nuevo más tarde.'
      default:
        return 'Ocurrió un error inesperado al cancelar tu reserva.'
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
            <XCircleIcon className="h-10 w-10 text-red-600" />
          </div>

          <h1 className="text-3xl font-bold mb-4">Error al Cancelar</h1>

          <p className="text-muted-foreground mb-8">
            {getErrorMessage(searchParams.error)}
          </p>

          <div className="bg-muted/50 p-4 rounded-lg mb-8">
            <p className="text-sm text-muted-foreground">
              Si necesitas ayuda, contacta con el administrador o intenta cancelar desde el panel de administración.
            </p>
          </div>

          <div className="space-y-3">
            <Button asChild className="w-full" size="lg">
              <Link href="/">Volver al inicio</Link>
            </Button>

            <Button asChild variant="outline" className="w-full" size="lg">
              <Link href="/reservas">Ir al panel de administración</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
