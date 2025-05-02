import React, { useState } from 'react';

const Image = ({ src, alt, className, ...props }) => {
  const [imgSrc, setImgSrc] = useState(src);
  const defaultImage = '/path/to/default-image.jpg';
  
  const handleError = () => {
    setImgSrc(defaultImage);
  };
  
  return (
    <img 
      src={imgSrc} 
      alt={alt} 
      className={className}
      onError={handleError}
      {...props}
    />
  );
};

export default Image; 