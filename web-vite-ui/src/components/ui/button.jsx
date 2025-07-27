import React from 'react';

const buttonVariants = {
  default: "bg-blue-600 text-white hover:bg-blue-700",
  destructive: "bg-red-600 text-white hover:bg-red-700",
  outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
  secondary: "bg-gray-600 text-white hover:bg-gray-700",
  ghost: "text-gray-700 hover:bg-gray-100",
  link: "text-blue-600 underline hover:text-blue-700",
};

const buttonSizes = {
  default: "h-10 px-4 py-2",
  sm: "h-9 px-3 py-1 text-sm",
  lg: "h-11 px-8 py-2 text-lg",
  icon: "h-10 w-10",
};

export function Button({ 
  className = '', 
  variant = 'default', 
  size = 'default', 
  children, 
  ...props 
}) {
  const baseClasses = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  const variantClasses = buttonVariants[variant] || buttonVariants.default;
  const sizeClasses = buttonSizes[size] || buttonSizes.default;
  
  return (
    <button
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export { buttonVariants }; 