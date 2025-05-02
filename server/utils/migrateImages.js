const { cloudinary } = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');

async function migrateImages() {
  const products = await Product.find({ image: { $exists: true } });
  
  for (const product of products) {
    if (product.image && product.image.startsWith('/uploads/')) {
      try {
        const localPath = path.join(__dirname, '../..', product.image);
        
        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(localPath);
        
        // Update product with Cloudinary URL
        product.image = result.secure_url;
        await product.save();
        
        console.log(`Migrated image for product ${product._id}`);
      } catch (error) {
        console.error(`Failed to migrate image for product ${product._id}:`, error);
      }
    }
  }
  console.log('Image migration completed');
}

module.exports = migrateImages; 