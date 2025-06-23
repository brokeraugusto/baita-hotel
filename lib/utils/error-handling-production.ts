// Sistema de tratamento de erros para produção
import { PRODUCTION_CONFIG } from "@/lib/constants/production"

export interface AppError {
  code: string
  message: string
  details?: any
  timestamp: string
  userId?: string
  hotelId?: string
}

export class ErrorHandler {
  static log(error: AppError) {
    // Em produção, enviar para serviço de monitoramento
    if (PRODUCTION_CONFIG.MONITORING.SENTRY_DSN) {
      // Integração com Sentry seria aqui
      console.error("Production Error:", error)
    }

    // Log local para desenvolvimento
    console.error("Error:", error)
  }

  static createError(code: string, message: string, details?: any, userId?: string, hotelId?: string): AppError {
    return {
      code,
      message,
      details,
      timestamp: new Date().toISOString(),
      userId,
      hotelId,
    }
  }

  static handleDatabaseError(error: any, context: string): AppError {
    const appError = this.createError("DATABASE_ERROR", "Erro interno do sistema", {
      originalError: error.message,
      context,
    })

    this.log(appError)
    return appError
  }

  static handleAuthError(error: any): AppError {
    const appError = this.createError("AUTH_ERROR", "Erro de autenticação", { originalError: error.message })

    this.log(appError)
    return appError
  }

  static handleValidationError(field: string, message: string): AppError {
    const appError = this.createError("VALIDATION_ERROR", `Erro de validação: ${message}`, { field })

    this.log(appError)
    return appError
  }
}
