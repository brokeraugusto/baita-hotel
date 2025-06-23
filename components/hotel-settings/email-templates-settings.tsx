"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { emailTemplateService } from "@/lib/services/email-template-service"
import {
  Plus,
  Edit,
  Copy,
  Trash2,
  Eye,
  Send,
  FileText,
  BarChart3,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react"

interface EmailTemplate {
  id: string
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
  recipient_email: string
  recipient_name: string | null
  subject: string
  status: string
  sent_at: string | null
  created_at: string
  error_message: string | null
}

export function EmailTemplatesSettings() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([])
  const [emailStats, setEmailStats] = useState<any>(null)
  const [previewData, setPreviewData] = useState<Record<string, string>>({})
  const [testEmail, setTestEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Dados do formulário
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    template_key: "",
    html_content: "",
    text_content: "",
    is_active: true,
  })

  useEffect(() => {
    loadTemplates()
    loadEmailLogs()
    loadEmailStats()
  }, [])

  const loadTemplates = async () => {
    try {
      // Simulando hotel_id - em produção viria do contexto/auth
      const hotelId = "hotel-uuid"
      const data = await emailTemplateService.getTemplates(hotelId)
      setTemplates(data)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar templates de e-mail",
        variant: "destructive",
      })
    }
  }

  const loadEmailLogs = async () => {
    try {
      const hotelId = "hotel-uuid"
      const data = await emailTemplateService.getEmailLogs(hotelId)
      setEmailLogs(data)
    } catch (error) {
      console.error("Erro ao carregar logs:", error)
    }
  }

  const loadEmailStats = async () => {
    try {
      const hotelId = "hotel-uuid"
      const data = await emailTemplateService.getEmailStats(hotelId)
      setEmailStats(data)
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error)
    }
  }

  const handleSaveTemplate = async () => {
    setIsLoading(true)
    try {
      const hotelId = "hotel-uuid"

      if (isCreating) {
        await emailTemplateService.createTemplate({
          ...formData,
          hotel_id: hotelId,
          variables: [],
        })
        toast({
          title: "Sucesso",
          description: "Template criado com sucesso",
        })
      } else if (selectedTemplate) {
        await emailTemplateService.updateTemplate(selectedTemplate.id, formData)
        toast({
          title: "Sucesso",
          description: "Template atualizado com sucesso",
        })
      }

      setIsEditing(false)
      setIsCreating(false)
      setSelectedTemplate(null)
      loadTemplates()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar template",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteTemplate = async (template: EmailTemplate) => {
    if (template.is_system) {
      toast({
        title: "Erro",
        description: "Templates do sistema não podem ser deletados",
        variant: "destructive",
      })
      return
    }

    try {
      await emailTemplateService.deleteTemplate(template.id)
      toast({
        title: "Sucesso",
        description: "Template deletado com sucesso",
      })
      loadTemplates()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao deletar template",
        variant: "destructive",
      })
    }
  }

  const handleDuplicateTemplate = async (template: EmailTemplate) => {
    try {
      await emailTemplateService.duplicateTemplate(template.id, `${template.name} (Cópia)`)
      toast({
        title: "Sucesso",
        description: "Template duplicado com sucesso",
      })
      loadTemplates()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao duplicar template",
        variant: "destructive",
      })
    }
  }

  const handleSendTestEmail = async () => {
    if (!selectedTemplate || !testEmail) return

    setIsLoading(true)
    try {
      // Dados de exemplo para teste
      const testVariables = {
        hotel_name: "Hotel Exemplo",
        guest_name: "João Silva",
        booking_number: "RES-12345",
        checkin_date: "15/01/2024",
        checkout_date: "18/01/2024",
        room_type: "Quarto Standard",
        guests_count: "2",
        total_amount: "R$ 450,00",
        hotel_address: "Rua Exemplo, 123",
        hotel_phone: "(11) 99999-9999",
        hotel_email: "contato@hotelexemplo.com",
      }

      await emailTemplateService.sendTemplateEmail(selectedTemplate.id, testEmail, "Teste", testVariables)

      toast({
        title: "Sucesso",
        description: "Email de teste enviado com sucesso",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao enviar email de teste",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const startEditing = (template: EmailTemplate) => {
    setSelectedTemplate(template)
    setFormData({
      name: template.name,
      subject: template.subject,
      template_key: template.template_key,
      html_content: template.html_content,
      text_content: template.text_content || "",
      is_active: template.is_active,
    })
    setIsEditing(true)
  }

  const startCreating = () => {
    setFormData({
      name: "",
      subject: "",
      template_key: "",
      html_content: "",
      text_content: "",
      is_active: true,
    })
    setIsCreating(true)
    setIsEditing(true)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "bg-green-100 text-green-800"
      case "failed":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Templates de E-mail</h2>
          <p className="text-muted-foreground">
            Personalize os templates de e-mail enviados automaticamente pelo sistema
          </p>
        </div>
        <Button onClick={startCreating}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Template
        </Button>
      </div>

      <Tabs defaultValue="templates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="logs">Histórico</TabsTrigger>
          <TabsTrigger value="stats">Estatísticas</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      {template.is_system && <Badge variant="secondary">Sistema</Badge>}
                      {!template.is_active && <Badge variant="outline">Inativo</Badge>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Preview: {template.name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>Assunto</Label>
                              <p className="text-sm bg-muted p-2 rounded">{template.subject}</p>
                            </div>
                            <div>
                              <Label>Conteúdo HTML</Label>
                              <div
                                className="border rounded p-4 bg-white"
                                dangerouslySetInnerHTML={{ __html: template.html_content }}
                              />
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button variant="outline" size="sm" onClick={() => startEditing(template)}>
                        <Edit className="h-4 w-4" />
                      </Button>

                      <Button variant="outline" size="sm" onClick={() => handleDuplicateTemplate(template)}>
                        <Copy className="h-4 w-4" />
                      </Button>

                      {!template.is_system && (
                        <Button variant="outline" size="sm" onClick={() => handleDeleteTemplate(template)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <CardDescription>{template.subject}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Chave: {template.template_key}</span>
                    <span>Variáveis: {template.variables?.length || 0}</span>
                    <span>Atualizado: {new Date(template.updated_at).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Envios</CardTitle>
              <CardDescription>Últimos e-mails enviados pelo sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {emailLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-4 border rounded">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(log.status)}
                      <div>
                        <p className="font-medium">{log.subject}</p>
                        <p className="text-sm text-muted-foreground">
                          Para: {log.recipient_name || log.recipient_email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(log.status)}>{log.status}</Badge>
                      <span className="text-sm text-muted-foreground">{new Date(log.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          {emailStats && (
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">E-mails Enviados</CardTitle>
                  <Send className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{emailStats.totalSent}</div>
                  <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{emailStats.successRate.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">{emailStats.totalFailed} falhas</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Templates Mais Usados</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(emailStats.byTemplate)
                      .sort(([, a], [, b]) => (b as number) - (a as number))
                      .slice(0, 3)
                      .map(([template, count]) => (
                        <div key={template} className="flex justify-between text-sm">
                          <span className="truncate">{template}</span>
                          <span className="font-medium">{count as number}</span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog de Edição/Criação */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isCreating ? "Novo Template" : "Editar Template"}</DialogTitle>
            <DialogDescription>
              {isCreating ? "Crie um novo template de e-mail personalizado" : "Edite o template de e-mail selecionado"}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basic" className="space-y-4">
            <TabsList>
              <TabsTrigger value="basic">Básico</TabsTrigger>
              <TabsTrigger value="html">HTML</TabsTrigger>
              <TabsTrigger value="text">Texto</TabsTrigger>
              <TabsTrigger value="test">Teste</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Template</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Confirmação de Reserva"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="template_key">Chave do Template</Label>
                  <Input
                    id="template_key"
                    value={formData.template_key}
                    onChange={(e) => setFormData({ ...formData, template_key: e.target.value })}
                    placeholder="Ex: booking_confirmation"
                    disabled={!isCreating}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Assunto do E-mail</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Ex: Confirmação da sua reserva - {{hotel_name}}"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Template ativo</Label>
              </div>
            </TabsContent>

            <TabsContent value="html" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="html_content">Conteúdo HTML</Label>
                <Textarea
                  id="html_content"
                  value={formData.html_content}
                  onChange={(e) => setFormData({ ...formData, html_content: e.target.value })}
                  placeholder="Digite o HTML do template..."
                  rows={20}
                  className="font-mono text-sm"
                />
              </div>
              <div className="text-xs text-muted-foreground">
                Use variáveis no formato {`{{variavel}}`} para personalizar o conteúdo
              </div>
            </TabsContent>

            <TabsContent value="text" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="text_content">Conteúdo em Texto</Label>
                <Textarea
                  id="text_content"
                  value={formData.text_content}
                  onChange={(e) => setFormData({ ...formData, text_content: e.target.value })}
                  placeholder="Versão em texto simples do e-mail..."
                  rows={15}
                />
              </div>
              <div className="text-xs text-muted-foreground">
                Versão alternativa em texto simples para clientes que não suportam HTML
              </div>
            </TabsContent>

            <TabsContent value="test" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="test_email">E-mail para Teste</Label>
                  <Input
                    id="test_email"
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="seu@email.com"
                  />
                </div>
                <Button onClick={handleSendTestEmail} disabled={!testEmail || isLoading}>
                  <Send className="mr-2 h-4 w-4" />
                  {isLoading ? "Enviando..." : "Enviar Teste"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button onClick={handleSaveTemplate} disabled={isLoading}>
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
