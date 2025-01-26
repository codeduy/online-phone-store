import React from 'react';
import { Carousel } from 'primereact/carousel';
import { Card } from 'primereact/card';
import { Link } from 'react-router-dom';

interface Promotion {
    id: string;
    title: string;
    image: string;
    description: string;
}

interface News {
    id: string;
    title: string;
    date: string;
    image: string;
    summary: string;
}

const UserNews: React.FC = () => {
    const promotions: Promotion[] = [
        {
            id: '1',
            title: 'Giảm giá 50% Samsung Galaxy S21',
            image: '/images/promotions/s21-promo.jpg',
            description: 'Ưu đãi đặc biệt cho dòng Samsung Galaxy S21'
        },
        {
            id: '2',
            title: 'Mua 1 tặng 1 phụ kiện',
            image: '/images/promotions/accessories-promo.jpg',
            description: 'Chương trình mua 1 tặng 1 cho tất cả phụ kiện'
        },
        // Add more promotions...
    ];

    const news: News[] = [
        {
            id: '1',
            title: 'Ra mắt Samsung Galaxy S24 Ultra',
            date: '2024-01-20',
            image: '/images/news/s24-launch.jpg',
            summary: 'Samsung chính thức ra mắt dòng điện thoại flagship mới'
        },
        {
            id: '2',
            title: 'Cửa hàng mới khai trương tại Q.1',
            date: '2024-01-15',
            image: '/images/news/new-store.jpg',
            summary: 'Khai trương cửa hàng mới tại Quận 1, TP.HCM'
        },
        // Add more news...
    ];

    const promotionTemplate = (promo: Promotion) => {
        return (
            <Link to={`/news/promotions/${promo.id}`} className="block">
                <div className="relative group overflow-hidden rounded-lg shadow-lg">
                    <img 
                        src={promo.image} 
                        alt={promo.title}
                        className="w-full h-[400px] object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                        <h3 className="text-white text-xl font-bold">{promo.title}</h3>
                        <p className="text-white/80">{promo.description}</p>
                    </div>
                </div>
            </Link>
        );
    };

    return (
        <div className="p-4">
            <div className="grid grid-cols-5 gap-6">
                {/* Column 1: Promotions (60%) */}
                <div className="col-span-3">
                    <h2 className="text-2xl font-bold mb-4">Tin khuyến mãi</h2>
                    <Carousel 
                        value={promotions} 
                        itemTemplate={promotionTemplate}
                        numVisible={1}
                        autoplayInterval={5000}
                    />
                </div>

                {/* Column 2: News (40%) */}
                <div className="col-span-2">
                    <h2 className="text-2xl font-bold mb-4">Tin tức công nghệ</h2>
                    <div className="space-y-4">
                        {news.map(item => (
                            <Link to={`/news/tech/${item.id}`} key={item.id}>
                                <Card className="hover:shadow-lg transition-shadow">
                                    <div className="flex gap-4">
                                        <img 
                                            src={item.image} 
                                            alt={item.title}
                                            className="w-24 h-24 object-cover rounded"
                                        />
                                        <div>
                                            <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                                            <p className="text-sm text-gray-600 mb-2">
                                                {new Date(item.date).toLocaleDateString('vi-VN')}
                                            </p>
                                            <p className="text-sm text-gray-700 line-clamp-2">{item.summary}</p>
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserNews;