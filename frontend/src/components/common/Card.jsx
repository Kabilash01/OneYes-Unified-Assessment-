import clsx from 'clsx';

/**
 * Card Component
 * @param {Object} props - Component props
 * @param {string} props.title - Card title
 * @param {React.ReactNode} props.children - Card content
 * @param {React.ReactNode} props.footer - Card footer
 * @param {boolean} props.hover - Enable hover effect
 * @param {string} props.className - Additional classes
 */
const Card = ({ title, children, footer, hover = false, className = '' }) => {
  const cardClasses = clsx(
    'bg-white dark:bg-gray-800 rounded-lg shadow-card p-6 transition-all',
    hover && 'hover:shadow-lg hover:scale-[1.02] cursor-pointer',
    className
  );

  return (
    <div className={cardClasses}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {title}
        </h3>
      )}
      <div>{children}</div>
      {footer && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
