"use client"

import { useRef, useEffect } from "react"

export function useHorizontalScroll() {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const handleWheel = (e: WheelEvent) => {
      // Verifica se o cursor está sobre o elemento
      if (e.deltaY === 0) return

      // Previne o comportamento padrão de scroll vertical
      e.preventDefault()

      // Converte o movimento vertical da roda em scroll horizontal
      el.scrollLeft += e.deltaY
    }

    // Adiciona o event listener
    el.addEventListener("wheel", handleWheel, { passive: false })

    // Remove o event listener quando o componente for desmontado
    return () => {
      el.removeEventListener("wheel", handleWheel)
    }
  }, [])

  return scrollRef
}
