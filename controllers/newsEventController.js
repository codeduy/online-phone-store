const NewsEvent = require('../models/newsEventModel');

const newsEventController = {
    // Get promotions
    getPromotions: async (req, res) => {
        try {
        const promotions = await NewsEvent.find({ 
            type: 'promotion',
            status: 'true',
            $or: [
            { end_date: { $gte: new Date() } },
            { end_date: null }
            ]
        })
        .select('title sub_title image link is_external_link')
        .sort({ created_at: -1 })
        .limit(5);
        
        res.json(promotions);
        } catch (error) {
        console.error('Error in getPromotions:', error);
        res.status(500).json({ message: error.message });
        }
    },

  // Get tech news
    getTechNews: async (req, res) => {
        try {
        const news = await NewsEvent.find({
            type: 'tech',
            status: 'true'
        })
        .select('title sub_title image link created_at is_external_link')  
        .sort({ created_at: -1 })
        .limit(4);

        res.json(news);
        } catch (error) {
        res.status(500).json({ message: error.message });
        }
    }
};

module.exports = newsEventController;