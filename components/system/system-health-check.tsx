"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, XCircle, AlertTriangle, RefreshCw } from "lucide-react"
import { createClient } from "@/lib/supabase/client-production"

interface HealthCheck {
  name: string
  status: "pass" | "fail" | "warning" | "checking"
  message: string
  details?: string
}

export function SystemHealthCheck() {
  const [checks, setChecks] = useState<HealthCheck[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [lastCheck, setLastCheck] = useState<Date | null>(null)

  const runHealthChecks = async () => {
    setIsRunning(true)
    const supabase = createClient()
    const newChecks: HealthCheck[] = []

    // 1. Database Connection Test
    try {
      const { data, error } = await supabase.from("profiles").select("id").limit(1)
      newChecks.push({
        name: "Database Connection",
        status: error ? "fail" : "pass",
        message: error ? "Database connection failed" : "Database connection successful",
        details: error?.message,
      })
    } catch (err) {
      newChecks.push({
        name: "Database Connection",
        status: "fail",
        message: "Database connection error",
        details: err instanceof Error ? err.message : "Unknown error",
      })
    }

    // 2. Authentication System Test
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()
      newChecks.push({
        name: "Authentication System",
        status: error ? "fail" : "pass",
        message: error ? "Auth system error" : "Auth system operational",
        details: error?.message,
      })
    } catch (err) {
      newChecks.push({
        name: "Authentication System",
        status: "fail",
        message: "Auth system unavailable",
        details: err instanceof Error ? err.message : "Unknown error",
      })
    }

    // 3. Test Users Existence
    try {
      const { data: adminUser, error: adminError } = await supabase
        .from("profiles")
        .select("id, email, role")
        .eq("email", "admin@baitahotel.com")
        .single()

      const { data: clientUser, error: clientError } = await supabase
        .from("profiles")
        .select("id, email, role")
        .eq("email", "hotel@exemplo.com")
        .single()

      if (adminError || clientError) {
        newChecks.push({
          name: "Test Users",
          status: "warning",
          message: "Some test users missing",
          details: `Admin: ${adminError ? "Missing" : "OK"}, Client: ${clientError ? "Missing" : "OK"}`,
        })
      } else {
        newChecks.push({
          name: "Test Users",
          status: "pass",
          message: "Test users available",
          details: `Admin: ${adminUser.role}, Client: ${clientUser.role}`,
        })
      }
    } catch (err) {
      newChecks.push({
        name: "Test Users",
        status: "fail",
        message: "Cannot verify test users",
        details: err instanceof Error ? err.message : "Unknown error",
      })
    }

    // 4. RLS Policies Test
    try {
      const { data, error } = await supabase.rpc("get_current_user_profile")
      newChecks.push({
        name: "RLS Policies",
        status: error ? "warning" : "pass",
        message: error ? "RLS policies may have issues" : "RLS policies working",
        details: error?.message,
      })
    } catch (err) {
      newChecks.push({
        name: "RLS Policies",
        status: "warning",
        message: "Cannot test RLS policies",
        details: err instanceof Error ? err.message : "Unknown error",
      })
    }

    // 5. Environment Variables Test
    const envVars = {
      SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    }

    const missingVars = Object.entries(envVars).filter(([_, value]) => !value)

    newChecks.push({
      name: "Environment Variables",
      status: missingVars.length > 0 ? "fail" : "pass",
      message:
        missingVars.length > 0
          ? `Missing ${missingVars.length} environment variables`
          : "All environment variables set",
      details: missingVars.length > 0 ? `Missing: ${missingVars.map(([key]) => key).join(", ")}` : undefined,
    })

    setChecks(newChecks)
    setLastCheck(new Date())
    setIsRunning(false)
  }

  useEffect(() => {
    runHealthChecks()
  }, [])

  const getStatusIcon = (status: HealthCheck["status"]) => {
    switch (status) {
      case "pass":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "fail":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "checking":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
    }
  }

  const getStatusBadge = (status: HealthCheck["status"]) => {
    const variants = {
      pass: "default" as const,
      fail: "destructive" as const,
      warning: "secondary" as const,
      checking: "outline" as const,
    }

    const labels = {
      pass: "PASS",
      fail: "FAIL",
      warning: "WARN",
      checking: "...",
    }

    return <Badge variant={variants[status]}>{labels[status]}</Badge>
  }

  const overallStatus = checks.length > 0 ? (checks.some((c) => c.status === "fail") ? "fail" : "pass") : "checking"

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              System Health Check
              {getStatusIcon(overallStatus)}
            </CardTitle>
            <CardDescription>
              {lastCheck ? `Last checked: ${lastCheck.toLocaleString()}` : "Running initial check..."}
            </CardDescription>
          </div>
          <Button onClick={runHealthChecks} disabled={isRunning} variant="outline" size="sm">
            {isRunning ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            {isRunning ? "Checking..." : "Refresh"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {checks.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Running health checks...
          </div>
        ) : (
          <>
            {checks.map((check, index) => (
              <div key={index} className="flex items-start justify-between p-4 border rounded-lg">
                <div className="flex items-start gap-3">
                  {getStatusIcon(check.status)}
                  <div>
                    <div className="font-medium">{check.name}</div>
                    <div className="text-sm text-muted-foreground">{check.message}</div>
                    {check.details && <div className="text-xs text-muted-foreground mt-1">{check.details}</div>}
                  </div>
                </div>
                {getStatusBadge(check.status)}
              </div>
            ))}

            {overallStatus === "fail" && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  System has critical issues that need to be resolved before production use.
                </AlertDescription>
              </Alert>
            )}

            {overallStatus === "pass" && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>All system checks passed. System is ready for use.</AlertDescription>
              </Alert>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
