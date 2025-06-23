"use client"

import { useState, useCallback } from "react"
import { z } from "zod"

interface UseFormValidationProps<T> {
  schema: z.ZodSchema<T>
  initialData?: Partial<T>
  onSubmit?: (data: T) => void | Promise<void>
}

export function useFormValidation<T>({ schema, initialData = {}, onSubmit }: UseFormValidationProps<T>) {
  const [data, setData] = useState<Partial<T>>(initialData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  const updateField = useCallback(
    (field: keyof T, value: any) => {
      setData((prev) => ({ ...prev, [field]: value }))
      setIsDirty(true)

      // Clear error for this field when user starts typing
      if (errors[field as string]) {
        setErrors((prev) => ({ ...prev, [field as string]: "" }))
      }
    },
    [errors],
  )

  const validateField = useCallback(
    (field: keyof T, value: any) => {
      try {
        const fieldSchema = schema.shape[field as string]
        if (fieldSchema) {
          fieldSchema.parse(value)
          setErrors((prev) => ({ ...prev, [field as string]: "" }))
          return true
        }
      } catch (error) {
        if (error instanceof z.ZodError) {
          setErrors((prev) => ({ ...prev, [field as string]: error.errors[0]?.message || "Valor inválido" }))
          return false
        }
      }
      return true
    },
    [schema],
  )

  const validateAll = useCallback(() => {
    try {
      schema.parse(data)
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        error.errors.forEach((err) => {
          if (err.path.length > 0) {
            newErrors[err.path[0] as string] = err.message
          }
        })
        setErrors(newErrors)
        return false
      }
    }
    return false
  }, [data, schema])

  const handleSubmit = useCallback(async () => {
    if (!validateAll()) {
      return false
    }

    if (onSubmit) {
      setIsSubmitting(true)
      try {
        await onSubmit(data as T)
        setIsDirty(false)
        return true
      } catch (error) {
        console.error("Submit error:", error)
        return false
      } finally {
        setIsSubmitting(false)
      }
    }
    return true
  }, [data, validateAll, onSubmit])

  const reset = useCallback(
    (newData?: Partial<T>) => {
      setData(newData || initialData)
      setErrors({})
      setIsDirty(false)
      setIsSubmitting(false)
    },
    [initialData],
  )

  return {
    data,
    errors,
    isSubmitting,
    isDirty,
    updateField,
    validateField,
    validateAll,
    handleSubmit,
    reset,
    hasErrors: Object.keys(errors).length > 0,
  }
}
