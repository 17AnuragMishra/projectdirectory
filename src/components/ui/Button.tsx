import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 select-none active:scale-[0.98] cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-orange-700 text-orange-50 shadow-sm hover:bg-orange-600 active:bg-orange-800 border border-orange-500/30",
        secondary:
          "bg-zinc-800/90 text-zinc-200 border border-zinc-700/60 hover:bg-zinc-700/80 hover:text-white hover:border-zinc-600",
        outline:
          "border border-zinc-800 bg-transparent text-zinc-300 hover:bg-zinc-800/80 hover:text-zinc-100 hover:border-zinc-700",
        ghost:
          "text-stone-400 hover:text-stone-100 hover:bg-stone-800/60",
        destructive:
          "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:text-red-300",
        link:
          "text-orange-300 underline-offset-4 hover:underline p-0 h-auto",
        glow:
          "bg-orange-700 text-orange-50 shadow-sm hover:bg-orange-600 border border-orange-400/30",
      },
      size: {
        default: "h-8 px-3 py-1.5 gap-1.5",
        sm: "h-7 px-2.5 text-[11px] gap-1 rounded",
        md: "h-8 px-3 py-1.5 gap-1.5",
        lg: "h-9 px-4 text-xs gap-2 rounded-md",
        icon: "h-8 w-8 p-0 rounded-md shrink-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
