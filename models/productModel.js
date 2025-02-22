const mongoose = require("mongoose");

// Constants for enums
const PRODUCT_NEEDS = [
  'Chơi game/Cấu hình cao',
  'Pin khủng trên 5000mAh',
  'Chụp ảnh, quay phim',
  'Mỏng nhẹ'
];

const SPECIAL_FEATURES = [
  'Kháng nước, bụi',
  'Hỗ trợ 5G',
  'Bảo mật khuôn mặt 3D',
  'Công nghệ NFC'
];

const productSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true,
    index: true
  },
  release_year: { 
    type: Number,
    required: true,
    min: 2019,  
    max: new Date().getFullYear(),  
    validate: {
      validator: Number.isInteger,
      message: 'Năm ra mắt phải là số nguyên'
    },
    index: true 
  },
  category_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Category",
    required: true,
    index: true
  },
  trademark: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
    index: true
  },
  images: {
    type: [String],
    required: true,
    validate: {
        validator: function(v) {
            return v && v.length > 0;
        },
        message: 'At least one image is required'
    }
  },
  ram: {
    type: String,
    required: true,
    trim: true
  },
  storage: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0,
    index: true
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  needs: {
    type: [String],
    validate: {
      validator: function(v) {
        return v.every(need => PRODUCT_NEEDS.includes(need));
      },
      message: props => `${props.value} is not a valid need`
    }
  },
  special_features: {
    type: [String],
    validate: {
      validator: function(v) {
        return v.every(feature => SPECIAL_FEATURES.includes(feature));
      },
      message: props => `${props.value} is not a valid special feature`
    }
  },
  link: { 
    type: String, 
    required: true,
    trim: true,
    unique: true
  },
  meta: { 
    type: String,
    default: "",
    trim: true
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

productSchema.statics.calculateAverageRating = async function(productId) {
  const Review = mongoose.model('Review');
  
  try {
      const result = await Review.aggregate([
          {
              $match: {
                  product_id: new mongoose.Types.ObjectId(productId),
                  status: 'approved',
                  parent_id: null
              }
          },
          {
              $group: {
                  _id: '$product_id',
                  averageRating: { $avg: '$rating' }
              }
          }
      ]);

      let averageRating = 0;
      if (result.length > 0) {
          averageRating = Math.round(result[0].averageRating * 10) / 10;
      }

      await this.findByIdAndUpdate(productId, { rating: averageRating });
      return averageRating;
  } catch (error) {
      console.error('Error calculating average rating:', error);
      throw error;
  }
};

// Add compound indexes
productSchema.index({ category_id: 1, name: 1 });
productSchema.index({ "rating": -1 });
productSchema.index({ name: "text" });
productSchema.index({ release_year: -1, price: 1 });

// Utility methods
productSchema.methods.hasNeed = function(need) {
  return this.needs.includes(need);
};

productSchema.methods.hasFeature = function(feature) {
  return this.special_features.includes(feature);
};

// Virtual for primary image
productSchema.virtual('mainImage').get(function() {
  return this.images[0] || null;
});

// Virtual for slug generation
productSchema.virtual('slug').get(function() {
  return this.link.split('/').pop();
});

// Virtual for base price (lowest variant price)
productSchema.virtual('basePrice').get(function() {
  if (!this.variants || this.variants.length === 0) return 0;
  return Math.min(...this.variants.map(v => v.price));
});

// Ensure virtuals are included in JSON
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

productSchema.pre('save', function(next) {
  const product = this;
  const baseName = product.name.toLowerCase().replace(/ /g, '-');
  const isIphone = baseName.includes('iphone');
  const formattedStorage = product.storage.toLowerCase();
  const formattedRam = product.ram?.toLowerCase();
  
  if (isIphone) {
    product.link = `${baseName}-${formattedStorage}`;
  } else {
    product.link = `${baseName}-${formattedRam}-${formattedStorage}`;
  }
  
  next();
});

// Make it available as a static method too
productSchema.statics.generateProductLink = function(productData) {
  const baseName = productData.name.toLowerCase().replace(/ /g, '-');
  const isIphone = baseName.includes('iphone');
  const formattedStorage = productData.storage.toLowerCase();
  const formattedRam = productData.ram?.toLowerCase();
  
  if (isIphone) {
    return `${baseName}-${formattedStorage}`;
  } else {
    return `${baseName}-${formattedRam}-${formattedStorage}`;
  }
};

productSchema.virtual('imageUrls').get(function() {
  if (!this.images || !this.trademark || !this.trademark.name) {
    return [];
  }
  try {
    const formattedTrademark = this.trademark.name.toUpperCase();
    const formattedProductName = this.name.replace(/\s+/g, '');
    return this.images.map(image => `/images/phone/${formattedTrademark}/${formattedProductName}/${image}`);
  } catch (error) {
    console.error('Error generating imageUrls:', error);
    return [];
  }
});

productSchema.pre('find', function() {
  this.populate({
    path: 'trademark',
    select: 'name' 
  });
});

productSchema.pre('findOne', function() {
  this.populate({
    path: 'trademark',
    select: 'name' 
  });
});

productSchema.pre(['find', 'findOne'], function() {
  this.populate('category_id')
      .populate({
        path: 'trademark',
        select: 'name'
      });
});

const Product = mongoose.model('Product', productSchema, 'products');
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = {
  Product,
  PRODUCT_NEEDS,
  SPECIAL_FEATURES
};

