import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, FileText, Video, MessageCircle } from "lucide-react"

const knowledgeItems = [
  {
    title: "Guia de Configuração Inicial",
    type: "Documentação",
    icon: FileText,
    views: 1250,
  },
  {
    title: "Como Configurar Integrações",
    type: "Tutorial",
    icon: Video,
    views: 890,
  },
  {
    title: "Resolução de Problemas Comuns",
    type: "FAQ",
    icon: MessageCircle,
    views: 2100,
  },
  {
    title: "Manual do Usuário Completo",
    type: "Documentação",
    icon: BookOpen,
    views: 3400,
  },
]

export function KnowledgeBase() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Base de Conhecimento</CardTitle>
        <CardDescription>Recursos para resolução rápida</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {knowledgeItems.map((item, index) => (
          <div key={index} className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
            <div className="flex items-start space-x-3">
              <item.icon className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-sm">{item.title}</h4>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-muted-foreground">{item.type}</span>
                  <span className="text-xs text-muted-foreground">{item.views} visualizações</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        <Button variant="outline" className="w-full mt-4">
          <BookOpen className="mr-2 h-4 w-4" />
          Ver Toda Base de Conhecimento
        </Button>
      </CardContent>
    </Card>
  )
}
