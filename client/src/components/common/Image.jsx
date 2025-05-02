import React, { useState } from 'react';

const Image = ({ src, alt, className, fallback = '/placeholder.jpg', ...props }) => {
  const [imgSrc, setImgSrc] = useState(src);
  
  const handleError = () => {
    setImgSrc(fallback);
  };
  
  return (
    <img 
      src={imgSrc} 
      alt={alt || 'Image'} 
      className={className}
      onError={handleError}
      {...props}
    />
  );
};

export default Image; 