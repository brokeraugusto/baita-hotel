import type React from "react"
import { AuthProvider } from "@/lib/auth/auth-context"
import { MasterSidebar } from "@/components/layout/master-sidebar"
import { MasterHeader } from "@/components/layout/master-header"

export default function MasterLayoutWithAuth({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <div className="flex h-screen bg-gray-100">
        <MasterSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <MasterHeader />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">{children}</main>
        </div>
      </div>
    </AuthProvider>
  )
}
