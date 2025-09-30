
import React from 'react';

interface InputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  type?: string;
}

const Input: React.FC<InputProps> = ({ value, onChange, placeholder, disabled = false, className = '', type = 'text' }) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    disabled={disabled}
    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''} ${className}`}
  />
);

export default Input;
