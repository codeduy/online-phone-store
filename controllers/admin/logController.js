const Log = require('../../models/logModel');

const logController = {
    getLogs: async (req, res) => {
        try {
            const logs = await Log.find()
                .populate('adminId', 'name email')
                .sort({ timestamp: -1 });

                const formattedLogs = logs.map(log => ({
                    _id: log._id,
                    action: log.action,
                    module: log.module,
                    details: log.details,
                    timestamp: log.timestamp,
                    ipAddress: log.ipAddress,
                    userAgent: log.userAgent,
                    adminId: {
                        _id: log.adminId._id,
                        name: log.adminId.name,
                        email: log.adminId.email
                    }
                }));

            res.json({
                success: true,
                data: formattedLogs
            });
        } catch (error) {
            console.error('Error fetching logs:', error);
            res.status(500).json({
                success: false,
                message: 'Không thể tải lịch sử hoạt động'
            });
        }
    }
};

module.exports = logController;