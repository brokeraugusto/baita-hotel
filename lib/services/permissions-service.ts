import {
  type PlanType,
  type UserRole,
  type ModuleName,
  PLAN_PERMISSIONS,
  ROLE_PERMISSIONS,
} from "@/lib/types/permissions"

export class PermissionsService {
  /**
   * Verifica se um plano tem acesso a um módulo específico
   */
  static hasModuleAccess(plan: PlanType, module: ModuleName): boolean {
    return PLAN_PERMISSIONS[plan].modules.includes(module)
  }

  /**
   * Verifica se um usuário tem permissão para uma ação específica em um módulo
   */
  static hasPermission(userRole: UserRole, module: ModuleName, action: "read" | "write" | "delete" | "admin"): boolean {
    const rolePermissions = ROLE_PERMISSIONS[userRole]
    const modulePermissions = rolePermissions.modules[module]

    if (!modulePermissions) return false

    return modulePermissions[action] || false
  }

  /**
   * Verifica se um usuário pode acessar um módulo (considerando plano + role)
   */
  static canAccessModule(userPlan: PlanType, userRole: UserRole, module: ModuleName): boolean {
    // Primeiro verifica se o plano permite o módulo
    const planAllows = this.hasModuleAccess(userPlan, module)
    if (!planAllows) return false

    // Depois verifica se o role tem pelo menos permissão de leitura
    return this.hasPermission(userRole, module, "read")
  }

  /**
   * Retorna todos os módulos que um usuário pode acessar
   */
  static getAccessibleModules(userPlan: PlanType, userRole: UserRole): ModuleName[] {
    const planModules = PLAN_PERMISSIONS[userPlan].modules
    const rolePermissions = ROLE_PERMISSIONS[userRole]

    return planModules.filter((module) => rolePermissions.modules[module]?.read === true)
  }

  /**
   * Verifica limites do plano
   */
  static checkPlanLimits(plan: PlanType) {
    return PLAN_PERMISSIONS[plan].limits
  }

  /**
   * Verifica features disponíveis no plano
   */
  static getPlanFeatures(plan: PlanType) {
    return PLAN_PERMISSIONS[plan].features
  }

  /**
   * Middleware para verificar permissões em componentes
   */
  static createPermissionGuard(
    requiredModule: ModuleName,
    requiredAction: "read" | "write" | "delete" | "admin" = "read",
  ) {
    return (userPlan: PlanType, userRole: UserRole) => {
      return (
        this.canAccessModule(userPlan, userRole, requiredModule) &&
        this.hasPermission(userRole, requiredModule, requiredAction)
      )
    }
  }
}
