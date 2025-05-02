const { upload } = require('../config/cloudinary');

// Thay đổi route upload
router.post('/', auth.protect, upload.single('image'), productController.createProduct);
router.put('/:id', auth.protect, upload.single('image'), productController.updateProduct); 