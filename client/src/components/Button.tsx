import { cn } from "../utils/format";
import { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  loading?: boolean;
}

export function Button({ variant = "primary", className, loading, disabled, children, ...props }: Props) {
  const styles = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    danger: "btn-danger",
  }[variant];
  return (
    <button className={cn(styles, className)} disabled={disabled || loading} {...props}>
      {loading ? <Loader2 className="h-5 w-5 shrink-0 animate-spin" aria-hidden /> : null}
      {children}
    </button>
  );
}
