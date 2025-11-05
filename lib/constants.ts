import type { Sala } from "./types"

export const SALAS: Sala[] = [
  {
    id: "andromeda",
    nombre: "Sala Andrómeda",
    capacidad: 40,
    descripcion: "Auditorio con capacidad para 40 personas, ideal para charlas y presentaciones.",
    imagen: "/images/backgrounds/AuditorioFoto.webp",
  },
  {
    id: "boreal",
    nombre: "Sala Boreal",
    capacidad: 3,
    descripcion: "Sala pequeña para reuniones personales (máximo 3 personas).",
    imagen: "/images/backgrounds/SalaSmall.webp",
  },
  {
    id: "cenit",
    nombre: "Sala Cénit",
    capacidad: 10,
    descripcion: "Sala equipada para formaciones y presentaciones (hasta 10 personas).",
    imagen: "/images/backgrounds/SalaFormaciones.webp",
  },
  {
    id: "delta",
    nombre: "Sala Delta",
    capacidad: 6,
    descripcion: "Espacio optimizado para creación de contenido (foto y video). Aforo flexible; recomendado hasta 6 personas.",
    imagen: "/images/backgrounds/SalaMedia.webp",
  },
  {
    id: "eclipse",
    nombre: "Sala Eclipse",
    capacidad: 10,
    descripcion: "Máximo 10 personas, con pizarra interactiva; perfecta para demos y reuniones.",
    imagen: "/images/backgrounds/SalaIntercativa.webp", 
  },
]
