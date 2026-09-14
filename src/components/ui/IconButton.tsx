import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../utils/classNames";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  icon: ReactNode;
  variant?: "default" | "frameless";
};

export function IconButton({ label, icon, variant = "default", className, type = "button", ...props }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        variant === "default" && "icon-button",
        variant === "frameless" && "inline-grid h-9 w-9 place-items-center text-muted transition hover:bg-slate-100 hover:text-ink",
        className
      )}
      style={variant === "frameless" ? { borderRadius: 0 } : undefined}
      {...props}
    >
      {icon}
    </button>
  );
}
