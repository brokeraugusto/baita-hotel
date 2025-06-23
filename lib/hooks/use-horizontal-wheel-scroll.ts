"use client"

import { useRef, useEffect } from "react"

export function useHorizontalWheelScroll() {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = scrollRef.current
    if (!element) return

    const handleWheel = (e: WheelEvent) => {
      // Verifica se o conteúdo é maior que o container
      if (element.scrollWidth <= element.clientWidth) return

      // Previne o comportamento padrão apenas se houver scroll horizontal
      if (e.deltaY !== 0) {
        e.preventDefault()

        // Determina a direção e a quantidade de scroll
        const scrollAmount = e.deltaY * 2 // Aumenta a velocidade do scroll

        // Aplica o scroll horizontal
        element.scrollLeft += scrollAmount
      }
    }

    // Adiciona o event listener com passive: false para permitir preventDefault()
    element.addEventListener("wheel", handleWheel, { passive: false })

    return () => {
      element.removeEventListener("wheel", handleWheel)
    }
  }, [])

  return scrollRef
}
