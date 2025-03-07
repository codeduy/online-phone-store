const Log = require('../models/logModel');

const logger = async (adminId, action, module, details, req) => {
    try {
        await Log.create({
            adminId,
            action,
            module,
            details,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        });
    } catch (error) {
        console.error('Logging error:', error);
    }
};

module.exports = logger;