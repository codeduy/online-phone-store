const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true,
        trim: true 
    },
    email: { 
        type: String, 
        required: true,
        trim: true,
        lowercase: true
    },
    phone: { 
        type: String, 
        required: true,
        trim: true,
        maxLength: 10
    },
    subject: { 
        type: String, 
        required: true,
        trim: true
    },
    message: { 
        type: String, 
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'resolved'],
        default: 'pending'
    }
}, {
    timestamps: true
});

const Contact = mongoose.model('Contact', contactSchema);
module.exports = Contact;