"use client"

import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "@/components/advanced/theme-toggle"
import { NotificationsCenter } from "@/components/advanced/notifications-center"
import { SearchCommand } from "@/components/advanced/search-command"
import { useToast } from "@/hooks/use-toast"
import {
  Menu,
  Search,
  Settings,
  User,
  LogOut,
  ChevronRight,
  Home,
  Users,
  Package,
  CreditCard,
  BarChart3,
  HeadphonesIcon,
  Shield,
} from "lucide-react"

interface MasterHeaderProps {
  onMenuClick: () => void
}

export function MasterHeader({ onMenuClick }: MasterHeaderProps) {
  const pathname = usePathname()
  const { toast } = useToast()

  // Simulação de dados do usuário master
  const user = {
    name: "Admin Master",
    email: "admin@baitahotel.com",
    role: "Master Administrator",
    avatar: "/placeholder.svg?height=32&width=32",
  }

  // Mapeamento de rotas para breadcrumbs
  const routeMap: Record<string, { title: string; icon: any }> = {
    "/master": { title: "Dashboard", icon: Home },
    "/master/clientes": { title: "Clientes", icon: Users },
    "/master/planos": { title: "Planos", icon: Package },
    "/master/financeiro": { title: "Financeiro", icon: CreditCard },
    "/master/relatorios": { title: "Relatórios", icon: BarChart3 },
    "/master/suporte": { title: "Suporte", icon: HeadphonesIcon },
    "/master/configuracoes": { title: "Configurações", icon: Settings },
  }

  const currentRoute = routeMap[pathname] || { title: "Página", icon: Home }
  const CurrentIcon = currentRoute.icon

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
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:px-6">
      {/* Mobile Menu Button */}
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
        <Menu className="h-5 w-5" />
        <span className="sr-only">Abrir menu</span>
      </Button>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Shield className="h-4 w-4 text-purple-600" />
          <span>Master Admin</span>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        <div className="flex items-center gap-2 font-medium">
          <CurrentIcon className="h-4 w-4" />
          <span>{currentRoute.title}</span>
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search Bar - Hidden on mobile */}
      <div className="hidden md:flex items-center gap-2 max-w-sm flex-1">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar clientes, planos..." className="pl-9 h-9" />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Search Command - Mobile */}
        <div className="md:hidden">
          <SearchCommand />
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <NotificationsCenter />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback className="bg-purple-100 text-purple-700">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs">
                    <Shield className="h-3 w-3 mr-1" />
                    Master Admin
                  </Badge>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Configurações</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
