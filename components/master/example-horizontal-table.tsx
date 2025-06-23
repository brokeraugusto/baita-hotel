"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { HorizontalScrollTable } from "@/components/ui/horizontal-scroll-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function ExampleHorizontalTable() {
  // Dados de exemplo
  const data = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    name: `Item ${i + 1}`,
    description: `Descrição do item ${i + 1}`,
    category: `Categoria ${(i % 3) + 1}`,
    price: Math.floor(Math.random() * 1000) + 100,
    stock: Math.floor(Math.random() * 100),
    lastUpdated: new Date().toLocaleDateString("pt-BR"),
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exemplo de Tabela com Scroll Horizontal</CardTitle>
        <CardDescription>Use a roda do mouse para navegar horizontalmente</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <HorizontalScrollTable minWidth="1200px">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">ID</TableHead>
                <TableHead className="w-[200px]">Nome</TableHead>
                <TableHead className="w-[300px]">Descrição</TableHead>
                <TableHead className="w-[150px]">Categoria</TableHead>
                <TableHead className="w-[120px]">Preço</TableHead>
                <TableHead className="w-[100px]">Estoque</TableHead>
                <TableHead className="w-[150px]">Última Atualização</TableHead>
                <TableHead className="w-[200px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>R$ {item.price.toFixed(2)}</TableCell>
                  <TableCell>{item.stock}</TableCell>
                  <TableCell>{item.lastUpdated}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <button className="text-blue-500 hover:underline">Editar</button>
                      <button className="text-red-500 hover:underline">Excluir</button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </HorizontalScrollTable>
      </CardContent>
    </Card>
  )
}
