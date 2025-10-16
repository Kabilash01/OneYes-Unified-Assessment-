import clsx from 'clsx';

/**
 * Badge Component
 * @param {Object} props - Component props
 * @param {string} props.variant - Badge variant
 * @param {string} props.children - Badge content
 */
const Badge = ({ variant = 'primary', size = 'md', className = '', children }) => {
  const variants = {
    primary: 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300',
    secondary: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    success: 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-300',
    warning: 'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-300',
    danger: 'bg-danger-100 text-danger-800 dark:bg-danger-900 dark:text-danger-300',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm',
  };

  const classes = clsx(
    'inline-flex items-center rounded-full font-medium',
    variants[variant],
    sizes[size],
    className
  );

  return <span className={classes}>{children}</span>;
};

export default Badge;
