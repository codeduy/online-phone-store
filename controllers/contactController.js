const Contact = require('../models/contactModel');

const contactController = {
    createContact: async (req, res) => {
        try {
            const { email, phone } = req.body;

            // Check for existing active requests
            const existingContact = await Contact.findOne({
                $or: [
                    { email: email.toLowerCase() },
                    { phone: phone }
                ],
                status: {
                    $in: ['pending', 'processing']
                }
            });

            if (existingContact) {
                return res.status(400).json({
                    message: 'Vui lòng chờ yêu cầu hỗ trợ trước đó hoàn thành'
                });
            }

            // Create new contact if no active requests found
            const newContact = new Contact(req.body);
            await newContact.save();

            res.status(201).json({
                message: 'Gửi thông tin thành công',
                contact: newContact
            });

        } catch (error) {
            console.error('Error in createContact:', error);
            res.status(500).json({
                message: 'Có lỗi xảy ra, vui lòng thử lại'
            });
        }
    },

    getAllContacts: async (req, res) => {
        try {
            const contacts = await Contact.find();
            res.json(contacts);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = contactController;