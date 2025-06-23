"use client"

import { QuickSearch } from "@/components/accommodations/quick-search"

export default function QuickSearchPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Busca Rápida</h1>
        <p className="text-muted-foreground">
          Encontre acomodações disponíveis rapidamente e compartilhe informações com seus clientes
        </p>
      </div>

      <QuickSearch />
    </div>
  )
}
