"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

export default function TestMasterAPI() {
  const [apiStatus, setApiStatus] = useState<any>(null)
  const [loginResult, setLoginResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [loginLoading, setLoginLoading] = useState(false)
  const [credentials, setCredentials] = useState({
    email: "admin@baitahotel.com",
    password: "MasterAdmin2024!",
  })

  const testAPIStatus = async () => {
    setLoading(true)
    try {
      console.log("Testing API status...")
      const response = await fetch("/api/master/auth/login", {
        method: "GET",
      })

      const data = await response.json()
      console.log("API Status Response:", data)
      setApiStatus(data)
    } catch (error) {
      console.error("API Status Error:", error)
      setApiStatus({
        status: "error",
        message: "Failed to connect to API",
        details: {
          error: error instanceof Error ? error.message : "Unknown error",
          hint: "Check if the server is running",
        },
      })
    } finally {
      setLoading(false)
    }
  }

  const testLogin = async () => {
    setLoginLoading(true)
    try {
      console.log("Testing login with:", credentials)
      const response = await fetch("/api/master/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      })

      const data = await response.json()
      console.log("Login Response:", data)
      setLoginResult(data)
    } catch (error) {
      console.error("Login Error:", error)
      setLoginResult({
        success: false,
        error: "Failed to connect to API",
        details: {
          error: error instanceof Error ? error.message : "Unknown error",
          hint: "Check if the server is running",
        },
      })
    } finally {
      setLoginLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "border-green-500 bg-green-50"
      case "error":
        return "border-red-500 bg-red-50"
      default:
        return "border-gray-500 bg-gray-50"
    }
  }

  const renderSetupInstructions = (details: any) => {
    if (!details) return null

    return (
      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
        <p className="font-medium text-blue-800 mb-2">🛠️ Setup Required</p>
        {details.setupScript && (
          <div className="mb-2">
            <p className="text-sm text-blue-700 mb-1">Run this script in Supabase SQL Editor:</p>
            <code className="text-xs bg-blue-100 px-2 py-1 rounded block break-all">{details.setupScript}</code>
          </div>
        )}
        {details.instructions && (
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">Instructions:</p>
            <ol className="list-decimal list-inside space-y-1">
              {details.instructions.map((instruction: string, index: number) => (
                <li key={index}>{instruction}</li>
              ))}
            </ol>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Master Admin API Test</h1>
        <p className="text-muted-foreground">Test the Master Admin authentication system</p>
      </div>

      <div className="grid gap-6">
        {/* URGENT Setup Alert */}
        <Alert className="border-red-500 bg-red-50">
          <AlertDescription>
            <div className="space-y-3">
              <p className="font-bold text-red-800">🚨 SETUP REQUIRED</p>
              <p className="text-red-700 text-sm">The database tables don't exist yet. Follow these steps in order:</p>
              <div className="space-y-2">
                <div className="p-2 bg-red-100 rounded border border-red-300">
                  <p className="font-medium text-red-800 text-sm">Step 1: Create Tables</p>
                  <code className="text-xs text-red-700 block break-all">
                    scripts/auth-separation/01-create-tables-first.sql
                  </code>
                </div>
                <div className="p-2 bg-yellow-100 rounded border border-yellow-300">
                  <p className="font-medium text-yellow-800 text-sm">Step 2: Create Functions</p>
                  <code className="text-xs text-yellow-700 block break-all">
                    scripts/auth-separation/02-create-functions.sql
                  </code>
                </div>
                <div className="p-2 bg-green-100 rounded border border-green-300">
                  <p className="font-medium text-green-800 text-sm">Step 3: Verify Setup</p>
                  <code className="text-xs text-green-700 block break-all">
                    scripts/auth-separation/03-verify-setup.sql
                  </code>
                </div>
              </div>
              <p className="text-red-600 text-xs font-medium">
                ⚠️ Run these scripts IN ORDER in your Supabase SQL Editor
              </p>
            </div>
          </AlertDescription>
        </Alert>

        {/* API Status Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>🔍</span>
              API Status Test
            </CardTitle>
            <CardDescription>Check if the Master Admin API is working and accessible</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testAPIStatus} disabled={loading} className="w-full">
              {loading ? "Testing..." : "Test API Status"}
            </Button>

            {apiStatus && (
              <Alert className={getStatusColor(apiStatus.status)}>
                <AlertDescription>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant={apiStatus.status === "success" ? "default" : "destructive"}>
                        {apiStatus.status}
                      </Badge>
                      <span className="font-medium">{apiStatus.message}</span>
                    </div>

                    {apiStatus.data && (
                      <div className="space-y-2">
                        <div className="border-t pt-2">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Master Admins Count:</span>{" "}
                              {apiStatus.data.master_admins_count}
                            </div>
                            <div>
                              <span className="font-medium">Has Admins:</span>{" "}
                              {apiStatus.data.has_admins ? "Yes" : "No"}
                            </div>
                          </div>

                          {apiStatus.data.admins && apiStatus.data.admins.length > 0 && (
                            <div className="mt-3 space-y-2">
                              <p className="font-medium text-sm">Registered Admins:</p>
                              <div className="space-y-1">
                                {apiStatus.data.admins.map((admin: any) => (
                                  <div
                                    key={admin.id}
                                    className="flex items-center justify-between p-2 bg-white rounded border text-xs"
                                  >
                                    <div>
                                      <span className="font-medium">{admin.email}</span>
                                      <span className="text-gray-500 ml-2">({admin.full_name})</span>
                                    </div>
                                    <Badge variant={admin.is_active ? "default" : "secondary"} className="text-xs">
                                      {admin.is_active ? "Active" : "Inactive"}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {apiStatus.details && (
                      <div className="space-y-2">
                        <div className="border-t pt-2">
                          <div className="text-sm">
                            <p className="font-medium text-red-700">Error Details:</p>
                            <div className="text-red-600 bg-red-50 p-2 rounded mt-1">
                              {apiStatus.details.message || apiStatus.details.error}
                            </div>
                            {apiStatus.details.hint && (
                              <p className="text-blue-700 mt-2 text-sm">💡 {apiStatus.details.hint}</p>
                            )}
                          </div>
                          {renderSetupInstructions(apiStatus.details)}
                        </div>
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Login Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>🔐</span>
              Login Test
            </CardTitle>
            <CardDescription>Test Master Admin login functionality</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={credentials.email}
                  onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                  placeholder="admin@baitahotel.com"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  placeholder="MasterAdmin2024!"
                />
              </div>
            </div>

            <Button onClick={testLogin} disabled={loginLoading} className="w-full">
              {loginLoading ? "Testing Login..." : "Test Login"}
            </Button>

            {loginResult && (
              <Alert className={loginResult.success ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}>
                <AlertDescription>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant={loginResult.success ? "default" : "destructive"}>
                        {loginResult.success ? "Success" : "Failed"}
                      </Badge>
                      <span className="font-medium">
                        {loginResult.success ? "Login successful!" : loginResult.error}
                      </span>
                    </div>

                    {loginResult.user && (
                      <div className="space-y-2">
                        <div className="border-t pt-2">
                          <div className="text-sm">
                            <p className="font-medium text-green-700 mb-2">User Details:</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-green-50 p-3 rounded">
                              <div>
                                <span className="font-medium">ID:</span> {loginResult.user.id}
                              </div>
                              <div>
                                <span className="font-medium">Email:</span> {loginResult.user.email}
                              </div>
                              <div>
                                <span className="font-medium">Name:</span> {loginResult.user.full_name}
                              </div>
                              <div>
                                <span className="font-medium">Role:</span> {loginResult.user.role}
                              </div>
                            </div>
                            {loginResult.token && (
                              <div className="mt-2">
                                <span className="font-medium">Token:</span>
                                <code className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">
                                  {loginResult.token.substring(0, 30)}...
                                </code>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {loginResult.details && (
                      <div className="space-y-2">
                        <div className="border-t pt-2">
                          <div className="text-sm">
                            <p className="font-medium text-red-700">Error Details:</p>
                            <div className="text-red-600 bg-red-50 p-2 rounded mt-1">
                              {loginResult.details.message || loginResult.details.error}
                            </div>
                            {loginResult.details.hint && (
                              <p className="text-blue-700 mt-2 text-sm">💡 {loginResult.details.hint}</p>
                            )}
                            {loginResult.details.defaultCredentials && (
                              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                                <p className="text-yellow-800 font-medium text-xs">Default Credentials:</p>
                                <p className="text-yellow-700 text-xs">
                                  Email: {loginResult.details.defaultCredentials.email}
                                </p>
                                <p className="text-yellow-700 text-xs">
                                  Password: {loginResult.details.defaultCredentials.password}
                                </p>
                              </div>
                            )}
                          </div>
                          {renderSetupInstructions(loginResult.details)}
                        </div>
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Step-by-Step Setup Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>📋</span>
              Step-by-Step Setup Instructions
            </CardTitle>
            <CardDescription>Follow these steps in order to set up the Master Admin system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert className="border-blue-500 bg-blue-50">
                <AlertDescription>
                  <p className="font-medium text-blue-800 mb-2">🎯 How to run SQL scripts in Supabase:</p>
                  <ol className="text-blue-700 text-sm list-decimal list-inside space-y-1">
                    <li>Go to your Supabase project dashboard</li>
                    <li>Click on "SQL Editor" in the left sidebar</li>
                    <li>Click "New query" to create a new SQL query</li>
                    <li>Copy and paste the script content</li>
                    <li>Click "Run" to execute the script</li>
                    <li>Check the results in the output panel</li>
                  </ol>
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <div className="p-4 bg-red-50 rounded border border-red-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                      1
                    </span>
                    <h3 className="font-medium text-red-800">Create Tables First</h3>
                  </div>
                  <p className="text-red-700 text-sm mb-2">
                    This script creates the master_admins and hotels tables with proper structure.
                  </p>
                  <code className="text-sm text-red-700 bg-red-100 px-2 py-1 rounded block break-all">
                    scripts/auth-separation/01-create-tables-first.sql
                  </code>
                  <p className="text-red-600 text-xs mt-2">
                    ✅ Creates tables, indexes, permissions, and inserts the first admin
                  </p>
                </div>

                <div className="p-4 bg-yellow-50 rounded border border-yellow-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                      2
                    </span>
                    <h3 className="font-medium text-yellow-800">Create Functions</h3>
                  </div>
                  <p className="text-yellow-700 text-sm mb-2">
                    This script creates helper functions for authentication and user management.
                  </p>
                  <code className="text-sm text-yellow-700 bg-yellow-100 px-2 py-1 rounded block break-all">
                    scripts/auth-separation/02-create-functions.sql
                  </code>
                  <p className="text-yellow-600 text-xs mt-2">
                    ✅ Creates has_master_admin() and create_first_master_admin() functions
                  </p>
                </div>

                <div className="p-4 bg-green-50 rounded border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                      3
                    </span>
                    <h3 className="font-medium text-green-800">Verify Setup</h3>
                  </div>
                  <p className="text-green-700 text-sm mb-2">
                    This script verifies that everything was created correctly and shows the results.
                  </p>
                  <code className="text-sm text-green-700 bg-green-100 px-2 py-1 rounded block break-all">
                    scripts/auth-separation/03-verify-setup.sql
                  </code>
                  <p className="text-green-600 text-xs mt-2">✅ Verifies tables, counts records, and tests functions</p>
                </div>
              </div>

              <div className="p-4 bg-indigo-50 rounded border border-indigo-200">
                <h3 className="font-medium text-indigo-800 mb-2">🔑 Default Credentials (after setup)</h3>
                <div className="text-sm text-indigo-700 space-y-1">
                  <div>
                    <strong>Email:</strong> admin@baitahotel.com
                  </div>
                  <div>
                    <strong>Password:</strong> MasterAdmin2024!
                  </div>
                </div>
              </div>

              <Alert className="border-orange-500 bg-orange-50">
                <AlertDescription>
                  <p className="font-medium text-orange-800 mb-1">⚠️ Important Notes:</p>
                  <ul className="text-orange-700 text-sm list-disc list-inside space-y-1">
                    <li>Run the scripts in the exact order shown above</li>
                    <li>Wait for each script to complete before running the next one</li>
                    <li>Check for any error messages in the SQL Editor output</li>
                    <li>If you get errors, check the Supabase logs for more details</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
