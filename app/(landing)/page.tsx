"use client"
import { useAuth } from "@/components/auth/auth-provider-minimal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Hotel, Users, BarChart3, Settings, TestTube, Activity, Loader2 } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

export default function LandingPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Carregando sistema...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Hotel className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Baita Hotel</h1>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated && user ? (
                <div className="flex items-center space-x-3">
                  <Badge variant={user.role === "master_admin" ? "default" : "secondary"}>
                    {user.role === "master_admin" ? "Master Admin" : "Cliente"}
                  </Badge>
                  <span className="text-sm text-gray-600">Olá, {user.full_name}</span>
                  <Button asChild>
                    <Link href={user.role === "master_admin" ? "/master/dashboard" : "/client"}>Dashboard</Link>
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Button variant="outline" asChild>
                        <Link href="/login">Login</Link>
                      </Button>
                      <Button asChild>
                        <Link href="/cadastro">Cadastrar</Link>
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Sistema de Gestão Hoteleira</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Plataforma completa para gerenciamento de hotéis com recursos avançados de reservas, limpeza, manutenção e
            relatórios financeiros.
          </p>

          {!isAuthenticated && (
            <div className="flex justify-center space-x-4">
              <Button size="lg" asChild>
                <Link href="/login">Começar Agora</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/contato">Saiba Mais</Link>
              </Button>
            </div>
          )}
        </div>

        {/* System Status */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-900">Sistema Online</span>
            </div>
            <div className="text-sm text-gray-600">Última atualização: {new Date().toLocaleString("pt-BR")}</div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <Users className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>Gestão de Hóspedes</CardTitle>
              <CardDescription>
                Controle completo de reservas, check-in/check-out e histórico de hóspedes
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Settings className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle>Manutenção</CardTitle>
              <CardDescription>Sistema completo de ordens de serviço e manutenção preventiva</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="h-8 w-8 text-purple-600 mb-2" />
              <CardTitle>Relatórios Financeiros</CardTitle>
              <CardDescription>Análises detalhadas de receitas, despesas e performance do hotel</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Test Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="text-center mb-6">
            <TestTube className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Área de Testes</h2>
            <p className="text-gray-600">Teste todas as funcionalidades do sistema com credenciais de demonstração</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Badge>Master Admin</Badge>
                  <span>Administrador</span>
                </CardTitle>
                <CardDescription>Acesso completo ao sistema, gestão de clientes e relatórios globais</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Email:</strong> admin@baitahotel.com
                  </p>
                  <p>
                    <strong>Senha:</strong> admin123
                  </p>
                </div>
                <Button className="w-full mt-4" asChild>
                  <Link href="/login?type=master">Testar como Admin</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Badge variant="secondary">Cliente</Badge>
                  <span>Hotel</span>
                </CardTitle>
                <CardDescription>Gestão completa do hotel: reservas, limpeza, manutenção e finanças</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Email:</strong> hotel@exemplo.com
                  </p>
                  <p>
                    <strong>Senha:</strong> hotel123
                  </p>
                </div>
                <Button className="w-full mt-4" variant="outline" asChild>
                  <Link href="/login?type=client">Testar como Cliente</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <Activity className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle>Sistema de Saúde</CardTitle>
              <CardDescription>Monitore o status do sistema e conectividade</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/system-health">Verificar Status</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <TestTube className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>Testes Automatizados</CardTitle>
              <CardDescription>Execute testes completos do sistema de login</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/test-login">Executar Testes</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Hotel className="h-8 w-8 text-purple-600 mb-2" />
              <CardTitle>Documentação</CardTitle>
              <CardDescription>Guias e documentação do sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/contato">Ver Documentação</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 Baita Hotel System. Sistema de gestão hoteleira completo.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
