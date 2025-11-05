import Image from "next/image"

export default function TestImagesPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Test de Imagenes</h1>

      <div className="space-y-8">
        <div>
          <h2 className="text-xl mb-4">1. Imagen SIN overlay ni blur</h2>
          <div className="relative h-[300px] w-full border-4 border-red-500">
            <Image
              src="/images/backgrounds/AuditorioFoto.webp"
              alt="Test"
              fill
              className="object-cover"
            />
          </div>
        </div>

        <div>
          <h2 className="text-xl mb-4">2. Imagen CON overlay ligero</h2>
          <div className="relative h-[300px] w-full border-4 border-blue-500">
            <Image
              src="/images/backgrounds/AuditorioFoto.webp"
              alt="Test"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/20" />
          </div>
        </div>

        <div>
          <h2 className="text-xl mb-4">3. Diseño ACTUAL de la card</h2>
          <div className="relative h-[300px] w-full border-4 border-green-500">
            <Image
              src="/images/backgrounds/AuditorioFoto.webp"
              alt="Test"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/40" />
            <div className="relative z-10 p-6 text-white">
              <h3 className="text-2xl font-bold drop-shadow-lg">Sala Andromeda</h3>
              <p className="drop-shadow-md">Texto sobre la imagen</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
