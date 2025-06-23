"use client"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { useToast } from "@/hooks/use-toast"
import {
  Menu,
  Search,
  Settings,
  User,
  LogOut,
  ChevronRight,
  Home,
  Calendar,
  Hotel,
  Tag,
  DollarSign,
  Clock,
  Users,
  CreditCard,
  PenToolIcon as Tool,
  Brush,
  BarChart3,
  Bell,
} from "lucide-react"

interface ClientHeaderProps {
  onMenuClick: () => void
}

export function ClientHeader({ onMenuClick }: ClientHeaderProps) {
  const pathname = usePathname()
  const { toast } = useToast()
  const router = useRouter()

  // Simulação de dados do usuário
  const user = {
    name: "João Silva",
    email: "hotel@exemplo.com",
    hotel_name: "Hotel Exemplo",
    plan: "Professional",
    avatar: "/placeholder.svg?height=32&width=32",
  }

  // Mapeamento de rotas para breadcrumbs
  const routeMap: Record<string, { title: string; icon: any }> = {
    "/client": { title: "Dashboard", icon: Home },
    "/client/reservas": { title: "Reservas", icon: Calendar },
    "/client/reservas-nova": { title: "Nova Reserva", icon: Calendar },
    "/client/mapa-reservas": { title: "Mapa de Reservas", icon: Calendar },
    "/client/acomodacoes": { title: "Acomodações", icon: Hotel },
    "/client/acomodacoes/nova": { title: "Nova Acomodação", icon: Hotel },
    "/client/busca-rapida": { title: "Busca Rápida", icon: Search },
    "/client/categorias": { title: "Categorias", icon: Tag },
    "/client/precos": { title: "Preços & Tarifas", icon: DollarSign },
    "/client/checkin": { title: "Check-in/Check-out", icon: Clock },
    "/client/hospedes": { title: "Hóspedes", icon: Users },
    "/client/financeiro-hotel": { title: "Financeiro", icon: CreditCard },
    "/client/manutencao": { title: "Manutenção", icon: Tool },
    "/client/limpeza": { title: "Limpeza", icon: Brush },
    "/client/relatorios-hotel": { title: "Relatórios", icon: BarChart3 },
    "/client/configuracoes-hotel": { title: "Configurações", icon: Settings },
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
    <header className="sticky top-0 z-30 flex h-14 sm:h-16 items-center gap-2 sm:gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-3 sm:px-4 lg:px-6">
      {/* Mobile Menu Button */}
      <Button variant="ghost" size="icon" className="lg:hidden h-8 w-8 sm:h-9 sm:w-9" onClick={onMenuClick}>
        <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
        <span className="sr-only">Abrir menu</span>
      </Button>

      {/* Breadcrumb - Hidden on small mobile */}
      <div className="hidden sm:flex items-center gap-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Home className="h-4 w-4" />
          <span className="hidden md:inline">Painel</span>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        <div className="flex items-center gap-2 font-medium">
          <CurrentIcon className="h-4 w-4" />
          <span className="truncate max-w-32 sm:max-w-none">{currentRoute.title}</span>
        </div>
      </div>

      {/* Page Title for Mobile */}
      <div className="sm:hidden flex items-center gap-2 font-medium text-sm">
        <CurrentIcon className="h-4 w-4" />
        <span className="truncate">{currentRoute.title}</span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search Bar - Hidden on mobile and small tablets */}
      <div className="hidden lg:flex items-center gap-2 max-w-sm flex-1">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar reservas, hóspedes..." className="pl-9 h-9" />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Search Command - Mobile and Tablet */}
        <div className="lg:hidden">
          <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 relative">
          <Bell className="h-4 w-4" />
        </Button>

        {/* Theme Toggle - Hidden on small mobile */}
        <div className="hidden sm:block">
          <ThemeToggle />
        </div>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 sm:h-9 sm:w-9 rounded-full">
              <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback className="bg-blue-100 text-blue-700 text-xs sm:text-sm">
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
                <div className="flex items-center gap-2 mt-2"></div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/client/perfil")}>
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Configurações</span>
            </DropdownMenuItem>
            {/* Theme Toggle for Mobile */}
            <div className="sm:hidden">
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <span className="mr-2">🌙</span>
                <span>Tema</span>
              </DropdownMenuItem>
            </div>
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
