import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-full text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary px-5 py-2.5 text-primary-foreground hover:opacity-90",
        secondary: "bg-secondary px-5 py-2.5 text-secondary-foreground hover:bg-secondary/80",
        outline: "border border-border bg-white px-5 py-2.5 text-foreground hover:bg-muted",
        ghost: "px-4 py-2 text-foreground hover:bg-muted",
        danger: "bg-red-600 px-5 py-2.5 text-white hover:bg-red-700",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  }
);

export function Button({ className, variant, ...props }) {
  return <button className={cn(buttonVariants({ variant }), className)} {...props} />;
}
