import { HotelFinancialOverview } from "@/components/hotel/financial-overview"
import { ReservationsRevenue } from "@/components/hotel/reservations-revenue"
import { ExpensesTable } from "@/components/hotel/expenses-table"

export default function ClientFinancialPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Financeiro</h1>
            <p className="text-gray-600">Gestão financeira do seu hotel</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">🏨 Cliente</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        <HotelFinancialOverview />
        <div className="grid gap-6 md:grid-cols-2">
          <ReservationsRevenue />
          <ExpensesTable />
        </div>
      </div>
    </div>
  )
}
