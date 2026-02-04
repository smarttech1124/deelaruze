import React from 'react';

const Card = ({ children, className = '', hover = true }) => {
  const hoverClasses = hover ? 'hover:scale-105 transition-transform duration-300' : '';
  
  return (
    <div className={`bg-gray-900 border border-gray-800 ${hoverClasses} ${className}`}>
      {children}
    </div>
  );
};

export default Card;