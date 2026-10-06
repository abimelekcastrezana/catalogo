import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "@/app/lib/utils"

// Botones "con volumen": un canto inferior (--btn-edge) que se hunde al presionar.
// --d es la profundidad del canto. Los botones planos (ghost/link) usan scale(0.96).
const raised =
  "shadow-[0_var(--d)_0_0_var(--btn-edge)] hover:-translate-y-0.5 hover:shadow-[0_calc(var(--d)+2px)_0_0_var(--btn-edge)] active:translate-y-[var(--d)] active:shadow-[0_0_0_0_var(--btn-edge)]"

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-bold select-none transition-[transform,box-shadow,background-color,color,border-color] duration-100 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none [&_svg]:size-[18px] [&_svg]:shrink-0 [&_svg]:stroke-[2]",
  {
    variants: {
      variant: {
        default:     `${raised} [--btn-edge:var(--accent-edge)] bg-primary text-primary-foreground`,
        whatsapp:    `${raised} [--btn-edge:var(--whatsapp-edge)] bg-whatsapp-fill text-white`,
        destructive: `${raised} [--btn-edge:var(--danger-edge)] bg-destructive text-destructive-foreground`,
        secondary:   `${raised} [--btn-edge:var(--border-strong)] border-2 border-border-strong bg-secondary text-secondary-foreground`,
        outline:     `${raised} [--btn-edge:var(--border-strong)] border-2 border-border-strong bg-card text-foreground`,
        ghost:       "active:scale-[0.96] hover:bg-accent hover:text-accent-foreground",
        link:        "active:scale-[0.96] text-[var(--accent-text)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 py-2 [--d:4px]",
        sm:      "h-9 px-4 text-[13px] [--d:3px] hit",
        lg:      "h-12 px-6 text-base [--d:4px]",
        icon:    "h-11 w-11 [--d:4px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button, buttonVariants }
