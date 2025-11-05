import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { UsersIcon } from "@heroicons/react/24/outline"
import type { Sala } from "@/lib/types"

interface RoomCardProps {
  sala: Sala
}

export function RoomCard({ sala }: RoomCardProps) {
  return (
    <div className="relative overflow-hidden rounded-lg border shadow-sm hover:shadow-lg transition-shadow group h-[320px]">
      {/* BACKGROUND IMAGE */}
      {sala.imagen && (
        <>
          <Image
            src={sala.imagen}
            alt={sala.nombre}
            fill
            priority
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-white/40 to-black/40" />
        </>
      )}

      {/* CONTENT */}
      <div className="relative z-10 flex flex-col h-full p-6 justify-between">
        <div>
          <h3 className="text-2xl font-bold text-black mb-2">{sala.nombre}</h3>
          <p className="text-sm text-slate-800 mb-3">{sala.descripcion}</p>
          <div className="flex items-center gap-2 text-slate-800">
            <UsersIcon className="h-5 w-5" />
            <span className="text-sm">
              Capacidad: <span className="font-semibold text-black">{sala.capacidad} personas</span>
            </span>
          </div>
        </div>

        <Button asChild className="w-full">
          <Link href={`/reservar?room=${encodeURIComponent(sala.id)}`}>Reservar sala</Link>
        </Button>
      </div>
    </div>
  )
}
