import Link from "next/link"
import { QrCodeIcon } from "@heroicons/react/24/outline"

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/50 mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">© 2025 Sistema de Reservas de Salas</p>
          <Link
            href="/qr"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <QrCodeIcon className="h-4 w-4" />
            Ver códigos QR de salas
          </Link>
        </div>
      </div>
    </footer>
  )
}
