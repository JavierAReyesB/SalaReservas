"use client"

import { useState } from "react"
import { useReservas } from "@/hooks/use-reservations"
import { ReservationsTable } from "@/components/reservations-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SALAS } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { XMarkIcon, FunnelIcon } from "@heroicons/react/24/outline"
import { Skeleton } from "@/components/ui/skeleton"

export default function ReservasPage() {
  const [selectedSala, setSelectedSala] = useState<string>("")
  const [selectedFecha, setSelectedFecha] = useState<string>("")

  const { data: reservas, isLoading, refetch } = useReservas(selectedSala || undefined, selectedFecha || undefined)

  const clearFilters = () => {
    setSelectedSala("")
    setSelectedFecha("")
  }

  const hasFilters = selectedSala || selectedFecha

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Administrar reservas</h1>
          <p className="text-muted-foreground">Visualiza y gestiona todas las reservas del sistema</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Filtros</CardTitle>
                <CardDescription>Filtra las reservas por sala y fecha</CardDescription>
              </div>
              {hasFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <XMarkIcon className="mr-2 h-4 w-4" />
                  Limpiar filtros
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="filter-sala">Sala</Label>
                <Select value={selectedSala} onValueChange={setSelectedSala}>
                  <SelectTrigger id="filter-sala">
                    <SelectValue placeholder="Todas las salas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las salas</SelectItem>
                    {SALAS.map((sala) => (
                      <SelectItem key={sala.id} value={sala.id}>
                        {sala.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="filter-fecha">Fecha</Label>
                <Input
                  id="filter-fecha"
                  type="date"
                  value={selectedFecha}
                  onChange={(e) => setSelectedFecha(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Reservas {reservas && <span className="text-muted-foreground font-normal">({reservas.length})</span>}
              </CardTitle>
              {hasFilters && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FunnelIcon className="h-4 w-4" />
                  <span>Filtros activos</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : reservas ? (
              <ReservationsTable reservas={reservas} onDelete={refetch} />
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>Error al cargar las reservas</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
