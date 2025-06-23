"use client"

import { PlansOverview } from "@/components/plans/plans-overview"
import { PlansManagement } from "@/components/plans/plans-management"
import { SubscriptionsTable } from "@/components/plans/subscriptions-table"

export default function MasterPlansPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Planos</h1>
            <p className="text-gray-600">Gerencie os planos de assinatura da plataforma</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
              👑 Master Admin
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 space-y-6">
        <PlansOverview />
        <PlansManagement showToggleStatus={true} />
        <SubscriptionsTable />
      </div>
    </div>
  )
}
