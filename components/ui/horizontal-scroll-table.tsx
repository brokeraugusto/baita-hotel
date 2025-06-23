"use client"

import type { ReactNode } from "react"
import { useHorizontalScroll } from "@/lib/hooks/use-horizontal-scroll"
import { cn } from "@/lib/utils"

interface HorizontalScrollTableProps {
  children: ReactNode
  minWidth?: string
  className?: string
}

export function HorizontalScrollTable({ children, minWidth = "1000px", className }: HorizontalScrollTableProps) {
  const scrollRef = useHorizontalScroll()

  return (
    <div className={cn("overflow-x-auto", className)} ref={scrollRef}>
      <div style={{ minWidth }}>{children}</div>
    </div>
  )
}
