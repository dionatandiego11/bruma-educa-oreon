import React from 'react';

const Card = ({ children, className = '', ...props }: { children: React.ReactNode; className?: string; [key: string]: any }) => (
  <div className={`bg-white rounded-lg shadow-md border p-6 ${className}`} {...props}>
    {children}
  </div>
);

export default Card;