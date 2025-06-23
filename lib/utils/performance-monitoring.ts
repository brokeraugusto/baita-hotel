// Sistema de monitoramento de performance
export class PerformanceMonitor {
  private static metrics: Map<string, number[]> = new Map()

  static startTimer(operation: string): () => void {
    const start = performance.now()

    return () => {
      const duration = performance.now() - start
      this.recordMetric(operation, duration)
    }
  }

  static recordMetric(operation: string, duration: number) {
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, [])
    }

    const metrics = this.metrics.get(operation)!
    metrics.push(duration)

    // Manter apenas os últimos 100 registros
    if (metrics.length > 100) {
      metrics.shift()
    }
  }

  static getAverageTime(operation: string): number {
    const metrics = this.metrics.get(operation)
    if (!metrics || metrics.length === 0) return 0

    return metrics.reduce((sum, time) => sum + time, 0) / metrics.length
  }

  static getMetrics(): Record<string, { average: number; count: number }> {
    const result: Record<string, { average: number; count: number }> = {}

    for (const [operation, times] of this.metrics.entries()) {
      result[operation] = {
        average: this.getAverageTime(operation),
        count: times.length,
      }
    }

    return result
  }
}

// Hook para monitorar performance de componentes
export function usePerformanceMonitor(componentName: string) {
  const endTimer = PerformanceMonitor.startTimer(`component_${componentName}`)

  return {
    endTimer,
    recordOperation: (operation: string, duration: number) => {
      PerformanceMonitor.recordMetric(`${componentName}_${operation}`, duration)
    },
  }
}
