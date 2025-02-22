const Category = require('../models/categoryModel');

const categoryController = {
    getAllCategories: async (req, res) => {
        try {
            const categories = await Category.find()
                .select('name link logo_url')
                .lean();

            console.log('Categories from DB:', categories); // Debug log

            if (!categories || categories.length === 0) {
                // Instead of 404, return empty array
                return res.json([]);
            }

            // Return array directly instead of wrapping in object
            res.json(categories);
        } catch (error) {
            console.error('Error in getAllCategories:', error);
            res.status(500).json({ 
                success: false,
                message: 'Error fetching categories',
                error: error.message 
            });
        }
    }
};

module.exports = categoryController;