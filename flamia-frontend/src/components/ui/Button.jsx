import { motion } from 'framer-motion';
import { forwardRef } from 'react';

const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  danger: 'bg-error text-ivory font-sans font-medium uppercase px-8 py-3.5 rounded-luxury tracking-widest text-body-sm hover:opacity-90 active:scale-[0.98] transition-all duration-200',
};

const sizes = {
  sm: 'px-5 py-2 text-caption',
  md: '',
  lg: 'px-10 py-4 text-body-md',
};

const Button = forwardRef(({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  fullWidth = false,
  icon,
  children,
  className = '',
  ...props
}, ref) => {
  return (
    <motion.button
      ref={ref}
      whileHover={!disabled && !isLoading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !isLoading ? { scale: 0.98 } : {}}
      className={`
        ${variants[variant] || variants.primary}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${isLoading || disabled ? 'opacity-70 pointer-events-none' : ''}
        inline-flex items-center justify-center gap-2
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : icon ? (
        <span className="w-5 h-5">{icon}</span>
      ) : null}
      {children}
    </motion.button>
  );
});

Button.displayName = 'Button';
export default Button;
