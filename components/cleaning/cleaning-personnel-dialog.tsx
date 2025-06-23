"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"

interface CleaningPersonnelDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPersonnelCreated: () => void
  hotelId: string
}

const specialtyOptions = [
  "Quartos Standard",
  "Quartos Deluxe",
  "Suítes",
  "Áreas Comuns",
  "Limpeza Profunda",
  "Manutenção",
  "Inspeção",
  "Lavanderia",
]

export function CleaningPersonnelDialog({
  open,
  onOpenChange,
  onPersonnelCreated,
  hotelId,
}: CleaningPersonnelDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    hourlyRate: "",
    specialties: [] as string[],
    notes: "",
  })
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Simular criação de funcionário
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Funcionário adicionado",
        description: `${formData.name} foi adicionado à equipe de limpeza.`,
      })

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        hourlyRate: "",
        specialties: [],
        notes: "",
      })

      onPersonnelCreated()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao adicionar o funcionário.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSpecialtyChange = (specialty: string, checked: boolean) => {
    if (checked) {
      setFormData({ ...formData, specialties: [...formData.specialties, specialty] })
    } else {
      setFormData({ ...formData, specialties: formData.specialties.filter((s) => s !== specialty) })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Funcionário</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Maria Silva"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="maria@hotel.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hourlyRate">Valor por Hora (R$)</Label>
            <Input
              id="hourlyRate"
              type="number"
              step="0.01"
              value={formData.hourlyRate}
              onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
              placeholder="25.00"
            />
          </div>

          <div className="space-y-2">
            <Label>Especialidades</Label>
            <div className="grid grid-cols-2 gap-2">
              {specialtyOptions.map((specialty) => (
                <div key={specialty} className="flex items-center space-x-2">
                  <Checkbox
                    id={specialty}
                    checked={formData.specialties.includes(specialty)}
                    onCheckedChange={(checked) => handleSpecialtyChange(specialty, checked as boolean)}
                  />
                  <Label htmlFor={specialty} className="text-sm">
                    {specialty}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Informações adicionais sobre o funcionário..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adicionando..." : "Adicionar Funcionário"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
