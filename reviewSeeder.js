const mongoose = require('mongoose');
require('./models/categoryModel'); // Import Category model first
const Review = require('./models/reviewModel');
const { Product } = require('./models/productModel');
const User = require('./models/userModel');

const comments = [
    "Sản phẩm rất tốt, đáng tiền",
    "Chất lượng ổn, pin trâu",
    "Camera chụp đẹp, màn hình sắc nét",
    "Điện thoại chạy mượt, thiết kế đẹp",
    "Rất hài lòng với sản phẩm này",
    "Giá cả hợp lý, chất lượng tốt",
    "Pin dùng được 2 ngày, rất thích",
    "Cấu hình mạnh mẽ, chơi game mượt",
    "Máy đẹp, chụp ảnh tốt",
    "Giao hàng nhanh, sản phẩm chất lượng"
];

async function seedReviews() {
    try {
        await mongoose.connect('mongodb://localhost:27017/mobileshop');
        console.log('Connected to MongoDB');
        
        const products = await Product.find();
        const users = await User.find({ role: 'customer' });

        console.log(`Found ${products.length} products`);
        console.log(`Found ${users.length} users`);

        if (!products.length || !users.length) {
            console.log('No products or users found');
            return;
        }

        await Review.deleteMany({});
        console.log('Cleared existing reviews');

        const reviews = [];

        // Create 20 random reviews
        for (let i = 0; i < 20; i++) {
            const randomProduct = products[Math.floor(Math.random() * products.length)];
            const randomUser = users[Math.floor(Math.random() * users.length)];
            const randomRating = Math.floor(Math.random() * 4) + 2;

            const review = {
                product_id: randomProduct._id,
                user_id: randomUser._id,
                rating: randomRating,
                comment: comments[Math.floor(Math.random() * comments.length)],
                is_verified_purchase: true,
                images: [],
                replies: []
            };

            if (Math.random() < 0.3) {
                const randomReplier = users[Math.floor(Math.random() * users.length)];
                review.replies = [{
                    user_id: randomReplier._id,
                    comment: "Cảm ơn bạn đã đánh giá sản phẩm!",
                    created_at: new Date()
                }];
            }

            reviews.push(review);
        }

        await Review.insertMany(reviews);
        console.log(`Created ${reviews.length} reviews`);

        // Update product ratings
        for (const product of products) {
            const productReviews = await Review.find({ product_id: product._id });
            if (productReviews.length > 0) {
                const totalRating = productReviews.reduce((sum, review) => sum + review.rating, 0);
                const averageRating = totalRating / productReviews.length;
                
                await Product.findByIdAndUpdate(product._id, {
                    'rating.average': Number(averageRating.toFixed(1)),
                    'rating.count': productReviews.length
                });
                console.log(`Updated rating for product ${product._id}: avg=${averageRating.toFixed(1)}, count=${productReviews.length}`);
            }
        }

        console.log('Successfully seeded reviews and updated product ratings');
    } catch (error) {
        console.error('Error seeding reviews:', error);
        console.error(error.stack);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

seedReviews();