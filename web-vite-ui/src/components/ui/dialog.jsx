import React, { useState, useEffect } from 'react';

export function Dialog({ children, open, onOpenChange, ...props }) {
  const [isOpen, setIsOpen] = useState(open);

  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  const handleOpenChange = (newOpen) => {
    setIsOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black bg-opacity-50" 
        onClick={() => handleOpenChange(false)}
      />
      <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        {React.Children.map(children, child => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, { onClose: () => handleOpenChange(false) });
          }
          return child;
        })}
      </div>
    </div>
  );
}

export function DialogTrigger({ children, asChild = false, ...props }) {
  if (asChild) {
    return React.cloneElement(children, {
      onClick: () => props.onClick?.(),
      ...props
    });
  }
  return <div {...props}>{children}</div>;
}

export function DialogContent({ className = '', children, ...props }) {
  return (
    <div className={`p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function DialogHeader({ className = '', children, ...props }) {
  return (
    <div className={`mb-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function DialogTitle({ className = '', children, ...props }) {
  return (
    <h2 className={`text-lg font-semibold ${className}`} {...props}>
      {children}
    </h2>
  );
}

export function DialogDescription({ className = '', children, ...props }) {
  return (
    <p className={`text-sm text-gray-600 ${className}`} {...props}>
      {children}
    </p>
  );
}

export function DialogFooter({ className = '', children, ...props }) {
  return (
    <div className={`flex justify-end gap-2 mt-4 ${className}`} {...props}>
      {children}
    </div>
  );
} 