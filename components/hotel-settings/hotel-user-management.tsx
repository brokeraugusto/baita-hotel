"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
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
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Users, UserPlus, Edit, Trash2, Shield, Key, Mail, Phone, Calendar } from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  phone: string
  role: string
  status: "active" | "inactive"
  lastLogin: string
  createdAt: string
  permissions: string[]
}

interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
  color: string
}

const roles: Role[] = [
  {
    id: "admin",
    name: "Admin/Diretoria",
    description: "Acesso total ao sistema",
    permissions: ["all"],
    color: "bg-red-100 text-red-800",
  },
  {
    id: "manager",
    name: "Gerente",
    description: "Gestão geral do hotel",
    permissions: ["reservations", "guests", "reports", "maintenance", "cleaning", "financial"],
    color: "bg-blue-100 text-blue-800",
  },
  {
    id: "reception",
    name: "Recepção",
    description: "Check-in, check-out e atendimento",
    permissions: ["reservations", "guests", "checkin"],
    color: "bg-green-100 text-green-800",
  },
  {
    id: "maintenance",
    name: "Manutenção",
    description: "Ordens de serviço e manutenção",
    permissions: ["maintenance", "rooms"],
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    id: "financial",
    name: "Financeiro",
    description: "Gestão financeira e relatórios",
    permissions: ["financial", "reports", "pricing"],
    color: "bg-purple-100 text-purple-800",
  },
  {
    id: "housekeeping",
    name: "Governança",
    description: "Limpeza e camareiras",
    permissions: ["cleaning", "rooms"],
    color: "bg-orange-100 text-orange-800",
  },
]

const allPermissions = [
  { id: "reservations", name: "Reservas", description: "Gerenciar reservas e disponibilidade" },
  { id: "guests", name: "Hóspedes", description: "Cadastro e gestão de hóspedes" },
  { id: "checkin", name: "Check-in/Check-out", description: "Processos de entrada e saída" },
  { id: "rooms", name: "Acomodações", description: "Gestão de quartos e categorias" },
  { id: "maintenance", name: "Manutenção", description: "Ordens de serviço e manutenção" },
  { id: "cleaning", name: "Limpeza", description: "Gestão de limpeza e governança" },
  { id: "financial", name: "Financeiro", description: "Gestão financeira e pagamentos" },
  { id: "reports", name: "Relatórios", description: "Visualização de relatórios" },
  { id: "pricing", name: "Preços", description: "Gestão de tarifas e preços" },
  { id: "settings", name: "Configurações", description: "Configurações do sistema" },
]

export function HotelUserManagement() {
  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      name: "João Silva",
      email: "joao@hotelaugusto.com.br",
      phone: "(11) 99999-9999",
      role: "admin",
      status: "active",
      lastLogin: "2024-01-15 14:30:00",
      createdAt: "2024-01-01",
      permissions: ["all"],
    },
    {
      id: "2",
      name: "Maria Santos",
      email: "maria@hotelaugusto.com.br",
      phone: "(11) 88888-8888",
      role: "manager",
      status: "active",
      lastLogin: "2024-01-15 13:45:00",
      createdAt: "2024-01-02",
      permissions: ["reservations", "guests", "reports", "maintenance", "cleaning", "financial"],
    },
    {
      id: "3",
      name: "Pedro Costa",
      email: "pedro@hotelaugusto.com.br",
      phone: "(11) 77777-7777",
      role: "reception",
      status: "active",
      lastLogin: "2024-01-15 15:20:00",
      createdAt: "2024-01-03",
      permissions: ["reservations", "guests", "checkin"],
    },
    {
      id: "4",
      name: "Ana Lima",
      email: "ana@hotelaugusto.com.br",
      phone: "(11) 66666-6666",
      role: "maintenance",
      status: "inactive",
      lastLogin: "2024-01-10 10:15:00",
      createdAt: "2024-01-04",
      permissions: ["maintenance", "rooms"],
    },
  ])

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    permissions: [] as string[],
  })
  const { toast } = useToast()

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      role: "",
      permissions: [],
    })
  }

  const handleCreateUser = () => {
    const selectedRole = roles.find((r) => r.id === formData.role)
    const newUser: User = {
      id: Date.now().toString(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      status: "active",
      lastLogin: "Nunca",
      createdAt: new Date().toISOString().split("T")[0],
      permissions: selectedRole?.permissions || formData.permissions,
    }

    setUsers([...users, newUser])
    setIsCreateOpen(false)
    resetForm()

    toast({
      title: "Usuário criado",
      description: "Novo usuário adicionado com sucesso.",
    })
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      permissions: user.permissions,
    })
    setIsEditOpen(true)
  }

  const handleUpdateUser = () => {
    if (!selectedUser) return

    const selectedRole = roles.find((r) => r.id === formData.role)
    const updatedUsers = users.map((user) =>
      user.id === selectedUser.id
        ? {
            ...user,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            role: formData.role,
            permissions: selectedRole?.permissions || formData.permissions,
          }
        : user,
    )

    setUsers(updatedUsers)
    setIsEditOpen(false)
    setSelectedUser(null)
    resetForm()

    toast({
      title: "Usuário atualizado",
      description: "Dados do usuário atualizados com sucesso.",
    })
  }

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter((user) => user.id !== id))
    toast({
      title: "Usuário removido",
      description: "Usuário excluído com sucesso.",
    })
  }

  const toggleUserStatus = (id: string) => {
    setUsers(
      users.map((user) =>
        user.id === id ? { ...user, status: user.status === "active" ? "inactive" : "active" } : user,
      ),
    )
  }

  const getRoleInfo = (roleId: string) => {
    return roles.find((role) => role.id === roleId)
  }

  const handleRoleChange = (roleId: string) => {
    const role = roles.find((r) => r.id === roleId)
    setFormData({
      ...formData,
      role: roleId,
      permissions: role?.permissions || [],
    })
  }

  const handlePermissionToggle = (permissionId: string) => {
    const newPermissions = formData.permissions.includes(permissionId)
      ? formData.permissions.filter((p) => p !== permissionId)
      : [...formData.permissions, permissionId]

    setFormData({ ...formData, permissions: newPermissions })
  }

  return (
    <div className="space-y-6">
      {/* Header com Estatísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">{users.filter((u) => u.status === "active").length} ativos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administradores</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.filter((u) => u.role === "admin").length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Últimos Logins</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.filter((u) => u.lastLogin !== "Nunca").length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Funções Ativas</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roles.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Gerenciamento de Usuários */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Usuários do Sistema</CardTitle>
              <CardDescription>Gerencie usuários e suas permissões</CardDescription>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Novo Usuário
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Novo Usuário</DialogTitle>
                  <DialogDescription>Adicione um novo usuário ao sistema</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome Completo</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Nome do usuário"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="email@hotel.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Função</Label>
                      <Select value={formData.role} onValueChange={handleRoleChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a função" />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role.id} value={role.id}>
                              {role.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {formData.role && (
                    <div className="space-y-3">
                      <Label>Permissões</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {allPermissions.map((permission) => (
                          <div key={permission.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={permission.id}
                              checked={
                                formData.permissions.includes(permission.id) || formData.permissions.includes("all")
                              }
                              onCheckedChange={() => handlePermissionToggle(permission.id)}
                              disabled={formData.permissions.includes("all")}
                            />
                            <Label htmlFor={permission.id} className="text-sm">
                              {permission.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateUser}>Criar Usuário</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Último Login</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const roleInfo = getRoleInfo(user.role)
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{roleInfo && <Badge className={roleInfo.color}>{roleInfo.name}</Badge>}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3" />
                          {user.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant={user.status === "active" ? "default" : "secondary"}>
                          {user.status === "active" ? "Ativo" : "Inativo"}
                        </Badge>
                        <Switch checked={user.status === "active"} onCheckedChange={() => toggleUserStatus(user.id)} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {user.lastLogin === "Nunca" ? (
                          <span className="text-muted-foreground">Nunca</span>
                        ) : (
                          new Date(user.lastLogin).toLocaleString("pt-BR")
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={user.role === "admin"}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Gerenciamento de Funções */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Funções e Permissões
          </CardTitle>
          <CardDescription>Configure as funções disponíveis e suas permissões</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {roles.map((role) => (
              <Card key={role.id} className="border-2">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{role.name}</CardTitle>
                    <Badge className={role.color}>{users.filter((u) => u.role === role.id).length} usuários</Badge>
                  </div>
                  <CardDescription>{role.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Permissões:</Label>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.includes("all") ? (
                        <Badge variant="outline" className="text-xs">
                          Todas as permissões
                        </Badge>
                      ) : (
                        role.permissions.map((permissionId) => {
                          const permission = allPermissions.find((p) => p.id === permissionId)
                          return permission ? (
                            <Badge key={permissionId} variant="outline" className="text-xs">
                              {permission.name}
                            </Badge>
                          ) : null
                        })
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Edição */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>Atualize as informações do usuário</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome Completo</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">E-mail</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Telefone</Label>
                <Input
                  id="edit-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role">Função</Label>
                <Select value={formData.role} onValueChange={handleRoleChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.role && (
              <div className="space-y-3">
                <Label>Permissões</Label>
                <div className="grid grid-cols-2 gap-2">
                  {allPermissions.map((permission) => (
                    <div key={permission.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-${permission.id}`}
                        checked={formData.permissions.includes(permission.id) || formData.permissions.includes("all")}
                        onCheckedChange={() => handlePermissionToggle(permission.id)}
                        disabled={formData.permissions.includes("all")}
                      />
                      <Label htmlFor={`edit-${permission.id}`} className="text-sm">
                        {permission.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateUser}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
