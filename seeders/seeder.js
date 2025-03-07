const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');
const config = require('./config');

async function importCollection(collectionName, data) {
  try {
    const collection = mongoose.connection.collection(collectionName);
    
    // Kiểm tra xem collection có dữ liệu không
    const count = await collection.countDocuments();
    if (count > 0) {
      console.log(`Collection ${collectionName} already has data, skipping...`);
      return;
    }

    if (data.length > 0) {
      // Convert string ObjectIds to MongoDB ObjectIds
      const processedData = data.map(item => {
        const processed = { ...item };
        if (item._id && item._id.$oid) {
          processed._id = new mongoose.Types.ObjectId(item._id.$oid);
        }
        
        // Process dates
        for (const [key, value] of Object.entries(processed)) {
          if (value && value.$date) {
            processed[key] = new Date(value.$date);
          }
        }
        
        // Process references
        for (const [key, value] of Object.entries(processed)) {
          if (value && typeof value === 'object' && value.$oid) {
            processed[key] = new mongoose.Types.ObjectId(value.$oid);
          }
          // Handle arrays of references
          if (Array.isArray(value)) {
            processed[key] = value.map(v => {
              if (v && typeof v === 'object' && v.$oid) {
                return new mongoose.Types.ObjectId(v.$oid);
              }
              return v;
            });
          }
        }
        
        return processed;
      });

      await collection.insertMany(processedData);
      console.log(`${collectionName} data seeded successfully`);
    }
  } catch (error) {
    console.error(`Error seeding ${collectionName}:`, error);
  }
}

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongodb.url, config.mongodb.options);
    console.log('Connected to MongoDB');

    // Read all JSON files from data directory
    const dataDir = path.join(__dirname, 'data');
    const files = await fs.readdir(dataDir);

    for (const file of files) {
      if (file.endsWith('.json')) {
        const collectionName = file.replace('.json', '').toLowerCase();
        const dataPath = path.join(dataDir, file);
        const jsonData = await fs.readFile(dataPath, 'utf8');
        const data = JSON.parse(jsonData);
        
        await importCollection(collectionName, data);
      }
    }

    console.log('All data seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

seedDatabase();