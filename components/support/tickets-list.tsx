import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, MessageSquare, MoreHorizontal, User, Clock } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const tickets = [
  {
    id: "TK-001",
    title: "Sistema não sincroniza reservas",
    client: "Hotel Vista Mar",
    priority: "critical",
    status: "open",
    assignee: "João Silva",
    created: "2024-01-14 10:30",
    lastUpdate: "2024-01-14 14:20",
    responses: 3,
  },
  {
    id: "TK-002",
    title: "Dúvida sobre relatórios financeiros",
    client: "Pousada do Sol",
    priority: "medium",
    status: "in-progress",
    assignee: "Maria Santos",
    created: "2024-01-14 09:15",
    lastUpdate: "2024-01-14 13:45",
    responses: 5,
  },
  {
    id: "TK-003",
    title: "Erro ao gerar backup",
    client: "Resort Paradise",
    priority: "high",
    status: "waiting",
    assignee: "Pedro Costa",
    created: "2024-01-13 16:20",
    lastUpdate: "2024-01-14 08:30",
    responses: 2,
  },
  {
    id: "TK-004",
    title: "Solicitação de nova funcionalidade",
    client: "Hotel Central",
    priority: "low",
    status: "resolved",
    assignee: "Ana Lima",
    created: "2024-01-12 14:10",
    lastUpdate: "2024-01-13 17:00",
    responses: 8,
  },
]

const statusConfig = {
  open: { label: "Aberto", variant: "destructive" as const },
  "in-progress": { label: "Em Andamento", variant: "secondary" as const },
  waiting: { label: "Aguardando", variant: "outline" as const },
  resolved: { label: "Resolvido", variant: "default" as const },
  closed: { label: "Fechado", variant: "outline" as const },
}

const priorityConfig = {
  critical: { label: "Crítica", variant: "destructive" as const },
  high: { label: "Alta", variant: "destructive" as const },
  medium: { label: "Média", variant: "secondary" as const },
  low: { label: "Baixa", variant: "outline" as const },
}

export function TicketsList() {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticket</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Prioridade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Última Atualização</TableHead>
              <TableHead>Respostas</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.map((ticket) => (
              <TableRow key={ticket.id}>
                <TableCell>
                  <div>
                    <code className="text-sm bg-muted px-2 py-1 rounded">{ticket.id}</code>
                    <div className="font-medium mt-1">{ticket.title}</div>
                    <div className="text-sm text-muted-foreground flex items-center mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      {ticket.created}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-medium">{ticket.client}</TableCell>
                <TableCell>
                  <Badge variant={priorityConfig[ticket.priority as keyof typeof priorityConfig].variant}>
                    {priorityConfig[ticket.priority as keyof typeof priorityConfig].label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={statusConfig[ticket.status as keyof typeof statusConfig].variant}>
                    {statusConfig[ticket.status as keyof typeof statusConfig].label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{ticket.assignee}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{ticket.lastUpdate}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{ticket.responses}</span>
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
                        <Eye className="mr-2 h-4 w-4" />
                        Ver Detalhes
                      </DropdownMenuItem>
                      <DropdownMenuItem>Responder</DropdownMenuItem>
                      <DropdownMenuItem>Alterar Status</DropdownMenuItem>
                      <DropdownMenuItem>Escalar</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
