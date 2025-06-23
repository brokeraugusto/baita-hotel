import { HorizontalScrollContainer } from "@/components/ui/horizontal-scroll-container"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Client {
  id: string
  name: string
  email: string
  plan: string
  status: string
  lastLogin: string
  hotels: number
}

interface ClientsTableProps {
  clients: Client[]
}

export function ClientsTableWithHorizontalScroll({ clients }: ClientsTableProps) {
  return (
    <HorizontalScrollContainer>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Plano</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Último Login</TableHead>
            <TableHead>Hotéis</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.id}>
              <TableCell>{client.id}</TableCell>
              <TableCell>{client.name}</TableCell>
              <TableCell>{client.email}</TableCell>
              <TableCell>{client.plan}</TableCell>
              <TableCell>{client.status}</TableCell>
              <TableCell>{client.lastLogin}</TableCell>
              <TableCell>{client.hotels}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <button className="text-blue-500 hover:text-blue-700">Editar</button>
                  <button className="text-red-500 hover:text-red-700">Excluir</button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </HorizontalScrollContainer>
  )
}
