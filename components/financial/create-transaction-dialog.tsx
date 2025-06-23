"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"
import { financialService, type FinancialCategory, type BankAccount } from "@/lib/services/financial-service"

interface CreateTransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  hotelId: string
  onSuccess?: () => void
}

export function CreateTransactionDialog({ open, onOpenChange, hotelId, onSuccess }: CreateTransactionDialogProps) {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<FinancialCategory[]>([])
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    transaction_type: "income" as "income" | "expense", // Atualizado para transaction_type
    amount: "",
    description: "",
    payment_method: "cash",
    transaction_date: new Date().toISOString().split("T")[0],
    notes: "",
  })

  useEffect(() => {
    if (open) {
      fetchData()
      setError(null)
      setSuccess(false)
    }
  }, [open])

  const fetchData = async () => {
    try {
      const [categoriesData, bankAccountsData] = await Promise.all([
        financialService.getCategories(),
        financialService.getBankAccounts(hotelId),
      ])
      setCategories(categoriesData)
      setBankAccounts(bankAccountsData)
    } catch (error) {
      console.error("Error fetching data:", error)
      setError("Erro ao carregar dados. Verifique se as tabelas estão configuradas.")
    }
  }

  const resetForm = () => {
    setFormData({
      transaction_type: "income",
      amount: "",
      description: "",
      payment_method: "cash",
      transaction_date: new Date().toISOString().split("T")[0],
      notes: "",
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Validações
      if (!formData.amount || Number.parseFloat(formData.amount) <= 0) {
        throw new Error("Valor deve ser maior que zero")
      }

      if (!formData.description.trim()) {
        throw new Error("Descrição é obrigatória")
      }

      const transaction = {
        hotel_id: hotelId,
        transaction_type: formData.transaction_type,
        amount: Number.parseFloat(formData.amount),
        description: formData.description.trim(),
        payment_method: formData.payment_method,
        transaction_date: formData.transaction_date,
        status: "completed", // Status padrão
      }

      const result = await financialService.createTransaction(transaction)

      if (result) {
        setSuccess(true)
        setTimeout(() => {
          onSuccess?.()
          onOpenChange(false)
          resetForm()
          setSuccess(false)
        }, 1500)
      } else {
        throw new Error("Falha ao criar transação")
      }
    } catch (error) {
      console.error("Error creating transaction:", error)
      setError(error instanceof Error ? error.message : "Erro ao criar transação")
    } finally {
      setLoading(false)
    }
  }

  const filteredCategories = categories.filter((cat) => cat.type === formData.transaction_type)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nova Transação</DialogTitle>
          <DialogDescription>Registre uma nova movimentação financeira</DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>Transação criada com sucesso!</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="transaction_type">Tipo *</Label>
              <Select
                value={formData.transaction_type}
                onValueChange={(value: "income" | "expense") => setFormData({ ...formData, transaction_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Receita</SelectItem>
                  <SelectItem value="expense">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Valor *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0,00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Input
              id="description"
              placeholder="Descreva a transação"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payment_method">Método de Pagamento</Label>
              <Select
                value={formData.payment_method}
                onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Dinheiro</SelectItem>
                  <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                  <SelectItem value="debit_card">Cartão de Débito</SelectItem>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="bank_transfer">Transferência</SelectItem>
                  <SelectItem value="check">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="transaction_date">Data *</Label>
              <Input
                id="transaction_date"
                type="date"
                value={formData.transaction_date}
                onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              placeholder="Observações adicionais (opcional)"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || success}>
              {loading ? "Salvando..." : success ? "Salvo!" : "Salvar Transação"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
