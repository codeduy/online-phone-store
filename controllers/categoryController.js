const Category = require('../models/categoryModel');

const categoryController = {
    getAllCategories: async (req, res) => {
      try {
        const categories = await Category.find().select('name link logo_url');
        res.json(categories);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    }
};

module.exports = categoryController;  