import type React from "react"
import { useWheelHorizontalScroll } from "@/lib/hooks/use-wheel-horizontal-scroll"

interface HorizontalScrollContainerProps {
  children: React.ReactNode
  className?: string
}

export function HorizontalScrollContainer({ children, className = "" }: HorizontalScrollContainerProps) {
  const scrollRef = useWheelHorizontalScroll()

  return (
    <div ref={scrollRef} className={`overflow-x-auto ${className}`} style={{ scrollbarWidth: "thin" }}>
      {children}
    </div>
  )
}
