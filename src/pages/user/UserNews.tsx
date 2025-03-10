import React, { useEffect, useState } from 'react';
import { Carousel } from 'primereact/carousel';
import { Card } from 'primereact/card';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet';

interface NewsEvent {
    _id: string;
    title: string;
    sub_title: string;
    image: string;
    type: 'promotion' | 'tech';
    start_date: string;  
    created_at: string;
    link: string;
    is_external_link: boolean;
}

interface LinkProps {
    to?: string;
    href?: string;
    target?: string;
    rel?: string;
    className: string;
    children: React.ReactNode;
}

const UserNews: React.FC = () => {
    const [promotions, setPromotions] = useState<NewsEvent[]>([]);
    const [news, setNews] = useState<NewsEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [promotionsRes, newsRes] = await Promise.all([
                    axios.get('/news/promotions'),
                    axios.get('/news/tech')
                ]);
                setPromotions(promotionsRes.data);
                setNews(newsRes.data);
            } 
            catch (error) {
                console.error('Error fetching news:', error);
            } 
            finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const promotionTemplate = (promo: NewsEvent) => {
        // Define component type explicitly
        const LinkComponent: React.ComponentType<LinkProps> = promo.is_external_link ? 'a' as any : Link;
        
        const linkProps = promo.is_external_link ? 
            { href: promo.link, target: "_blank", rel: "noopener noreferrer" } : 
            { to: promo.link };

        return (
            <LinkComponent {...linkProps} className="block">
                <div className="relative group overflow-hidden rounded-lg shadow-lg">
                    <img 
                        src={`${import.meta.env.VITE_IMAGE_URL}${promo.image}`}
                        alt={promo.title}
                        className="w-full h-[400px] object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/src/assets/img/default-news.png';
                        }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                        <h3 className="text-white text-xl font-bold">{promo.title}</h3>
                        <p className="text-white/80">{promo.sub_title}</p>
                    </div>
                </div>
            </LinkComponent>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <i className="pi pi-spin pi-spinner text-4xl"></i>
            </div>
        );
    }

    return (
        <div className="p-4">
            <Helmet>
                <title>Tin tức & sự kiện</title>
                <link rel="icon" href="../../src/assets/img/phone.ico" />
            </Helmet>
            <div className="grid grid-cols-5 gap-6">
                {/* Promotions Section */}
                <div className="col-span-3">
                    <h2 className="text-2xl font-bold mb-4">Tin khuyến mãi</h2>
                    {promotions.length > 0 ? (
                        <Carousel 
                            value={promotions}
                            itemTemplate={promotionTemplate}
                            numVisible={1}
                            autoplayInterval={5000}
                        />
                    ) : (
                        <div className="text-center p-4 bg-gray-100 rounded">
                            Không có khuyến mãi nào
                        </div>
                    )}
                </div>

                {/* Tech News Section */}
                <div className="col-span-2">
                <h2 className="text-2xl font-bold mb-4">Tin tức công nghệ</h2>                    
                <div className="space-y-4">
                    {news.length > 0 ? news.map(item => {
                        // Define component type explicitly
                        const LinkComponent: React.ComponentType<LinkProps> = item.is_external_link ? 'a' as any : Link;
                        
                        const linkProps = item.is_external_link ? 
                            { href: item.link, target: "_blank", rel: "noopener noreferrer" } : 
                            { to: item.link };

                        return (
                            <LinkComponent {...linkProps} key={item._id} className="block">
                                <Card className="hover:shadow-lg transition-shadow">
                                    <div className="flex gap-4">
                                        <img 
                                            src={`${import.meta.env.VITE_IMAGE_URL}${item.image}`}
                                            alt={item.title}
                                            className="w-24 h-24 object-cover rounded"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = '/src/assets/img/default-news.png';
                                            }}
                                        />
                                        <div>
                                            <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                                            <p className="text-sm text-gray-600 mb-2">
                                                {new Date(item.created_at).toLocaleDateString('vi-VN')}
                                            </p>
                                            <p className="text-sm text-gray-700 line-clamp-2">{item.sub_title}</p>
                                        </div>
                                    </div>
                                </Card>
                            </LinkComponent>
                        );
                    }) : (
                        <div className="text-center p-4 bg-gray-100 rounded">
                            Không có tin tức nào
                        </div>
                    )}
                </div>
            </div>
            </div>
        </div>
    );
};

export default UserNews;


