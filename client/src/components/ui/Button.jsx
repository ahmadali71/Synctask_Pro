import React from 'react';
import { motion } from 'framer-motion';

const Button = React.forwardRef(
  ({ className = '', variant = 'primary', size = 'md', children, isLoading, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-surface-900 disabled:opacity-50 disabled:pointer-events-none';

    const variants = {
      primary:
        'bg-primary-600 text-white hover:bg-primary-500 active:bg-primary-700 btn-primary-glow',
      secondary:
        'bg-surface-100 text-surface-800 hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-100 dark:hover:bg-surface-700 border border-surface-200 dark:border-surface-600',
      outline:
        'border-2 border-surface-300 dark:border-surface-600 bg-transparent text-theme-primary hover:bg-surface-100 dark:hover:bg-surface-800',
      ghost:
        'bg-transparent text-theme-secondary hover:bg-surface-100 dark:hover:bg-surface-800',
      danger:
        'bg-danger-600 text-white hover:bg-danger-500 shadow-md shadow-danger-500/25',
    };

    const sizes = {
      sm: 'h-9 px-3.5 text-xs gap-1.5',
      md: 'h-11 px-5 text-sm gap-2',
      lg: 'h-12 px-6 text-base gap-2',
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: props.disabled || isLoading ? 1 : 1.02 }}
        whileTap={{ scale: props.disabled || isLoading ? 1 : 0.98 }}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
