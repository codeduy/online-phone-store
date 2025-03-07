const Category = require('../models/categoryModel');
const { Product } = require('../models/productModel');

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
    },
    getActiveCategories: async (req, res) => {
        try {
            // Get all unique category_ids from products
            const activeProductCategories = await Product.distinct('category_id');
            
            // Find categories that have products
            const activeCategories = await Category.find({
                _id: { $in: activeProductCategories }
            })
            .select('name link logo_url')
            .lean();

            console.log('Active categories:', activeCategories);

            if (!activeCategories || activeCategories.length === 0) {
                return res.json([]);
            }

            res.json(activeCategories);
        } catch (error) {
            console.error('Error in getActiveCategories:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching active categories',
                error: error.message
            });
        }
    }
};

module.exports = categoryController;