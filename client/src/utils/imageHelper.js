import { Image } from '../components/common/Image';

// Helper cho xử lý fallback hình ảnh
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '/placeholder.jpg';
  
  // Nếu là URL đầy đủ (Cloudinary hoặc external)
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Nếu là relative path 
  if (imagePath.startsWith('/uploads/')) {
    return imagePath;
  }
  
  // Fallback
  return '/placeholder.jpg';
};

export { Image };
