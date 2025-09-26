import React from 'react';

interface SelectProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

const Select: React.FC<SelectProps> = ({ value, onChange, children, disabled = false, className = '' }) => (
  <select
    value={value}
    onChange={onChange}
    disabled={disabled}
    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''} ${className}`}
  >
    {children}
  </select>
);

export default Select;