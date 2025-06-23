"use client"

import { useRef, useEffect } from "react"

export function useWheelHorizontalScroll() {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = scrollRef.current
    if (!element) return

    const handleWheel = (e: WheelEvent) => {
      // Verifica se a tecla Shift está pressionada ou se o elemento já tem scroll horizontal
      if (e.shiftKey || element.scrollWidth > element.clientWidth) {
        // Previne o comportamento padrão apenas se houver conteúdo para scrollar horizontalmente
        if (element.scrollWidth > element.clientWidth) {
          e.preventDefault()

          // Aplica o scroll horizontal com uma velocidade adequada
          element.scrollLeft += e.deltaY * 0.5
        }
      }
    }

    // Usa o evento com passive: false para permitir preventDefault()
    element.addEventListener("wheel", handleWheel, { passive: false })

    return () => {
      element.removeEventListener("wheel", handleWheel)
    }
  }, [])

  return scrollRef
}
