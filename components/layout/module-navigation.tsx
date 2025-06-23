"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { usePermissions } from "@/components/auth/permission-guard"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Building2, Calendar, DollarSign, BarChart3, Users, Wrench, Sparkles, TrendingUp, Lock } from "lucide-react"
import type { ModuleName } from "@/lib/types/permissions"

interface NavigationItem {
  name: string
  href: string
  icon: React.ElementType
  module: ModuleName
  badge?: string
  description: string
}

const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    name: "Acomodações",
    href: "/client/acomodacoes",
    icon: Building2,
    module: "accommodations",
    description: "Gestão de quartos e tipos de acomodação",
  },
  {
    name: "Reservas",
    href: "/client/reservas",
    icon: Calendar,
    module: "reservations",
    description: "Controle de reservas e disponibilidade",
  },
  {
    name: "Hóspedes",
    href: "/client/hospedes",
    icon: Users,
    module: "guests",
    description: "Cadastro e histórico de hóspedes",
  },
  {
    name: "Financeiro",
    href: "/client/financeiro",
    icon: DollarSign,
    module: "financial",
    description: "Controle financeiro e faturamento",
  },
  {
    name: "Relatórios",
    href: "/client/relatorios-hotel",
    icon: BarChart3,
    module: "reports",
    description: "Relatórios e análises",
  },
  {
    name: "Manutenção",
    href: "/client/manutencao",
    icon: Wrench,
    module: "maintenance",
    description: "Ordens de serviço e manutenção",
  },
  {
    name: "Limpeza",
    href: "/client/limpeza",
    icon: Sparkles,
    module: "housekeeping",
    description: "Controle de limpeza e governança",
  },
  {
    name: "Analytics",
    href: "/client/analytics",
    icon: TrendingUp,
    module: "analytics",
    description: "Analytics avançado e insights",
  },
]

interface ModuleNavigationProps {
  collapsed?: boolean
  onItemClick?: () => void
}

export function ModuleNavigation({ collapsed = false, onItemClick }: ModuleNavigationProps) {
  const pathname = usePathname()
  const { hasModuleAccess, getAccessibleModules, userPlan } = usePermissions()

  const accessibleModules = getAccessibleModules()

  return (
    <nav className="space-y-1">
      {NAVIGATION_ITEMS.map((item) => {
        const hasAccess = hasModuleAccess(item.module)
        const isActive = pathname === item.href

        if (!hasAccess) {
          return (
            <div
              key={item.name}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all",
                "text-muted-foreground/50 cursor-not-allowed",
                collapsed ? "justify-center px-2" : "justify-start",
              )}
              title={collapsed ? `${item.name} - Não disponível no seu plano` : undefined}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1">{item.name}</span>
                  <Lock className="h-3 w-3" />
                </>
              )}
            </div>
          )
        }

        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={onItemClick}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all hover:bg-accent hover:text-accent-foreground",
              isActive ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground",
              collapsed ? "justify-center px-2" : "justify-start",
            )}
            title={collapsed ? item.description : undefined}
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {!collapsed && (
              <>
                <span className="flex-1">{item.name}</span>
                {item.badge && (
                  <Badge variant="secondary" className="text-xs">
                    {item.badge}
                  </Badge>
                )}
              </>
            )}
          </Link>
        )
      })}

      {/* Plan Indicator */}
      {!collapsed && (
        <div className="mt-4 pt-4 border-t">
          <div className="px-3 py-2">
            <div className="text-xs text-muted-foreground mb-1">Plano Atual</div>
            <Badge variant="outline" className="text-xs">
              {userPlan.charAt(0).toUpperCase() + userPlan.slice(1)}
            </Badge>
          </div>
        </div>
      )}
    </nav>
  )
}
