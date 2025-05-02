const Product = require('../models/Product');

// Get all products
exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find()
            .populate('seller', 'username email')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            products
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách sản phẩm'
        });
    }
};

// Create new product
exports.createProduct = async (req, res) => {
    try {
        const { name, description, price, category } = req.body;
        
        const product = await Product.create({
            name,
            description,
            price,
            category,
            image: req.file ? req.file.path : 'https://res.cloudinary.com/your-cloud-name/image/upload/shoptraodoi/default-product.jpg',
            seller: req.user._id
        });

        res.status(201).json({
            success: true,
            product
        });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tạo sản phẩm mới'
        });
    }
};

// Get single product
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('seller', 'username email');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm'
            });
        }

        res.json({
            success: true,
            product
        });
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thông tin sản phẩm'
        });
    }
};

// Update product
exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm'
            });
        }

        const productFields = req.body;

        if (req.file) {
            productFields.image = req.file.path;
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            productFields,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            product: updatedProduct
        });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật sản phẩm'
        });
    }
};

// Delete product
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm'
            });
        }

        res.json({
            success: true,
            message: 'Xóa sản phẩm thành công'
        });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa sản phẩm'
        });
    }
};

// Thêm hoặc cập nhật hàm getFeaturedProducts với xử lý lỗi đầy đủ
exports.getFeaturedProducts = async (req, res) => {
  try {
    const featuredProducts = await Product.find()
      .sort({ createdAt: -1 })
      .limit(6);
    
    return res.status(200).json({
      success: true,
      products: featuredProducts
    });
  } catch (error) {
    console.error('Error in getFeaturedProducts:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching featured products'
    });
  }
}; 