
import React from 'react';

const Card = ({ children, className = '', ...props }: { children: React.ReactNode; className?: string; [key: string]: unknown }) => (
  <div className={`bg-white rounded-xl shadow-lg border border-gray-100 p-6 sm:p-8 ${className}`} {...(props as React.HTMLAttributes<HTMLDivElement>)}>
    {children}
  </div>
);

export default Card;
