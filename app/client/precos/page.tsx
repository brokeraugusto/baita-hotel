"use client"

import { useState, useEffect } from "react"
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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { Plus, Edit, Trash2, DollarSign, Calendar, TrendingUp, Percent } from 'lucide-react'

interface PricingRule {
  id: string
  name: string
  categoryId: string
  categoryName: string
  type: "base" | "weekend" | "holiday" | "season" | "special"
  basePrice: number
  modifier: number
  modifierType: "percentage" | "fixed"
  startDate?: string
  endDate?: string
  daysOfWeek?: number[]
  priority: number
  active: boolean
}

const categories = [
  { id: "1", name: "Suíte Luxo", basePrice: 450 },
  { id: "2", name: "Quarto Vista Mar", basePrice: 320 },
  { id: "3", name: "Chalé Standard", basePrice: 280 },
  { id: "4", name: "Quarto Econômico", basePrice: 180 },
]

const initialPricingRules: PricingRule[] = [
  {
    id: "1",
    name: "Fim de Semana",
    categoryId: "1",
    categoryName: "Suíte Luxo",
    type: "weekend",
    basePrice: 450,
    modifier: 20,
    modifierType: "percentage",
    daysOfWeek: [5, 6], // Sexta e Sábado
    priority: 1,
    active: true,
  },
  {
    id: "2",
    name: "Alta Temporada 2024",
    categoryId: "1",
    categoryName: "Suíte Luxo",
    type: "season",
    basePrice: 450,
    modifier: 50,
    modifierType: "percentage",
    startDate: "2024-12-15",
    endDate: "2024-03-15",
    priority: 2,
    active: true,
  },
  {
    id: "3",
    name: "Feriados Nacionais",
    categoryId: "2",
    categoryName: "Quarto Vista Mar",
    type: "holiday",
    basePrice: 320,
    modifier: 100,
    modifierType: "fixed",
    priority: 3,
    active: true,
  },
]

const typeLabels = {
  base: "Base",
  weekend: "Fim de Semana",
  holiday: "Feriado",
  season: "Temporada",
  special: "Especial",
}

const typeColors = {
  base: "default",
  weekend: "secondary",
  holiday: "destructive",
  season: "default",
  special: "outline",
} as const

const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

export default function PricingPage() {
  const [pricingRules, setPricingRules] = useState<PricingRule[]>(initialPricingRules)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<PricingRule | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    type: "base" as PricingRule["type"],
    modifier: "",
    modifierType: "percentage" as "percentage" | "fixed",
    startDate: "",
    endDate: "",
    daysOfWeek: [] as number[],
    priority: "1",
  })
  const { toast } = useToast()

  const resetForm = () => {
    setFormData({
      name: "",
      categoryId: "",
      type: "base",
      modifier: "",
      modifierType: "percentage",
      startDate: "",
      endDate: "",
      daysOfWeek: [],
      priority: "1",
    })
  }

  const calculatePrice = (basePrice: number, modifier: number, modifierType: "percentage" | "fixed") => {
    if (modifierType === "percentage") {
      return basePrice + (basePrice * modifier) / 100
    }
    return basePrice + modifier
  }

  const handleCreate = () => {
    if (!formData.name || !formData.categoryId || !formData.modifier) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      })
      return
    }

    const category = categories.find((c) => c.id === formData.categoryId)
    if (!category) return

    const newRule: PricingRule = {
      id: Date.now().toString(),
      name: formData.name,
      categoryId: formData.categoryId,
      categoryName: category.name,
      type: formData.type,
      basePrice: category.basePrice,
      modifier: Number(formData.modifier),
      modifierType: formData.modifierType,
      startDate: formData.startDate || undefined,
      endDate: formData.endDate || undefined,
      daysOfWeek: formData.daysOfWeek.length > 0 ? formData.daysOfWeek : undefined,
      priority: Number(formData.priority),
      active: true,
    }

    setPricingRules([...pricingRules, newRule])
    setIsCreateOpen(false)
    resetForm()
    toast({
      title: "Regra criada",
      description: "Nova regra de preço adicionada com sucesso.",
    })
  }

  const handleEdit = (rule: PricingRule) => {
    setEditingRule(rule)
    setFormData({
      name: rule.name,
      categoryId: rule.categoryId,
      type: rule.type,
      modifier: rule.modifier.toString(),
      modifierType: rule.modifierType,
      startDate: rule.startDate || "",
      endDate: rule.endDate || "",
      daysOfWeek: rule.daysOfWeek || [],
      priority: rule.priority.toString(),
    })
    setIsEditOpen(true)
  }

  const handleUpdate = () => {
    if (!editingRule) return

    const category = categories.find((c) => c.id === formData.categoryId)
    if (!category) return

    const updatedRules = pricingRules.map((rule) =>
      rule.id === editingRule.id
        ? {
            ...rule,
            name: formData.name,
            categoryId: formData.categoryId,
            categoryName: category.name,
            type: formData.type,
            basePrice: category.basePrice,
            modifier: Number(formData.modifier),
            modifierType: formData.modifierType,
            startDate: formData.startDate || undefined,
            endDate: formData.endDate || undefined,
            daysOfWeek: formData.daysOfWeek.length > 0 ? formData.daysOfWeek : undefined,
            priority: Number(formData.priority),
          }
        : rule,
    )

    setPricingRules(updatedRules)
    setIsEditOpen(false)
    setEditingRule(null)
    resetForm()
    toast({
      title: "Regra atualizada",
      description: "Regra de preço editada com sucesso.",
    })
  }

  const handleDelete = (id: string) => {
    setPricingRules(pricingRules.filter((rule) => rule.id !== id))
    toast({
      title: "Regra removida",
      description: "Regra de preço excluída com sucesso.",
    })
  }

  const toggleActive = (id: string) => {
    setPricingRules(pricingRules.map((rule) => (rule.id === id ? { ...rule, active: !rule.active } : rule)))
  }

  const toggleDayOfWeek = (day: number) => {
    setFormData((prev) => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day) ? prev.daysOfWeek.filter((d) => d !== day) : [...prev.daysOfWeek, day],
    }))
  }

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault()
        const container = e.currentTarget as HTMLElement
        container.scrollLeft += e.deltaY
      }
    }

    const pricingContainer = document.getElementById('pricing-container')
    if (pricingContainer) {
      pricingContainer.addEventListener('wheel', handleWheel, { passive: false })
      return () => pricingContainer.removeEventListener('wheel', handleWheel)
    }
  }, [])

  return (
    <div id="pricing-container" className="space-y-6 overflow-x-auto min-w-full">
      <div className="min-w-[1200px]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Preços & Tarifas</h1>
            <p className="text-muted-foreground">
              Configure regras de preços por período, categoria e condições especiais
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Regra
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Nova Regra de Preço</DialogTitle>
                <DialogDescription>Crie uma nova regra de precificação para suas acomodações</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome da Regra *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Fim de Semana"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria *</Label>
                    <Select
                      value={formData.categoryId}
                      onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name} - R$ {category.basePrice}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo de Regra</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: PricingRule["type"]) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="base">Base</SelectItem>
                        <SelectItem value="weekend">Fim de Semana</SelectItem>
                        <SelectItem value="holiday">Feriado</SelectItem>
                        <SelectItem value="season">Temporada</SelectItem>
                        <SelectItem value="special">Especial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Prioridade</Label>
                    <Input
                      id="priority"
                      type="number"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      placeholder="1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="modifier">Modificador *</Label>
                    <Input
                      id="modifier"
                      type="number"
                      value={formData.modifier}
                      onChange={(e) => setFormData({ ...formData, modifier: e.target.value })}
                      placeholder="20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="modifierType">Tipo</Label>
                    <Select
                      value={formData.modifierType}
                      onValueChange={(value: "percentage" | "fixed") => setFormData({ ...formData, modifierType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Porcentagem (%)</SelectItem>
                        <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {(formData.type === "season" || formData.type === "special") && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Data Início</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">Data Fim</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      />
                    </div>
                  </div>
                )}
                {formData.type === "weekend" && (
                  <div className="space-y-2">
                    <Label>Dias da Semana</Label>
                    <div className="flex gap-2">
                      {dayNames.map((day, index) => (
                        <Button
                          key={index}
                          type="button"
                          variant={formData.daysOfWeek.includes(index) ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleDayOfWeek(index)}
                        >
                          {day}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreate}>Criar Regra</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Regras</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pricingRules.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Regras Ativas</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pricingRules.filter((r) => r.active).length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Preço Médio</CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {Math.round(categories.reduce((sum, c) => sum + c.basePrice, 0) / categories.length)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Maior Tarifa</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {Math.max(...categories.map((c) => c.basePrice))}</div>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Rules Table */}
        <Card>
          <CardHeader>
            <CardTitle>Regras de Preço</CardTitle>
            <CardDescription>Gerencie todas as regras de precificação das suas acomodações</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Preço Base</TableHead>
                  <TableHead>Modificador</TableHead>
                  <TableHead>Preço Final</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pricingRules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">{rule.name}</TableCell>
                    <TableCell>{rule.categoryName}</TableCell>
                    <TableCell>
                      <Badge variant={typeColors[rule.type]}>{typeLabels[rule.type]}</Badge>
                    </TableCell>
                    <TableCell>R$ {rule.basePrice}</TableCell>
                    <TableCell>
                      {rule.modifierType === "percentage" ? `+${rule.modifier}%` : `+R$ ${rule.modifier}`}
                    </TableCell>
                    <TableCell className="font-semibold">
                      R$ {calculatePrice(rule.basePrice, rule.modifier, rule.modifierType)}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => toggleActive(rule.id)}>
                        <Badge variant={rule.active ? "default" : "secondary"}>{rule.active ? "Ativa" : "Inativa"}</Badge>
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(rule)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(rule.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Editar Regra de Preço</DialogTitle>
              <DialogDescription>Modifique as informações da regra de precificação</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nome da Regra *</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Categoria *</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name} - R$ {category.basePrice}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-type">Tipo de Regra</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: PricingRule["type"]) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="base">Base</SelectItem>
                      <SelectItem value="weekend">Fim de Semana</SelectItem>
                      <SelectItem value="holiday">Feriado</SelectItem>
                      <SelectItem value="season">Temporada</SelectItem>
                      <SelectItem value="special">Especial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-priority">Prioridade</Label>
                  <Input
                    id="edit-priority"
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-modifier">Modificador *</Label>
                  <Input
                    id="edit-modifier"
                    type="number"
                    value={formData.modifier}
                    onChange={(e) => setFormData({ ...formData, modifier: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-modifierType">Tipo</Label>
                  <Select
                    value={formData.modifierType}
                    onValueChange={(value: "percentage" | "fixed") => setFormData({ ...formData, modifierType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Porcentagem (%)</SelectItem>
                      <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {(formData.type === "season" || formData.type === "special") && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-startDate">Data Início</Label>
                    <Input
                      id="edit-startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-endDate">Data Fim</Label>
                    <Input
                      id="edit-endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </div>
              )}
              {formData.type === "weekend" && (
                <div className="space-y-2">
                  <Label>Dias da Semana</Label>
                  <div className="flex gap-2">
                    {dayNames.map((day, index) => (
                      <Button
                        key={index}
                        type="button"
                        variant={formData.daysOfWeek.includes(index) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleDayOfWeek(index)}
                      >
                        {day}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdate}>Salvar Alterações</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
