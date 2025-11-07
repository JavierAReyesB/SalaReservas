"use client"

import { useEffect, useRef, useState } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CameraIcon, XMarkIcon } from "@heroicons/react/24/outline"
import { useRouter } from "next/navigation"

export function QRScanner() {
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const router = useRouter()

  const startScanning = async () => {
    try {
      setError(null)
      const html5QrCode = new Html5Qrcode("qr-reader")
      scannerRef.current = html5QrCode

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          console.log("[v0] QR Scanner - decoded text:", decodedText)

          try {
            const url = new URL(decodedText)
            console.log("[v0] QR Scanner - parsed URL:", url)
            console.log("[v0] QR Scanner - pathname:", url.pathname)
            console.log("[v0] QR Scanner - search:", url.search)

            if (url.pathname.startsWith("/reservar")) {
              stopScanning()
              // Use pathname + search to get relative URL (e.g., /reservar?room=andromeda)
              const relativePath = url.pathname + url.search
              console.log("[v0] QR Scanner - navigating to:", relativePath)
              router.push(relativePath)
            } else {
              setError("El código QR no es válido para este sistema")
            }
          } catch {
            // If it's not a full URL, try to use it as a relative path
            console.log("[v0] QR Scanner - not a full URL, trying as relative path")
            if (decodedText.startsWith("/reservar")) {
              stopScanning()
              console.log("[v0] QR Scanner - navigating to relative path:", decodedText)
              router.push(decodedText)
            } else {
              setError("El código QR no contiene una URL válida")
            }
          }
        },
        (errorMessage) => {
          // Ignore scanning errors (they happen constantly)
        },
      )

      setIsScanning(true)
    } catch (err) {
      setError("No se pudo acceder a la cámara. Verifica los permisos.")
      console.error(err)
    }
  }

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop()
        scannerRef.current.clear()
      } catch (err) {
        console.error("Error stopping scanner:", err)
      }
    }
    setIsScanning(false)
  }

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error)
      }
    }
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lector de códigos QR</CardTitle>
        <CardDescription>Escanea un código QR de sala para reservar rápidamente</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isScanning ? (
          <Button onClick={startScanning} className="w-full">
            <CameraIcon className="mr-2 h-4 w-4" />
            Iniciar escáner
          </Button>
        ) : (
          <>
            <div id="qr-reader" className="w-full rounded-lg overflow-hidden border border-border" />
            <Button onClick={stopScanning} variant="outline" className="w-full bg-transparent">
              <XMarkIcon className="mr-2 h-4 w-4" />
              Detener escáner
            </Button>
          </>
        )}
        {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">{error}</div>}
      </CardContent>
    </Card>
  )
}
