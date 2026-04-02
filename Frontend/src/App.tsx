import React from "react"
import { Button } from "./components/ui/button"

export default function App() {
  return (
    <div className="p-8 flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Test Buttons</h1>

      <Button>Default</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="destructive">Delete</Button>
    </div>
  )
}
