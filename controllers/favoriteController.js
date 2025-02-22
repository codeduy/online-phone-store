const User = require('../models/userModel');
const Product = require('../models/productModel');

const toggleFavorite = async (req, res) => {
  try {
    const { userId, productId } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Check if product is already in favorites
    const isFavorite = user.favorite_products.includes(productId);
    
    if (isFavorite) {
      // Remove from favorites
      user.favorite_products = user.favorite_products.filter(
        id => id.toString() !== productId
      );
    } else {
      // Check favorites limit
      if (user.favorite_products.length >= 50) {
        return res.status(400).json({
          success: false,
          message: 'Maximum favorites limit (50) reached'
        });
      }
      // Add to favorites
      user.favorite_products.push(productId);
    }

    await user.save();

    res.json({
      success: true,
      isFavorite: !isFavorite,
      message: isFavorite ? 'Removed from favorites' : 'Added to favorites'
    });
  } catch (error) {
    console.error('Error in toggleFavorite:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getFavorites = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const user = await User.findById(userId)
            .populate({
                path: 'favorite_products',
                select: '_id name images price stock ram storage'
            })
            .lean();

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Transform the data to match the frontend expectations
        const transformedProducts = user.favorite_products.map(product => ({
            ...product,
            images: product.images || [],
            image_url: product.images?.[0] || '',
            stock_quantity: product.stock 
        }));

        res.json({
            success: true,
            data: transformedProducts
        });
    } catch (error) {
        console.error('Error in getFavorites:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
  toggleFavorite,
  getFavorites
};