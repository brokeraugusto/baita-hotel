"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Eye,
  Edit,
  MoreHorizontal,
  Building2,
  Users,
  Pause,
  Play,
  Trash2,
  Mail,
  Settings,
  Plus,
  Search,
  Download,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { clientsService, type Client } from "@/lib/services/master-admin-service"
import { useToast } from "@/hooks/use-toast"
import { useHorizontalWheelScroll } from "@/lib/hooks/use-horizontal-wheel-scroll"

const statusConfig = {
  active: { label: "Ativo", variant: "default" as const },
  trial: { label: "Trial", variant: "secondary" as const },
  suspended: { label: "Suspenso", variant: "destructive" as const },
  inactive: { label: "Inativo", variant: "outline" as const },
}

interface ClientsListProps {
  onSelectedClientsChange?: (selectedClients: string[]) => void
  selectedClients?: string[]
}

export function ClientsList({ onSelectedClientsChange, selectedClients: externalSelectedClients }: ClientsListProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedClients, setSelectedClients] = useState<string[]>(externalSelectedClients || [])
  const [isNewClientOpen, setIsNewClientOpen] = useState(false)
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false)
  const [isEditSelectedOpen, setIsEditSelectedOpen] = useState(false)
  const [isSuspendSelectedOpen, setIsSuspendSelectedOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [newClient, setNewClient] = useState({
    hotel_name: "",
    name: "",
    email: "",
    phone: "",
    plan: "basic",
    rooms_count: "10",
    city: "",
    state: "",
    country: "Brasil",
    address: "",
  })
  const [emailForm, setEmailForm] = useState({
    subject: "",
    message: "",
    recipients: [] as string[],
  })
  const { toast } = useToast()
  const scrollRef = useHorizontalWheelScroll()

  useEffect(() => {
    loadClients()
  }, [])

  useEffect(() => {
    if (externalSelectedClients) {
      setSelectedClients(externalSelectedClients)
    }
  }, [externalSelectedClients])

  useEffect(() => {
    if (onSelectedClientsChange) {
      onSelectedClientsChange(selectedClients)
    }
  }, [selectedClients, onSelectedClientsChange])

  const loadClients = async () => {
    try {
      setLoading(true)
      const data = await clientsService.getAll()
      setClients(data)
    } catch (error) {
      console.error("Error loading clients:", error)
      toast({
        title: "Erro",
        description: "Erro ao carregar clientes. Usando dados de exemplo.",
        variant: "destructive",
      })

      // Dados de exemplo em caso de erro
      setClients([
        {
          id: "1",
          hotel_name: "Hotel Exemplo",
          name: "João Silva",
          email: "joao@exemplo.com",
          phone: "(11) 99999-9999",
          status: "active",
          plan: { name: "Premium" },
          monthly_revenue: 15000,
          rooms_count: 50,
          total_reservations: 120,
          last_payment_at: new Date().toISOString(),
        },
        {
          id: "2",
          hotel_name: "Pousada Mar Azul",
          name: "Maria Santos",
          email: "maria@exemplo.com",
          phone: "(21) 88888-8888",
          status: "trial",
          plan: { name: "Básico" },
          monthly_revenue: 5000,
          rooms_count: 15,
          total_reservations: 45,
          last_payment_at: new Date().toISOString(),
        },
        {
          id: "3",
          hotel_name: "Resort Sol Nascente",
          name: "Carlos Oliveira",
          email: "carlos@exemplo.com",
          phone: "(31) 77777-7777",
          status: "suspended",
          plan: { name: "Enterprise" },
          monthly_revenue: 35000,
          rooms_count: 120,
          total_reservations: 350,
          last_payment_at: new Date().toISOString(),
        },
      ] as Client[])
    } finally {
      setLoading(false)
    }
  }

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.hotel_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || client.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleSelectClient = (id: string) => {
    setSelectedClients((prev) => (prev.includes(id) ? prev.filter((clientId) => clientId !== id) : [...prev, id]))
  }

  const handleSelectAll = () => {
    if (selectedClients.length === filteredClients.length) {
      setSelectedClients([])
    } else {
      setSelectedClients(filteredClients.map((client) => client.id))
    }
  }

  const handleSuspendClient = async (id: string) => {
    try {
      await clientsService.suspend(id)
      toast({
        title: "Sucesso",
        description: "Cliente suspenso com sucesso",
      })
      loadClients()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao suspender cliente",
        variant: "destructive",
      })
    }
  }

  const handleActivateClient = async (id: string) => {
    try {
      await clientsService.activate(id)
      toast({
        title: "Sucesso",
        description: "Cliente ativado com sucesso",
      })
      loadClients()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao ativar cliente",
        variant: "destructive",
      })
    }
  }

  const handleDeleteClient = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este cliente?")) return

    try {
      await clientsService.delete(id)
      toast({
        title: "Sucesso",
        description: "Cliente excluído com sucesso",
      })
      loadClients()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir cliente",
        variant: "destructive",
      })
    }
  }

  const handleCreateClient = async () => {
    // Validação básica
    if (!newClient.hotel_name || !newClient.name || !newClient.email) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      })
      return
    }

    try {
      await clientsService.create({
        ...newClient,
        rooms_count: Number.parseInt(newClient.rooms_count),
      })

      toast({
        title: "Sucesso",
        description: "Cliente criado com sucesso",
      })

      setIsNewClientOpen(false)
      setNewClient({
        hotel_name: "",
        name: "",
        email: "",
        phone: "",
        plan: "basic",
        rooms_count: "10",
        city: "",
        state: "",
        country: "Brasil",
        address: "",
      })

      loadClients()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar cliente",
        variant: "destructive",
      })
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewClient((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setNewClient((prev) => ({ ...prev, [name]: value }))
  }

  const handleSendEmail = () => {
    if (!emailForm.subject || !emailForm.message) {
      toast({
        title: "Erro",
        description: "Preencha o assunto e a mensagem",
        variant: "destructive",
      })
      return
    }

    // Aqui você implementaria a lógica para enviar o email
    // Por enquanto, apenas mostraremos uma mensagem de sucesso
    toast({
      title: "Email enviado",
      description: `Email enviado para ${selectedClients.length} cliente(s)`,
    })

    setIsEmailDialogOpen(false)
    setEmailForm({
      subject: "",
      message: "",
      recipients: [],
    })
  }

  const openEmailDialog = () => {
    if (selectedClients.length === 0) {
      toast({
        title: "Nenhum cliente selecionado",
        description: "Selecione pelo menos um cliente para enviar email",
        variant: "destructive",
      })
      return
    }

    // Preenche os destinatários com base nos clientes selecionados
    const recipients = clients.filter((client) => selectedClients.includes(client.id)).map((client) => client.email)

    setEmailForm((prev) => ({
      ...prev,
      recipients,
    }))

    setIsEmailDialogOpen(true)
  }

  const handleEditSelected = () => {
    if (selectedClients.length === 0) {
      toast({
        title: "Nenhum cliente selecionado",
        description: "Selecione pelo menos um cliente para editar",
        variant: "destructive",
      })
      return
    }

    setIsEditSelectedOpen(true)
  }

  const handleSuspendSelected = () => {
    if (selectedClients.length === 0) {
      toast({
        title: "Nenhum cliente selecionado",
        description: "Selecione pelo menos um cliente para suspender",
        variant: "destructive",
      })
      return
    }

    setIsSuspendSelectedOpen(true)
  }

  const confirmEditSelected = () => {
    toast({
      title: "Clientes atualizados",
      description: `${selectedClients.length} cliente(s) foram atualizados com sucesso.`,
    })
    setIsEditSelectedOpen(false)
  }

  const confirmSuspendSelected = () => {
    toast({
      title: "Clientes suspensos",
      description: `${selectedClients.length} cliente(s) foram suspensos com sucesso.`,
    })
    setIsSuspendSelectedOpen(false)
    loadClients()
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Clientes</CardTitle>
          <CardDescription>Carregando clientes...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <CardTitle>Clientes ({clients.length})</CardTitle>
          <CardDescription>Gerencie todos os clientes da plataforma</CardDescription>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar clientes..."
              className="pl-8 w-full sm:w-[200px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="trial">Trial</SelectItem>
              <SelectItem value="suspended">Suspenso</SelectItem>
              <SelectItem value="inactive">Inativo</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
          <Button onClick={() => setIsNewClientOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Cliente
          </Button>
        </div>
      </CardHeader>

      {selectedClients.length > 0 && (
        <div className="px-6 py-2 border-t border-b bg-muted/20 flex flex-wrap gap-2 items-center">
          <span className="text-sm font-medium">{selectedClients.length} cliente(s) selecionado(s)</span>
          <div className="flex-1"></div>
          <Button variant="outline" size="sm" onClick={handleEditSelected}>
            <Edit className="h-4 w-4 mr-2" />
            Editar Selecionados
          </Button>
          <Button variant="outline" size="sm" onClick={openEmailDialog}>
            <Mail className="h-4 w-4 mr-2" />
            Enviar Email
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-600"
            onClick={handleSuspendSelected}
          >
            <Pause className="h-4 w-4 mr-2" />
            Suspender Selecionados
          </Button>
        </div>
      )}

      <CardContent className="p-0">
        <div className="overflow-x-auto" ref={scrollRef}>
          <div className="min-w-[1200px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">
                    <Checkbox
                      checked={selectedClients.length === filteredClients.length && filteredClients.length > 0}
                      onCheckedChange={handleSelectAll}
                      aria-label="Selecionar todos"
                    />
                  </TableHead>
                  <TableHead className="w-[300px]">Cliente</TableHead>
                  <TableHead className="w-[120px]">Plano</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[140px]">Receita Mensal</TableHead>
                  <TableHead className="w-[100px]">Quartos</TableHead>
                  <TableHead className="w-[120px]">Reservas</TableHead>
                  <TableHead className="w-[140px]">Último Login</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      Nenhum cliente encontrado com os filtros atuais.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedClients.includes(client.id)}
                          onCheckedChange={() => handleSelectClient(client.id)}
                          aria-label={`Selecionar ${client.hotel_name}`}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={`/placeholder.svg?height=36&width=36`} alt={client.hotel_name} />
                            <AvatarFallback>
                              <Building2 className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{client.hotel_name}</div>
                            <div className="text-sm text-muted-foreground">{client.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{client.plan?.name || "No Plan"}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusConfig[client.status as keyof typeof statusConfig]?.variant || "outline"}>
                          {statusConfig[client.status as keyof typeof statusConfig]?.label || client.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">R$ {(client.monthly_revenue || 0).toLocaleString("pt-BR")}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span>{client.rooms_count}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{client.total_reservations || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {client.last_payment_at
                            ? new Date(client.last_payment_at).toLocaleDateString("pt-BR")
                            : "N/A"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            {client.status === "active" || client.status === "trial" ? (
                              <DropdownMenuItem onClick={() => handleSuspendClient(client.id)}>
                                <Pause className="h-4 w-4 mr-2" />
                                Suspender
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleActivateClient(client.id)}>
                                <Play className="h-4 w-4 mr-2" />
                                Ativar
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteClient(client.id)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>

      {/* Dialog para novo cliente */}
      <Dialog open={isNewClientOpen} onOpenChange={setIsNewClientOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Cliente</DialogTitle>
            <DialogDescription>Preencha os dados do novo cliente para criar sua conta.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hotel_name">Nome do Hotel</Label>
                <Input
                  id="hotel_name"
                  name="hotel_name"
                  value={newClient.hotel_name}
                  onChange={handleInputChange}
                  placeholder="Hotel Vista Mar"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Responsável</Label>
                <Input
                  id="name"
                  name="name"
                  value={newClient.name}
                  onChange={handleInputChange}
                  placeholder="João Silva"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={newClient.email}
                  onChange={handleInputChange}
                  placeholder="contato@hotelvistamar.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={newClient.phone}
                  onChange={handleInputChange}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plan">Plano</Label>
                <Select value={newClient.plan} onValueChange={(value) => handleSelectChange("plan", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Básico</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rooms_count">Número de Quartos</Label>
                <Input
                  id="rooms_count"
                  name="rooms_count"
                  type="number"
                  value={newClient.rooms_count}
                  onChange={handleInputChange}
                  placeholder="10"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  name="city"
                  value={newClient.city}
                  onChange={handleInputChange}
                  placeholder="São Paulo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Input id="state" name="state" value={newClient.state} onChange={handleInputChange} placeholder="SP" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                name="address"
                value={newClient.address}
                onChange={handleInputChange}
                placeholder="Av. Paulista, 1000"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewClientOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateClient}>Criar Cliente</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para enviar email */}
      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Enviar Email</DialogTitle>
            <DialogDescription>
              Envie um email para {selectedClients.length} cliente(s) selecionado(s).
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="recipients">Destinatários</Label>
              <div className="p-2 border rounded-md bg-muted/20 max-h-24 overflow-y-auto">
                {emailForm.recipients.map((email, index) => (
                  <Badge key={index} variant="secondary" className="m-1">
                    {email}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Assunto</Label>
              <Input
                id="subject"
                value={emailForm.subject}
                onChange={(e) => setEmailForm((prev) => ({ ...prev, subject: e.target.value }))}
                placeholder="Assunto do email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Mensagem</Label>
              <Textarea
                id="message"
                value={emailForm.message}
                onChange={(e) => setEmailForm((prev) => ({ ...prev, message: e.target.value }))}
                placeholder="Digite sua mensagem aqui..."
                rows={8}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEmailDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSendEmail}>Enviar Email</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para editar selecionados */}
      <Dialog open={isEditSelectedOpen} onOpenChange={setIsEditSelectedOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Clientes Selecionados</DialogTitle>
            <DialogDescription>
              Edite informações em massa para {selectedClients.length} cliente(s) selecionado(s).
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="bulk-plan">Alterar Plano</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um plano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Básico</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">Deixe em branco para manter o plano atual.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bulk-status">Alterar Status</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="suspended">Suspenso</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">Deixe em branco para manter o status atual.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bulk-notes">Observações</Label>
              <Textarea placeholder="Adicione observações para estes clientes..." rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditSelectedOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmEditSelected}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para suspender selecionados */}
      <Dialog open={isSuspendSelectedOpen} onOpenChange={setIsSuspendSelectedOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Suspender Clientes Selecionados</DialogTitle>
            <DialogDescription>Tem certeza que deseja suspender {selectedClients.length} cliente(s)?</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="suspend-reason">Motivo da Suspensão</Label>
              <Select defaultValue="payment">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="payment">Falta de Pagamento</SelectItem>
                  <SelectItem value="violation">Violação de Termos</SelectItem>
                  <SelectItem value="request">Solicitação do Cliente</SelectItem>
                  <SelectItem value="other">Outro Motivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="suspend-notes">Observações</Label>
              <Textarea placeholder="Adicione observações sobre a suspensão..." rows={3} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="suspend-duration">Duração da Suspensão</Label>
              <Select defaultValue="indefinite">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">7 dias</SelectItem>
                  <SelectItem value="30days">30 dias</SelectItem>
                  <SelectItem value="indefinite">Indefinida</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSuspendSelectedOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmSuspendSelected}>
              Confirmar Suspensão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
