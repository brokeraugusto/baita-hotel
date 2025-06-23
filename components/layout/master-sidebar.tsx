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
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  Package,
  HeadphonesIcon,
  X,
  Home,
  Layout,
} from "lucide-react"

interface SidebarProps {
  className?: string
  onClose?: () => void
}

export function MasterSidebar({ className, onClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const { toast } = useToast()

  // Simulação de dados do usuário master
  const user = {
    name: "Admin Master",
    email: "admin@baitahotel.com",
    role: "Master Administrator",
    avatar: "MA",
  }

  const routes = [
    {
      label: "Dashboard",
      icon: Home,
      href: "/master",
      active: pathname === "/master",
      badge: null,
    },
    {
      label: "Clientes",
      icon: Users,
      href: "/master/clientes",
      active: pathname === "/master/clientes",
      badge: "24",
    },
    {
      label: "Planos",
      icon: Package,
      href: "/master/planos",
      active: pathname === "/master/planos",
      badge: null,
    },
    {
      label: "Financeiro",
      icon: CreditCard,
      href: "/master/financeiro",
      active: pathname === "/master/financeiro",
      badge: null,
    },
    {
      label: "Relatórios",
      icon: BarChart3,
      href: "/master/relatorios",
      active: pathname === "/master/relatorios",
      badge: null,
    },
    {
      label: "Landing Page",
      icon: Layout,
      href: "/master/landing-page",
      active: pathname === "/master/landing-page",
      badge: null,
    },
    {
      label: "Suporte",
      icon: HeadphonesIcon,
      href: "/master/suporte",
      active: pathname === "/master/suporte",
      badge: "7",
    },
    {
      label: "Configurações",
      icon: Settings,
      href: "/master/configuracoes",
      active: pathname === "/master/configuracoes",
      badge: null,
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
          href="/master"
          className={cn("flex items-center gap-2 font-semibold", collapsed ? "justify-center" : "justify-start")}
        >
          <Building2 className="h-7 w-7 text-purple-600" />
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
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-700 font-semibold">
                {user.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                <Shield className="h-3 w-3" />
                Master Admin
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-700 font-semibold text-sm">
              {user.avatar}
            </div>
            <Shield className="h-3 w-3 text-purple-600" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-2">
        <nav className="grid gap-1 px-2">
          {routes.map((route, i) => (
            <Link
              key={i}
              href={route.href}
              className={cn(
                "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all hover:bg-accent hover:text-accent-foreground",
                route.active ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground",
                collapsed ? "justify-center px-2" : "justify-start",
              )}
              onClick={onClose} // Close mobile menu when clicking a link
            >
              <route.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1">{route.label}</span>
                  {route.badge && (
                    <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs text-white font-medium">
                      {route.badge}
                    </span>
                  )}
                </>
              )}
              {collapsed && route.badge && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-xs text-white font-medium">
                  {route.badge}
                </span>
              )}
            </Link>
          ))}
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
