const fs = require('fs');
const path = require('path');
const UserProfile = require('../models/userProfileModel');

const cleanupUnusedImages = async () => {
    try {
        const uploadsDir = path.join(__dirname, '../public/uploads/profile');
        const files = fs.readdirSync(uploadsDir);

        const profiles = await UserProfile.find({}, 'image_url');
        const usedImages = profiles.map(profile => {
            if (profile.image_url) {
                return path.basename(profile.image_url);
            }
        }).filter(Boolean);

        files.forEach(file => {
            if (!usedImages.includes(file)) {
                fs.unlinkSync(path.join(uploadsDir, file));
                console.log(`Deleted unused image: ${file}`);
            }
        });
    } catch (error) {
        console.error('Error cleaning up images:', error);
    }
};

module.exports = { cleanupUnusedImages };