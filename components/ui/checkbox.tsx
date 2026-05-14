"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

export interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, ...props }, ref) => (
    <div className="relative inline-flex">
      <input
        type="checkbox"
        className={cn(
          "peer appearance-none w-4 h-4 border border-slate-400 rounded bg-transparent cursor-pointer checked:bg-blue-600 checked:border-blue-600 transition-colors",
          className
        )}
        ref={ref}
        {...props}
      />
      <Check className="absolute top-0.5 left-0.5 w-3 h-3 text-white pointer-events-none peer-checked:block hidden" />
    </div>
  )
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
