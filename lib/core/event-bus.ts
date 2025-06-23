type EventCallback = (data?: any) => void

class EventBus {
  private events: { [key: string]: EventCallback[] } = {}

  subscribe(event: string, callback: EventCallback): () => void {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(callback)

    // Retorna função para unsubscribe
    return () => {
      this.events[event] = this.events[event].filter((cb) => cb !== callback)
    }
  }

  emit(event: string, data?: any): void {
    if (this.events[event]) {
      this.events[event].forEach((callback) => {
        try {
          callback(data)
        } catch (error) {
          console.error(`Error in event callback for ${event}:`, error)
        }
      })
    }
  }

  unsubscribe(event: string): void {
    delete this.events[event]
  }

  // Método para debug - listar todos os eventos ativos
  getActiveEvents(): string[] {
    return Object.keys(this.events)
  }
}

export const eventBus = new EventBus()

// Eventos do sistema de limpeza
export const CLEANING_EVENTS = {
  ROOM_STATUS_CHANGED: "room_status_changed",
  TASK_CREATED: "cleaning_task_created",
  TASK_COMPLETED: "cleaning_task_completed",
  PERSONNEL_ASSIGNED: "cleaning_personnel_assigned",
  ROOM_UNAVAILABLE_WITH_RESERVATIONS: "room_unavailable_with_reservations",
} as const

// Eventos do sistema de reservas
export const RESERVATION_EVENTS = {
  RESERVATION_CREATED: "reservation_created",
  RESERVATION_CANCELLED: "reservation_cancelled",
  CHECK_IN_COMPLETED: "check_in_completed",
  CHECK_OUT_COMPLETED: "check_out_completed",
} as const

// Eventos do sistema de manutenção
export const MAINTENANCE_EVENTS = {
  MAINTENANCE_ORDER_CREATED: "maintenance_order_created",
  MAINTENANCE_COMPLETED: "maintenance_completed",
  ROOM_NEEDS_MAINTENANCE: "room_needs_maintenance",
} as const
