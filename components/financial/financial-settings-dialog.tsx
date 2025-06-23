"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CreditCard, Tag, Users, Settings, Info } from "lucide-react"
import {
  financialService,
  type FinancialCategory,
  type BankAccount,
  type Supplier,
} from "@/lib/services/financial-service"

interface FinancialSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  hotelId: string
}

export function FinancialSettingsDialog({ open, onOpenChange, hotelId }: FinancialSettingsDialogProps) {
  const [categories, setCategories] = useState<FinancialCategory[]>([])
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      loadData()
    }
  }, [open, hotelId])

  const loadData = async () => {
    setLoading(true)
    try {
      const [categoriesData, bankAccountsData, suppliersData] = await Promise.all([
        financialService.getCategories(),
        financialService.getBankAccounts(hotelId),
        financialService.getSuppliers(hotelId),
      ])
      setCategories(categoriesData)
      setBankAccounts(bankAccountsData)
      setSuppliers(suppliersData)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações Financeiras
          </DialogTitle>
          <DialogDescription>Gerencie as configurações do módulo financeiro</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="categories">Categorias</TabsTrigger>
            <TabsTrigger value="accounts">Contas</TabsTrigger>
            <TabsTrigger value="suppliers">Fornecedores</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Status do Sistema</CardTitle>
                <CardDescription>Informações sobre a configuração atual</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{categories.length}</div>
                    <div className="text-sm text-blue-600">Categorias</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{bankAccounts.length}</div>
                    <div className="text-sm text-green-600">Contas Bancárias</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{suppliers.length}</div>
                    <div className="text-sm text-purple-600">Fornecedores</div>
                  </div>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    O sistema financeiro está configurado e operacional. Use as abas acima para gerenciar categorias,
                    contas bancárias e fornecedores.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Categorias Financeiras
                </CardTitle>
                <CardDescription>Gerencie as categorias de receitas e despesas</CardDescription>
              </CardHeader>
              <CardContent>
                {categories.length === 0 ? (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>Nenhuma categoria encontrada.</AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          {category.color && (
                            <div className="w-4 h-4 rounded" style={{ backgroundColor: category.color }} />
                          )}
                          <div>
                            <div className="font-medium">{category.name}</div>
                            {category.description && (
                              <div className="text-sm text-muted-foreground">{category.description}</div>
                            )}
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {category.type === "income" ? "Receita" : "Despesa"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accounts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Contas Bancárias
                </CardTitle>
                <CardDescription>Configure suas contas bancárias</CardDescription>
              </CardHeader>
              <CardContent>
                {bankAccounts.length === 0 ? (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>Nenhuma conta bancária encontrada.</AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-2">
                    {bankAccounts.map((account) => (
                      <div key={account.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{account.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {account.bank_name} - {account.account_number}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{formatCurrency(account.balance)}</div>
                          <div className="text-sm text-muted-foreground">
                            {account.account_type === "checking"
                              ? "Corrente"
                              : account.account_type === "savings"
                                ? "Poupança"
                                : "Crédito"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="suppliers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Fornecedores
                </CardTitle>
                <CardDescription>Gerencie seus fornecedores</CardDescription>
              </CardHeader>
              <CardContent>
                {suppliers.length === 0 ? (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>Nenhum fornecedor encontrado.</AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-2">
                    {suppliers.map((supplier) => (
                      <div key={supplier.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{supplier.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {supplier.contact_person && `${supplier.contact_person} - `}
                            {supplier.email}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{supplier.category}</div>
                          <div className="text-sm text-muted-foreground">{supplier.payment_terms} dias</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={() => onOpenChange(false)}>Fechar</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
