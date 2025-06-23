"use client"

import { useState } from "react"
import { ClientsList } from "@/components/clients/clients-list"
import { ClientsFilters } from "@/components/clients/clients-filters"
import { ClientsStats } from "@/components/clients/clients-stats"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit, Trash2, Mail, Settings } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { clientsService } from "@/lib/services/clients-service-production-v2"

export default function MasterClientsPage() {
  const [isNewClientOpen, setIsNewClientOpen] = useState(false)
  const [isEditClientOpen, setIsEditClientOpen] = useState(false)
  const [isEmailOpen, setIsEmailOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [selectedClients, setSelectedClients] = useState<string[]>([])
  const [clientsListKey, setClientsListKey] = useState(0)
  const { toast } = useToast()

  // Form states
  const [newClientForm, setNewClientForm] = useState({
    hotelName: "",
    ownerName: "",
    email: "",
    phone: "",
    plan: "starter",
    rooms: "10",
    address: "",
    city: "",
    state: "",
    country: "Brasil",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [emailForm, setEmailForm] = useState({
    subject: "",
    message: "",
    recipients: [] as string[],
  })

  const handleCreateClient = async () => {
    // Validate form
    if (!newClientForm.hotelName || !newClientForm.email || !newClientForm.ownerName) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha nome do hotel, email e nome do proprietário",
        variant: "destructive",
      })
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newClientForm.email)) {
      toast({
        title: "Email inválido",
        description: "Digite um email válido",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      console.log("🏨 Creating client with data:", newClientForm)

      // Create new client using the production service
      const newClient = await clientsService.create({
        name: newClientForm.ownerName,
        email: newClientForm.email.trim().toLowerCase(),
        phone: newClientForm.phone || "",
        hotel_name: newClientForm.hotelName,
        hotel_address: newClientForm.address,
        hotel_city: newClientForm.city,
        hotel_state: newClientForm.state,
        hotel_country: newClientForm.country,
        rooms_count: Number.parseInt(newClientForm.rooms) || 10,
        plan_id: newClientForm.plan,
      })

      if (newClient) {
        toast({
          title: "Cliente criado com sucesso! 🎉",
          description: `${newClientForm.hotelName} foi adicionado à plataforma`,
        })

        // Reset form and close dialog
        setNewClientForm({
          hotelName: "",
          ownerName: "",
          email: "",
          phone: "",
          plan: "starter",
          rooms: "10",
          address: "",
          city: "",
          state: "",
          country: "Brasil",
        })
        setIsNewClientOpen(false)

        // Force refresh the clients list
        setClientsListKey((prev) => prev + 1)
      } else {
        toast({
          title: "Erro ao criar cliente",
          description: "Não foi possível criar o cliente. Verifique os dados e tente novamente.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("💥 Error creating client:", error)
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao criar o cliente. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
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

    setIsEditClientOpen(true)
  }

  const handleSendEmail = () => {
    if (selectedClients.length === 0) {
      toast({
        title: "Nenhum cliente selecionado",
        description: "Selecione pelo menos um cliente para enviar email",
        variant: "destructive",
      })
      return
    }

    if (!emailForm.subject || !emailForm.message) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o assunto e a mensagem",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Email enviado",
      description: `Email enviado para ${selectedClients.length} cliente(s)`,
    })

    setEmailForm({
      subject: "",
      message: "",
      recipients: [],
    })
    setIsEmailOpen(false)
  }

  const handleSuspendSelected = async () => {
    if (selectedClients.length === 0) {
      toast({
        title: "Nenhum cliente selecionado",
        description: "Selecione pelo menos um cliente para suspender",
        variant: "destructive",
      })
      return
    }

    try {
      // Suspender todos os clientes selecionados
      const results = await Promise.all(selectedClients.map((id) => clientsService.suspend(id)))

      const successCount = results.filter(Boolean).length

      if (successCount > 0) {
        toast({
          title: "Clientes suspensos",
          description: `${successCount} cliente(s) suspensos com sucesso`,
        })
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível suspender os clientes selecionados",
          variant: "destructive",
        })
      }

      // Reset selection and refresh list
      setSelectedClients([])
      setClientsListKey((prev) => prev + 1)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao suspender clientes",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Clientes</h1>
            <p className="text-gray-600">Gerencie todos os clientes da plataforma</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
              👑 Master Admin
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Novo Cliente */}
            <Dialog
              open={isNewClientOpen}
              onOpenChange={(open) => {
                setIsNewClientOpen(open)
                if (!open && !isSubmitting) {
                  setNewClientForm({
                    hotelName: "",
                    ownerName: "",
                    email: "",
                    phone: "",
                    plan: "starter",
                    rooms: "10",
                    address: "",
                    city: "",
                    state: "",
                    country: "Brasil",
                  })
                }
              }}
            >
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => setIsNewClientOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Cliente
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Novo Cliente</DialogTitle>
                  <DialogDescription>Adicione um novo cliente à plataforma</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="hotel-name">Nome do Hotel *</Label>
                      <Input
                        id="hotel-name"
                        placeholder="Ex: Hotel Exemplo"
                        value={newClientForm.hotelName}
                        onChange={(e) => setNewClientForm({ ...newClientForm, hotelName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="owner-name">Nome do Proprietário *</Label>
                      <Input
                        id="owner-name"
                        placeholder="Nome completo"
                        value={newClientForm.ownerName}
                        onChange={(e) => setNewClientForm({ ...newClientForm, ownerName: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="email@exemplo.com"
                        value={newClientForm.email}
                        onChange={(e) => setNewClientForm({ ...newClientForm, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        placeholder="(11) 99999-9999"
                        value={newClientForm.phone}
                        onChange={(e) => setNewClientForm({ ...newClientForm, phone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="plan">Plano</Label>
                      <Select
                        value={newClientForm.plan}
                        onValueChange={(value) => setNewClientForm({ ...newClientForm, plan: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o plano" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="starter">Starter - R$ 99,90/mês</SelectItem>
                          <SelectItem value="professional">Professional - R$ 199,90/mês</SelectItem>
                          <SelectItem value="enterprise">Enterprise - R$ 399,90/mês</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rooms">Número de Quartos</Label>
                      <Input
                        id="rooms"
                        type="number"
                        placeholder="Ex: 50"
                        value={newClientForm.rooms}
                        onChange={(e) => setNewClientForm({ ...newClientForm, rooms: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">Cidade</Label>
                      <Input
                        id="city"
                        placeholder="Ex: São Paulo"
                        value={newClientForm.city}
                        onChange={(e) => setNewClientForm({ ...newClientForm, city: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">Estado</Label>
                      <Input
                        id="state"
                        placeholder="Ex: SP"
                        value={newClientForm.state}
                        onChange={(e) => setNewClientForm({ ...newClientForm, state: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">País</Label>
                      <Input
                        id="country"
                        placeholder="Ex: Brasil"
                        value={newClientForm.country}
                        onChange={(e) => setNewClientForm({ ...newClientForm, country: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Endereço</Label>
                    <Textarea
                      id="address"
                      placeholder="Endereço completo do hotel..."
                      value={newClientForm.address}
                      onChange={(e) => setNewClientForm({ ...newClientForm, address: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter className="sm:justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setIsNewClientOpen(false)} disabled={isSubmitting}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateClient} disabled={isSubmitting}>
                    {isSubmitting ? "Criando..." : "Criar Cliente"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Other action buttons */}
            <Button variant="outline" onClick={handleEditSelected}>
              <Edit className="h-4 w-4 mr-2" />
              Editar Selecionados
            </Button>

            <Button variant="outline" onClick={() => setIsEmailOpen(true)}>
              <Mail className="h-4 w-4 mr-2" />
              Enviar Email
            </Button>

            <Button variant="outline" size="sm" onClick={() => setIsSettingsOpen(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </Button>

            <Button variant="destructive" size="sm" onClick={handleSuspendSelected}>
              <Trash2 className="h-4 w-4 mr-2" />
              Suspender Selecionados
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 space-y-6">
        <ClientsStats />
        <ClientsFilters />
        <ClientsList
          key={clientsListKey}
          onSelectedClientsChange={setSelectedClients}
          selectedClients={selectedClients}
        />
      </div>
    </div>
  )
}
