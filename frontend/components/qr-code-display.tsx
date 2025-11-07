"use client"

import { useEffect, useRef, useState } from "react"
import QRCode from "qrcode"
import { Button } from "@/components/ui/button"
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline"

interface QRCodeDisplayProps {
  value: string
  size?: number
  label?: string
}

export function QRCodeDisplay({ value, size = 256, label }: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        value,
        {
          width: size,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        },
        (err) => {
          if (err) {
            setError("Error al generar código QR")
            console.error(err)
          }
        },
      )
    }
  }, [value, size])

  const downloadQR = async () => {
    try {
      const url = await QRCode.toDataURL(value, {
        width: 512,
        margin: 2,
      })
      const link = document.createElement("a")
      link.href = url
      link.download = `qr-${label || "code"}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error("Error downloading QR:", err)
    }
  }

  if (error) {
    return <div className="text-sm text-destructive">{error}</div>
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas ref={canvasRef} className="border border-border rounded-lg" />
      <Button onClick={downloadQR} variant="outline" size="sm">
        <ArrowDownTrayIcon className="mr-2 h-4 w-4" />
        Descargar QR
      </Button>
    </div>
  )
}
