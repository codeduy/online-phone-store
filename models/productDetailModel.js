const mongoose = require('mongoose');

const productDetailSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Product' },
  trademark: { type: String, required: true },
  name: { type: String, required: true },
  sizeGB: { type: [String], required: true }, // Example: ["128GB", "256GB"]
  color: { type: [String], required: true }, // Example: ["Black", "White", "Blue"]
  price: { type: Number, required: true },
  system: { type: String, required: true }, // Example: "Android", "iOS"
  CPU: { type: String, required: true }, // Example: "Snapdragon 8 Gen 2"
  GPU: { type: String, required: true }, // Example: "Adreno 740"
  RAM: { type: String, required: true }, // Example: "8GB", "12GB"
  camera: { type: String, required: true }, // Example: "50MP + 12MP + 10MP"
  screen: { type: String, required: true }, // Example: "6.5-inch OLED, 1080x2400px"
  pin: { type: String, required: true }, // Example: "4000mAh, 25W fast charging"
  link: { type: String, required: true },
  meta: { type: String, required: true } // Domain name or any other identifier
});

const ProductDetail = mongoose.model('ProductDetail', productDetailSchema, 'productDetails');

module.exports = ProductDetail;
