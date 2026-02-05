import clsx from 'clsx';

const Badge = ({ label, variant = 'primary', size = 'md', icon, onRemove }) => {
  const baseClasses = 'inline-flex items-center space-x-1 rounded-full font-medium transition';

  const variantClasses = {
    primary: 'bg-primary-100 text-primary-800',
    success: 'bg-success-50 text-success-600',
    warning: 'bg-warning-50 text-warning-600',
    error: 'bg-error-50 text-error-600',
    secondary: 'bg-secondary-100 text-secondary-700',
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <span className={clsx(baseClasses, variantClasses[variant], sizeClasses[size])}>
      {icon && <span>{icon}</span>}
      <span>{label}</span>
      {onRemove && (
        <button
          onClick={onRemove}
          className="hover:opacity-70 ml-1"
          title="Remove"
        >
          ✕
        </button>
      )}
    </span>
  );
};

export default Badge;
