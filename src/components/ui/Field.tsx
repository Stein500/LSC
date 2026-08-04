import {
  forwardRef,
  cloneElement,
  isValidElement,
  useId,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
  type SelectHTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "@/utils/cn";

type FieldProps = {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children?: ReactNode;
  className?: string;
};

/**
 * Wrapper de champ accessible — relie label / hint / error à l'input enfant.
 * - Le label est associé à l'input via `htmlFor` + `id` auto-généré.
 * - L'erreur reçoit `role="alert"` pour être annoncée par les screen readers.
 * - `aria-describedby` + `aria-invalid` sont injectés sur l'input enfant
 *   (Input / Textarea / Select ou tout élément acceptant ces props).
 */
export function Field({ label, hint, error, required, children, className }: FieldProps) {
  const reactId = useId();
  const inputId = `${reactId}-input`;
  const hintId = hint ? `${reactId}-hint` : undefined;
  const errorId = error ? `${reactId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("block", className)}>
      <label htmlFor={inputId} className="block text-sm font-medium mb-1.5 text-[var(--color-ink)]">
        {label}
        {required && (
          <span className="text-[var(--color-orange)] ml-0.5" aria-hidden="true">
            *
          </span>
        )}
        {required && <span className="sr-only"> (champ obligatoire)</span>}
      </label>
      {isValidElement(children)
        ? cloneElement(children as React.ReactElement<Record<string, unknown>>, {
            id: inputId,
            "aria-describedby": describedBy,
            "aria-invalid": error ? true : undefined,
          })
        : children}
      {hint && !error && (
        <span id={hintId} className="block mt-1 text-xs text-[var(--color-muted)]">
          {hint}
        </span>
      )}
      {error && (
        <span id={errorId} role="alert" className="block mt-1 text-xs text-[var(--color-orange-d)]">
          {error}
        </span>
      )}
    </div>
  );
}

const inputBase =
  "block w-full rounded-xl border border-[var(--color-line)] bg-white px-4 py-3 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-muted)] transition-colors focus:border-[var(--color-citron-d)] focus:ring-2 focus:ring-[var(--color-citron)]/40 focus:outline-none aria-[invalid=true]:border-[var(--color-orange)]";

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }
>(({ className, invalid, ...rest }, ref) => (
  <input
    ref={ref}
    className={cn(inputBase, invalid && "border-[var(--color-orange)]", className)}
    aria-invalid={invalid || undefined}
    {...rest}
  />
));
Input.displayName = "Input";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }
>(({ className, invalid, ...rest }, ref) => (
  <textarea
    ref={ref}
    rows={4}
    className={cn(inputBase, "resize-y min-h-[96px]", invalid && "border-[var(--color-orange)]", className)}
    aria-invalid={invalid || undefined}
    {...rest}
  />
));
Textarea.displayName = "Textarea";

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }
>(({ className, invalid, children, ...rest }, ref) => (
  <select
    ref={ref}
    className={cn(inputBase, "appearance-none pr-10", invalid && "border-[var(--color-orange)]", className)}
    aria-invalid={invalid || undefined}
    {...rest}
  >
    {children}
  </select>
));
Select.displayName = "Select";

export function CheckboxGroup({
  options,
  value,
  onChange,
  name,
  describedBy,
}: {
  options: { value: string; label: string }[];
  value: string[];
  onChange: (v: string[]) => void;
  name?: string;
  describedBy?: string;
}) {
  const toggle = (v: string) => {
    if (value.includes(v)) onChange(value.filter((x) => x !== v));
    else onChange([...value, v]);
  };
  return (
    <div
      role="group"
      aria-describedby={describedBy}
      className="grid grid-cols-2 sm:grid-cols-4 gap-2"
    >
      {options.map((opt) => {
        const checked = value.includes(opt.value);
        return (
          <label
            key={opt.value}
            className={cn(
              "flex items-center justify-center gap-2 cursor-pointer rounded-xl border px-3 py-2.5 text-sm font-medium transition-all select-none min-h-[44px]",
              checked
                ? "border-[var(--color-citron-d)] bg-[var(--color-citron)]/30 text-[var(--color-ink)]"
                : "border-[var(--color-line)] bg-white text-[var(--color-ink-soft)] hover:border-[var(--color-citron)]",
            )}
          >
            <input type="checkbox" name={name} checked={checked} onChange={() => toggle(opt.value)} className="sr-only" />
            <span
              className={cn(
                "w-4 h-4 rounded border flex items-center justify-center shrink-0",
                checked
                  ? "bg-[var(--color-citron-d)] border-[var(--color-citron-d)]"
                  : "border-[var(--color-line)]",
              )}
            >
              {checked && (
                <svg
                  viewBox="0 0 24 24"
                  className="w-3 h-3 text-[var(--color-ink)]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            {opt.label}
          </label>
        );
      })}
    </div>
  );
}
