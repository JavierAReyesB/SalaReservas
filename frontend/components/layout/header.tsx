"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { Bars3Icon } from "@heroicons/react/24/outline"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

export function Header() {
  const [open, setOpen] = useState(false)

  const navLinks = [
    { href: "/", label: "Inicio" },
    { href: "/reservas", label: "Administrar" },
    { href: "/qr", label: "Códigos QR" },
  ]

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 h-20">
      <div className="container mx-auto px-4 h-full">
        <div className="relative flex items-center justify-between h-full">
          {/* Logo */}
          <Link href="/" className="flex items-center h-full py-2">
            <div className="relative h-full w-48">
              <Image
                src="/logoAvanzadi.png"
                alt="Avanzadi Logo"
                fill
                className="object-contain object-left"
                priority
              />
            </div>
          </Link>

          {/* Centered Title */}
          <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:block">
            <h1 className="text-2xl font-bold">Reserva de Salas</h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Bars3Icon className="h-6 w-6" />
                  <span className="sr-only">Abrir menú</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col gap-4 mt-8">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="text-lg font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
