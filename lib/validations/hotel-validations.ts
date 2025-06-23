import { z } from "zod"

// Validações para configurações básicas do hotel
export const hotelBasicSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100, "Nome muito longo"),
  description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres").max(500, "Descrição muito longa"),
  address: z.string().min(5, "Endereço deve ter pelo menos 5 caracteres"),
  city: z.string().min(2, "Cidade deve ter pelo menos 2 caracteres"),
  state: z.string().min(2, "Estado deve ter pelo menos 2 caracteres"),
  zipCode: z.string().regex(/^\d{5}-?\d{3}$/, "CEP inválido (formato: 00000-000)"),
  country: z.string().min(2, "País deve ter pelo menos 2 caracteres"),
  phone: z.string().regex(/^$$\d{2}$$\s\d{4,5}-\d{4}$/, "Telefone inválido (formato: (00) 00000-0000)"),
  email: z.string().email("E-mail inválido"),
  website: z.string().url("URL inválida").optional().or(z.literal("")),
  category: z.enum(["1-star", "2-stars", "3-stars", "4-stars", "5-stars", "boutique", "resort"]),
  checkInTime: z.string().regex(/^\d{2}:\d{2}$/, "Horário inválido (formato: HH:MM)"),
  checkOutTime: z.string().regex(/^\d{2}:\d{2}$/, "Horário inválido (formato: HH:MM)"),
  currency: z.enum(["BRL", "USD", "EUR", "ARS"]),
  timezone: z.string().min(1, "Fuso horário é obrigatório"),
})

// Validações para usuários
export const userSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100, "Nome muito longo"),
  email: z.string().email("E-mail inválido"),
  phone: z
    .string()
    .regex(/^$$\d{2}$$\s\d{4,5}-\d{4}$/, "Telefone inválido")
    .optional()
    .or(z.literal("")),
  role: z.enum(["admin", "manager", "reception", "maintenance", "financial", "housekeeping"]),
  permissions: z.array(z.string()).min(1, "Pelo menos uma permissão deve ser selecionada"),
})

// Validações para hóspedes
export const guestSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100, "Nome muito longo"),
  email: z.string().email("E-mail inválido"),
  phone: z
    .string()
    .regex(/^$$\d{2}$$\s\d{4,5}-\d{4}$/, "Telefone inválido")
    .optional()
    .or(z.literal("")),
  document: z.string().min(8, "Documento deve ter pelo menos 8 caracteres"),
  address: z.string().min(5, "Endereço deve ter pelo menos 5 caracteres").optional().or(z.literal("")),
  city: z.string().min(2, "Cidade deve ter pelo menos 2 caracteres").optional().or(z.literal("")),
  state: z.string().min(2, "Estado deve ter pelo menos 2 caracteres").optional().or(z.literal("")),
  country: z.string().min(2, "País deve ter pelo menos 2 caracteres").optional().or(z.literal("")),
  birthdate: z.string().optional().or(z.literal("")),
  nationality: z.string().min(2, "Nacionalidade deve ter pelo menos 2 caracteres").optional().or(z.literal("")),
  gender: z.enum(["Masculino", "Feminino", "Outro", "Prefiro não informar"]).optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().max(1000, "Observações muito longas").optional().or(z.literal("")),
  vip: z.boolean().optional(),
})

// Validações para reservas
export const reservationSchema = z
  .object({
    guestName: z.string().min(2, "Nome do hóspede é obrigatório"),
    guestEmail: z.string().email("E-mail inválido"),
    guestPhone: z
      .string()
      .regex(/^$$\d{2}$$\s\d{4,5}-\d{4}$/, "Telefone inválido")
      .optional()
      .or(z.literal("")),
    guestDocument: z.string().min(8, "Documento é obrigatório"),
    roomNumber: z.string().min(1, "Número do quarto é obrigatório"),
    roomCategory: z.string().min(1, "Categoria do quarto é obrigatória"),
    checkInDate: z.string().min(1, "Data de check-in é obrigatória"),
    checkOutDate: z.string().min(1, "Data de check-out é obrigatória"),
    guests: z.number().min(1, "Número de hóspedes deve ser pelo menos 1").max(10, "Máximo 10 hóspedes"),
    totalAmount: z.number().min(0, "Valor total deve ser positivo"),
    paymentMethod: z.enum(["PIX", "Cartão", "Dinheiro", "Transferência"]),
    paymentStatus: z.enum(["pending", "paid", "partial", "cancelled"]),
    status: z.enum(["confirmed", "pending", "checked_in", "checked_out", "cancelled"]),
    breakfast: z.boolean(),
    observations: z.string().max(500, "Observações muito longas").optional().or(z.literal("")),
  })
  .refine(
    (data) => {
      const checkIn = new Date(data.checkInDate)
      const checkOut = new Date(data.checkOutDate)
      return checkOut > checkIn
    },
    {
      message: "Data de check-out deve ser posterior à data de check-in",
      path: ["checkOutDate"],
    },
  )

// Validações para manutenção
export const maintenanceSchema = z.object({
  title: z.string().min(3, "Título deve ter pelo menos 3 caracteres").max(100, "Título muito longo"),
  description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres").max(1000, "Descrição muito longa"),
  roomId: z.string().min(1, "Quarto é obrigatório"),
  category: z.enum(["electrical", "plumbing", "hvac", "furniture", "cleaning", "other"]),
  priority: z.enum(["low", "medium", "high", "critical"]),
  type: z.enum(["corrective", "preventive", "emergency", "inspection"]),
  assignedTo: z.string().optional(),
  estimatedCost: z.number().min(0, "Custo estimado deve ser positivo").optional(),
  scheduledDate: z.string().optional(),
  notes: z.string().max(1000, "Observações muito longas").optional().or(z.literal("")),
})

// Validações para preços
export const pricingRuleSchema = z
  .object({
    name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres").max(50, "Nome muito longo"),
    categoryId: z.string().min(1, "Categoria é obrigatória"),
    type: z.enum(["base", "weekend", "holiday", "season", "special"]),
    modifier: z.number().min(0, "Modificador deve ser positivo"),
    modifierType: z.enum(["percentage", "fixed"]),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
    priority: z.number().min(1, "Prioridade deve ser pelo menos 1").max(10, "Prioridade máxima é 10"),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        const start = new Date(data.startDate)
        const end = new Date(data.endDate)
        return end > start
      }
      return true
    },
    {
      message: "Data de fim deve ser posterior à data de início",
      path: ["endDate"],
    },
  )

// Validações para limpeza
export const cleaningTaskSchema = z.object({
  roomId: z.string().min(1, "Quarto é obrigatório"),
  taskType: z.enum(["checkout_cleaning", "maintenance_cleaning", "deep_cleaning", "inspection"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  assignedTo: z.string().optional(),
  estimatedDuration: z.number().min(15, "Duração mínima é 15 minutos").max(480, "Duração máxima é 8 horas"),
  specialInstructions: z.string().max(500, "Instruções muito longas").optional().or(z.literal("")),
  checklistItems: z.array(z.string()).optional(),
})

export type HotelBasicData = z.infer<typeof hotelBasicSchema>
export type UserData = z.infer<typeof userSchema>
export type GuestData = z.infer<typeof guestSchema>
export type ReservationData = z.infer<typeof reservationSchema>
export type MaintenanceData = z.infer<typeof maintenanceSchema>
export type PricingRuleData = z.infer<typeof pricingRuleSchema>
export type CleaningTaskData = z.infer<typeof cleaningTaskSchema>
