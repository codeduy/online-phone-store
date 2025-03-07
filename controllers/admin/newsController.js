const NewsEvent = require('../../models/newsEventModel');
const multer = require('multer');
const path = require('path');
const logger = require('../../middleware/loggerMiddleware');

// Configure multer for image upload
const storage = multer.diskStorage({
    destination: './public/images/news',
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 5000000 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only .png, .jpg, .jpeg and .webp format allowed!'));
    }
}).single('image');

const newsController = {
    // Get all news
    getAllNews: async (req, res) => {
        try {
            console.log('Getting all news...');
            const news = await NewsEvent.find().sort({ created_at: -1 });
            console.log('Found news:', news);
            res.json(news);
        } catch (error) {
            console.error('Error in getAllNews:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Create new news
    createNews: async (req, res) => {
        try {
            const newsData = {
                ...req.body,
                staff_id: req.user.userId
            };
    
            // Validate and convert start_date
            if (newsData.start_date) {
                const startDate = new Date(newsData.start_date);
                if (isNaN(startDate.getTime())) {
                    return res.status(400).json({
                        success: false,
                        message: 'Ngày đăng bài không hợp lệ'
                    });
                }
                newsData.start_date = startDate;
            }
    
            console.log('Creating news with data:', newsData);
    
            const news = new NewsEvent(newsData);
            await news.save();

            // Log the create action
            await logger(
                req.user.userId,
                'CREATE',
                'NEWS',
                `Tạo tin tức mới: ${news.title}`,
                req
            );
            
            res.status(201).json({ 
                success: true, 
                data: news 
            });
        } catch (error) {
            console.error('Error creating news:', error);
            res.status(500).json({ 
                success: false, 
                message: error.message || 'Internal Server Error'
            });
        }
    },


    // Update news
    updateNews: async (req, res) => {
        try {
            const updateData = {
                ...req.body,
                updated_at: new Date()
            };
    
            // Validate and convert start_date
            if (updateData.start_date) {
                const startDate = new Date(updateData.start_date);
                if (isNaN(startDate.getTime())) {
                    return res.status(400).json({
                        success: false,
                        message: 'Ngày đăng bài không hợp lệ'
                    });
                }
                updateData.start_date = startDate;
            }
    
            const news = await NewsEvent.findByIdAndUpdate(
                req.params.id,
                updateData,
                { new: true, runValidators: true }
            );
            
            if (!news) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy tin tức'
                });
            }

             // Log the update action
             await logger(
                req.user.userId,
                'UPDATE',
                'NEWS',
                `Cập nhật tin tức: ${news.title}`,
                req
            );
            
            res.json({ success: true, data: news });
        } catch (error) {
            console.error('Error updating news:', error);
            res.status(500).json({ 
                success: false, 
                message: error.message || 'Internal Server Error'
            });
        }
    },


    // Delete news
    deleteNews: async (req, res) => {
        try {
            const news = await NewsEvent.findByIdAndDelete(req.params.id);
            
            if (!news) {
                return res.status(404).json({ success: false, message: 'News not found' });
            }

            await NewsEvent.findByIdAndDelete(req.params.id);

            // Log the delete action
            await logger(
                req.user.userId,
                'DELETE',
                'NEWS',
                `Xóa tin tức: ${news.title}`,
                req
            );
            
            res.json({ success: true, message: 'News deleted successfully' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Upload image
    uploadImage: (req, res) => {
        upload(req, res, (err) => {
            if (err) {
                return res.status(400).json({ success: false, message: err.message });
            }
            
            if (!req.file) {
                return res.status(400).json({ success: false, message: 'No file uploaded' });
            }

            const imagePath = `/images/news/${req.file.filename}`;
            res.json({ success: true, imagePath });
        });
    },

    searchNews: async (req, res) => {
        try {
            const { query } = req.query;
            
            if (!query) {
                return res.json({ 
                    success: true, 
                    data: [] 
                });
            }
    
            const searchRegex = new RegExp(query, 'i');
            const news = await NewsEvent.find({
                $or: [
                    { title: { $regex: searchRegex } },
                    { sub_title: { $regex: searchRegex } },
                    { meta: { $regex: searchRegex } }
                ]
            }).sort({ created_at: -1 });
    
            res.json({ 
                success: true, 
                data: news // This might be an empty array if no results found
            });
        } catch (error) {
            console.error('Error searching news:', error);
            res.status(500).json({ 
                success: false, 
                message: error.message 
            });
        }
    }
};

module.exports = newsController;