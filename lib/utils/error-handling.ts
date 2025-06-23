export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode = 500,
    public isOperational = true,
  ) {
    super(message)
    this.name = "AppError"
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string,
    public field?: string,
  ) {
    super(message, "VALIDATION_ERROR", 400)
    this.name = "ValidationError"
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} não encontrado`, "NOT_FOUND", 404)
    this.name = "NotFoundError"
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Acesso não autorizado") {
    super(message, "UNAUTHORIZED", 401)
    this.name = "UnauthorizedError"
  }
}

export function handleError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error
  }

  if (error instanceof Error) {
    return new AppError(error.message, "UNKNOWN_ERROR")
  }

  return new AppError("Erro desconhecido", "UNKNOWN_ERROR")
}

export function createErrorHandler(onError?: (error: AppError) => void) {
  return (error: unknown) => {
    const appError = handleError(error)

    // Log do erro
    console.error("Error:", {
      message: appError.message,
      code: appError.code,
      statusCode: appError.statusCode,
      stack: appError.stack,
    })

    // Callback personalizado
    if (onError) {
      onError(appError)
    }

    return appError
  }
}
