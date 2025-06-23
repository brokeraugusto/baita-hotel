"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { useToast } from "@/hooks/use-toast"
import { Plus, Edit, Trash2, Tag, Users, DollarSign, Star, Wifi, Tv, Car, Coffee, Bath } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Category {
  id: string
  name: string
  description: string
  basePrice: number
  maxOccupancy: number
  amenities: string[]
  color: string
  roomCount: number
  status: "active" | "inactive"
}

const initialCategories: Category[] = [
  {
    id: "1",
    name: "Suíte Luxo",
    description: "Acomodação premium com vista para o mar e comodidades exclusivas",
    basePrice: 450,
    maxOccupancy: 4,
    amenities: ["wifi", "tv", "parking", "coffee", "bath", "minibar", "balcony"],
    color: "purple",
    roomCount: 8,
    status: "active",
  },
  {
    id: "2",
    name: "Quarto Vista Mar",
    description: "Quarto confortável com vista panorâmica para o oceano",
    basePrice: 320,
    maxOccupancy: 3,
    amenities: ["wifi", "tv", "coffee", "balcony"],
    color: "blue",
    roomCount: 15,
    status: "active",
  },
  {
    id: "3",
    name: "Chalé Standard",
    description: "Chalé aconchegante em meio ao jardim, ideal para famílias",
    basePrice: 280,
    maxOccupancy: 6,
    amenities: ["wifi", "tv", "parking", "kitchen"],
    color: "green",
    roomCount: 12,
    status: "active",
  },
  {
    id: "4",
    name: "Quarto Econômico",
    description: "Opção econômica com todas as comodidades essenciais",
    basePrice: 180,
    maxOccupancy: 2,
    amenities: ["wifi", "tv"],
    color: "orange",
    roomCount: 20,
    status: "inactive",
  },
]

const amenityOptions = [
  { id: "wifi", label: "Wi-Fi", icon: Wifi },
  { id: "tv", label: "TV", icon: Tv },
  { id: "parking", label: "Estacionamento", icon: Car },
  { id: "coffee", label: "Café", icon: Coffee },
  { id: "bath", label: "Banheira", icon: Bath },
  { id: "minibar", label: "Minibar", icon: Star },
  { id: "balcony", label: "Varanda", icon: Star },
  { id: "kitchen", label: "Cozinha", icon: Star },
]

const colorOptions = [
  { value: "blue", label: "Azul", class: "bg-blue-500" },
  { value: "green", label: "Verde", class: "bg-green-500" },
  { value: "purple", label: "Roxo", class: "bg-purple-500" },
  { value: "orange", label: "Laranja", class: "bg-orange-500" },
  { value: "red", label: "Vermelho", class: "bg-red-500" },
  { value: "yellow", label: "Amarelo", class: "bg-yellow-500" },
]

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    basePrice: "",
    maxOccupancy: "",
    amenities: [] as string[],
    color: "blue",
  })
  const { toast } = useToast()

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      basePrice: "",
      maxOccupancy: "",
      amenities: [],
      color: "blue",
    })
  }

  const handleCreate = () => {
    if (!formData.name || !formData.basePrice || !formData.maxOccupancy) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      })
      return
    }

    const newCategory: Category = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      basePrice: Number(formData.basePrice),
      maxOccupancy: Number(formData.maxOccupancy),
      amenities: formData.amenities,
      color: formData.color,
      roomCount: 0,
      status: "active",
    }

    setCategories([...categories, newCategory])
    setIsCreateOpen(false)
    resetForm()
    toast({
      title: "Categoria criada",
      description: "Nova categoria adicionada com sucesso.",
    })
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description,
      basePrice: category.basePrice.toString(),
      maxOccupancy: category.maxOccupancy.toString(),
      amenities: category.amenities,
      color: category.color,
    })
    setIsEditOpen(true)
  }

  const handleUpdate = () => {
    if (!editingCategory) return

    const updatedCategories = categories.map((cat) =>
      cat.id === editingCategory.id
        ? {
            ...cat,
            name: formData.name,
            description: formData.description,
            basePrice: Number(formData.basePrice),
            maxOccupancy: Number(formData.maxOccupancy),
            amenities: formData.amenities,
            color: formData.color,
          }
        : cat,
    )

    setCategories(updatedCategories)
    setIsEditOpen(false)
    setEditingCategory(null)
    resetForm()
    toast({
      title: "Categoria atualizada",
      description: "Categoria editada com sucesso.",
    })
  }

  const handleDelete = (id: string) => {
    setCategories(categories.filter((cat) => cat.id !== id))
    toast({
      title: "Categoria removida",
      description: "Categoria excluída com sucesso.",
    })
  }

  const toggleAmenity = (amenityId: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter((id) => id !== amenityId)
        : [...prev.amenities, amenityId],
    }))
  }

  const getColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: "bg-blue-500",
      green: "bg-green-500",
      purple: "bg-purple-500",
      orange: "bg-orange-500",
      red: "bg-red-500",
      yellow: "bg-yellow-500",
    }
    return colorMap[color] || "bg-gray-500"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categorias de Acomodações</h1>
          <p className="text-muted-foreground">Gerencie os tipos de acomodações e suas características</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Categoria
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>Nova Categoria</DialogTitle>
              <DialogDescription>Crie uma nova categoria de acomodação com suas características</DialogDescription>
            </DialogHeader>
            <ScrollArea className="flex-1 pr-6">
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome da Categoria *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Suíte Luxo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="color">Cor</Label>
                    <Select
                      value={formData.color}
                      onValueChange={(value) => setFormData({ ...formData, color: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {colorOptions.map((color) => (
                          <SelectItem key={color.value} value={color.value}>
                            <div className="flex items-center gap-2">
                              <div className={`w-4 h-4 rounded-full ${color.class}`} />
                              {color.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descrição detalhada da categoria..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="basePrice">Preço Base (R$) *</Label>
                    <Input
                      id="basePrice"
                      type="number"
                      value={formData.basePrice}
                      onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                      placeholder="0,00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxOccupancy">Ocupação Máxima *</Label>
                    <Input
                      id="maxOccupancy"
                      type="number"
                      value={formData.maxOccupancy}
                      onChange={(e) => setFormData({ ...formData, maxOccupancy: e.target.value })}
                      placeholder="Número de pessoas"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Comodidades</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {amenityOptions.map((amenity) => (
                      <div
                        key={amenity.id}
                        className={`flex items-center gap-2 p-2 border rounded cursor-pointer transition-colors ${
                          formData.amenities.includes(amenity.id) ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50"
                        }`}
                        onClick={() => toggleAmenity(amenity.id)}
                      >
                        <amenity.icon className="h-4 w-4" />
                        <span className="text-sm">{amenity.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
            <DialogFooter className="flex-shrink-0 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreate}>Criar Categoria</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Categorias</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorias Ativas</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.filter((c) => c.status === "active").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Quartos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.reduce((sum, c) => sum + c.roomCount, 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Preço Médio</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {Math.round(categories.reduce((sum, c) => sum + c.basePrice, 0) / categories.length)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Card key={category.id} className="overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full ${getColorClass(category.color)}`} />
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                </div>
                <Badge variant={category.status === "active" ? "default" : "secondary"}>
                  {category.status === "active" ? "Ativa" : "Inativa"}
                </Badge>
              </div>
              <CardDescription>{category.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Preço Base:</span>
                  <div className="font-semibold">R$ {category.basePrice}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Ocupação:</span>
                  <div className="font-semibold">{category.maxOccupancy} pessoas</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Quartos:</span>
                  <div className="font-semibold">{category.roomCount} unidades</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Comodidades:</span>
                  <div className="font-semibold">{category.amenities.length} itens</div>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">Comodidades:</span>
                <div className="flex flex-wrap gap-1">
                  {category.amenities.slice(0, 4).map((amenityId) => {
                    const amenity = amenityOptions.find((a) => a.id === amenityId)
                    return amenity ? (
                      <div key={amenityId} className="flex items-center gap-1 px-2 py-1 bg-muted rounded text-xs">
                        <amenity.icon className="h-3 w-3" />
                        {amenity.label}
                      </div>
                    ) : null
                  })}
                  {category.amenities.length > 4 && (
                    <div className="px-2 py-1 bg-muted rounded text-xs">+{category.amenities.length - 4} mais</div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(category)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(category.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Editar Categoria</DialogTitle>
            <DialogDescription>Modifique as informações da categoria</DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 pr-6">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nome da Categoria *</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-color">Cor</Label>
                  <Select value={formData.color} onValueChange={(value) => setFormData({ ...formData, color: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {colorOptions.map((color) => (
                        <SelectItem key={color.value} value={color.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded-full ${color.class}`} />
                            {color.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Descrição</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-basePrice">Preço Base (R$) *</Label>
                  <Input
                    id="edit-basePrice"
                    type="number"
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-maxOccupancy">Ocupação Máxima *</Label>
                  <Input
                    id="edit-maxOccupancy"
                    type="number"
                    value={formData.maxOccupancy}
                    onChange={(e) => setFormData({ ...formData, maxOccupancy: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Comodidades</Label>
                <div className="grid grid-cols-2 gap-2">
                  {amenityOptions.map((amenity) => (
                    <div
                      key={amenity.id}
                      className={`flex items-center gap-2 p-2 border rounded cursor-pointer transition-colors ${
                        formData.amenities.includes(amenity.id) ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50"
                      }`}
                      onClick={() => toggleAmenity(amenity.id)}
                    >
                      <amenity.icon className="h-4 w-4" />
                      <span className="text-sm">{amenity.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="flex-shrink-0 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdate}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
