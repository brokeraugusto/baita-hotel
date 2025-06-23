"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Calendar,
  Users,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Coffee,
  Printer,
  Download,
  CheckCircle,
  Clock,
  FileText,
} from "lucide-react"

interface VoucherData {
  reservationId: string
  guestName: string
  guestEmail: string
  guestPhone: string
  guestDocument: string
  roomName: string
  roomCategory: string
  checkIn: string
  checkOut: string
  guests: number
  paymentMethod: string
  paymentStatus: string
  totalAmount: number
  breakfast: boolean
  observations?: string
  createdAt: string
  policies: string[]
}

const mockVoucher: VoucherData = {
  reservationId: "BR240115001",
  guestName: "João Silva Santos",
  guestEmail: "joao.silva@email.com",
  guestPhone: "(11) 99999-8888",
  guestDocument: "123.456.789-00",
  roomName: "Suíte 101",
  roomCategory: "Suíte Luxo",
  checkIn: "2024-01-20",
  checkOut: "2024-01-23",
  guests: 2,
  paymentMethod: "PIX",
  paymentStatus: "Confirmado",
  totalAmount: 1539,
  breakfast: true,
  observations: "Lua de mel. Solicitado decoração especial no quarto.",
  createdAt: "2024-01-15T10:30:00",
  policies: [
    "Check-in a partir das 14h00",
    "Check-out até às 12h00",
    "Cancelamento gratuito até 24h antes da data de chegada",
    "Não é permitido fumar nas acomodações",
    "Animais de estimação não são permitidos",
    "É necessário apresentar documento de identidade no check-in",
    "Café da manhã servido das 7h00 às 10h00",
    "Wi-Fi gratuito em todas as áreas",
  ],
}

export default function VoucherPage({ params }: { params: { id: string } }) {
  const [isLoading, setIsLoading] = useState(false)

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPDF = () => {
    setIsLoading(true)
    // Simular download
    setTimeout(() => {
      setIsLoading(false)
      // Aqui faria o download real
    }, 2000)
  }

  const calculateDays = () => {
    const start = new Date(mockVoucher.checkIn)
    const end = new Date(mockVoucher.checkOut)
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Voucher de Reserva</h1>
          <p className="text-muted-foreground">#{mockVoucher.reservationId}</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
          <Button onClick={handleDownloadPDF} disabled={isLoading}>
            <Download className="mr-2 h-4 w-4" />
            {isLoading ? "Gerando..." : "Download PDF"}
          </Button>
        </div>
      </div>

      {/* Voucher Content */}
      <div className="bg-white border rounded-lg p-8 print:shadow-none print:border-none">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">BaitaHotel</h1>
          <p className="text-lg text-gray-600">Voucher de Reserva Confirmada</p>
          <div className="mt-4 inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full">
            <CheckCircle className="mr-2 h-4 w-4" />
            Reserva Confirmada
          </div>
        </div>

        {/* Reservation Info */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Dados da Reserva
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Número:</span>
                <span className="font-bold">{mockVoucher.reservationId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Data da Reserva:</span>
                <span>{new Date(mockVoucher.createdAt).toLocaleDateString("pt-BR")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <Badge variant="default">Confirmada</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pagamento:</span>
                <Badge variant={mockVoucher.paymentStatus === "Confirmado" ? "default" : "destructive"}>
                  {mockVoucher.paymentStatus}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Dados do Hóspede
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Nome:</span>
                <span className="font-medium">{mockVoucher.guestName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Documento:</span>
                <span>{mockVoucher.guestDocument}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">E-mail:</span>
                <span className="text-sm">{mockVoucher.guestEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Telefone:</span>
                <span>{mockVoucher.guestPhone}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stay Details */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="mr-2 h-5 w-5" />
              Detalhes da Estadia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <Calendar className="mr-2 h-4 w-4" />
                  Check-in
                </div>
                <div>
                  <div className="font-bold text-lg">{new Date(mockVoucher.checkIn).toLocaleDateString("pt-BR")}</div>
                  <div className="text-sm text-gray-600">A partir das 14h00</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <Calendar className="mr-2 h-4 w-4" />
                  Check-out
                </div>
                <div>
                  <div className="font-bold text-lg">{new Date(mockVoucher.checkOut).toLocaleDateString("pt-BR")}</div>
                  <div className="text-sm text-gray-600">Até às 12h00</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <Clock className="mr-2 h-4 w-4" />
                  Duração
                </div>
                <div>
                  <div className="font-bold text-lg">
                    {calculateDays()} {calculateDays() === 1 ? "diária" : "diárias"}
                  </div>
                  <div className="text-sm text-gray-600">
                    {mockVoucher.guests} {mockVoucher.guests === 1 ? "hóspede" : "hóspedes"}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Accommodation Details */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Acomodação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg">{mockVoucher.roomName}</h3>
                <p className="text-gray-600">{mockVoucher.roomCategory}</p>
                <div className="flex items-center mt-2">
                  <Users className="mr-1 h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    Capacidade: {mockVoucher.guests} {mockVoucher.guests === 1 ? "pessoa" : "pessoas"}
                  </span>
                </div>
                {mockVoucher.breakfast && (
                  <div className="flex items-center mt-1">
                    <Coffee className="mr-1 h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Café da manhã incluído</span>
                  </div>
                )}
              </div>
            </div>

            {mockVoucher.observations && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-1">Observações:</h4>
                <p className="text-blue-700 text-sm">{mockVoucher.observations}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="mr-2 h-5 w-5" />
              Resumo Financeiro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>
                  Acomodação ({calculateDays()} {calculateDays() === 1 ? "diária" : "diárias"}):
                </span>
                <span>R$ {(mockVoucher.totalAmount * 0.8).toLocaleString("pt-BR")}</span>
              </div>
              {mockVoucher.breakfast && (
                <div className="flex justify-between">
                  <span>
                    Café da manhã ({calculateDays()} {calculateDays() === 1 ? "dia" : "dias"}):
                  </span>
                  <span>R$ {(mockVoucher.totalAmount * 0.2).toLocaleString("pt-BR")}</span>
                </div>
              )}
              {mockVoucher.paymentMethod === "PIX" && (
                <div className="flex justify-between text-green-600">
                  <span>Desconto PIX (5%):</span>
                  <span>-R$ {(mockVoucher.totalAmount * 0.05).toLocaleString("pt-BR")}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>R$ {mockVoucher.totalAmount.toLocaleString("pt-BR")}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Forma de Pagamento:</span>
                <span>{mockVoucher.paymentMethod}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Policies */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Políticas do Hotel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {mockVoucher.policies.map((policy, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="h-2 w-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-gray-700">{policy}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informações de Contato</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">BaitaHotel</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4" />
                    Rua das Águas Claras, 123 - Centro
                  </div>
                  <div className="flex items-center">
                    <Phone className="mr-2 h-4 w-4" />
                    (11) 3333-4444
                  </div>
                  <div className="flex items-center">
                    <Mail className="mr-2 h-4 w-4" />
                    contato@baitahotel.com.br
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Em caso de emergência:</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <div>• Recepção 24h: (11) 3333-4444</div>
                  <div>• WhatsApp: (11) 99999-8888</div>
                  <div>• E-mail: suporte@baitahotel.com.br</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 pt-8 border-t text-sm text-gray-500">
          <p>Este voucher é válido como comprovante de reserva confirmada.</p>
          <p className="mt-1">Apresente este documento no momento do check-in.</p>
          <p className="mt-2">Gerado em: {new Date().toLocaleString("pt-BR")}</p>
        </div>
      </div>
    </div>
  )
}
