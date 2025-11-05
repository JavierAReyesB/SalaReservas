"use client"

import { useState, useEffect, useCallback } from "react"
import { getReservas, createReserva, deleteReserva } from "@/lib/api/client"
import type { ReservaFormData, Reserva } from "@/lib/types"

export function useReservas(sala?: string, fecha?: string) {
  const [data, setData] = useState<Reserva[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchReservas = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const reservas = await getReservas(sala, fecha)
      setData(reservas)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Error al cargar reservas"))
    } finally {
      setIsLoading(false)
    }
  }, [sala, fecha])

  useEffect(() => {
    fetchReservas()
  }, [fetchReservas])

  return { data, isLoading, error, refetch: fetchReservas }
}

export function useCreateReserva() {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const mutateAsync = async (data: ReservaFormData) => {
    setIsPending(true)
    setError(null)

    try {
      const result = await createReserva(data)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Error al crear reserva")
      setError(error)
      throw error
    } finally {
      setIsPending(false)
    }
  }

  return { mutateAsync, isPending, error }
}

export function useDeleteReserva() {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const mutateAsync = async (id: string) => {
    setIsPending(true)
    setError(null)

    try {
      await deleteReserva(id)
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Error al eliminar reserva")
      setError(error)
      throw error
    } finally {
      setIsPending(false)
    }
  }

  return { mutateAsync, isPending, error }
}
