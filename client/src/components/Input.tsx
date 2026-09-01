import { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn, sanitizeAmount } from "../utils/format";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  const inputId = id ?? props.name;
  return (
    <label className="block" htmlFor={inputId}>
      <span className="label">{label}</span>
      <input id={inputId} className={cn("field", error && "border-rose-400", className)} {...props} />
      {error ? <p className="mt-1 text-xs text-rose-600">{error}</p> : null}
    </label>
  );
}

interface AmountInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}

export function AmountInput({ label, name, value, onChange, error, required }: AmountInputProps) {
  return (
    <Input
      label={label}
      name={name}
      type="text"
      inputMode="decimal"
      autoComplete="off"
      placeholder="0"
      value={value}
      required={required}
      error={error}
      onFocus={(e) => e.currentTarget.select()}
      onChange={(e) => onChange(sanitizeAmount(e.target.value))}
    />
  );
}

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export function TextArea({ label, error, className, id, ...props }: TextAreaProps) {
  const inputId = id ?? props.name;
  return (
    <label className="block" htmlFor={inputId}>
      <span className="label">{label}</span>
      <textarea
        id={inputId}
        className={cn("field min-h-[96px]", error && "border-rose-400", className)}
        {...props}
      />
      {error ? <p className="mt-1 text-xs text-rose-600">{error}</p> : null}
    </label>
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
}

export function Select({ label, error, options, className, id, ...props }: SelectProps) {
  const inputId = id ?? props.name;
  return (
    <label className="block" htmlFor={inputId}>
      <span className="label">{label}</span>
      <select id={inputId} className={cn("field", error && "border-rose-400", className)} {...props}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error ? <p className="mt-1 text-xs text-rose-600">{error}</p> : null}
    </label>
  );
}
