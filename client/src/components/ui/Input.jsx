import React from 'react';

const Input = React.forwardRef(({ className = '', label, error, id, ...props }, ref) => {
  const inputId = id || props.name;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-theme-secondary mb-2"
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={`flex h-11 w-full rounded-xl border-2 bg-[var(--bg-elevated)] px-4 py-2 text-sm text-theme-primary placeholder:text-theme-muted transition-all duration-200 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/15 disabled:cursor-not-allowed disabled:opacity-50 ${
          error
            ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/15'
            : 'border-[var(--border-default)] hover:border-[var(--border-strong)]'
        } ${className}`}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="mt-1.5 text-sm text-danger-600 dark:text-danger-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
