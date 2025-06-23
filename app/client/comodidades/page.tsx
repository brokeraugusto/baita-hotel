"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Plus, Edit, Trash2, Save, X } from "lucide-react"

// Tipos para as comodidades
interface Amenity {
  id: string
  name: string
  icon: string
  category: string
}

// Dados iniciais de comodidades
const initialAmenities: Amenity[] = [
  { id: "wifi", name: "Wi-Fi", icon: "wifi", category: "tecnologia" },
  { id: "tv", name: "TV", icon: "tv", category: "tecnologia" },
  { id: "ar-condicionado", name: "Ar-condicionado", icon: "fan", category: "conforto" },
  { id: "frigobar", name: "Frigobar", icon: "refrigerator", category: "conforto" },
  { id: "banheira", name: "Banheira", icon: "bath", category: "banheiro" },
  { id: "chuveiro", name: "Chuveiro", icon: "shower", category: "banheiro" },
  { id: "secador", name: "Secador de cabelo", icon: "hair-dryer", category: "banheiro" },
  { id: "cafe", name: "Cafeteira", icon: "coffee", category: "cozinha" },
  { id: "microondas", name: "Micro-ondas", icon: "microwave", category: "cozinha" },
  { id: "estacionamento", name: "Estacionamento", icon: "car", category: "serviços" },
  { id: "piscina", name: "Acesso à piscina", icon: "pool", category: "lazer" },
  { id: "academia", name: "Academia", icon: "dumbbell", category: "lazer" },
]

// Opções de ícones disponíveis
const iconOptions = [
  { value: "wifi", label: "Wi-Fi" },
  { value: "tv", label: "TV" },
  { value: "fan", label: "Ventilador/Ar" },
  { value: "refrigerator", label: "Frigobar" },
  { value: "bath", label: "Banheira" },
  { value: "shower", label: "Chuveiro" },
  { value: "hair-dryer", label: "Secador" },
  { value: "coffee", label: "Café" },
  { value: "microwave", label: "Micro-ondas" },
  { value: "car", label: "Carro" },
  { value: "pool", label: "Piscina" },
  { value: "dumbbell", label: "Academia" },
  { value: "utensils", label: "Talheres" },
  { value: "bed", label: "Cama" },
  { value: "key", label: "Chave" },
]

// Opções de categorias
const categoryOptions = [
  { value: "tecnologia", label: "Tecnologia" },
  { value: "conforto", label: "Conforto" },
  { value: "banheiro", label: "Banheiro" },
  { value: "cozinha", label: "Cozinha" },
  { value: "serviços", label: "Serviços" },
  { value: "lazer", label: "Lazer" },
  { value: "outros", label: "Outros" },
]

// Função para obter o ícone correspondente
const getIconComponent = (iconName: string) => {
  // Em uma implementação real, você importaria dinamicamente os ícones
  // Aqui estamos simulando com um elemento span
  return <span className="i-lucide-{iconName} h-4 w-4" />
}

export default function AmenitiesPage() {
  const [amenities, setAmenities] = useState<Amenity[]>(initialAmenities)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newAmenity, setNewAmenity] = useState<Partial<Amenity>>({
    name: "",
    icon: "",
    category: "",
  })
  const { toast } = useToast()

  // Filtrar comodidades por categoria
  const amenitiesByCategory = amenities.reduce(
    (acc, amenity) => {
      if (!acc[amenity.category]) {
        acc[amenity.category] = []
      }
      acc[amenity.category].push(amenity)
      return acc
    },
    {} as Record<string, Amenity[]>,
  )

  // Adicionar nova comodidade
  const handleAddAmenity = () => {
    if (!newAmenity.name || !newAmenity.icon || !newAmenity.category) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos para adicionar uma comodidade.",
        variant: "destructive",
      })
      return
    }

    const id = newAmenity.name.toLowerCase().replace(/\s+/g, "-")

    if (amenities.some((a) => a.id === id)) {
      toast({
        title: "Comodidade já existe",
        description: "Já existe uma comodidade com esse nome.",
        variant: "destructive",
      })
      return
    }

    const amenity: Amenity = {
      id,
      name: newAmenity.name,
      icon: newAmenity.icon,
      category: newAmenity.category,
    }

    setAmenities([...amenities, amenity])
    setNewAmenity({ name: "", icon: "", category: "" })

    toast({
      title: "Comodidade adicionada",
      description: `${amenity.name} foi adicionada com sucesso.`,
    })
  }

  // Iniciar edição de comodidade
  const handleStartEdit = (amenity: Amenity) => {
    setEditingId(amenity.id)
    setNewAmenity({
      name: amenity.name,
      icon: amenity.icon,
      category: amenity.category,
    })
  }

  // Salvar edição de comodidade
  const handleSaveEdit = () => {
    if (!editingId || !newAmenity.name || !newAmenity.icon || !newAmenity.category) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos para salvar a comodidade.",
        variant: "destructive",
      })
      return
    }

    setAmenities(
      amenities.map((amenity) =>
        amenity.id === editingId
          ? {
              ...amenity,
              name: newAmenity.name!,
              icon: newAmenity.icon!,
              category: newAmenity.category!,
            }
          : amenity,
      ),
    )

    setEditingId(null)
    setNewAmenity({ name: "", icon: "", category: "" })

    toast({
      title: "Comodidade atualizada",
      description: "A comodidade foi atualizada com sucesso.",
    })
  }

  // Cancelar edição
  const handleCancelEdit = () => {
    setEditingId(null)
    setNewAmenity({ name: "", icon: "", category: "" })
  }

  // Excluir comodidade
  const handleDeleteAmenity = (id: string) => {
    setAmenities(amenities.filter((amenity) => amenity.id !== id))

    toast({
      title: "Comodidade excluída",
      description: "A comodidade foi excluída com sucesso.",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Comodidades</h1>
          <p className="text-muted-foreground">Gerencie as comodidades disponíveis para suas acomodações</p>
        </div>
      </div>

      {/* Formulário para adicionar/editar comodidade */}
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Editar Comodidade" : "Nova Comodidade"}</CardTitle>
          <CardDescription>
            {editingId
              ? "Atualize as informações da comodidade selecionada"
              : "Adicione uma nova comodidade ao sistema"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Comodidade</Label>
              <Input
                id="name"
                value={newAmenity.name}
                onChange={(e) => setNewAmenity({ ...newAmenity, name: e.target.value })}
                placeholder="Ex: Wi-Fi"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="icon">Ícone</Label>
              <Select value={newAmenity.icon} onValueChange={(value) => setNewAmenity({ ...newAmenity, icon: value })}>
                <SelectTrigger id="icon">
                  <SelectValue placeholder="Selecione um ícone" />
                </SelectTrigger>
                <SelectContent>
                  {iconOptions.map((icon) => (
                    <SelectItem key={icon.value} value={icon.value}>
                      <div className="flex items-center gap-2">
                        <span className={`i-lucide-${icon.value}`}></span>
                        {icon.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={newAmenity.category}
                onValueChange={(value) => setNewAmenity({ ...newAmenity, category: value })}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            {editingId ? (
              <>
                <Button variant="outline" onClick={handleCancelEdit}>
                  <X className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>
                <Button onClick={handleSaveEdit}>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Alterações
                </Button>
              </>
            ) : (
              <Button onClick={handleAddAmenity}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Comodidade
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lista de comodidades por categoria */}
      <div className="grid gap-6 md:grid-cols-2">
        {Object.entries(amenitiesByCategory).map(([category, categoryAmenities]) => {
          const categoryLabel = categoryOptions.find((c) => c.value === category)?.label || category

          return (
            <Card key={category}>
              <CardHeader>
                <CardTitle>{categoryLabel}</CardTitle>
                <CardDescription>
                  {categoryAmenities.length} {categoryAmenities.length === 1 ? "comodidade" : "comodidades"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryAmenities.map((amenity) => (
                    <div key={amenity.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                          <span className={`i-lucide-${amenity.icon}`}></span>
                        </div>
                        <div>
                          <p className="font-medium">{amenity.name}</p>
                          <p className="text-sm text-muted-foreground">ID: {amenity.id}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleStartEdit(amenity)}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteAmenity(amenity.id)}>
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Excluir</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
