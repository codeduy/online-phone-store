const express = require('express');
const router = express.Router();
const newsController = require('../../controllers/admin/newsController');
const { adminAuthMiddleware } = require('../../middleware/admin/adminAuthMiddleware');

// Apply admin auth middleware to all routes
router.use(adminAuthMiddleware);

// News routes
router.get('/', newsController.getAllNews);
router.post('/', newsController.createNews);
router.put('/:id', newsController.updateNews);
router.delete('/:id', newsController.deleteNews);
router.post('/upload', newsController.uploadImage);
router.get('/search', newsController.searchNews);

module.exports = router;