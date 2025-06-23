"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Building2, ArrowLeft, ArrowRight, CheckCircle, Loader2, AlertCircle } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"

export default function CadastroPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    hotel_name: "",
    phone: "",
    address: "",
    rooms: "",
  })
  const router = useRouter()
  const { signUp } = useAuth()

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError(null)
  }

  const validateStep1 = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError("Todos os campos são obrigatórios.")
      return false
    }
    if (formData.password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.")
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem.")
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (!formData.name || !formData.hotel_name || !formData.phone || !formData.address) {
      setError("Todos os campos são obrigatórios.")
      return false
    }
    return true
  }

  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) return
    if (currentStep === 2 && !validateStep2()) return
    setCurrentStep((prev) => prev + 1)
    setError(null)
  }

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1)
    setError(null)
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const success = await signUp(formData)

      if (success) {
        // Redirecionar para o dashboard do cliente
        router.push("/client")
      } else {
        setError("Email já cadastrado. Tente fazer login ou use outro email.")
      }
    } catch (error: any) {
      console.error("Erro no cadastro:", error)
      setError("Erro ao criar conta. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Building2 className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">BaitaHotel</span>
          </div>
          <p className="text-gray-600">Cadastro de Novo Hotel</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl">Criar Conta</CardTitle>
            <CardDescription>Etapa {currentStep} de 3</CardDescription>
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              />
            </div>
          </CardHeader>

          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Etapa 1: Dados da Conta */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Dados da Conta</h3>
                  <p className="text-sm text-gray-600">Crie suas credenciais de acesso</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="seu@email.com"
                    className="bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    placeholder="Digite a senha novamente"
                    className="bg-white"
                  />
                </div>

                <Button onClick={handleNext} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  Próximo <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Etapa 2: Dados do Hotel */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Dados do Hotel</h3>
                  <p className="text-sm text-gray-600">Informações sobre seu estabelecimento</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Seu nome completo"
                    className="bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hotel_name">Nome do Hotel</Label>
                  <Input
                    id="hotel_name"
                    type="text"
                    value={formData.hotel_name}
                    onChange={(e) => handleInputChange("hotel_name", e.target.value)}
                    placeholder="Nome do seu hotel"
                    className="bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    placeholder="Endereço completo do hotel"
                    className="bg-white"
                  />
                </div>

                <div className="flex space-x-2">
                  <Button onClick={handleBack} variant="outline" className="flex-1">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                  </Button>
                  <Button onClick={handleNext} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                    Próximo <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Etapa 3: Confirmação */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Confirmar Dados</h3>
                  <p className="text-sm text-gray-600">Verifique as informações antes de finalizar</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div>
                    <span className="font-medium">Email:</span> {formData.email}
                  </div>
                  <div>
                    <span className="font-medium">Nome:</span> {formData.name}
                  </div>
                  <div>
                    <span className="font-medium">Hotel:</span> {formData.hotel_name}
                  </div>
                  <div>
                    <span className="font-medium">Telefone:</span> {formData.phone}
                  </div>
                  <div>
                    <span className="font-medium">Endereço:</span> {formData.address}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button onClick={handleBack} variant="outline" className="flex-1">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Finalizar Cadastro
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            <div className="mt-6 text-center text-sm text-gray-500">
              Já tem uma conta?{" "}
              <a href="/login" className="text-blue-600 hover:text-blue-800 hover:underline">
                Faça login aqui
              </a>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <a href="/landing" className="text-sm text-gray-500 hover:text-gray-700 hover:underline">
            ← Voltar para página inicial
          </a>
        </div>
      </div>
    </div>
  )
}
