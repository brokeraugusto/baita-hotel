"use client"

import { useState } from "react"
import Link from "next/link"
import { Building2, Menu, X, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export function LandingHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navigation = [
    { name: "Funcionalidades", href: "#features" },
    { name: "Preços", href: "#pricing" },
    { name: "Depoimentos", href: "#testimonials" },
    { name: "Contato", href: "/contato" },
  ]

  return (
    <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-baita-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/landing" className="flex items-center space-x-2">
            <div className="relative">
              <Building2 className="h-8 w-8 text-baita-600" />
              <Sparkles className="h-3 w-3 text-gold-500 absolute -top-1 -right-1" />
            </div>
            <span className="text-xl font-display font-bold text-baita-900">BaitaHotel</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-baita-700 hover:text-baita-900 font-medium transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/login">
              <Button variant="outline" className="border-baita-300 text-baita-700 hover:bg-baita-50">
                Entrar
              </Button>
            </Link>
            <Link href="/cadastro">
              <Button className="bg-baita-600 hover:bg-baita-700 text-white">Teste Grátis</Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-baita-700">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-baita-200">
            <div className="flex flex-col space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-baita-700 hover:text-baita-900 font-medium transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="flex flex-col space-y-2 pt-4">
                <Link href="/login">
                  <Button variant="outline" className="w-full border-baita-300 text-baita-700 hover:bg-baita-50">
                    Entrar
                  </Button>
                </Link>
                <Link href="/cadastro">
                  <Button className="w-full bg-baita-600 hover:bg-baita-700 text-white">Teste Grátis</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
