import type { InputHTMLAttributes } from "react";

//////////
// Label + Input
//////////
 
interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}
 
export default function Field({
  label,
  error,
  hint,
  id,
  className = "",
  ...props
}: FieldProps) {
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, "-");
 
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={fieldId}
        className="block text-xs tracking-widest uppercase text-slate-500"
      >
        {label}
      </label>
 
      <input
        id={fieldId}
        className={[
          "w-full bg-slate-950/60 border rounded px-3 py-2.5",
          "text-slate-200 placeholder-slate-600 text-sm",
          "focus:outline-none transition-colors",
          error
            ? "border-red-700 focus:border-red-600 focus:ring-1 focus:ring-red-600/30"
            : "border-slate-700 focus:border-violet-600 focus:ring-1 focus:ring-violet-600/30",
          className,
        ].join(" ")}
        {...props}
      />
 
      {error && (
        <p className="text-red-400 text-xs">{error}</p>
      )}
 
      {hint && !error && (
        <p className="text-slate-600 text-xs">{hint}</p>
      )}
    </div>
  );
}