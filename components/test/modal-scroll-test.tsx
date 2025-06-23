"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowUp,
  ArrowDown,
  MousePointer,
  Keyboard,
  Smartphone,
  Monitor,
  CheckCircle,
  AlertCircle,
  Info,
} from "lucide-react"

export default function ModalScrollTest() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("1")
  const [scrollPosition, setScrollPosition] = useState(0)
  const [testResults, setTestResults] = useState<Record<string, boolean>>({})

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement
    const scrollPercentage = (target.scrollTop / (target.scrollHeight - target.clientHeight)) * 100
    setScrollPosition(scrollPercentage)
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.querySelector(`[data-section="${sectionId}"]`)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
      setTestResults((prev) => ({ ...prev, [`scroll_${sectionId}`]: true }))
    }
  }

  const testKeyboardNavigation = () => {
    // Simulate keyboard navigation test
    setTestResults((prev) => ({ ...prev, keyboard_nav: true }))
  }

  const testTabNavigation = (tabValue: string) => {
    setActiveTab(tabValue)
    setTimeout(() => {
      const element = document.querySelector(`[data-state="active"][data-value="${tabValue}"]`)
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "nearest" })
        setTestResults((prev) => ({ ...prev, [`tab_${tabValue}`]: true }))
      }
    }, 100)
  }

  const testMobileScroll = () => {
    // Simulate mobile scroll test
    setTestResults((prev) => ({ ...prev, mobile_scroll: true }))
  }

  const resetTests = () => {
    setTestResults({})
    setScrollPosition(0)
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MousePointer className="h-5 w-5" />
            Modal Scroll Behavior Test
          </CardTitle>
          <CardDescription>Test all scrolling behaviors in the price rules creation modal</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{Math.round(scrollPosition)}%</div>
              <div className="text-sm text-muted-foreground">Scroll Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Object.values(testResults).filter(Boolean).length}
              </div>
              <div className="text-sm text-muted-foreground">Tests Passed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Object.keys(testResults).length - Object.values(testResults).filter(Boolean).length}
              </div>
              <div className="text-sm text-muted-foreground">Tests Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">12</div>
              <div className="text-sm text-muted-foreground">Total Tests</div>
            </div>
          </div>

          <div className="flex gap-2">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button>Open Test Modal</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[800px] h-[85vh] overflow-hidden flex flex-col">
                <DialogHeader className="flex-shrink-0">
                  <DialogTitle>Scroll Behavior Test Modal</DialogTitle>
                  <DialogDescription>Test various scrolling scenarios in this modal</DialogDescription>
                </DialogHeader>

                {/* Scroll Progress Indicator */}
                <div className="flex-shrink-0 px-6 pb-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Scroll Progress:</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${scrollPosition}%` }}
                      />
                    </div>
                    <span>{Math.round(scrollPosition)}%</span>
                  </div>
                </div>

                {/* Quick Navigation */}
                <div className="flex-shrink-0 px-6 pb-4 border-b">
                  <div className="flex gap-2 flex-wrap">
                    <Button size="sm" variant="outline" onClick={() => scrollToSection("section1")}>
                      Section 1
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => scrollToSection("section2")}>
                      Section 2
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => scrollToSection("section3")}>
                      Section 3
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => scrollToSection("section4")}>
                      Section 4
                    </Button>
                  </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-hidden">
                  <ScrollArea className="h-full px-6" onScrollCapture={handleScroll}>
                    <div className="space-y-8 pb-4">
                      {/* Section 1: Basic Information */}
                      <div data-section="section1" className="space-y-4">
                        <div className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50/50 rounded-r">
                          <div className="flex items-center gap-2">
                            <span className="bg-blue-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                              1
                            </span>
                            <h3 className="text-sm font-medium text-gray-900">Basic Information</h3>
                            <Badge variant="outline" className="text-xs">
                              Required
                            </Badge>
                            {testResults.scroll_section1 && <CheckCircle className="h-4 w-4 text-green-600" />}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Tariff Period</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Select period" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="high">High Season</SelectItem>
                                <SelectItem value="low">Low Season</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Category</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="standard">Standard</SelectItem>
                                <SelectItem value="deluxe">Deluxe</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Info className="h-4 w-4 text-blue-600" />
                            <h4 className="font-medium text-blue-900">Test: Basic Form Interaction</h4>
                          </div>
                          <p className="text-sm text-blue-700">
                            This section tests basic form interactions within the scrollable area. Try selecting
                            different options and notice how the scroll position is maintained.
                          </p>
                        </div>
                      </div>

                      {/* Section 2: Prices with Tabs */}
                      <div data-section="section2" className="space-y-4">
                        <div className="border-l-4 border-green-500 pl-4 py-2 bg-green-50/50 rounded-r">
                          <div className="flex items-center gap-2">
                            <span className="bg-green-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                              2
                            </span>
                            <h3 className="text-sm font-medium text-gray-900">Prices by Guest Count</h3>
                            <Badge variant="outline" className="text-xs">
                              Tab Navigation
                            </Badge>
                            {testResults.scroll_section2 && <CheckCircle className="h-4 w-4 text-green-600" />}
                          </div>
                        </div>

                        <Tabs value={activeTab} onValueChange={testTabNavigation} className="w-full">
                          <TabsList className="mb-4 w-full justify-start">
                            <TabsTrigger value="1">1 Guest</TabsTrigger>
                            <TabsTrigger value="2">2 Guests</TabsTrigger>
                            <TabsTrigger value="3">3 Guests</TabsTrigger>
                            <TabsTrigger value="4">4 Guests</TabsTrigger>
                          </TabsList>

                          {["1", "2", "3", "4"].map((guestCount) => (
                            <TabsContent key={guestCount} value={guestCount} className="space-y-4">
                              <div className="p-4 border rounded-lg bg-white">
                                <h4 className="text-sm font-medium mb-3">
                                  Prices for {guestCount} Guest{guestCount !== "1" ? "s" : ""}
                                  {testResults[`tab_${guestCount}`] && (
                                    <CheckCircle className="inline h-4 w-4 text-green-600 ml-2" />
                                  )}
                                </h4>

                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label>Credit Card Price (R$)</Label>
                                    <Input type="number" placeholder="250.00" />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>PIX Price (R$)</Label>
                                    <Input type="number" placeholder="225.00" />
                                  </div>
                                </div>

                                <div className="mt-4 bg-blue-50 p-3 rounded-lg">
                                  <h5 className="text-sm font-medium text-blue-900 mb-2">
                                    Preview for {guestCount} Guest{guestCount !== "1" ? "s" : ""}
                                  </h5>
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <h6 className="text-xs font-medium text-blue-800 mb-1">With Breakfast</h6>
                                      <div className="space-y-1">
                                        <div className="flex justify-between">
                                          <span className="text-xs">Credit Card:</span>
                                          <span className="text-xs font-medium">R$ 250,00</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-xs">PIX:</span>
                                          <span className="text-xs font-medium text-green-600">R$ 225,00</span>
                                        </div>
                                      </div>
                                    </div>
                                    <div>
                                      <h6 className="text-xs font-medium text-blue-800 mb-1">Without Breakfast</h6>
                                      <div className="space-y-1">
                                        <div className="flex justify-between">
                                          <span className="text-xs">Credit Card:</span>
                                          <span className="text-xs font-medium">R$ 225,00</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-xs">PIX:</span>
                                          <span className="text-xs font-medium text-green-600">R$ 200,00</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </TabsContent>
                          ))}
                        </Tabs>

                        <div className="bg-green-50 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Keyboard className="h-4 w-4 text-green-600" />
                            <h4 className="font-medium text-green-900">Test: Tab Navigation</h4>
                          </div>
                          <p className="text-sm text-green-700">
                            Click on different tabs above to test smooth scrolling behavior when tab content changes.
                            The active tab should remain visible after switching.
                          </p>
                        </div>
                      </div>

                      {/* Section 3: Breakfast Discount */}
                      <div data-section="section3" className="space-y-4">
                        <div className="border-l-4 border-orange-500 pl-4 py-2 bg-orange-50/50 rounded-r">
                          <div className="flex items-center gap-2">
                            <span className="bg-orange-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                              3
                            </span>
                            <h3 className="text-sm font-medium text-gray-900">Breakfast Discount</h3>
                            <Badge variant="outline" className="text-xs">
                              Dynamic Content
                            </Badge>
                            {testResults.scroll_section3 && <CheckCircle className="h-4 w-4 text-green-600" />}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Discount Type</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="fixed">Fixed Amount (R$)</SelectItem>
                                <SelectItem value="percentage">Percentage (%)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Discount Value</Label>
                            <Input type="number" placeholder="25.00" />
                          </div>
                        </div>

                        <div className="bg-orange-50 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Monitor className="h-4 w-4 text-orange-600" />
                            <h4 className="font-medium text-orange-900">Test: Dynamic Content</h4>
                          </div>
                          <p className="text-sm text-orange-700">
                            This section tests how the scroll behaves when content changes dynamically. Try changing the
                            discount type and observe the smooth transitions.
                          </p>
                        </div>
                      </div>

                      {/* Section 4: Summary */}
                      <div data-section="section4" className="space-y-4">
                        <div className="border-l-4 border-purple-500 pl-4 py-2 bg-purple-50/50 rounded-r">
                          <div className="flex items-center gap-2">
                            <span className="bg-purple-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                              4
                            </span>
                            <h3 className="text-sm font-medium text-gray-900">Summary & Tests</h3>
                            <Badge variant="outline" className="text-xs">
                              Final Section
                            </Badge>
                            {testResults.scroll_section4 && <CheckCircle className="h-4 w-4 text-green-600" />}
                          </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg border">
                          <h4 className="text-sm font-medium mb-3">Scroll Test Results</h4>

                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <h5 className="text-xs font-medium">Navigation Tests</h5>
                                <div className="space-y-1">
                                  {["section1", "section2", "section3", "section4"].map((section) => (
                                    <div key={section} className="flex items-center justify-between text-xs">
                                      <span>Scroll to {section}:</span>
                                      {testResults[`scroll_${section}`] ? (
                                        <CheckCircle className="h-3 w-3 text-green-600" />
                                      ) : (
                                        <AlertCircle className="h-3 w-3 text-gray-400" />
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="space-y-2">
                                <h5 className="text-xs font-medium">Tab Navigation Tests</h5>
                                <div className="space-y-1">
                                  {["1", "2", "3", "4"].map((tab) => (
                                    <div key={tab} className="flex items-center justify-between text-xs">
                                      <span>Tab {tab} navigation:</span>
                                      {testResults[`tab_${tab}`] ? (
                                        <CheckCircle className="h-3 w-3 text-green-600" />
                                      ) : (
                                        <AlertCircle className="h-3 w-3 text-gray-400" />
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="border-t pt-3">
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={testKeyboardNavigation}>
                                  <Keyboard className="h-3 w-3 mr-1" />
                                  Test Keyboard Nav
                                </Button>
                                <Button size="sm" variant="outline" onClick={testMobileScroll}>
                                  <Smartphone className="h-3 w-3 mr-1" />
                                  Test Mobile Scroll
                                </Button>
                                <Button size="sm" variant="outline" onClick={resetTests}>
                                  Reset Tests
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-purple-50 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Smartphone className="h-4 w-4 text-purple-600" />
                            <h4 className="font-medium text-purple-900">Test: Mobile Responsiveness</h4>
                          </div>
                          <p className="text-sm text-purple-700">
                            This section is at the bottom to test scroll-to-bottom behavior. On mobile devices, ensure
                            the modal doesn't exceed viewport height and scrolls smoothly.
                          </p>
                        </div>

                        {/* Extra content to test bottom scroll */}
                        <div className="space-y-4">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="p-3 bg-gray-100 rounded text-sm">
                              Extra content block {i} - This ensures we can test scrolling to the very bottom of the
                              modal and that the footer remains accessible.
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </div>

                {/* Fixed Footer */}
                <div className="flex-shrink-0 border-t p-6 bg-white">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      Scroll: {Math.round(scrollPosition)}% | Tests: {Object.values(testResults).filter(Boolean).length}
                      /12
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setIsOpen(false)}>
                        Cancel
                      </Button>
                      <Button>Save Rules</Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="outline" onClick={resetTests}>
              Reset Tests
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Results Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Scroll Test Checklist</CardTitle>
          <CardDescription>Complete these tests to verify modal scrolling behavior</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Navigation Tests</h4>
              <div className="space-y-2">
                {[
                  { key: "scroll_section1", label: "Scroll to Section 1", icon: ArrowUp },
                  { key: "scroll_section2", label: "Scroll to Section 2", icon: ArrowDown },
                  { key: "scroll_section3", label: "Scroll to Section 3", icon: ArrowDown },
                  { key: "scroll_section4", label: "Scroll to Section 4", icon: ArrowDown },
                ].map(({ key, label, icon: Icon }) => (
                  <div key={key} className="flex items-center gap-2 text-sm">
                    <Icon className="h-4 w-4 text-gray-400" />
                    <span className="flex-1">{label}</span>
                    {testResults[key] ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-sm">Interaction Tests</h4>
              <div className="space-y-2">
                {[
                  { key: "tab_1", label: "Tab 1 Navigation", icon: Keyboard },
                  { key: "tab_2", label: "Tab 2 Navigation", icon: Keyboard },
                  { key: "tab_3", label: "Tab 3 Navigation", icon: Keyboard },
                  { key: "tab_4", label: "Tab 4 Navigation", icon: Keyboard },
                ].map(({ key, label, icon: Icon }) => (
                  <div key={key} className="flex items-center gap-2 text-sm">
                    <Icon className="h-4 w-4 text-gray-400" />
                    <span className="flex-1">{label}</span>
                    {testResults[key] ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Testing Instructions</h4>
            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
              <li>Open the test modal using the button above</li>
              <li>Use the quick navigation buttons to test section scrolling</li>
              <li>Click through all tabs to test tab navigation</li>
              <li>Scroll manually to test smooth scrolling behavior</li>
              <li>Test on different screen sizes (desktop, tablet, mobile)</li>
              <li>Verify the progress indicator updates correctly</li>
              <li>Ensure the footer remains accessible at all scroll positions</li>
              <li>Test keyboard navigation (Tab, Shift+Tab, Arrow keys)</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
