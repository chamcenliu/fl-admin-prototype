import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../utils/classNames";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  icon: ReactNode;
};

export function IconButton({ label, icon, className, ...props }: IconButtonProps) {
  return (
    <button aria-label={label} title={label} className={cn("icon-button", className)} {...props}>
      {icon}
    </button>
  );
}
