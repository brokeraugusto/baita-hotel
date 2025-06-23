"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TestTube, Shield, Database, User } from "lucide-react"
import Link from "next/link"

export function TestNavigation() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <TestTube className="h-4 w-4" />
            Login Tests
          </CardTitle>
          <CardDescription className="text-xs">Test authentication functionality</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/test-login">
            <Button variant="outline" size="sm" className="w-full">
              Run Login Tests
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Shield className="h-4 w-4" />
            System Health
          </CardTitle>
          <CardDescription className="text-xs">Check system status</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/system-health">
            <Button variant="outline" size="sm" className="w-full">
              System Health
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Database className="h-4 w-4" />
            Connection Test
          </CardTitle>
          <CardDescription className="text-xs">Test database connection</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/test-connection">
            <Button variant="outline" size="sm" className="w-full">
              Test Connection
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4" />
            Login Page
          </CardTitle>
          <CardDescription className="text-xs">Manual login testing</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/login">
            <Button variant="outline" size="sm" className="w-full">
              Go to Login
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
