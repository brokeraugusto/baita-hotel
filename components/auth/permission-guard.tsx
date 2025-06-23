"use client"

import type React from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { PermissionsService } from "@/lib/services/permissions-service"
import type { ModuleName, UserRole, PlanType } from "@/lib/types/permissions"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lock } from "lucide-react"

interface PermissionGuardProps {
  children: React.ReactNode
  module: ModuleName
  action?: "read" | "write" | "delete" | "admin"
  fallback?: React.ReactNode
  showUpgradeMessage?: boolean
}

export function PermissionGuard({
  children,
  module,
  action = "read",
  fallback,
  showUpgradeMessage = true,
}: PermissionGuardProps) {
  const { user } = useAuth()

  // Para desenvolvimento, assumir permissões básicas se não houver usuário
  const userRole: UserRole = user?.type === "master_admin" ? "master_admin" : "hotel_admin"
  const userPlan: PlanType = "advanced" // Para desenvolvimento

  const hasAccess = PermissionsService.canAccessModule(userPlan, userRole, module)
  const hasPermission = PermissionsService.hasPermission(userRole, module, action)

  if (!hasAccess) {
    if (fallback) return <>{fallback}</>

    if (showUpgradeMessage) {
      return (
        <Alert className="border-orange-200 bg-orange-50">
          <Lock className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            Este módulo não está disponível no seu plano atual.
            <button className="ml-2 underline font-medium">Fazer upgrade</button>
          </AlertDescription>
        </Alert>
      )
    }

    return null
  }

  if (!hasPermission) {
    if (fallback) return <>{fallback}</>

    return (
      <Alert className="border-red-200 bg-red-50">
        <Lock className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          Você não tem permissão para{" "}
          {action === "read"
            ? "visualizar"
            : action === "write"
              ? "editar"
              : action === "delete"
                ? "excluir"
                : "administrar"}{" "}
          este módulo.
        </AlertDescription>
      </Alert>
    )
  }

  return <>{children}</>
}

// Hook para usar permissões em componentes
export function usePermissions() {
  const { user } = useAuth()

  const userRole: UserRole = user?.type === "master_admin" ? "master_admin" : "hotel_admin"
  const userPlan: PlanType = "advanced" // Para desenvolvimento

  return {
    hasModuleAccess: (module: ModuleName) => PermissionsService.canAccessModule(userPlan, userRole, module),

    hasPermission: (module: ModuleName, action: "read" | "write" | "delete" | "admin") =>
      PermissionsService.hasPermission(userRole, module, action),

    getAccessibleModules: () => PermissionsService.getAccessibleModules(userPlan, userRole),

    checkPlanLimits: () => PermissionsService.checkPlanLimits(userPlan),

    getPlanFeatures: () => PermissionsService.getPlanFeatures(userPlan),

    userRole,
    userPlan,
  }
}
