# Carpeta de Imágenes

Esta carpeta contiene todas las imágenes utilizadas en el proyecto.

## Estructura de carpetas

```
images/
├── salas/          # Imágenes de las salas de reuniones
├── logos/          # Logos de la empresa/aplicación
├── icons/          # Íconos y elementos gráficos pequeños
└── backgrounds/    # Imágenes de fondo
```

## Cómo usar las imágenes en el código

### Usando el componente Image de Next.js (recomendado)

```tsx
import Image from "next/image"

// Ejemplo: Imagen de una sala
<Image
  src="/images/salas/andromeda.jpg"
  alt="Sala Andrómeda"
  width={800}
  height={600}
/>
```

### Usando img estándar

```tsx
<img src="/images/logos/logo.png" alt="Logo" />
```

## Formatos recomendados

- **Fotos de salas**: JPG, WebP (optimizadas)
- **Logos**: SVG, PNG (con transparencia)
- **Íconos**: SVG
- **Fondos**: JPG, WebP

## Nomenclatura de archivos

- Usa nombres descriptivos en minúsculas
- Usa guiones para separar palabras
- Ejemplos:
  - `sala-andromeda.jpg`
  - `logo-empresa.svg`
  - `icono-calendario.svg`
  - `fondo-hero.jpg`

## Optimización

Para mejores resultados, optimiza las imágenes antes de subirlas:
- Comprime las imágenes JPG/PNG
- Considera usar WebP para mejor compresión
- Usa SVG para gráficos vectoriales cuando sea posible
