/**
 * Loading Spinner Component
 */
export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizes[size]} border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin`}
      ></div>
    </div>
  );
};

/**
 * Page Loading Component
 */
export const PageLoader = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Spinner size="xl" />
      <p className="mt-4 text-gray-600 dark:text-gray-400">{message}</p>
    </div>
  );
};

/**
 * Skeleton Loading Component
 */
export const Skeleton = ({ className = '', variant = 'text' }) => {
  const variants = {
    text: 'h-4',
    title: 'h-6',
    button: 'h-10',
    avatar: 'h-12 w-12 rounded-full',
    card: 'h-32',
  };

  return (
    <div
      className={`bg-gray-200 dark:bg-gray-700 animate-pulse rounded ${variants[variant]} ${className}`}
    ></div>
  );
};

export default Spinner;
