"use client"

import { Bell, Search, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ClientSelector } from "@/components/master/client-selector"

interface HeaderProps {
  isMasterAdmin?: boolean
}

export function Header({ isMasterAdmin = false }: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-baita-200 bg-white/95 backdrop-blur-sm px-6 shadow-sm">
      <div className="flex items-center space-x-4 flex-1">
        {isMasterAdmin && <ClientSelector />}

        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-baita-500" />
          <Input
            placeholder={isMasterAdmin ? "Buscar clientes, planos..." : "Buscar reservas, hóspedes..."}
            className="pl-10 border-baita-200 focus:border-baita-500 focus:ring-baita-500 bg-white/80"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {isMasterAdmin && (
          <Button
            variant="outline"
            size="sm"
            className="hidden md:flex items-center border-baita-300 text-baita-700 hover:bg-baita-50"
          >
            <Shield className="mr-2 h-4 w-4 text-baita-600" />
            Modo Master Admin
          </Button>
        )}

        <Button variant="ghost" size="icon" className="text-baita-600 hover:bg-baita-50">
          <Bell className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8 border-2 border-baita-200">
                <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Avatar" />
                <AvatarFallback className="bg-baita-100 text-baita-700 font-medium">
                  {isMasterAdmin ? "MA" : "HM"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 border-baita-200" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-baita-900">
                  {isMasterAdmin ? "Master Admin" : "Hotel Manager"}
                </p>
                <p className="text-xs leading-none text-baita-600">
                  {isMasterAdmin ? "admin@baitahotel.com" : "manager@hotelvistamar.com"}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-baita-200" />
            <DropdownMenuItem className="text-baita-700 hover:bg-baita-50">Perfil</DropdownMenuItem>
            <DropdownMenuItem className="text-baita-700 hover:bg-baita-50">Configurações</DropdownMenuItem>
            <DropdownMenuSeparator className="bg-baita-200" />
            <DropdownMenuItem className="text-baita-700 hover:bg-baita-50">Sair</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
