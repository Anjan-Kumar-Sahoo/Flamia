const Badge = ({ children, variant = 'default', className = '' }) => {
  const variantClasses = {
    default: 'bg-charcoal-100 text-charcoal-600',
    placed: 'badge-placed',
    confirmed: 'badge-confirmed',
    shipped: 'badge-shipped',
    delivered: 'badge-delivered',
    cancelled: 'badge-cancelled',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    info: 'bg-info/10 text-info',
  };

  return (
    <span className={`badge ${variantClasses[variant] || variantClasses.default} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
