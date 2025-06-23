"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function TestMasterAPI() {
  const [testResult, setTestResult] = useState<any>(null)
  const [loginResult, setLoginResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("admin@baitahotel.com")
  const [password, setPassword] = useState("MasterAdmin2024!")

  const testAPI = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/master/auth/login", {
        method: "GET",
      })
      const data = await response.json()
      setTestResult(data)
    } catch (error) {
      setTestResult({ error: error instanceof Error ? error.message : "Unknown error" })
    }
    setLoading(false)
  }

  const testLogin = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/master/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json()
      setLoginResult(data)
    } catch (error) {
      setLoginResult({ error: error instanceof Error ? error.message : "Unknown error" })
    }
    setLoading(false)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Master Admin API Test</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>API Status Test</CardTitle>
            <CardDescription>Test if the Master Admin API is working</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testAPI} disabled={loading} className="w-full">
              {loading ? "Testing..." : "Test API Status"}
            </Button>

            {testResult && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Result:</h3>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-64">
                  {JSON.stringify(testResult, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Login Test</CardTitle>
            <CardDescription>Test Master Admin login functionality</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>

            <Button onClick={testLogin} disabled={loading} className="w-full">
              {loading ? "Testing Login..." : "Test Login"}
            </Button>

            {loginResult && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Login Result:</h3>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-64">
                  {JSON.stringify(loginResult, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2">
            <li>First, run the API Status Test to check if the system is configured</li>
            <li>If you see errors about missing tables, run the setup scripts</li>
            <li>Then test the login with the default credentials</li>
            <li>Check the browser console for detailed logs</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
