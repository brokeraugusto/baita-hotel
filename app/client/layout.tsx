"use client"

import type React from "react"
import { Inter } from "next/font/google"
import "../globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { ClientSidebar } from "@/components/layout/client-sidebar"
import { ClientHeader } from "@/components/layout/client-header"
import { Toaster } from "@/components/ui/toaster"
import { useState } from "react"

const inter = Inter({ subsets: ["latin"] })

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <div className="flex h-screen bg-background overflow-hidden">
            {/* Sidebar Desktop */}
            <div className="hidden lg:block">
              <ClientSidebar />
            </div>

            {/* Sidebar Mobile Overlay */}
            {sidebarOpen && (
              <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar Mobile */}
            <div
              className={`
              fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:hidden
              ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            `}
            >
              <ClientSidebar onClose={() => setSidebarOpen(false)} />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
              <ClientHeader onMenuClick={() => setSidebarOpen(true)} />

              {/* Content Area */}
              <main className="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-gray-900/50">
                <div className="container mx-auto p-4 lg:p-6 max-w-7xl">{children}</div>
              </main>
            </div>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
