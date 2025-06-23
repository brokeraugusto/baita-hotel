"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import {
  Building2,
  Users,
  Calendar,
  BedDouble,
  ClipboardList,
  DollarSign,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Brush,
  PenToolIcon as Tool,
  Tag,
  Search,
  Map,
  Home,
  X,
  Layers,
  Sparkles,
  Clock,
} from "lucide-react"

interface SidebarProps {
  className?: string
  onClose?: () => void
}

interface NavItem {
  label: string
  icon: any
  href: string
  active?: boolean
  badge?: string | undefined
}

interface NavGroup {
  title: string
  items: NavItem[]
}

export function ClientSidebar({ className, onClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const { toast } = useToast()

  // Simulação de dados do usuário hotel
  const user = {
    name: "Hotel Manager",
    email: "manager@baitahotel.com",
    role: "Gerente do Hotel",
    avatar: "HM",
  }

  // Organização hierárquica dos itens de navegação
  const navGroups: NavGroup[] = [
    {
      title: "Principal",
      items: [
        {
          label: "Dashboard",
          icon: Home,
          href: "/client",
          active: pathname === "/client",
          badge: undefined,
        },
      ],
    },
    {
      title: "Reservas",
      items: [
        {
          label: "Busca Rápida",
          icon: Search,
          href: "/client/busca-rapida",
          active: pathname === "/client/busca-rapida",
          badge: undefined,
        },
        {
          label: "Reservas",
          icon: Calendar,
          href: "/client/reservas",
          active: pathname === "/client/reservas",
          badge: undefined,
        },
        {
          label: "Nova Reserva",
          icon: Calendar,
          href: "/client/reservas-nova",
          active: pathname === "/client/reservas-nova",
          badge: undefined,
        },
        {
          label: "Mapa de Reservas",
          icon: Map,
          href: "/client/mapa-reservas",
          active: pathname === "/client/mapa-reservas",
          badge: undefined,
        },
        {
          label: "Check-in/Check-out",
          icon: Clock,
          href: "/client/checkin",
          active: pathname === "/client/checkin",
          badge: undefined,
        },
      ],
    },
    {
      title: "Acomodações",
      items: [
        {
          label: "Acomodações",
          icon: BedDouble,
          href: "/client/acomodacoes",
          active: pathname === "/client/acomodacoes",
          badge: undefined,
        },
        {
          label: "Categorias",
          icon: Layers,
          href: "/client/categorias",
          active: pathname === "/client/categorias",
          badge: undefined,
        },
        {
          label: "Comodidades",
          icon: Sparkles,
          href: "/client/comodidades",
          active: pathname === "/client/comodidades",
          badge: undefined,
        },
      ],
    },
    {
      title: "Gestão",
      items: [
        {
          label: "Limpeza",
          icon: Brush,
          href: "/client/limpeza",
          active: pathname === "/client/limpeza",
          badge: undefined,
        },
        {
          label: "Hóspedes",
          icon: Users,
          href: "/client/hospedes",
          active: pathname === "/client/hospedes",
          badge: undefined,
        },
        {
          label: "Manutenção",
          icon: Tool,
          href: "/client/manutencao",
          active: pathname === "/client/manutencao",
          badge: undefined,
        },
      ],
    },
    {
      title: "Financeiro",
      items: [
        {
          label: "Financeiro",
          icon: DollarSign,
          href: "/client/financeiro-hotel",
          active: pathname === "/client/financeiro-hotel",
          badge: undefined,
        },
        {
          label: "Preços & Tarifas",
          icon: Tag,
          href: "/client/precos",
          active: pathname === "/client/precos",
          badge: undefined,
        },
        {
          label: "Períodos Tarifários",
          icon: Calendar,
          href: "/client/periodos-tarifarios",
          active: pathname === "/client/periodos-tarifarios",
          badge: undefined,
        },
        {
          label: "Regras de Preços",
          icon: ClipboardList,
          href: "/client/regras-precos",
          active: pathname === "/client/regras-precos",
          badge: undefined,
        },
        {
          label: "Simulador de Preços",
          icon: DollarSign,
          href: "/client/simulador-precos",
          active: pathname === "/client/simulador-precos",
          badge: undefined,
        },
      ],
    },
    {
      title: "Relatórios",
      items: [
        {
          label: "Relatórios",
          icon: BarChart3,
          href: "/client/relatorios-hotel",
          active: pathname === "/client/relatorios-hotel",
          badge: undefined,
        },
        {
          label: "Relatórios de Manutenção",
          icon: ClipboardList,
          href: "/client/relatorios-manutencao",
          active: pathname === "/client/relatorios-manutencao",
          badge: undefined,
        },
      ],
    },
    {
      title: "Ferramentas",
      items: [
        {
          label: "Configurações",
          icon: Settings,
          href: "/client/configuracoes-hotel",
          active: pathname === "/client/configuracoes-hotel",
          badge: undefined,
        },
      ],
    },
  ]

  const handleLogout = () => {
    localStorage.removeItem("baitahotel_user")
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso.",
      variant: "default",
    })
    setTimeout(() => {
      window.location.href = "/login"
    }, 1000)
  }

  return (
    <div
      className={cn(
        "relative flex flex-col border-r bg-background transition-all duration-300 h-screen",
        collapsed ? "w-16" : "w-72",
        className,
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center border-b px-4">
        <Link
          href="/client"
          className={cn("flex items-center gap-2 font-semibold", collapsed ? "justify-center" : "justify-start")}
        >
          <Building2 className="h-7 w-7 text-primary" />
          {!collapsed && <span className="text-xl">BaitaHotel</span>}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className={cn("ml-auto", collapsed ? "hidden" : "flex")}
          onClick={() => setCollapsed(!collapsed)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {collapsed && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute -right-3 top-6 h-6 w-6 rounded-full border bg-background shadow-md z-10"
            onClick={() => setCollapsed(!collapsed)}
          >
            <ChevronRight className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Mobile Close Button */}
      {onClose && (
        <div className="lg:hidden flex justify-end p-2 border-b">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* User Info */}
      <div className={cn("border-b p-4", collapsed ? "px-2" : "px-4")}>
        {!collapsed ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                {user.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                <Building2 className="h-3 w-3" />
                Cliente
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
              {user.avatar}
            </div>
            <Building2 className="h-3 w-3 text-primary" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-2">
        <nav className="grid gap-4 px-2">
          {!collapsed &&
            navGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="grid gap-1">
                <div className="px-3 py-1">
                  <h3 className="text-xs font-medium text-muted-foreground tracking-wider uppercase">{group.title}</h3>
                </div>
                {group.items.map((item, itemIndex) => (
                  <Link
                    key={itemIndex}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all hover:bg-accent hover:text-accent-foreground",
                      item.active ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground",
                    )}
                    onClick={onClose}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    <span className="flex-1">{item.label}</span>
                  </Link>
                ))}
              </div>
            ))}

          {/* Collapsed view - just icons */}
          {collapsed && (
            <div className="grid gap-1 px-2">
              {navGroups.map((group) =>
                group.items.map((item, i) => (
                  <Link
                    key={i}
                    href={item.href}
                    className={cn(
                      "relative flex items-center justify-center rounded-lg px-3 py-2.5 text-sm transition-all hover:bg-accent hover:text-accent-foreground",
                      item.active ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground",
                    )}
                    onClick={onClose}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                  </Link>
                )),
              )}
            </div>
          )}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t p-4">
        <Button
          variant="ghost"
          className={cn(
            "w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-red-50 hover:text-red-700",
            collapsed ? "justify-center px-2" : "justify-start",
          )}
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span>Sair</span>}
        </Button>
      </div>
    </div>
  )
}
