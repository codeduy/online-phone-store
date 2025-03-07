require('dotenv').config();

module.exports = {
  mongodb: {
    url: process.env.MONGODB_URI || 'mongodb://localhost:27017/mobileshop',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  }
};