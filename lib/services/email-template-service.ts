import { createClient } from "@/lib/supabase/client"

interface EmailTemplate {
  id: string
  hotel_id: string
  name: string
  subject: string
  template_key: string
  html_content: string
  text_content: string | null
  variables: any[]
  is_active: boolean
  is_system: boolean
  created_at: string
  updated_at: string
}

interface EmailLog {
  id: string
  hotel_id: string
  template_id: string | null
  recipient_email: string
  recipient_name: string | null
  subject: string
  status: string
  sent_at: string | null
  delivered_at: string | null
  opened_at: string | null
  clicked_at: string | null
  error_message: string | null
  metadata: any
  created_at: string
  updated_at: string
}

export class EmailTemplateService {
  private supabase = createClient()
  private defaultHotelId = "550e8400-e29b-41d4-a716-446655440000" // Hotel de exemplo

  // Verificar se as tabelas existem
  private async checkTablesExist(): Promise<boolean> {
    try {
      const { error } = await this.supabase.from("email_templates").select("id").limit(1)

      return !error
    } catch (error) {
      console.warn("Tabelas de e-mail não encontradas:", error)
      return false
    }
  }

  // Buscar todos os templates de um hotel
  async getTemplates(hotelId: string = this.defaultHotelId): Promise<EmailTemplate[]> {
    try {
      const tablesExist = await this.checkTablesExist()
      if (!tablesExist) {
        return this.getMockTemplates()
      }

      const { data, error } = await this.supabase
        .from("email_templates")
        .select("*")
        .eq("hotel_id", hotelId)
        .order("name")

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Erro ao buscar templates:", error)
      return this.getMockTemplates()
    }
  }

  // Buscar template por ID
  async getTemplate(id: string): Promise<EmailTemplate | null> {
    try {
      const tablesExist = await this.checkTablesExist()
      if (!tablesExist) {
        return this.getMockTemplates().find((t) => t.id === id) || null
      }

      const { data, error } = await this.supabase.from("email_templates").select("*").eq("id", id).single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Erro ao buscar template:", error)
      return null
    }
  }

  // Buscar template por chave
  async getTemplateByKey(hotelId: string, templateKey: string): Promise<EmailTemplate | null> {
    try {
      const tablesExist = await this.checkTablesExist()
      if (!tablesExist) {
        return this.getMockTemplates().find((t) => t.template_key === templateKey) || null
      }

      const { data, error } = await this.supabase
        .from("email_templates")
        .select("*")
        .eq("hotel_id", hotelId)
        .eq("template_key", templateKey)
        .eq("is_active", true)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Erro ao buscar template por chave:", error)
      return null
    }
  }

  // Criar novo template
  async createTemplate(template: Partial<EmailTemplate>): Promise<EmailTemplate> {
    try {
      const tablesExist = await this.checkTablesExist()
      if (!tablesExist) {
        throw new Error("Sistema de e-mail não configurado. Execute os scripts SQL primeiro.")
      }

      const { data, error } = await this.supabase
        .from("email_templates")
        .insert({
          ...template,
          hotel_id: template.hotel_id || this.defaultHotelId,
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Erro ao criar template:", error)
      throw error
    }
  }

  // Atualizar template
  async updateTemplate(id: string, updates: Partial<EmailTemplate>): Promise<EmailTemplate> {
    try {
      const tablesExist = await this.checkTablesExist()
      if (!tablesExist) {
        throw new Error("Sistema de e-mail não configurado. Execute os scripts SQL primeiro.")
      }

      const { data, error } = await this.supabase.from("email_templates").update(updates).eq("id", id).select().single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Erro ao atualizar template:", error)
      throw error
    }
  }

  // Deletar template (apenas templates não-sistema)
  async deleteTemplate(id: string): Promise<void> {
    try {
      const tablesExist = await this.checkTablesExist()
      if (!tablesExist) {
        throw new Error("Sistema de e-mail não configurado. Execute os scripts SQL primeiro.")
      }

      const { error } = await this.supabase.from("email_templates").delete().eq("id", id).eq("is_system", false)

      if (error) throw error
    } catch (error) {
      console.error("Erro ao deletar template:", error)
      throw error
    }
  }

  // Duplicar template
  async duplicateTemplate(id: string, newName: string): Promise<EmailTemplate> {
    try {
      const original = await this.getTemplate(id)
      if (!original) throw new Error("Template não encontrado")

      const duplicate = {
        ...original,
        id: undefined,
        name: newName,
        template_key: `${original.template_key}_copy_${Date.now()}`,
        is_active: false,
        is_system: false,
      }

      return this.createTemplate(duplicate)
    } catch (error) {
      console.error("Erro ao duplicar template:", error)
      throw error
    }
  }

  // Buscar logs de email
  async getEmailLogs(hotelId: string = this.defaultHotelId, limit = 50): Promise<EmailLog[]> {
    try {
      const tablesExist = await this.checkTablesExist()
      if (!tablesExist) {
        return this.getMockLogs()
      }

      const { data, error } = await this.supabase
        .from("email_logs")
        .select("*")
        .eq("hotel_id", hotelId)
        .order("created_at", { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Erro ao buscar logs:", error)
      return this.getMockLogs()
    }
  }

  // Obter estatísticas de email
  async getEmailStats(
    hotelId: string = this.defaultHotelId,
    days = 30,
  ): Promise<{
    totalSent: number
    totalFailed: number
    successRate: number
    byTemplate: Record<string, number>
  }> {
    try {
      const tablesExist = await this.checkTablesExist()
      if (!tablesExist) {
        return {
          totalSent: 15,
          totalFailed: 2,
          successRate: 88.2,
          byTemplate: {
            "Confirmação de Reserva": 8,
            "Lembrete de Check-in": 5,
            "Cancelamento de Reserva": 4,
          },
        }
      }

      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const { data, error } = await this.supabase
        .from("email_logs")
        .select(`
          status,
          template_id,
          email_templates!inner(name)
        `)
        .eq("hotel_id", hotelId)
        .gte("created_at", startDate.toISOString())

      if (error) throw error

      const logs = data || []
      const totalSent = logs.filter((log) => log.status === "sent").length
      const totalFailed = logs.filter((log) => log.status === "failed").length
      const successRate = logs.length > 0 ? (totalSent / logs.length) * 100 : 0

      const byTemplate: Record<string, number> = {}
      logs.forEach((log) => {
        if (log.template_id && (log as any).email_templates?.name) {
          const templateName = (log as any).email_templates.name
          byTemplate[templateName] = (byTemplate[templateName] || 0) + 1
        }
      })

      return {
        totalSent,
        totalFailed,
        successRate,
        byTemplate,
      }
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error)
      return {
        totalSent: 0,
        totalFailed: 0,
        successRate: 0,
        byTemplate: {},
      }
    }
  }

  // Renderizar template com variáveis
  renderTemplate(
    template: EmailTemplate,
    variables: Record<string, string>,
  ): {
    subject: string
    htmlContent: string
    textContent: string
  } {
    let subject = template.subject
    let htmlContent = template.html_content
    let textContent = template.text_content || ""

    // Substituir variáveis no formato {{variable}}
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, "g")
      subject = subject.replace(regex, value)
      htmlContent = htmlContent.replace(regex, value)
      textContent = textContent.replace(regex, value)
    })

    return {
      subject,
      htmlContent,
      textContent,
    }
  }

  // Enviar email usando template (simulado)
  async sendTemplateEmail(
    templateId: string,
    recipientEmail: string,
    recipientName: string,
    variables: Record<string, string>,
    metadata?: Record<string, any>,
  ): Promise<void> {
    try {
      const template = await this.getTemplate(templateId)
      if (!template) throw new Error("Template não encontrado")

      // Renderizar template
      const rendered = this.renderTemplate(template, variables)

      // Simular envio de e-mail
      console.log("Email enviado (simulado):", {
        to: recipientEmail,
        subject: rendered.subject,
        html: rendered.htmlContent,
      })

      // Registrar log se as tabelas existirem
      const tablesExist = await this.checkTablesExist()
      if (tablesExist) {
        await this.supabase.from("email_logs").insert({
          hotel_id: template.hotel_id,
          template_id: templateId,
          recipient_email: recipientEmail,
          recipient_name: recipientName,
          subject: rendered.subject,
          status: "sent",
          sent_at: new Date().toISOString(),
          metadata: metadata || {},
        })
      }
    } catch (error) {
      console.error("Erro ao enviar e-mail:", error)
      throw error
    }
  }

  // Dados mock para quando as tabelas não existem
  private getMockTemplates(): EmailTemplate[] {
    return [
      {
        id: "mock-1",
        hotel_id: this.defaultHotelId,
        name: "Confirmação de Reserva",
        subject: "Confirmação da sua reserva - {{hotel_name}}",
        template_key: "booking_confirmation",
        html_content: `
          <h1>{{hotel_name}}</h1>
          <p>Olá {{guest_name}},</p>
          <p>Sua reserva foi confirmada!</p>
          <p><strong>Reserva:</strong> {{booking_number}}</p>
          <p><strong>Check-in:</strong> {{checkin_date}}</p>
          <p><strong>Check-out:</strong> {{checkout_date}}</p>
        `,
        text_content: "Olá {{guest_name}}, sua reserva foi confirmada!",
        variables: [
          { key: "hotel_name", name: "Nome do Hotel", required: true },
          { key: "guest_name", name: "Nome do Hóspede", required: true },
          { key: "booking_number", name: "Número da Reserva", required: true },
        ],
        is_active: true,
        is_system: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "mock-2",
        hotel_id: this.defaultHotelId,
        name: "Lembrete de Check-in",
        subject: "Lembrete: Seu check-in é amanhã - {{hotel_name}}",
        template_key: "checkin_reminder",
        html_content: `
          <h1>{{hotel_name}}</h1>
          <p>Olá {{guest_name}},</p>
          <p>Lembramos que seu check-in é amanhã!</p>
          <p><strong>Reserva:</strong> {{booking_number}}</p>
        `,
        text_content: "Olá {{guest_name}}, seu check-in é amanhã!",
        variables: [
          { key: "hotel_name", name: "Nome do Hotel", required: true },
          { key: "guest_name", name: "Nome do Hóspede", required: true },
        ],
        is_active: true,
        is_system: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]
  }

  private getMockLogs(): EmailLog[] {
    return [
      {
        id: "log-1",
        hotel_id: this.defaultHotelId,
        template_id: "mock-1",
        recipient_email: "joao@email.com",
        recipient_name: "João Silva",
        subject: "Confirmação da sua reserva - Hotel Exemplo",
        status: "sent",
        sent_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        delivered_at: null,
        opened_at: null,
        clicked_at: null,
        error_message: null,
        metadata: {},
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "log-2",
        hotel_id: this.defaultHotelId,
        template_id: "mock-2",
        recipient_email: "maria@email.com",
        recipient_name: "Maria Santos",
        subject: "Lembrete: Seu check-in é amanhã - Hotel Exemplo",
        status: "failed",
        sent_at: null,
        delivered_at: null,
        opened_at: null,
        clicked_at: null,
        error_message: "Endereço de e-mail inválido",
        metadata: {},
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
    ]
  }
}

export const emailTemplateService = new EmailTemplateService()
