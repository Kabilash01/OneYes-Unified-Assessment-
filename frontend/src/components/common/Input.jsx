import clsx from 'clsx';

/**
 * Input Component
 * @param {Object} props - Component props
 * @param {string} props.label - Input label
 * @param {string} props.type - Input type
 * @param {string} props.error - Error message
 * @param {string} props.placeholder - Placeholder text
 * @param {boolean} props.required - Required field
 * @param {string} props.className - Additional classes
 */
const Input = ({
  label,
  type = 'text',
  error,
  placeholder,
  required = false,
  className = '',
  ...props
}) => {
  const inputClasses = clsx(
    'w-full px-4 py-2 border rounded-lg transition-all',
    'bg-white dark:bg-gray-800',
    'text-gray-900 dark:text-gray-100',
    'focus:outline-none focus:ring-2 focus:ring-offset-0',
    error
      ? 'border-danger-500 focus:ring-danger-500'
      : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-transparent',
    className
  );

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
          {required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        className={inputClasses}
        placeholder={placeholder}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
