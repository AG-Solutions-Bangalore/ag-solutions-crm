import * as React from "react"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground border-border",
        success:
          "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20",
        warning:
          "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20",
        info:
          "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20",
        purple:
          "border-purple-500/20 bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20",
        indigo:
          "border-indigo-500/20 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20",
        cyan:
          "border-cyan-500/20 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/20",
        rose:
          "border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);


function Badge({
  className,
  variant,
  ...props
}) {
  return (<div className={cn(badgeVariants({ variant }), className)} {...props} />);
}

export { Badge, badgeVariants }
