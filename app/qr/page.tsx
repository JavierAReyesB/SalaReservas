"use client"

import { SALAS } from "@/lib/constants"
import { QRCodeDisplay } from "@/components/qr-code-display"
import { QRScanner } from "@/components/qr-scanner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function QRPage() {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : ""

  console.log("[v0] QR Page - baseUrl:", baseUrl)

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Códigos QR de salas</h1>
          <p className="text-muted-foreground">
            Genera y descarga códigos QR para cada sala, o escanea uno para reservar
          </p>
        </div>

        <Tabs defaultValue="generate" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="generate">Generar QR</TabsTrigger>
            <TabsTrigger value="scan">Escanear QR</TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {SALAS.map((sala) => {
                const qrUrl = `${baseUrl}/reservar?room=${encodeURIComponent(sala.id)}`
                console.log(`[v0] QR Page - ${sala.nombre} QR URL:`, qrUrl)

                return (
                  <Card key={sala.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{sala.nombre}</CardTitle>
                      <CardDescription>Capacidad: {sala.capacidad} personas</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <QRCodeDisplay value={qrUrl} size={200} label={sala.id} />
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-lg">Cómo usar los códigos QR</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>1. Descarga el código QR de la sala que desees</p>
                <p>2. Imprime el código y colócalo en la entrada de la sala</p>
                <p>
                  3. Los usuarios pueden escanear el código para acceder directamente al formulario de reserva con la
                  sala preseleccionada
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scan">
            <QRScanner />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
