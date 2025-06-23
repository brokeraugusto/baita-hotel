import ModalScrollTest from "@/components/test/modal-scroll-test"

export default function TestScrollPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Modal Scroll Behavior Test</h1>
        <p className="text-muted-foreground">
          Comprehensive testing suite for modal scrolling behavior and user interactions
        </p>
      </div>

      <ModalScrollTest />
    </div>
  )
}
