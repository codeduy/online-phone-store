const express = require('express');
const router = express.Router();
const productController = require('../../controllers/admin/productController');
const { adminAuthMiddleware } = require('../../middleware/admin/adminAuthMiddleware');
const upload = require('../../middleware/admin/logoUploadMiddleware');

// Product management routes
router.get('/', adminAuthMiddleware, productController.getAllProducts);
router.post('/', adminAuthMiddleware, upload.array('images', 12), productController.createProduct);
router.put('/:id', adminAuthMiddleware, upload.array('images', 12), productController.updateProduct);
router.delete('/:id', adminAuthMiddleware, productController.deleteProduct);
router.get('/search', adminAuthMiddleware, productController.searchProducts);
router.get('/:id/details', adminAuthMiddleware, productController.getProductDetails);

// Category management routes
router.get('/categories', adminAuthMiddleware, productController.getCategories);
router.post('/categories', adminAuthMiddleware, upload.single('logo'), productController.createCategory);
router.put('/categories/:id', adminAuthMiddleware, upload.single('logo'), productController.updateCategory);
router.delete('/categories/:id', adminAuthMiddleware, productController.deleteCategory);

module.exports = router;