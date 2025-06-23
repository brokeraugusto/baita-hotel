"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Upload, Save, Palette, ImageIcon, Eye, Download } from "lucide-react"

interface BrandingSettings {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  logoUrl: string
  faviconUrl: string
  customCss: string
  fontFamily: string
  theme: string
}

export function HotelBrandingSettings() {
  const [settings, setSettings] = useState<BrandingSettings>({
    primaryColor: "#3b82f6",
    secondaryColor: "#64748b",
    accentColor: "#f59e0b",
    logoUrl: "",
    faviconUrl: "",
    customCss: "",
    fontFamily: "Inter",
    theme: "light",
  })

  const [isLoading, setIsLoading] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const faviconInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleSave = async () => {
    setIsLoading(true)

    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Configurações salvas",
        description: "As configurações visuais foram atualizadas com sucesso.",
      })
    }, 1000)
  }

  const handleFileUpload = (type: "logo" | "favicon", file: File) => {
    // Simular upload de arquivo
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      if (type === "logo") {
        setSettings((prev) => ({ ...prev, logoUrl: result }))
      } else {
        setSettings((prev) => ({ ...prev, faviconUrl: result }))
      }

      toast({
        title: "Upload realizado",
        description: `${type === "logo" ? "Logo" : "Favicon"} carregado com sucesso.`,
      })
    }
    reader.readAsDataURL(file)
  }

  const handleInputChange = (field: keyof BrandingSettings, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      {/* Cores do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Cores do Sistema
          </CardTitle>
          <CardDescription>Personalize as cores principais da interface</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Cor Primária</Label>
              <div className="flex gap-2">
                <Input
                  id="primaryColor"
                  type="color"
                  value={settings.primaryColor}
                  onChange={(e) => handleInputChange("primaryColor", e.target.value)}
                  className="w-16 h-10 p-1 border rounded"
                />
                <Input
                  value={settings.primaryColor}
                  onChange={(e) => handleInputChange("primaryColor", e.target.value)}
                  placeholder="#3b82f6"
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="secondaryColor">Cor Secundária</Label>
              <div className="flex gap-2">
                <Input
                  id="secondaryColor"
                  type="color"
                  value={settings.secondaryColor}
                  onChange={(e) => handleInputChange("secondaryColor", e.target.value)}
                  className="w-16 h-10 p-1 border rounded"
                />
                <Input
                  value={settings.secondaryColor}
                  onChange={(e) => handleInputChange("secondaryColor", e.target.value)}
                  placeholder="#64748b"
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="accentColor">Cor de Destaque</Label>
              <div className="flex gap-2">
                <Input
                  id="accentColor"
                  type="color"
                  value={settings.accentColor}
                  onChange={(e) => handleInputChange("accentColor", e.target.value)}
                  className="w-16 h-10 p-1 border rounded"
                />
                <Input
                  value={settings.accentColor}
                  onChange={(e) => handleInputChange("accentColor", e.target.value)}
                  placeholder="#f59e0b"
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fontFamily">Fonte</Label>
              <Select value={settings.fontFamily} onValueChange={(value) => handleInputChange("fontFamily", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Inter">Inter</SelectItem>
                  <SelectItem value="Roboto">Roboto</SelectItem>
                  <SelectItem value="Open Sans">Open Sans</SelectItem>
                  <SelectItem value="Lato">Lato</SelectItem>
                  <SelectItem value="Montserrat">Montserrat</SelectItem>
                  <SelectItem value="Poppins">Poppins</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="theme">Tema</Label>
              <Select value={settings.theme} onValueChange={(value) => handleInputChange("theme", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Claro</SelectItem>
                  <SelectItem value="dark">Escuro</SelectItem>
                  <SelectItem value="auto">Automático</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logo e Favicon */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Logo e Ícones
          </CardTitle>
          <CardDescription>Faça upload do logo e favicon do seu hotel</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Logo */}
          <div className="space-y-4">
            <div>
              <Label>Logo do Hotel</Label>
              <p className="text-sm text-muted-foreground">Recomendado: 200x60px, formato PNG ou SVG</p>
            </div>

            <div className="flex items-center gap-4">
              {settings.logoUrl && (
                <div className="w-32 h-16 border rounded-lg flex items-center justify-center bg-gray-50">
                  <img
                    src={settings.logoUrl || "/placeholder.svg"}
                    alt="Logo preview"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => logoInputRef.current?.click()}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Logo
                </Button>

                {settings.logoUrl && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      const link = document.createElement("a")
                      link.href = settings.logoUrl
                      link.download = "logo.png"
                      link.click()
                    }}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                )}
              </div>
            </div>

            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFileUpload("logo", file)
              }}
            />
          </div>

          {/* Favicon */}
          <div className="space-y-4">
            <div>
              <Label>Favicon</Label>
              <p className="text-sm text-muted-foreground">Recomendado: 32x32px, formato ICO ou PNG</p>
            </div>

            <div className="flex items-center gap-4">
              {settings.faviconUrl && (
                <div className="w-8 h-8 border rounded flex items-center justify-center bg-gray-50">
                  <img
                    src={settings.faviconUrl || "/placeholder.svg"}
                    alt="Favicon preview"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => faviconInputRef.current?.click()}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Favicon
                </Button>

                {settings.faviconUrl && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      const link = document.createElement("a")
                      link.href = settings.faviconUrl
                      link.download = "favicon.ico"
                      link.click()
                    }}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                )}
              </div>
            </div>

            <input
              ref={faviconInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFileUpload("favicon", file)
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* CSS Customizado */}
      <Card>
        <CardHeader>
          <CardTitle>CSS Customizado</CardTitle>
          <CardDescription>Adicione estilos CSS personalizados para maior controle visual</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customCss">CSS Personalizado</Label>
            <Textarea
              id="customCss"
              value={settings.customCss}
              onChange={(e) => handleInputChange("customCss", e.target.value)}
              placeholder="/* Adicione seu CSS personalizado aqui */
.custom-header {
  background: linear-gradient(45deg, #3b82f6, #1d4ed8);
}

.custom-button {
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}"
              rows={8}
              className="font-mono text-sm"
            />
          </div>

          <div className="flex gap-2">
            <Button variant="outline">
              <Eye className="mr-2 h-4 w-4" />
              Visualizar
            </Button>
            <Button variant="outline">Resetar CSS</Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Preview das Configurações</CardTitle>
          <CardDescription>Visualize como ficará a aparência do sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="flex items-center gap-4 mb-4">
              {settings.logoUrl && (
                <img src={settings.logoUrl || "/placeholder.svg"} alt="Logo" className="h-8 object-contain" />
              )}
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded border" style={{ backgroundColor: settings.primaryColor }}></div>
                <div className="w-6 h-6 rounded border" style={{ backgroundColor: settings.secondaryColor }}></div>
                <div className="w-6 h-6 rounded border" style={{ backgroundColor: settings.accentColor }}></div>
              </div>
            </div>

            <div className="space-y-2">
              <div
                className="px-4 py-2 rounded text-white font-medium"
                style={{ backgroundColor: settings.primaryColor, fontFamily: settings.fontFamily }}
              >
                Botão Primário
              </div>
              <div
                className="px-4 py-2 rounded border"
                style={{
                  borderColor: settings.secondaryColor,
                  color: settings.secondaryColor,
                  fontFamily: settings.fontFamily,
                }}
              >
                Botão Secundário
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botão de Salvar */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isLoading}>
          <Save className="mr-2 h-4 w-4" />
          {isLoading ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </div>
    </div>
  )
}
