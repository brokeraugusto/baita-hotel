"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { landingPageService, type LandingPageSetting } from "@/lib/services/landing-page-service"
import { toast } from "@/hooks/use-toast"
import { Loader2, Save, Eye } from "lucide-react"

interface LandingPageEditorProps {
  onPreview: () => void
}

export function LandingPageEditor({ onPreview }: LandingPageEditorProps) {
  const [settings, setSettings] = useState<Record<string, Record<string, LandingPageSetting>>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeSection, setActiveSection] = useState("hero")

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await landingPageService.getLandingPageSettings()
        setSettings(data)
      } catch (error) {
        console.error("Erro ao carregar configurações:", error)
        toast({
          title: "Erro ao carregar configurações",
          description: "Não foi possível carregar as configurações da landing page.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [])

  const handleInputChange = (section: string, key: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: {
          ...prev[section][key],
          value,
        },
      },
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Salvar todas as configurações alteradas
      for (const section in settings) {
        for (const key in settings[section]) {
          await landingPageService.updateLandingPageSetting(section, key, settings[section][key].value)
        }
      }

      toast({
        title: "Configurações salvas",
        description: "As alterações na landing page foram salvas com sucesso.",
      })
    } catch (error) {
      console.error("Erro ao salvar configurações:", error)
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as alterações na landing page.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const sections = Object.keys(settings)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Editor da Landing Page</CardTitle>
        <CardDescription>
          Personalize o conteúdo da sua landing page para atrair mais clientes para o BaitaHotel
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeSection} onValueChange={setActiveSection} className="w-full">
          <TabsList className="mb-4 flex flex-wrap">
            {sections.map((section) => (
              <TabsTrigger key={section} value={section} className="capitalize">
                {section === "cta" ? "Call to Action" : section}
              </TabsTrigger>
            ))}
          </TabsList>

          {sections.map((section) => (
            <TabsContent key={section} value={section} className="space-y-4">
              <div className="grid gap-6">
                {Object.keys(settings[section]).map((key) => {
                  const setting = settings[section][key]
                  return (
                    <div key={key} className="space-y-2">
                      <Label htmlFor={`${section}-${key}`} className="font-medium">
                        {setting.label || key}
                      </Label>
                      {setting.description && <p className="text-sm text-muted-foreground">{setting.description}</p>}

                      {setting.value_type === "textarea" ? (
                        <Textarea
                          id={`${section}-${key}`}
                          value={setting.value}
                          onChange={(e) => handleInputChange(section, key, e.target.value)}
                          rows={3}
                          className="w-full"
                        />
                      ) : setting.value_type === "image" ? (
                        <div className="space-y-2">
                          <Input
                            id={`${section}-${key}`}
                            value={setting.value}
                            onChange={(e) => handleInputChange(section, key, e.target.value)}
                            className="w-full"
                          />
                          {setting.value && (
                            <div className="mt-2 rounded-md border p-2">
                              <p className="mb-1 text-sm text-muted-foreground">Preview:</p>
                              <img
                                src={setting.value || "/placeholder.svg"}
                                alt="Preview"
                                className="max-h-40 rounded-md object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = "/placeholder.svg?height=100&width=200"
                                }}
                              />
                            </div>
                          )}
                        </div>
                      ) : (
                        <Input
                          id={`${section}-${key}`}
                          value={setting.value}
                          onChange={(e) => handleInputChange(section, key, e.target.value)}
                          type={setting.value_type === "number" ? "number" : "text"}
                          className="w-full"
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onPreview}>
          <Eye className="mr-2 h-4 w-4" />
          Visualizar
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Salvar Alterações
        </Button>
      </CardFooter>
    </Card>
  )
}
