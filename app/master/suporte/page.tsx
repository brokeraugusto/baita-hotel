"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import {
  AlertCircle,
  Building2,
  CheckCircle,
  Clock,
  Download,
  Filter,
  HelpCircle,
  MessageSquare,
  Plus,
  Search,
  Settings,
  User,
} from "lucide-react"
import { HorizontalScrollContainer } from "@/components/ui/horizontal-scroll-container"

interface SupportTicket {
  id: string
  title: string
  description: string
  clientId: string
  clientName: string
  clientEmail: string
  clientType: "hotel" | "pousada" | "resort" | "hostel"
  status: "open" | "in_progress" | "resolved" | "closed"
  priority: "low" | "medium" | "high" | "critical"
  category: "technical" | "billing" | "feature" | "account" | "other"
  createdAt: string
  updatedAt: string
  assignedTo?: string
  messages: {
    id: string
    sender: "client" | "support"
    senderName: string
    content: string
    timestamp: string
  }[]
}

const initialTickets: SupportTicket[] = [
  {
    id: "T-1001",
    title: "Erro ao criar nova reserva",
    description: "Estou tentando criar uma nova reserva, mas o sistema apresenta erro ao salvar.",
    clientId: "C-5001",
    clientName: "Hotel Beira Mar",
    clientEmail: "contato@hotelbeiramar.com.br",
    clientType: "hotel",
    status: "open",
    priority: "high",
    category: "technical",
    createdAt: "2024-06-10T14:30:00Z",
    updatedAt: "2024-06-10T14:30:00Z",
    messages: [
      {
        id: "M-1",
        sender: "client",
        senderName: "Carlos (Hotel Beira Mar)",
        content:
          "Olá, estou tentando criar uma nova reserva para o próximo final de semana, mas quando clico em salvar aparece uma mensagem de erro. Podem me ajudar?",
        timestamp: "2024-06-10T14:30:00Z",
      },
    ],
  },
  {
    id: "T-1002",
    title: "Dúvida sobre cobrança mensal",
    description: "Gostaria de entender melhor os valores cobrados na última fatura.",
    clientId: "C-5002",
    clientName: "Pousada Montanha",
    clientEmail: "financeiro@pousadamontanha.com.br",
    clientType: "pousada",
    status: "in_progress",
    priority: "medium",
    category: "billing",
    createdAt: "2024-06-09T10:15:00Z",
    updatedAt: "2024-06-10T11:20:00Z",
    assignedTo: "Ana Silva",
    messages: [
      {
        id: "M-2",
        sender: "client",
        senderName: "Maria (Pousada Montanha)",
        content:
          "Boa tarde! Recebi a fatura deste mês e notei alguns valores que não consegui identificar. Poderiam me explicar?",
        timestamp: "2024-06-09T10:15:00Z",
      },
      {
        id: "M-3",
        sender: "support",
        senderName: "Ana Silva (Suporte)",
        content:
          "Olá Maria! Vou verificar sua fatura e te enviar um detalhamento completo. Pode me informar o número da fatura?",
        timestamp: "2024-06-10T11:20:00Z",
      },
    ],
  },
  {
    id: "T-1003",
    title: "Solicitação de nova funcionalidade",
    description: "Gostaria de sugerir uma funcionalidade para relatórios personalizados.",
    clientId: "C-5003",
    clientName: "Resort Águas Claras",
    clientEmail: "ti@aguasclaras.com.br",
    clientType: "resort",
    status: "resolved",
    priority: "low",
    category: "feature",
    createdAt: "2024-06-05T16:45:00Z",
    updatedAt: "2024-06-08T14:30:00Z",
    assignedTo: "João Santos",
    messages: [
      {
        id: "M-4",
        sender: "client",
        senderName: "Roberto (Resort Águas Claras)",
        content:
          "Seria possível adicionar uma funcionalidade para criar relatórios personalizados? Isso nos ajudaria muito na gestão.",
        timestamp: "2024-06-05T16:45:00Z",
      },
      {
        id: "M-5",
        sender: "support",
        senderName: "João Santos (Suporte)",
        content:
          "Olá Roberto! Sua sugestão foi registrada em nosso backlog de desenvolvimento. Vamos avaliar a viabilidade e prioridade.",
        timestamp: "2024-06-08T14:30:00Z",
      },
    ],
  },
  {
    id: "T-1004",
    title: "Problema com login",
    description: "Não consigo acessar minha conta há 2 dias.",
    clientId: "C-5004",
    clientName: "Chalés da Serra",
    clientEmail: "admin@chalesdaterra.com.br",
    clientType: "hostel",
    status: "closed",
    priority: "critical",
    category: "account",
    createdAt: "2024-06-07T08:20:00Z",
    updatedAt: "2024-06-07T15:45:00Z",
    assignedTo: "Pedro Costa",
    messages: [
      {
        id: "M-6",
        sender: "client",
        senderName: "Fernanda (Chalés da Serra)",
        content: "Urgente! Não consigo fazer login na plataforma há 2 dias. Preciso acessar as reservas!",
        timestamp: "2024-06-07T08:20:00Z",
      },
      {
        id: "M-7",
        sender: "support",
        senderName: "Pedro Costa (Suporte)",
        content: "Olá Fernanda! Identifiquei o problema e já corrigi. Pode tentar fazer login novamente?",
        timestamp: "2024-06-07T15:45:00Z",
      },
      {
        id: "M-8",
        sender: "client",
        senderName: "Fernanda (Chalés da Serra)",
        content: "Perfeito! Consegui acessar normalmente. Muito obrigada pelo suporte rápido!",
        timestamp: "2024-06-07T16:00:00Z",
      },
    ],
  },
]

const statusColors = {
  open: "bg-red-100 text-red-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  resolved: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-800",
}

const priorityColors = {
  low: "bg-blue-100 text-blue-800",
  medium: "bg-orange-100 text-orange-800",
  high: "bg-red-100 text-red-800",
  critical: "bg-purple-100 text-purple-800",
}

const categoryIcons = {
  technical: Settings,
  billing: Building2,
  feature: Plus,
  account: User,
  other: HelpCircle,
}

const responseTemplates = [
  {
    id: "greeting",
    title: "Saudação Inicial",
    content: "Olá! Obrigado por entrar em contato com o suporte do Baita Hotel. Como posso ajudar hoje?",
  },
  {
    id: "technical-issue",
    title: "Problema Técnico",
    content:
      "Entendi o problema técnico relatado. Vou analisar e retornar com uma solução o mais breve possível. Enquanto isso, você poderia fornecer mais detalhes sobre quando o problema começou a ocorrer?",
  },
  {
    id: "billing-question",
    title: "Dúvida de Cobrança",
    content:
      "Sobre sua dúvida de cobrança, vou verificar os detalhes da sua fatura e explicar cada item. Para agilizar, poderia me informar o número da fatura ou o mês de referência?",
  },
  {
    id: "feature-request",
    title: "Solicitação de Funcionalidade",
    content:
      "Agradecemos sua sugestão de funcionalidade! Vamos registrá-la em nosso backlog de desenvolvimento e avaliar sua viabilidade. Poderia detalhar mais como essa funcionalidade ajudaria no seu dia a dia?",
  },
  {
    id: "resolution",
    title: "Resolução de Problema",
    content:
      "Fico feliz em informar que conseguimos resolver o problema relatado. Por favor, verifique se tudo está funcionando corretamente agora e não hesite em nos contatar caso precise de mais assistência.",
  },
  {
    id: "follow-up",
    title: "Acompanhamento",
    content:
      "Estou entrando em contato para verificar se o problema foi resolvido após nossa última interação. Está tudo funcionando conforme esperado ou precisa de mais assistência?",
  },
]

export default function SupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>(initialTickets)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [isTicketOpen, setIsTicketOpen] = useState(false)
  const [newMessage, setNewMessage] = useState("")
  const { toast } = useToast()
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")

  const handleViewTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket)
    setIsTicketOpen(true)
  }

  const handleUpdateStatus = (ticketId: string, newStatus: SupportTicket["status"]) => {
    setTickets((prev) =>
      prev.map((ticket) =>
        ticket.id === ticketId ? { ...ticket, status: newStatus, updatedAt: new Date().toISOString() } : ticket,
      ),
    )
    toast({
      title: "Status atualizado",
      description: "O status do ticket foi atualizado com sucesso.",
    })
  }

  const handleAssignTicket = (ticketId: string, assignee: string) => {
    setTickets((prev) =>
      prev.map((ticket) =>
        ticket.id === ticketId ? { ...ticket, assignedTo: assignee, updatedAt: new Date().toISOString() } : ticket,
      ),
    )
    toast({
      title: "Ticket atribuído",
      description: `Ticket atribuído para ${assignee}.`,
    })
  }

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedTicket) return

    const message = {
      id: `M-${Date.now()}`,
      sender: "support" as const,
      senderName: "Suporte Baita Hotel",
      content: newMessage,
      timestamp: new Date().toISOString(),
    }

    setTickets((prev) =>
      prev.map((ticket) =>
        ticket.id === selectedTicket.id
          ? {
              ...ticket,
              messages: [...ticket.messages, message],
              updatedAt: new Date().toISOString(),
            }
          : ticket,
      ),
    )

    setSelectedTicket((prev) => (prev ? { ...prev, messages: [...prev.messages, message] } : null))

    setNewMessage("")
    toast({
      title: "Mensagem enviada",
      description: "Sua resposta foi enviada ao cliente.",
    })
  }

  const applyTemplate = (templateId: string) => {
    const template = responseTemplates.find((t) => t.id === templateId)
    if (template) {
      setNewMessage(template.content)
    }
    setSelectedTemplate("")
  }

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter
    const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter
    const matchesCategory = categoryFilter === "all" || ticket.category === categoryFilter

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory
  })

  const openTickets = tickets.filter((t) => t.status === "open").length
  const inProgressTickets = tickets.filter((t) => t.status === "in_progress").length
  const resolvedTickets = tickets.filter((t) => t.status === "resolved").length
  const avgResponseTime = "4.2h"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <h2 className="text-3xl font-bold tracking-tight">Suporte</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets Abertos</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openTickets}</div>
            <p className="text-xs text-muted-foreground">Aguardando atendimento</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressTickets}</div>
            <p className="text-xs text-muted-foreground">Sendo atendidos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolvidos</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resolvedTickets}</div>
            <p className="text-xs text-muted-foreground">Este mês</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgResponseTime}</div>
            <p className="text-xs text-muted-foreground">Tempo de resposta</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por título, cliente ou ID..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="open">Abertos</SelectItem>
                <SelectItem value="in_progress">Em Andamento</SelectItem>
                <SelectItem value="resolved">Resolvidos</SelectItem>
                <SelectItem value="closed">Fechados</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="critical">Crítica</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="low">Baixa</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="technical">Técnico</SelectItem>
                <SelectItem value="billing">Financeiro</SelectItem>
                <SelectItem value="feature">Funcionalidade</SelectItem>
                <SelectItem value="account">Conta</SelectItem>
                <SelectItem value="other">Outros</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tickets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Tickets de Suporte</CardTitle>
          <CardDescription>Gerencie todos os tickets de suporte dos clientes</CardDescription>
        </CardHeader>
        <CardContent>
          <HorizontalScrollContainer className="pb-2">
            <Table className="min-w-[1000px]">
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Atribuído</TableHead>
                  <TableHead>Atualizado</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.map((ticket) => {
                  const CategoryIcon = categoryIcons[ticket.category]
                  return (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-mono">{ticket.id}</TableCell>
                      <TableCell>
                        <div className="max-w-[200px]">
                          <div className="font-medium truncate">{ticket.title}</div>
                          <div className="text-sm text-muted-foreground truncate">{ticket.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
                            <Building2 className="h-4 w-4 text-purple-600" />
                          </div>
                          <div>
                            <div className="font-medium">{ticket.clientName}</div>
                            <div className="text-sm text-muted-foreground capitalize">{ticket.clientType}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="capitalize">{ticket.category}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={priorityColors[ticket.priority]}>
                          {ticket.priority === "low" && "Baixa"}
                          {ticket.priority === "medium" && "Média"}
                          {ticket.priority === "high" && "Alta"}
                          {ticket.priority === "critical" && "Crítica"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[ticket.status]}>
                          {ticket.status === "open" && "Aberto"}
                          {ticket.status === "in_progress" && "Em Andamento"}
                          {ticket.status === "resolved" && "Resolvido"}
                          {ticket.status === "closed" && "Fechado"}
                        </Badge>
                      </TableCell>
                      <TableCell>{ticket.assignedTo || "Não atribuído"}</TableCell>
                      <TableCell>{new Date(ticket.updatedAt).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleViewTicket(ticket)}>
                            Ver
                          </Button>
                          <Select
                            value={ticket.status}
                            onValueChange={(value) => handleUpdateStatus(ticket.id, value as SupportTicket["status"])}
                          >
                            <SelectTrigger className="w-[120px] h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="open">Aberto</SelectItem>
                              <SelectItem value="in_progress">Em Andamento</SelectItem>
                              <SelectItem value="resolved">Resolvido</SelectItem>
                              <SelectItem value="closed">Fechado</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </HorizontalScrollContainer>
        </CardContent>
      </Card>

      {/* Ticket Detail Dialog */}
      <Dialog open={isTicketOpen} onOpenChange={setIsTicketOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ticket {selectedTicket?.id}</DialogTitle>
            <DialogDescription>{selectedTicket?.title}</DialogDescription>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-6">
              {/* Ticket Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Cliente</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedTicket.clientName}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <div className="mt-1">{selectedTicket.clientEmail}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Prioridade</Label>
                  <div className="mt-1">
                    <Badge className={priorityColors[selectedTicket.priority]}>
                      {selectedTicket.priority === "low" && "Baixa"}
                      {selectedTicket.priority === "medium" && "Média"}
                      {selectedTicket.priority === "high" && "Alta"}
                      {selectedTicket.priority === "critical" && "Crítica"}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">
                    <Badge className={statusColors[selectedTicket.status]}>
                      {selectedTicket.status === "open" && "Aberto"}
                      {selectedTicket.status === "in_progress" && "Em Andamento"}
                      {selectedTicket.status === "resolved" && "Resolvido"}
                      {selectedTicket.status === "closed" && "Fechado"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <Label className="text-muted-foreground">Descrição</Label>
                <div className="mt-1 p-3 border rounded-md bg-gray-50">{selectedTicket.description}</div>
              </div>

              {/* Messages */}
              <div>
                <Label className="text-muted-foreground">Conversação</Label>
                <div className="mt-2 space-y-4 max-h-[300px] overflow-y-auto border rounded-md p-4">
                  {selectedTicket.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === "support" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.sender === "support" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <div className="text-sm font-medium mb-1">{message.senderName}</div>
                        <div className="text-sm">{message.content}</div>
                        <div
                          className={`text-xs mt-2 ${message.sender === "support" ? "text-blue-100" : "text-gray-500"}`}
                        >
                          {new Date(message.timestamp).toLocaleString("pt-BR")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reply with Templates */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="reply">Responder</Label>
                  <Select value={selectedTemplate} onValueChange={applyTemplate}>
                    <SelectTrigger className="w-[220px]">
                      <SelectValue placeholder="Respostas pré-definidas" />
                    </SelectTrigger>
                    <SelectContent>
                      {responseTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Textarea
                  id="reply"
                  placeholder="Digite sua resposta..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="min-h-[120px]"
                />
                <div className="text-xs text-muted-foreground">
                  Dica: Use respostas pré-definidas e personalize conforme necessário antes de enviar.
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between">
                <div className="flex space-x-2">
                  <Select
                    value={selectedTicket.status}
                    onValueChange={(value) => handleUpdateStatus(selectedTicket.id, value as SupportTicket["status"])}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Aberto</SelectItem>
                      <SelectItem value="in_progress">Em Andamento</SelectItem>
                      <SelectItem value="resolved">Resolvido</SelectItem>
                      <SelectItem value="closed">Fechado</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={selectedTicket.assignedTo || ""}
                    onValueChange={(value) => handleAssignTicket(selectedTicket.id, value)}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Atribuir a..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ana Silva">Ana Silva</SelectItem>
                      <SelectItem value="João Santos">João Santos</SelectItem>
                      <SelectItem value="Pedro Costa">Pedro Costa</SelectItem>
                      <SelectItem value="Maria Oliveira">Maria Oliveira</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                  Enviar Resposta
                </Button>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTicketOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
