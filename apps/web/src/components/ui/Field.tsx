import type { InputHTMLAttributes } from 'react';

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  error?: string;
  hint?: string;
}

export function Field({ label, name, error, hint, className, ...input }: FieldProps) {
  const hintId = `${name}-hint`;
  const message = error ?? hint;
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      <input
        {...input}
        name={name}
        className={['input', className].filter(Boolean).join(' ')}
        aria-invalid={error ? true : undefined}
        aria-describedby={message ? hintId : undefined}
      />
      {message && (
        <span id={hintId} className="field__hint" data-tone={error ? 'error' : undefined}>
          {message}
        </span>
      )}
    </label>
  );
}
