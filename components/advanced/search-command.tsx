"use client"

import { useState } from "react"
import { Search, Calendar, Users, Bed, DollarSign, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

export function SearchCommand() {
  const [open, setOpen] = useState(false)

  const commands = [
    {
      group: "Navegação",
      items: [
        { icon: Calendar, label: "Reservas", action: () => (window.location.href = "/client/reservas") },
        { icon: Bed, label: "Acomodações", action: () => (window.location.href = "/client/acomodacoes") },
        { icon: Users, label: "Hóspedes", action: () => (window.location.href = "/client/hospedes") },
        { icon: DollarSign, label: "Financeiro", action: () => (window.location.href = "/client/financeiro") },
        { icon: Settings, label: "Configurações", action: () => (window.location.href = "/client/configuracoes") },
      ],
    },
    {
      group: "Ações Rápidas",
      items: [
        { icon: Calendar, label: "Nova Reserva", action: () => console.log("Nova reserva") },
        { icon: Users, label: "Novo Hóspede", action: () => console.log("Novo hóspede") },
        { icon: Bed, label: "Check-in Rápido", action: () => console.log("Check-in") },
        { icon: DollarSign, label: "Registrar Pagamento", action: () => console.log("Pagamento") },
      ],
    },
  ]

  return (
    <>
      <Button
        variant="outline"
        className="relative h-8 w-full justify-start rounded-[0.5rem] bg-background text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        Buscar...
        <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Digite um comando ou busque..." />
        <CommandList>
          <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
          {commands.map((group) => (
            <CommandGroup key={group.group} heading={group.group}>
              {group.items.map((item) => (
                <CommandItem
                  key={item.label}
                  onSelect={() => {
                    item.action()
                    setOpen(false)
                  }}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  <span>{item.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  )
}
