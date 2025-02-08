const mongoose = require('mongoose');

const productDetailSchema = new mongoose.Schema({
  product_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true, 
    ref: 'Product' 
  },
  trademark: { 
    type: String, 
    required: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  variants: [{
    storage: {
      type: String,
      required: true
    },
    ram: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    }
  }],
  color_options: { 
    type: [String], 
    required: true 
  },
  os: { 
    type: String, 
    required: true 
  },
  cpu: { 
    type: String, 
    required: true 
  },
  gpu: { 
    type: String, 
    required: true 
  },
  camera: {
    main: { 
      type: String, 
      required: true 
    },
    front: { 
      type: String, 
      required: true 
    }
  },
  display: {
    type: { 
      type: String, 
      required: true 
    },
    size: { 
      type: String, 
      required: true 
    },
    refresh_rate: { 
      type: String, 
      required: true 
    },
    brightness: { 
      type: String, 
      required: true 
    }
  },
  battery: {
    capacity: { 
      type: String, 
      required: true 
    },
    charging: { 
      type: String, 
      required: true 
    }
  },
  link: { 
    type: String, 
    required: true 
  },
  meta: { 
    type: String, 
    required: true 
  }
}, {
  timestamps: { 
    createdAt: 'created_at', 
    updatedAt: 'updated_at' 
  }
});

// Helper method to get base price
productDetailSchema.methods.getBasePrice = function() {
  return Math.min(...this.variants.map(v => v.price));
};

// Helper method to get price by configuration
productDetailSchema.methods.getPriceByConfig = function(storage, ram) {
  const variant = this.variants.find(v => v.storage === storage && v.ram === ram);
  return variant ? variant.price : null;
};

const ProductDetail = mongoose.model('ProductDetail', productDetailSchema, 'productDetails');

module.exports = ProductDetail;