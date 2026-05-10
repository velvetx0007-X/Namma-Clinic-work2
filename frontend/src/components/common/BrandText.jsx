import React from 'react';

const BrandText = ({ className = "" }) => {
  return (
    <span className={`brand-text ${className}`}>
      <span className="brand-namma">NAMMA</span>
      <span className="brand-clinic">CLINIC</span>
    </span>
  );
};

export default BrandText;
