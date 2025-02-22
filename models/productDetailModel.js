const mongoose = require('mongoose');

const productDetailSchema = new mongoose.Schema({
  product_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true, 
    ref: 'Product',
    index: true
  },
  trademark: { 
    type: String, 
    required: true,
    index: true
  },
  os: { 
    type: String, 
    required: true,
    trim: true
  },
  cpu: { 
    type: String, 
    required: true,
    trim: true
  },
  gpu: { 
    type: String, 
    required: true,
    trim: true
  },
  camera: {
    _id: false,
    main: { 
      type: String, 
      required: true,
      trim: true
    },
    front: { 
      type: String, 
      required: true,
      trim: true
    }
  },
  display: {
    _id: false,
    type: { 
      type: String, 
      required: true,
      trim: true
    },
    size: { 
      type: String, 
      required: true,
      trim: true
    },
    refresh_rate: { 
      type: String, 
      required: true,
      trim: true
    },
    brightness: { 
      type: String, 
      required: true,
      trim: true
    }
  },
  battery: {
    _id: false,
    capacity: { 
      type: String, 
      required: true,
      trim: true
    },
    charging: { 
      type: String, 
      required: true,
      trim: true
    }
  },
  color_options: { 
    type: [String], 
    required: true,
    validate: [arr => arr.length > 0, 'At least one color is required']
  }
}, {
  timestamps: { 
    createdAt: 'created_at', 
    updatedAt: 'updated_at' 
  }
});

// Add compound indexes for common queries
productDetailSchema.index({ trademark: 1, 'display.refresh_rate': 1 });
productDetailSchema.index({ os: 1, cpu: 1 });

// Virtual for full specifications
productDetailSchema.virtual('fullSpecs').get(function() {
  return `${this.cpu}, ${this.gpu}, ${this.display.size} ${this.display.type}`;
});

// Ensure virtuals are included in JSON
productDetailSchema.set('toJSON', { virtuals: true });
productDetailSchema.set('toObject', { virtuals: true });

const ProductDetail = mongoose.model('ProductDetail', productDetailSchema, 'productDetails');

module.exports = {
  ProductDetail
};