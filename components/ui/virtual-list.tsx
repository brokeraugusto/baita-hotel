"use client"

import type React from "react"

import { useState, useRef, useMemo } from "react"
import { createVirtualList } from "@/lib/utils/performance"

interface VirtualListProps<T> {
  items: T[]
  itemHeight: number
  height: number
  renderItem: (item: T, index: number) => React.ReactNode
  className?: string
  overscan?: number
}

export function VirtualList<T>({
  items,
  itemHeight,
  height,
  renderItem,
  className = "",
  overscan = 5,
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const virtualData = useMemo(() => {
    return createVirtualList(items, itemHeight, height, scrollTop)
  }, [items, itemHeight, height, scrollTop])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }

  return (
    <div ref={containerRef} className={`overflow-auto ${className}`} style={{ height }} onScroll={handleScroll}>
      <div style={{ height: virtualData.totalHeight, position: "relative" }}>
        <div style={{ transform: `translateY(${virtualData.offsetY}px)` }}>
          {virtualData.visibleItems.map((item, index) => (
            <div key={virtualData.startIndex + index} style={{ height: itemHeight }}>
              {renderItem(item, virtualData.startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
