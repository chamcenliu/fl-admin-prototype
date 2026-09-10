import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../utils/classNames";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  icon?: ReactNode;
};

export function Button({ variant = "secondary", icon, className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        variant === "primary" && "primary-button",
        variant === "secondary" && "secondary-button",
        variant === "ghost" && "inline-flex min-h-9 items-center gap-2 px-3 text-sm font-semibold text-muted transition hover:text-ink",
        className
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
