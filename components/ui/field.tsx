import * as React from "react";
import { cn } from "@/lib/utils";

export interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {}
export const Field = React.forwardRef<HTMLDivElement, FieldProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("space-y-1.5 w-full", className)} {...props} />
  )
);
Field.displayName = "Field";

export interface FieldGroupProps extends React.HTMLAttributes<HTMLDivElement> {}
export const FieldGroup = React.forwardRef<HTMLDivElement, FieldGroupProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("space-y-4 w-full", className)} {...props} />
  )
);
FieldGroup.displayName = "FieldGroup";

export interface FieldLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}
export const FieldLabel = React.forwardRef<HTMLLabelElement, FieldLabelProps>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...props}
    />
  )
);
FieldLabel.displayName = "FieldLabel";

export interface FieldDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}
export const FieldDescription = React.forwardRef<HTMLParagraphElement, FieldDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-[0.75rem] text-muted-foreground", className)}
      {...props}
    />
  )
);
FieldDescription.displayName = "FieldDescription";
