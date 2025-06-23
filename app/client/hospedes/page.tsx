"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Calendar,
  Download,
  Filter,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Search,
  Star,
  Tag,
  Trash2,
  User,
  UserPlus,
  Users,
  AlertCircle,
  Edit,
} from "lucide-react"
import { guestsService } from "@/lib/services/guests-service"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface Guest {
  id: string
  name: string
  email: string
  phone: string
  document: string
  address: string
  city: string
  state: string
  country: string
  birthdate: string
  nationality: string
  gender: string
  status: "active" | "inactive"
  tags: string[]
  lastStay: string
  totalStays: number
  totalSpent: number
  notes?: string
  vip: boolean
}

interface GuestFormData {
  name: string
  email: string
  phone: string
  document: string
  address: string
  city: string
  state: string
  country: string
  birthdate: string
  nationality: string
  gender: string
  tags: string[]
  notes: string
  vip: boolean
}

const tagColors: Record<string, string> = {
  business: "bg-blue-100 text-blue-800",
  leisure: "bg-green-100 text-green-800",
  family: "bg-orange-100 text-orange-800",
  vip: "bg-purple-100 text-purple-800",
  repeat: "bg-indigo-100 text-indigo-800",
}

// Componente GuestForm movido para fora para evitar re-criação
const GuestForm = ({
  formData,
  onFormDataChange,
  formErrors,
  submitError,
  onToggleTag,
  isEdit = false,
}: {
  formData: GuestFormData
  onFormDataChange: (field: keyof GuestFormData, value: any) => void
  formErrors: Record<string, string>
  submitError: string | null
  onToggleTag: (tag: string) => void
  isEdit?: boolean
}) => {
  const formRef = useRef<HTMLDivElement>(null)

  // Funções de mudança memoizadas para evitar re-renderizações
  const handleFieldChange = useCallback(
    (field: keyof GuestFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onFormDataChange(field, e.target.value)
    },
    [onFormDataChange],
  )

  const handleSelectChange = useCallback(
    (field: keyof GuestFormData) => (value: string) => {
      onFormDataChange(field, value)
    },
    [onFormDataChange],
  )

  const handleCheckboxChange = useCallback(
    (field: keyof GuestFormData) => (checked: boolean) => {
      onFormDataChange(field, checked)
    },
    [onFormDataChange],
  )

  return (
    <div className="grid gap-4 py-4" ref={formRef}>
      {submitError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome Completo *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={handleFieldChange("name")}
            placeholder="Nome completo"
            aria-invalid={!!formErrors.name}
          />
          {formErrors.name && <p className="text-xs text-red-500">{formErrors.name}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="document">Documento *</Label>
          <Input
            id="document"
            value={formData.document}
            onChange={handleFieldChange("document")}
            placeholder="CPF ou Passaporte"
            aria-invalid={!!formErrors.document}
          />
          {formErrors.document && <p className="text-xs text-red-500">{formErrors.document}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={handleFieldChange("email")}
            placeholder="email@exemplo.com"
            aria-invalid={!!formErrors.email}
          />
          {formErrors.email && <p className="text-xs text-red-500">{formErrors.email}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={handleFieldChange("phone")}
            placeholder="(00) 00000-0000"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="birthdate">Data de Nascimento</Label>
          <Input id="birthdate" type="date" value={formData.birthdate} onChange={handleFieldChange("birthdate")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gender">Gênero</Label>
          <Select value={formData.gender} onValueChange={handleSelectChange("gender")}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Masculino">Masculino</SelectItem>
              <SelectItem value="Feminino">Feminino</SelectItem>
              <SelectItem value="Outro">Outro</SelectItem>
              <SelectItem value="Prefiro não informar">Prefiro não informar</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Endereço</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={handleFieldChange("address")}
          placeholder="Rua, número, complemento"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">Cidade</Label>
          <Input id="city" value={formData.city} onChange={handleFieldChange("city")} placeholder="Cidade" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">Estado</Label>
          <Input id="state" value={formData.state} onChange={handleFieldChange("state")} placeholder="Estado" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">País</Label>
          <Input id="country" value={formData.country} onChange={handleFieldChange("country")} placeholder="País" />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Tags</Label>
        <div className="flex flex-wrap gap-2">
          {["business", "leisure", "family", "vip", "repeat"].map((tag) => (
            <Button
              key={tag}
              type="button"
              variant={formData.tags.includes(tag) ? "default" : "outline"}
              size="sm"
              onClick={() => onToggleTag(tag)}
            >
              {tag.charAt(0).toUpperCase() + tag.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox id="vip" checked={formData.vip} onCheckedChange={handleCheckboxChange("vip")} />
          <Label htmlFor="vip">Marcar como VIP</Label>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={handleFieldChange("notes")}
          placeholder="Preferências, alergias, observações importantes..."
        />
      </div>
    </div>
  )
}

export default function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [tagFilter, setTagFilter] = useState("all")
  const [isNewGuestOpen, setIsNewGuestOpen] = useState(false)
  const [isViewGuestOpen, setIsViewGuestOpen] = useState(false)
  const [isEditGuestOpen, setIsEditGuestOpen] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null)
  const [formData, setFormData] = useState<GuestFormData>({
    name: "",
    email: "",
    phone: "",
    document: "",
    address: "",
    city: "",
    state: "",
    country: "Brasil",
    birthdate: "",
    nationality: "Brasileira",
    gender: "Masculino",
    tags: [] as string[],
    notes: "",
    vip: false,
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const { toast } = useToast()

  // Fetch guests on component mount
  useEffect(() => {
    fetchGuests()
  }, [])

  // Adicionar o useEffect para scroll horizontal no início do componente:
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault()
        const container = e.currentTarget as HTMLElement
        container.scrollLeft += e.deltaY
      }
    }

    const guestsContainer = document.getElementById("guests-container")
    if (guestsContainer) {
      guestsContainer.addEventListener("wheel", handleWheel, { passive: false })
      return () => guestsContainer.removeEventListener("wheel", handleWheel)
    }
  }, [])

  const fetchGuests = async () => {
    setIsLoading(true)
    try {
      const fetchedGuests = await guestsService.getGuests()
      setGuests(fetchedGuests)
    } catch (error) {
      console.error("Error fetching guests:", error)
      toast({
        title: "Erro ao carregar hóspedes",
        description: "Não foi possível carregar a lista de hóspedes. Tente novamente mais tarde.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Função memoizada para mudanças no formulário
  const handleFormDataChange = useCallback(
    (field: keyof GuestFormData, value: any) => {
      setFormData((prev) => ({ ...prev, [field]: value }))
      // Limpar erro do campo quando o usuário começar a digitar
      if (formErrors[field]) {
        setFormErrors((prev) => ({ ...prev, [field]: "" }))
      }
    },
    [formErrors],
  )

  // Função memoizada para toggle de tags
  const handleToggleTag = useCallback((tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
    }))
  }, [])

  const resetForm = useCallback(() => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      document: "",
      address: "",
      city: "",
      state: "",
      country: "Brasil",
      birthdate: "",
      nationality: "Brasileira",
      gender: "Masculino",
      tags: [],
      notes: "",
      vip: false,
    })
    setFormErrors({})
    setSubmitError(null)
  }, [])

  const validateForm = useCallback(() => {
    const errors: Record<string, string> = {}

    if (!formData.name.trim()) {
      errors.name = "Nome é obrigatório"
    }

    if (!formData.email.trim()) {
      errors.email = "Email é obrigatório"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email inválido"
    }

    if (!formData.document.trim()) {
      errors.document = "Documento é obrigatório"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }, [formData])

  const scrollToFirstError = useCallback(() => {
    const firstErrorField = document.querySelector('[aria-invalid="true"]')
    if (firstErrorField) {
      firstErrorField.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }, [])

  const handleCreateGuest = useCallback(async () => {
    setIsSubmitting(true)
    setSubmitError(null)

    if (!validateForm()) {
      setIsSubmitting(false)
      scrollToFirstError()
      return
    }

    try {
      const newGuest = await guestsService.createGuest({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        document: formData.document,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        birthdate: formData.birthdate,
        nationality: formData.nationality,
        gender: formData.gender,
        tags: formData.tags,
        notes: formData.notes,
        vip: formData.vip,
      })

      setGuests((prev) => [...prev, newGuest])
      setIsNewGuestOpen(false)
      resetForm()
      toast({
        title: "Hóspede cadastrado",
        description: "Novo hóspede adicionado com sucesso.",
      })
    } catch (error) {
      console.error("Error creating guest:", error)
      setSubmitError("Erro ao cadastrar hóspede. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, validateForm, scrollToFirstError, resetForm, toast])

  const handleUpdateGuest = useCallback(async () => {
    if (!selectedGuest) return
    setIsSubmitting(true)
    setSubmitError(null)

    if (!validateForm()) {
      setIsSubmitting(false)
      scrollToFirstError()
      return
    }

    try {
      const updatedGuest = await guestsService.updateGuest(selectedGuest.id, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        document: formData.document,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        birthdate: formData.birthdate,
        nationality: formData.nationality,
        gender: formData.gender,
        tags: formData.tags,
        notes: formData.notes,
        vip: formData.vip,
      })

      setGuests((prev) => prev.map((guest) => (guest.id === selectedGuest.id ? updatedGuest : guest)))
      setIsEditGuestOpen(false)
      resetForm()
      toast({
        title: "Hóspede atualizado",
        description: "Dados do hóspede atualizados com sucesso.",
      })
    } catch (error) {
      console.error("Error updating guest:", error)
      setSubmitError("Erro ao atualizar hóspede. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }, [selectedGuest, formData, validateForm, scrollToFirstError, resetForm, toast])

  const handleDeleteGuest = useCallback(async () => {
    if (!selectedGuest) return
    setIsSubmitting(true)

    try {
      await guestsService.deleteGuest(selectedGuest.id)
      setGuests((prev) => prev.filter((guest) => guest.id !== selectedGuest.id))
      setIsDeleteConfirmOpen(false)
      toast({
        title: "Hóspede removido",
        description: "Hóspede excluído com sucesso.",
      })
    } catch (error) {
      console.error("Error deleting guest:", error)
      toast({
        title: "Erro",
        description: "Não foi possível excluir o hóspede. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }, [selectedGuest, toast])

  const handleViewGuest = useCallback((guest: Guest) => {
    setSelectedGuest(guest)
    setIsViewGuestOpen(true)
  }, [])

  const handleEditGuest = useCallback((guest: Guest) => {
    setSelectedGuest(guest)
    setFormData({
      name: guest.name,
      email: guest.email,
      phone: guest.phone,
      document: guest.document,
      address: guest.address,
      city: guest.city,
      state: guest.state,
      country: guest.country,
      birthdate: guest.birthdate,
      nationality: guest.nationality,
      gender: guest.gender,
      tags: guest.tags,
      notes: guest.notes || "",
      vip: guest.vip,
    })
    setIsEditGuestOpen(true)
  }, [])

  const confirmDeleteGuest = useCallback((guest: Guest) => {
    setSelectedGuest(guest)
    setIsDeleteConfirmOpen(true)
  }, [])

  // Memoizar dados filtrados para evitar recálculos desnecessários
  const filteredGuests = useMemo(() => {
    return guests.filter((guest) => {
      const matchesSearch =
        guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guest.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guest.document.includes(searchTerm)

      const matchesStatus = statusFilter === "all" || guest.status === statusFilter
      const matchesTag = tagFilter === "all" || guest.tags.includes(tagFilter)

      return matchesSearch && matchesStatus && matchesTag
    })
  }, [guests, searchTerm, statusFilter, tagFilter])

  // Memoizar estatísticas
  const stats = useMemo(() => {
    const activeGuests = guests.filter((g) => g.status === "active").length
    const vipGuests = guests.filter((g) => g.vip).length
    const totalRevenue = guests.reduce((sum, g) => sum + g.totalSpent, 0)
    const averageStays = guests.length > 0 ? guests.reduce((sum, g) => sum + g.totalStays, 0) / guests.length : 0

    return { activeGuests, vipGuests, totalRevenue, averageStays }
  }, [guests])

  return (
    <div id="guests-container" className="overflow-x-auto min-w-full">
      <div className="min-w-[1200px]">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <h2 className="text-3xl font-bold tracking-tight">Hóspedes</h2>
            <div className="flex items-center space-x-2">
              <Dialog open={isNewGuestOpen} onOpenChange={setIsNewGuestOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => {
                      resetForm()
                      setIsNewGuestOpen(true)
                    }}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Novo Hóspede
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
                  <DialogHeader>
                    <DialogTitle>Novo Hóspede</DialogTitle>
                    <DialogDescription>Cadastre um novo hóspede no sistema</DialogDescription>
                  </DialogHeader>
                  <ScrollArea className="max-h-[calc(90vh-180px)] pr-4">
                    <GuestForm
                      formData={formData}
                      onFormDataChange={handleFormDataChange}
                      formErrors={formErrors}
                      submitError={submitError}
                      onToggleTag={handleToggleTag}
                    />
                  </ScrollArea>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsNewGuestOpen(false)} disabled={isSubmitting}>
                      Cancelar
                    </Button>
                    <Button onClick={handleCreateGuest} disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Cadastrando...
                        </>
                      ) : (
                        "Cadastrar Hóspede"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
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
                <CardTitle className="text-sm font-medium">Total de Hóspedes</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{guests.length}</div>
                <p className="text-xs text-muted-foreground">+2 no último mês</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Hóspedes Ativos</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeGuests}</div>
                <p className="text-xs text-muted-foreground">
                  {guests.length > 0 ? Math.round((stats.activeGuests / guests.length) * 100) : 0}% do total
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Hóspedes VIP</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.vipGuests}</div>
                <p className="text-xs text-muted-foreground">
                  {guests.length > 0 ? Math.round((stats.vipGuests / guests.length) * 100) : 0}% do total
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ {stats.totalRevenue.toLocaleString("pt-BR")}</div>
                <p className="text-xs text-muted-foreground">
                  Média de {Math.round(stats.averageStays)} estadias por hóspede
                </p>
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
                    placeholder="Buscar por nome, email ou documento..."
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
                    <SelectItem value="active">Ativos</SelectItem>
                    <SelectItem value="inactive">Inativos</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={tagFilter} onValueChange={setTagFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Tag" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Tags</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="leisure">Leisure</SelectItem>
                    <SelectItem value="family">Family</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                    <SelectItem value="repeat">Repeat</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Guests Table */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Hóspedes</CardTitle>
              <CardDescription>Gerencie todos os hóspedes cadastrados no sistema</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredGuests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <User className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">Nenhum hóspede encontrado</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {guests.length === 0
                      ? "Cadastre seu primeiro hóspede clicando no botão 'Novo Hóspede'"
                      : "Tente ajustar os filtros para encontrar o que procura"}
                  </p>
                  {guests.length === 0 && (
                    <Button className="mt-4" onClick={() => setIsNewGuestOpen(true)}>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Novo Hóspede
                    </Button>
                  )}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hóspede</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead>Documento</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead>Última Estadia</TableHead>
                      <TableHead>Total Gasto</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[120px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGuests.map((guest) => (
                      <TableRow key={guest.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                              {guest.vip ? (
                                <Star className="h-5 w-5 text-blue-600" />
                              ) : (
                                <User className="h-5 w-5 text-blue-600" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium flex items-center space-x-2">
                                <span>{guest.name}</span>
                                {guest.vip && (
                                  <Badge variant="destructive" className="text-xs">
                                    VIP
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">{guest.nationality}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-1 text-sm">
                              <Mail className="h-3 w-3" />
                              <span>{guest.email}</span>
                            </div>
                            <div className="flex items-center space-x-1 text-sm">
                              <Phone className="h-3 w-3" />
                              <span>{guest.phone}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{guest.document}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {guest.tags.map((tag) => (
                              <span
                                key={tag}
                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                  tagColors[tag] || "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{new Date(guest.lastStay).toLocaleDateString("pt-BR")}</TableCell>
                        <TableCell>R$ {guest.totalSpent.toLocaleString("pt-BR")}</TableCell>
                        <TableCell>
                          <Badge variant={guest.status === "active" ? "default" : "secondary"}>
                            {guest.status === "active" ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" onClick={() => handleViewGuest(guest)}>
                              Ver
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => handleEditGuest(guest)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="destructive" size="icon" onClick={() => confirmDeleteGuest(guest)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* View Guest Dialog */}
          <Dialog open={isViewGuestOpen} onOpenChange={setIsViewGuestOpen}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>Detalhes do Hóspede</DialogTitle>
                <DialogDescription>Informações completas do hóspede</DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[calc(90vh-180px)]">
                {selectedGuest && (
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                        {selectedGuest.vip ? (
                          <Star className="h-8 w-8 text-blue-600" />
                        ) : (
                          <User className="h-8 w-8 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{selectedGuest.name}</h3>
                        <div className="flex items-center space-x-2">
                          {selectedGuest.vip && (
                            <Badge variant="default" className="bg-yellow-500">
                              VIP
                            </Badge>
                          )}
                          <Badge variant={selectedGuest.status === "active" ? "default" : "secondary"}>
                            {selectedGuest.status === "active" ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <Tabs defaultValue="info">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="info">Informações</TabsTrigger>
                        <TabsTrigger value="stays">Estadias</TabsTrigger>
                        <TabsTrigger value="preferences">Preferências</TabsTrigger>
                      </TabsList>
                      <TabsContent value="info" className="space-y-4 pt-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-muted-foreground">Email</Label>
                            <div className="flex items-center space-x-2 mt-1">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span>{selectedGuest.email}</span>
                            </div>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Telefone</Label>
                            <div className="flex items-center space-x-2 mt-1">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span>{selectedGuest.phone}</span>
                            </div>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Documento</Label>
                            <div className="mt-1">{selectedGuest.document}</div>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Data de Nascimento</Label>
                            <div className="mt-1">
                              {selectedGuest.birthdate
                                ? new Date(selectedGuest.birthdate).toLocaleDateString("pt-BR")
                                : "Não informado"}
                            </div>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Nacionalidade</Label>
                            <div className="mt-1">{selectedGuest.nationality}</div>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Gênero</Label>
                            <div className="mt-1">{selectedGuest.gender}</div>
                          </div>
                        </div>

                        <div>
                          <Label className="text-muted-foreground">Endereço</Label>
                          <div className="flex items-center space-x-2 mt-1">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {selectedGuest.address}, {selectedGuest.city} - {selectedGuest.state},{" "}
                              {selectedGuest.country}
                            </span>
                          </div>
                        </div>

                        <div>
                          <Label className="text-muted-foreground">Tags</Label>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {selectedGuest.tags.map((tag) => (
                              <span
                                key={tag}
                                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                  tagColors[tag] || "bg-gray-100 text-gray-800"
                                }`}
                              >
                                <Tag className="mr-1 h-3 w-3" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </TabsContent>
                      <TabsContent value="stays" className="space-y-4 pt-4">
                        <div className="grid grid-cols-2 gap-4">
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm">Total de Estadias</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold">{selectedGuest.totalStays}</div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm">Total Gasto</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold">
                                R$ {selectedGuest.totalSpent.toLocaleString("pt-BR")}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Última Estadia</Label>
                          <div className="mt-1">
                            {new Date(selectedGuest.lastStay).toLocaleDateString("pt-BR")} (
                            {Math.floor(
                              (new Date().getTime() - new Date(selectedGuest.lastStay).getTime()) /
                                (1000 * 60 * 60 * 24),
                            )}{" "}
                            dias atrás)
                          </div>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Histórico de Estadias</Label>
                          <div className="mt-2 border rounded-md">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Data</TableHead>
                                  <TableHead>Quarto</TableHead>
                                  <TableHead>Valor</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                <TableRow>
                                  <TableCell>{new Date(selectedGuest.lastStay).toLocaleDateString("pt-BR")}</TableCell>
                                  <TableCell>Suite 301</TableCell>
                                  <TableCell>R$ 1.250,00</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell>
                                    {new Date(
                                      new Date(selectedGuest.lastStay).getTime() - 30 * 24 * 60 * 60 * 1000,
                                    ).toLocaleDateString("pt-BR")}
                                  </TableCell>
                                  <TableCell>Quarto 205</TableCell>
                                  <TableCell>R$ 850,00</TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      </TabsContent>
                      <TabsContent value="preferences" className="space-y-4 pt-4">
                        <div>
                          <Label className="text-muted-foreground">Observações</Label>
                          <div className="mt-1 p-3 border rounded-md bg-gray-50">
                            {selectedGuest.notes || "Nenhuma observação registrada."}
                          </div>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Preferências</Label>
                          <div className="mt-2 space-y-2">
                            <div className="flex items-center space-x-2">
                              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                              <span>Andar alto</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                              <span>Longe do elevador</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                              <span>Travesseiros extras</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Alergias</Label>
                          <div className="mt-2 space-y-2">
                            <div className="flex items-center space-x-2">
                              <div className="h-2 w-2 rounded-full bg-red-500"></div>
                              <span>Amendoim</span>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                )}
              </ScrollArea>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsViewGuestOpen(false)}>
                  Fechar
                </Button>
                <Button
                  onClick={() => {
                    setIsViewGuestOpen(false)
                    if (selectedGuest) {
                      handleEditGuest(selectedGuest)
                    }
                  }}
                >
                  Editar Hóspede
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Guest Dialog */}
          <Dialog open={isEditGuestOpen} onOpenChange={setIsEditGuestOpen}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>Editar Hóspede</DialogTitle>
                <DialogDescription>Atualize os dados do hóspede</DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[calc(90vh-180px)] pr-4">
                <GuestForm
                  formData={formData}
                  onFormDataChange={handleFormDataChange}
                  formErrors={formErrors}
                  submitError={submitError}
                  onToggleTag={handleToggleTag}
                  isEdit={true}
                />
              </ScrollArea>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditGuestOpen(false)} disabled={isSubmitting}>
                  Cancelar
                </Button>
                <Button onClick={handleUpdateGuest} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar Alterações"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Confirmar exclusão</DialogTitle>
                <DialogDescription>
                  Tem certeza que deseja excluir este hóspede? Esta ação não pode ser desfeita.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                {selectedGuest && (
                  <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                      <User className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium">{selectedGuest.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedGuest.email}</p>
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)} disabled={isSubmitting}>
                  Cancelar
                </Button>
                <Button variant="destructive" onClick={handleDeleteGuest} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Excluindo...
                    </>
                  ) : (
                    "Excluir Hóspede"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}
