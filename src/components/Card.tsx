import React from 'react';

const Card = ({ children, className = '', ...props }: { children: React.ReactNode; className?: string; [key: string]: unknown }) => (
  <div className={`bg-white rounded-lg shadow-md border p-6 ${className}`} {...(props as React.HTMLAttributes<HTMLDivElement>)}>
    {children}
  </div>
);

export default Card;