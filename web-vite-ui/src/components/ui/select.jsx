import React, { useState, useRef, useEffect } from 'react';

export function Select({ children, value, onValueChange, disabled = false, ...props }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value);
  const triggerRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (contentRef.current && !contentRef.current.contains(event.target) &&
          triggerRef.current && !triggerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (newValue) => {
    setSelectedValue(newValue);
    onValueChange?.(newValue);
    setIsOpen(false);
  };

  return (
    <div className="relative" {...props}>
      <SelectTrigger 
        ref={triggerRef}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <SelectValue value={selectedValue} />
      </SelectTrigger>
      
      {isOpen && (
        <SelectContent ref={contentRef}>
          {React.Children.map(children, child => {
            if (React.isValidElement(child) && child.type === SelectItem) {
              return React.cloneElement(child, {
                onClick: () => handleSelect(child.props.value),
                className: `${child.props.className || ''} cursor-pointer`
              });
            }
            return child;
          })}
        </SelectContent>
      )}
    </div>
  );
}

export function SelectTrigger({ className = '', children, ...props }) {
  return (
    <div
      className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
      <svg
        className="h-4 w-4 opacity-50"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </div>
  );
}

export function SelectValue({ value, placeholder = "Select option" }) {
  return (
    <span className="text-sm">
      {value || placeholder}
    </span>
  );
}

export function SelectContent({ className = '', children, ...props }) {
  return (
    <div
      className={`absolute top-full left-0 z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function SelectItem({ className = '', children, value, ...props }) {
  return (
    <div
      className={`px-3 py-2 text-sm hover:bg-gray-100 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
} 