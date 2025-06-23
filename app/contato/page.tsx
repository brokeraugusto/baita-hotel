"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Building2, ArrowLeft, Mail, Phone, MapPin, Send, MessageSquare, Clock, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ContatoPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Simulação de envio de mensagem
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setSuccess(true)
    } catch (err) {
      setError("Não foi possível enviar sua mensagem. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen baita-gradient p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <Link href="/landing" className="inline-flex items-center text-baita-600 hover:text-baita-700 mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao site
          </Link>
          <div className="flex items-center justify-center mb-4">
            <Building2 className="h-10 w-10 text-baita-600" />
          </div>
          <h1 className="text-4xl font-display font-bold text-baita-900 mb-2">Entre em Contato</h1>
          <p className="text-baita-700 text-lg">Estamos aqui para ajudar você a transformar seu hotel</p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Informações de Contato */}
          <div className="space-y-6">
            <Card className="border-baita-200/50 shadow-baita backdrop-blur-sm bg-white/95">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-baita-600" />
                  Telefone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-baita-700 font-medium">(11) 9999-9999</p>
                <p className="text-sm text-baita-600">Segunda a Sexta, 8h às 18h</p>
              </CardContent>
            </Card>

            <Card className="border-baita-200/50 shadow-baita backdrop-blur-sm bg-white/95">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-baita-600" />
                  Email
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-baita-700 font-medium">contato@baitahotel.com</p>
                <p className="text-sm text-baita-600">Resposta em até 24h</p>
              </CardContent>
            </Card>

            <Card className="border-baita-200/50 shadow-baita backdrop-blur-sm bg-white/95">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-baita-600" />
                  Endereço
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-baita-700 font-medium">São Paulo, SP</p>
                <p className="text-sm text-baita-600">Brasil</p>
              </CardContent>
            </Card>

            <Card className="border-baita-200/50 shadow-baita backdrop-blur-sm bg-white/95">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-baita-600" />
                  Horário de Atendimento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  <p className="text-baita-700">
                    <strong>Segunda a Sexta:</strong> 8h às 18h
                  </p>
                  <p className="text-baita-700">
                    <strong>Sábado:</strong> 9h às 14h
                  </p>
                  <p className="text-baita-700">
                    <strong>Domingo:</strong> Fechado
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Formulário de Contato */}
          <div className="md:col-span-2">
            <Card className="border-baita-200/50 shadow-baita-lg backdrop-blur-sm bg-white/95">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <MessageSquare className="h-6 w-6 text-baita-600" />
                  Envie sua Mensagem
                </CardTitle>
                <CardDescription>
                  Preencha o formulário abaixo e nossa equipe entrará em contato em breve
                </CardDescription>
              </CardHeader>
              <CardContent>
                {success ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Send className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-green-900 mb-2">Mensagem Enviada!</h3>
                    <p className="text-green-700 mb-4">
                      Recebemos sua mensagem e nossa equipe entrará em contato em breve.
                    </p>
                    <Button onClick={() => setSuccess(false)} variant="outline">
                      Enviar Nova Mensagem
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome Completo</Label>
                        <Input id="name" placeholder="Seu nome completo" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="seu@email.com" required />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefone</Label>
                        <Input id="phone" placeholder="(11) 99999-9999" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company">Hotel/Empresa</Label>
                        <Input id="company" placeholder="Nome do seu hotel" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Assunto</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o assunto" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="demo">Solicitar Demonstração</SelectItem>
                          <SelectItem value="pricing">Informações sobre Preços</SelectItem>
                          <SelectItem value="support">Suporte Técnico</SelectItem>
                          <SelectItem value="partnership">Parcerias</SelectItem>
                          <SelectItem value="other">Outros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Mensagem</Label>
                      <Textarea id="message" placeholder="Descreva como podemos ajudar você..." rows={6} required />
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Enviando...
                        </div>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Enviar Mensagem
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>

            {/* FAQ Rápido */}
            <Card className="mt-6 border-baita-200/50 shadow-baita backdrop-blur-sm bg-white/95">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-baita-600" />
                  Perguntas Frequentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-baita-900">Como funciona o teste grátis?</h4>
                    <p className="text-sm text-baita-700">
                      Você tem 7 dias para testar todas as funcionalidades sem compromisso.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-baita-900">Preciso de cartão de crédito?</h4>
                    <p className="text-sm text-baita-700">
                      Não, o teste é completamente gratuito e não requer cartão de crédito.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-baita-900">Vocês oferecem treinamento?</h4>
                    <p className="text-sm text-baita-700">
                      Sim, oferecemos treinamento completo e suporte durante a implementação.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
