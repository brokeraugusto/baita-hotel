"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreVertical, Users, Mail, Phone, Loader2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getCleaningPersonnel } from "@/lib/services/cleaning-service"
import { useToast } from "@/hooks/use-toast"
import type { CleaningPersonnel } from "@/lib/services/cleaning-service"

interface CleaningPersonnelListProps {
  refreshTrigger: number
  onStaffUpdate: () => void
  hotelId: string
}

export function CleaningPersonnelList({ refreshTrigger, onStaffUpdate, hotelId }: CleaningPersonnelListProps) {
  const [personnel, setPersonnel] = useState<CleaningPersonnel[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadPersonnel()
  }, [refreshTrigger, hotelId])

  const loadPersonnel = async () => {
    setLoading(true)
    try {
      const { data, error } = await getCleaningPersonnel(hotelId)

      if (error) {
        toast({
          title: "Erro ao carregar pessoal",
          description: error,
          variant: "destructive",
        })
      } else {
        setPersonnel(data)
      }
    } catch (error) {
      console.error("Error loading personnel:", error)
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao carregar os dados do pessoal",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEditPersonnel = (id: string) => {
    toast({
      title: "Editar funcionário",
      description: `Editar funcionário com ID: ${id}`,
    })
  }

  const handleDeactivatePersonnel = (id: string) => {
    toast({
      title: "Desativar funcionário",
      description: `Desativar funcionário com ID: ${id}`,
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando equipe...</span>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Equipe de Limpeza</CardTitle>
        <Button variant="outline" size="sm" onClick={onStaffUpdate}>
          <Users className="h-4 w-4 mr-2" />
          Gerenciar Equipe
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Especialidades</TableHead>
                <TableHead>Valor/Hora</TableHead>
                <TableHead>Observações</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {personnel.map((person) => (
                <TableRow key={person.id}>
                  <TableCell>
                    <div className="font-medium">{person.name}</div>
                    <Badge variant="outline" className="mt-1">
                      {person.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center text-xs">
                        <Mail className="h-3 w-3 mr-1" />
                        <span>{person.email || "N/A"}</span>
                      </div>
                      <div className="flex items-center text-xs">
                        <Phone className="h-3 w-3 mr-1" />
                        <span>{person.phone || "N/A"}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {person.specialties?.map((specialty, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{person.hourly_rate ? `R$ ${person.hourly_rate.toFixed(2)}` : "N/A"}</TableCell>
                  <TableCell>
                    <div className="max-w-[200px] truncate text-xs text-muted-foreground">
                      {person.notes || "Sem observações"}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditPersonnel(person.id)}>Editar</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeactivatePersonnel(person.id)}>
                          {person.is_active ? "Desativar" : "Ativar"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {personnel.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum funcionário encontrado.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
