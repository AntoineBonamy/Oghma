import type { ButtonHTMLAttributes, ReactNode } from "react";
 
type Variant = "primary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-violet-700 hover:bg-violet-600 text-slate-100 border border-violet-700 hover:border-violet-600",
  ghost:
    "bg-transparent hover:bg-slate-800 text-slate-300 hover:text-slate-100 border border-slate-700",
  danger:
    "bg-transparent hover:bg-red-950/60 text-red-400 hover:text-red-300 border border-red-900/50",
};

const sizeClasses: Record<Size, string> = {
  sm: "text-xs px-3 py-1.5 tracking-wider",
  md: "text-xs px-4 py-2.5 tracking-widest",
  lg: "text-sm px-5 py-3 tracking-widest",
};

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={[
        "inline-flex items-center justify-center gap-2 rounded font-semibold uppercase transition-colors",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variantClasses[variant],
        sizeClasses[size],
        className,
      ].join(" ")}
      {...props}
    >
      {loading ? <LoadingDots /> : children}
    </button>
  );
}
 
function LoadingDots() {
  return (
    <span className="flex items-center gap-1">
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:0ms]" />
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:150ms]" />
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:300ms]" />
    </span>
  );
}