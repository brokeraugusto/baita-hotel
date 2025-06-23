"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Building2, Mail, Lock, User, Phone, MapPin, ArrowLeft, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function CadastroPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState(1)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Simulação de cadastro
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Redireciona para o painel do cliente após cadastro
      router.push("/(client)")
    } catch (err) {
      setError("Erro ao criar conta. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const nextStep = () => setStep(step + 1)
  const prevStep = () => setStep(step - 1)

  return (
    <div className="flex min-h-screen items-center justify-center baita-gradient p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-baita-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-ocean-200/30 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-2xl relative z-10">
        <div className="mb-8 text-center animate-fade-in">
          <Link href="/landing" className="inline-flex items-center text-baita-600 hover:text-baita-700 mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao site
          </Link>
          <div className="flex items-center justify-center mb-4">
            <Building2 className="h-10 w-10 text-baita-600" />
          </div>
          <h1 className="text-3xl font-display font-bold text-baita-900 mb-2">Teste Grátis por 7 Dias</h1>
          <p className="text-baita-700">Configure sua conta em poucos minutos</p>
        </div>

        <Card className="border-baita-200/50 shadow-baita-lg backdrop-blur-sm bg-white/95">
          <CardHeader className="bg-gradient-to-r from-baita-600 to-ocean-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl">Criar Conta</CardTitle>
            <CardDescription className="text-baita-100">
              Passo {step} de 3 - {step === 1 ? "Dados Pessoais" : step === 2 ? "Dados do Hotel" : "Finalização"}
            </CardDescription>

            {/* Progress bar */}
            <div className="w-full bg-baita-500/30 rounded-full h-2 mt-4">
              <div
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              ></div>
            </div>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="pt-6 space-y-5">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Nome</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-baita-500" />
                        <Input id="firstName" placeholder="Seu nome" className="pl-10" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Sobrenome</Label>
                      <Input id="lastName" placeholder="Seu sobrenome" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-baita-500" />
                      <Input id="email" type="email" placeholder="seu@email.com" className="pl-10" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-baita-500" />
                      <Input id="phone" placeholder="(11) 99999-9999" className="pl-10" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-baita-500" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Mínimo 8 caracteres"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="hotelName">Nome do Hotel/Pousada</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-baita-500" />
                      <Input id="hotelName" placeholder="Nome do seu estabelecimento" className="pl-10" required />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rooms">Número de Quartos</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-10">1 a 10 quartos</SelectItem>
                          <SelectItem value="11-25">11 a 25 quartos</SelectItem>
                          <SelectItem value="26-50">26 a 50 quartos</SelectItem>
                          <SelectItem value="51-100">51 a 100 quartos</SelectItem>
                          <SelectItem value="100+">Mais de 100 quartos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Tipo de Estabelecimento</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hotel">Hotel</SelectItem>
                          <SelectItem value="pousada">Pousada</SelectItem>
                          <SelectItem value="resort">Resort</SelectItem>
                          <SelectItem value="hostel">Hostel</SelectItem>
                          <SelectItem value="apart-hotel">Apart-hotel</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Endereço</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-baita-500" />
                      <Input id="address" placeholder="Endereço completo" className="pl-10" required />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">Cidade</Label>
                      <Input id="city" placeholder="Cidade" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">Estado</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="UF" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SP">São Paulo</SelectItem>
                          <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                          <SelectItem value="MG">Minas Gerais</SelectItem>
                          <SelectItem value="SC">Santa Catarina</SelectItem>
                          <SelectItem value="PR">Paraná</SelectItem>
                          {/* Adicionar outros estados */}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <CheckCircle className="h-16 w-16 text-success-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-baita-900 mb-2">Quase pronto!</h3>
                    <p className="text-baita-700">Revise os termos e finalize seu cadastro</p>
                  </div>

                  <div className="bg-baita-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-baita-900 mb-2">Seu teste grátis inclui:</h4>
                    <ul className="space-y-2 text-sm text-baita-700">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-success-500 mr-2" />7 dias de acesso completo
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-success-500 mr-2" />
                        Todas as funcionalidades desbloqueadas
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-success-500 mr-2" />
                        Suporte técnico incluído
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-success-500 mr-2" />
                        Sem compromisso de permanência
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-2">
                      <Checkbox id="terms" required />
                      <Label htmlFor="terms" className="text-sm text-baita-700 leading-relaxed">
                        Aceito os{" "}
                        <a href="#" className="text-baita-600 hover:underline">
                          Termos de Uso
                        </a>{" "}
                        e a{" "}
                        <a href="#" className="text-baita-600 hover:underline">
                          Política de Privacidade
                        </a>
                      </Label>
                    </div>

                    <div className="flex items-start space-x-2">
                      <Checkbox id="newsletter" />
                      <Label htmlFor="newsletter" className="text-sm text-baita-700">
                        Quero receber dicas e novidades sobre gestão hoteleira
                      </Label>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex justify-between">
              {step > 1 && (
                <Button type="button" variant="outline" onClick={prevStep}>
                  Voltar
                </Button>
              )}

              {step < 3 ? (
                <Button type="button" onClick={nextStep} className="ml-auto">
                  Próximo
                </Button>
              ) : (
                <Button type="submit" disabled={isLoading} className="ml-auto">
                  {isLoading ? "Criando conta..." : "Criar Conta e Começar Teste"}
                </Button>
              )}
            </CardFooter>
          </form>
        </Card>

        <div className="text-center mt-6">
          <p className="text-baita-700 text-sm">
            Já tem uma conta?{" "}
            <Link href="/auth/login" className="text-baita-600 hover:text-baita-700 font-medium">
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
