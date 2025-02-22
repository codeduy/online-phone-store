import React, { useState, useEffect, ReactNode } from 'react';
import { Steps } from 'primereact/steps';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { AiOutlineUser, AiOutlinePhone, AiOutlineEnvironment } from 'react-icons/ai';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet';

const API_URL = 'http://localhost:3000/api';

interface OrderItem {
    warranty: ReactNode;
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    color: string;
    product_id: {
        trademark: any;
        baseProductName: any;
        name: string;
        images: string[];
        price: number;
        warranty: string;
        ram?: string;   
        storage?: string; 
    };
}

interface Order {
    id: string;
    status: OrderStatus;
    date: Date;
    items: OrderItem[];
    total: {
        subtotal: number;
        shipping: number;
        discount: number;
        final: number;
    };
    payment: {
        method: string;
        status: 'pending' | 'paid';
        paidAmount: number;
    };
    shipping: {
        fullName: string;
        phone: string;
        address: string;
    };
    progress: {
        created: Date;
        confirmed?: Date;
        shipped?: Date;
        delivered?: Date;
        cancelled?: Date;
    };
}

type OrderStatus = 'pending' | 'paid' | 'shipping' | 'delivered' | 'cancelled';

const UserOrderDetail: React.FC = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch order details
    useEffect(() => {
        const fetchOrderDetail = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('Vui lòng đăng nhập');
                }

                // Fetch order data with populated items
                const response = await axios.get(
                    `${API_URL}/orders/detail/${orderId}`,
                    {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }
                );

                if (response.data.success) {
                    const orderData = response.data.data;
                    
                    // Format dates
                    orderData.date = new Date(orderData.order_date);
                    orderData.date = new Date(orderData.createdAt);
                    orderData.progress = {
                        created: new Date(orderData.createdAt),
                        confirmed: orderData.confirmed_at ? new Date(orderData.confirmed_at) : undefined,
                        shipped: orderData.shipped_at ? new Date(orderData.shipped_at) : undefined,
                        delivered: orderData.delivered_at ? new Date(orderData.delivered_at) : undefined,
                        cancelled: orderData.cancelled_at ? new Date(orderData.cancelled_at) : undefined
                    };

                    // Format order items
                    orderData.items = orderData.items.map((item: any) => ({
                        id: item._id,
                        name: item.product_id.name,
                        image: item.product_id.images[0],
                        price: item.price,
                        quantity: item.quantity,
                        warranty: item.product_id.warranty || '12 tháng',
                        color: '', // Thêm color
                        product_id: {      // Thêm product_id object với ram và storage
                            name: item.product_id.name,
                            images: item.product_id.images,
                            price: item.product_id.price,
                            warranty: item.product_id.warranty,
                            ram: item.product_id.ram,
                            storage: item.product_id.storage
                        }
                    }));

                    // Format totals
                    orderData.total = {
                        subtotal: orderData.total_amount,
                        shipping: orderData.shipping_fee || 0,
                        discount: orderData.discount || 0,
                        final: orderData.final_amount
                    };

                    // Format payment info
                    orderData.payment = {
                        method: orderData.payment_method,
                        status: orderData.payment_status,
                        paidAmount: orderData.paid_amount || 0
                    };

                    // Format shipping info from user profile
                    orderData.shipping = {
                        fullName: orderData.user_profile.fullName,
                        phone: orderData.user_profile.phone,
                        address: orderData.user_profile.address
                    };

                    setOrder(orderData);
                }
            } catch (error) {
                console.error('Error fetching order detail:', error);
                setError(error instanceof Error ? error.message : 'Lỗi khi tải chi tiết đơn hàng');
            } finally {
                setLoading(false);
            }
        };

        if (orderId) {
            fetchOrderDetail();
        }
    }, [orderId]);

    // Loading state
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <i className="pi pi-spinner pi-spin text-2xl"></i>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="p-4 max-w-5xl mx-auto">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <p>{error}</p>
                    <Button 
                        label="Quay lại" 
                        className="mt-4"
                        onClick={() => navigate('/orders')}
                    />
                </div>
            </div>
        );
    }

    // Not found state
    if (!order) {
        return (
            <div className="p-4 max-w-5xl mx-auto">
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                    <p>Không tìm thấy đơn hàng</p>
                    <Button 
                        label="Quay lại" 
                        className="mt-4"
                        onClick={() => navigate('/orders')}
                    />
                </div>
            </div>
        );
    }

    const getStatusConfig = (status: OrderStatus) => {
        const config = {
            pending: { 
                severity: 'warning',
                label: 'Chờ thanh toán',
                className: 'bg-yellow-100 text-yellow-800 border border-yellow-300'
            },
            paid: {
                severity: 'info',
                label: 'Đã thanh toán',
                className: 'bg-blue-100 text-blue-800 border border-blue-300'
            },
            shipping: {
                severity: 'info',
                label: 'Đang vận chuyển',
                className: 'bg-purple-100 text-purple-800 border border-purple-300'
            },
            delivered: {
                severity: 'success',
                label: 'Đã giao hàng',
                className: 'bg-green-100 text-green-800 border border-green-300'
            },
            cancelled: {
                severity: 'danger',
                label: 'Đã hủy',
                className: 'bg-red-100 text-red-800 border border-red-300'
            }
        };
        return config[status];
    };

    const getPaymentStatus = (orderStatus: OrderStatus) => {
        // If order is either paid, delivered, or shipping, it means payment is completed
        if (['paid', 'delivered', 'shipping'].includes(orderStatus)) {
            return {
                status: 'paid' as const,
                severity: 'success' as const,
                label: 'Đã thanh toán'
            };
        }
        
        // If order is cancelled, show special status
        if (orderStatus === 'cancelled') {
            return {
                status: 'cancelled' as const,
                severity: 'danger' as const,
                label: 'Đã hủy'
            };
        }
        
        // Default case (pending)
        return {
            status: 'pending' as const,
            severity: 'warning' as const,
            label: 'Chưa thanh toán'
        };
    };

    const getImageUrl = (item: OrderItem): string => {
        console.log('Processing image for item:', {
            itemId: item.id,
            name: item.name,
            image: item.image,
            productId: item.product_id
        });
    
        if (!item.product_id.images?.[0]) {
            console.warn('No image found for product:', item.product_id.name);
            return '/fallback-image.jpg';
        }
    
        const baseUrl = API_URL.replace('/api', '');
    
        // If image path is already complete
        if (item.product_id.images[0].startsWith('/images/')) {
            const fullUrl = `${baseUrl}${item.product_id.images[0]}`;
            console.log('Using existing image path:', fullUrl);
            return fullUrl;
        }
    
        // Get trademark from product_id
        const trademark = item.product_id.trademark?.toUpperCase() || 
                         (item.product_id.name.toLowerCase().includes('iphone') ? 'APPLE' : 
                         item.product_id.name.toLowerCase().includes('samsung') ? 'SAMSUNG' : 'UNKNOWN');
    
        // Get baseProductName or format name
        const productName = item.product_id.baseProductName?.replace(/\s+/g, '') || 
                           item.product_id.name.replace(/\s+/g, '');
    
        const fullPath = `/images/phone/${trademark}/${productName}/${item.product_id.images[0]}`;
        
        console.log('Generated image path:', {
            baseUrl,
            trademark,
            productName,
            imageName: item.product_id.images[0],
            fullPath
        });
    
        return `${baseUrl}${fullPath}`;
    };

    return (
        <div className="p-4 max-w-5xl mx-auto">
            <Helmet>
                <title>Chi tiết đơn hàng</title>
                <link rel="icon" href="../../src/assets/img/phone.ico" />
            </Helmet>
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <Button 
                        icon="pi pi-arrow-left"
                        className="p-button-text mb-2"
                        onClick={() => navigate('/orders')}
                    />
                    <h2 className="text-2xl font-bold">Đơn hàng #{order.id}</h2>
                    <p className="text-gray-600">
                        Đặt ngày {new Date(order.date).toLocaleDateString('vi-VN')} lúc{' '}
                        {new Date(order.date).toLocaleTimeString('vi-VN')}
                    </p>
                </div>
                <Tag
                    value={getStatusConfig(order.status).label}
                    severity={getStatusConfig(order.status).severity as any}
                    className={getStatusConfig(order.status).className}
                />
            </div>

            {/* Products */}
            <Card className="mb-6">
                <h3 className="text-xl font-semibold mb-4">Sản phẩm</h3>
                {order.items.map((item) => (
                    <div key={item.id} className="grid grid-cols-2 gap-4 mb-4 last:mb-0 p-4 border rounded-lg">
                        <div className="flex">
                            <img 
                                src={getImageUrl(item)} 
                                alt={item.product_id.name} 
                                className="w-24 h-24 object-contain rounded-lg mr-4" 
                            />
                            <div>
                                <div className="font-semibold">
                                    {item.name}
                                    {/* If product name includes "iPhone", only show storage */}
                                    {item.name.toLowerCase().includes('iphone') ? (
                                        item.product_id?.storage && ` ${item.product_id.storage}`
                                    ) : (
                                        <>
                                            {item.product_id?.ram && ` ${item.product_id.ram}`}
                                            {item.product_id?.storage && `/${item.product_id.storage}`}
                                        </>
                                    )}
                                    {/* {item.color && ` - ${item.color}`} */}
                                </div>
                                <div className="text-gray-600">Bảo hành: {item.warranty}</div>
                                <div className="text-red-600">
                                    {item.price.toLocaleString('vi-VN')} VND
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div>Số lượng: {item.quantity}</div>
                            <div className="font-semibold mt-2">
                                Thành tiền: {(item.price * item.quantity).toLocaleString('vi-VN')} VND
                            </div>
                        </div>
                    </div>
                ))}
            </Card>

            {/* Payment Summary */}
            <Card className="mb-6">
                <h3 className="text-xl font-semibold mb-4">Tổng quan thanh toán</h3>
                <div className="grid grid-cols-2 gap-y-3">
                    <div>Tổng tiền sản phẩm:</div>
                    <div className="text-right">
                        {order.total.subtotal.toLocaleString('vi-VN')} VND
                    </div>
                    
                    <div>Giảm giá:</div>
                    <div className="text-right text-red-500">
                        -{order.total.discount.toLocaleString('vi-VN')} VND
                    </div>
                    
                    <div>Phí vận chuyển:</div>
                    <div className="text-right">
                        {order.total.shipping.toLocaleString('vi-VN')} VND
                    </div>
                    
                    <div className="font-bold">Tổng thanh toán:</div>
                    <div className="text-right font-bold">
                        {order.total.final.toLocaleString('vi-VN')} VND
                    </div>
                    
                    <div>Đã thanh toán:</div>
                    <div className="text-right text-green-600">
                        {(['paid', 'delivered', 'shipping'].includes(order.status) 
                            ? order.total.final 
                            : order.payment.paidAmount
                        ).toLocaleString('vi-VN')} VND
                    </div>
                    
                    <div>Phương thức thanh toán:</div>
                    <div className="text-right">{order.payment.method}</div>
                    
                    <div>Trạng thái thanh toán:</div>
                    <div className="text-right">
                        <Tag 
                            severity={getPaymentStatus(order.status).severity}
                            value={getPaymentStatus(order.status).label}
                        />
                    </div>
                </div>
            </Card>

            {/* Customer Info */}
            <Card className="mb-6">
                <h3 className="text-xl font-semibold mb-4">Thông tin nhận hàng</h3>
                <div className="grid grid-cols-2 gap-y-3">
                    <div className="flex items-center gap-2">
                        <AiOutlineUser className="text-gray-600" />
                        Người nhận:
                    </div>
                    <div className="text-right">{order.shipping.fullName || 'Chưa có thông tin'}</div>

                    <div className="flex items-center gap-2">
                        <AiOutlinePhone className="text-gray-600" />
                        Số điện thoại:
                    </div>
                    <div className="text-right">{order.shipping.phone || 'Chưa có thông tin'}</div>

                    <div className="flex items-center gap-2">
                        <AiOutlineEnvironment className="text-gray-600" />
                        Địa chỉ:
                    </div>
                    <div className="text-right">{order.shipping.address || 'Chưa có thông tin'}</div>
                </div>
            </Card>
        </div>
    );
};

export default UserOrderDetail;