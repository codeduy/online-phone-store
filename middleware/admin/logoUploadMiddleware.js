const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

const storage = multer.diskStorage({
    destination: async function (req, file, cb) {
        try {
            if (file.fieldname === 'logo') {
                // Nếu là logo thì lưu vào thư mục categories
                await fs.mkdir('public/images/categories', { recursive: true });
                cb(null, 'public/images/categories');
            } else {
                // Nếu là ảnh sản phẩm, tạm thời lưu vào temp
                await fs.mkdir('public/uploads/temp', { recursive: true });
                cb(null, 'public/uploads/temp');
            }
        } catch (error) {
            cb(error);
        }
    },
    filename: function (req, file, cb) {
        // Đảm bảo tên file không có khoảng trắng và ký tự đặc biệt
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // Chỉ cho phép upload ảnh
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // Giới hạn 5MB
    }
});

module.exports = upload;