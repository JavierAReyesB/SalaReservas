"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LockClosedIcon } from "@heroicons/react/24/outline"

interface AdminLoginProps {
  onLogin: (password: string) => boolean
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const success = onLogin(password)
    if (!success) {
      setError("Contraseña incorrecta")
      setPassword("")
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-card border rounded-lg shadow-lg p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <LockClosedIcon className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-center">Acceso Administrador</h2>
            <p className="text-muted-foreground text-center mt-2">
              Ingresa la contraseña para acceder al panel de administración
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError("")
                }}
                className="w-full"
                autoFocus
              />
              {error && (
                <p className="text-sm text-destructive mt-2">{error}</p>
              )}
            </div>

            <Button type="submit" className="w-full" size="lg">
              Ingresar
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
