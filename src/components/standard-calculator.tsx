
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export default function StandardCalculator() {
  const [input, setInput] = useState("0")
  const [previousInput, setPreviousInput] = useState<string | null>(null)
  const [operator, setOperator] = useState<string | null>(null)

  const handleNumberClick = (value: string) => {
    if (input === "0" && value !== ".") {
      setInput(value)
    } else if (value === "." && input.includes(".")) {
      return
    } else {
      setInput(input + value)
    }
  }

  const handleOperatorClick = (op: string) => {
    if (previousInput !== null) {
      handleEqualsClick()
    }
    setPreviousInput(input)
    setInput("0")
    setOperator(op)
  }

  const handleEqualsClick = () => {
    if (!operator || previousInput === null) return
    
    const prev = parseFloat(previousInput)
    const current = parseFloat(input)
    let result

    switch (operator) {
      case "+":
        result = prev + current
        break
      case "-":
        result = prev - current
        break
      case "*":
        result = prev * current
        break
      case "/":
        result = prev / current
        break
      default:
        return
    }
    
    setInput(String(result))
    setPreviousInput(null)
    setOperator(null)
  }

  const handleClearClick = () => {
    setInput("0")
    setPreviousInput(null)
    setOperator(null)
  }

  const handleSignClick = () => {
    setInput(String(parseFloat(input) * -1))
  }

  const handlePercentClick = () => {
    setInput(String(parseFloat(input) / 100))
  }

  const buttons = [
    { label: "AC", handler: handleClearClick, className: "bg-muted hover:bg-muted/80 text-cyan-500" },
    { label: "+/-", handler: handleSignClick, className: "bg-muted hover:bg-muted/80 text-cyan-500" },
    { label: "%", handler: handlePercentClick, className: "bg-muted hover:bg-muted/80 text-cyan-500" },
    { label: "/", handler: () => handleOperatorClick("/"), className: "bg-cyan-500 hover:bg-cyan-600 text-white" },
    { label: "7", handler: () => handleNumberClick("7") },
    { label: "8", handler: () => handleNumberClick("8") },
    { label: "9", handler: () => handleNumberClick("9") },
    { label: "*", handler: () => handleOperatorClick("*"), className: "bg-cyan-500 hover:bg-cyan-600 text-white" },
    { label: "4", handler: () => handleNumberClick("4") },
    { label: "5", handler: () => handleNumberClick("5") },
    { label: "6", handler: () => handleNumberClick("6") },
    { label: "-", handler: () => handleOperatorClick("-"), className: "bg-cyan-500 hover:bg-cyan-600 text-white" },
    { label: "1", handler: () => handleNumberClick("1") },
    { label: "2", handler: () => handleNumberClick("2") },
    { label: "3", handler: () => handleNumberClick("3") },
    { label: "+", handler: () => handleOperatorClick("+"), className: "bg-cyan-500 hover:bg-cyan-600 text-white" },
    { label: "0", handler: () => handleNumberClick("0"), className: "col-span-2" },
    { label: ".", handler: () => handleNumberClick(".") },
    { label: "=", handler: handleEqualsClick, className: "bg-cyan-500 hover:bg-cyan-600 text-white" },
  ]

  return (
    <Card className="w-full max-w-md mx-auto transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:border-cyan-500/80 hover:shadow-2xl hover:shadow-cyan-500/20 hover:ring-2 hover:ring-cyan-500/50 dark:hover:shadow-cyan-500/10">
      <CardHeader>
        <CardTitle className="sr-only">Standard Calculator</CardTitle>
        <div className="bg-muted text-right p-6 rounded-lg">
          <p className="text-sm text-muted-foreground h-6">{previousInput} {operator}</p>
          <p className="text-5xl font-bold text-foreground truncate">{input}</p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-2">
          {buttons.map((btn) => (
            <Button
              key={btn.label}
              onClick={btn.handler}
              variant="secondary"
              className={cn("h-20 text-2xl font-semibold", btn.className)}
            >
              {btn.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
