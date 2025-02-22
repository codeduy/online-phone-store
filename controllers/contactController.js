const Contact = require('../models/contactModel');

const contactController = {
    createContact: async (req, res) => {
        try {
            const { name, email, phone, subject, message } = req.body;

            // Validate required fields
            if (!name || !email || !phone || !subject || !message) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng điền đầy đủ thông tin'
                });
            }

            // Create new contact
            const contact = new Contact({
                name,
                email,
                phone,
                subject,
                message,
                status: 'pending'
            });

            await contact.save();

            res.status(201).json({
                success: true,
                message: 'Gửi thông tin thành công'
            });
        } catch (error) {
            console.error('Contact creation error:', error);
            res.status(500).json({
                success: false,
                message: 'Có lỗi xảy ra, vui lòng thử lại sau'
            });
        }
    }
};

module.exports = contactController;