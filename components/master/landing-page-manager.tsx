"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LandingPageEditor } from "@/components/master/landing-page-editor"
import { LandingPagePreview } from "@/components/master/landing-page-preview"
import { Button } from "@/components/ui/button"
import { Eye, Code } from "lucide-react"

export function LandingPageManager() {
  const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor")

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => setActiveTab(activeTab === "editor" ? "preview" : "editor")}>
          {activeTab === "editor" ? (
            <>
              <Eye className="mr-2 h-4 w-4" />
              Ver Preview
            </>
          ) : (
            <>
              <Code className="mr-2 h-4 w-4" />
              Voltar ao Editor
            </>
          )}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "editor" | "preview")}>
        <TabsList className="hidden">
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="border-none p-0">
          <LandingPageEditor onPreview={() => setActiveTab("preview")} />
        </TabsContent>

        <TabsContent value="preview" className="border-none p-0">
          <LandingPagePreview onEdit={() => setActiveTab("editor")} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
