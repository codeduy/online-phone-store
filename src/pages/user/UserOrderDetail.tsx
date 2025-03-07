import React, { useState, useEffect, ReactNode, useRef } from 'react';
import { Steps } from 'primereact/steps';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { AiOutlineUser, AiOutlinePhone, AiOutlineEnvironment } from 'react-icons/ai';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';

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
        category_id: {
            _id: string;
            name: string;
            description?: string;
            parent_category_id?: string | null;
            link?: string;
            meta?: string;
            logo_url?: string;
        };
        name: string;
        images: string[];
        price: number;
        warranty: string;
        ram?: string;
        storage?: string;
        baseProductName?: string;
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
    const toast = useRef<Toast>(null);

    const handleCancelOrder = async () => {
        if (!order) {
            return;
        }
        confirmDialog({
            message: 'Bạn có chắc chắn muốn hủy đơn hàng này không?',
            header: 'Xác nhận hủy đơn hàng',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Hủy đơn hàng',
            rejectLabel: 'Không',
            acceptClassName: 'px-4 py-2 bg-white text-red-600 border border-red-300 rounded-lg hover:bg-red-50 hover:border-red-400 transition-colors duration-200',
            rejectClassName: 'px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-colors duration-200',
            pt: {
                root: { className: 'border rounded-lg shadow-lg' },
                header: { className: 'text-xl font-semibold text-gray-800 p-4 border-b bg-gray-50' },
                content: { className: 'p-6 flex flex-col items-center gap-4' },
                icon: { className: 'text-yellow-500 text-3xl' },
                message: { className: 'text-gray-600 text-center' },
                footer: { className: 'flex justify-end gap-3 p-4 bg-gray-50 border-t' }
            },
            accept: async () => {
                try {
                    const token = localStorage.getItem('token');
                    const response = await axios.put(
                        `${API_URL}/orders/${orderId}/status`,
                        { status: 'cancelled' },
                        {
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );
    
                    if (response.data.success) {
                        // Update local order state
                        setOrder(prev => prev ? { ...prev, status: 'cancelled' } : null);
                        
                        toast.current?.show({
                            severity: 'success',
                            summary: 'Thành công',
                            detail: 'Đã hủy đơn hàng'
                        });
                    }
                } catch (error) {
                    console.error('Cancel order error:', error);
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Lỗi',
                        detail: 'Không thể hủy đơn hàng'
                    });
                }
            }
        });
    };

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
                        color: '', 
                        product_id: {     
                            name: item.product_id.name,
                            images: item.product_id.images,
                            price: item.product_id.price,
                            warranty: item.product_id.warranty,
                            ram: item.product_id.ram,
                            storage: item.product_id.storage,
                            category_id: item.product_id.category_id,
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
        // Debug log
        console.log('Processing item:', {
            name: item.product_id.name,
            category: item.product_id.category_id,
            images: item.product_id.images
        });
    
        // if (!item.product_id.images?.[0]) {
        //     console.warn('No image found for product:', item.product_id.name);
        //     return '/fallback-image.jpg';
        // }
    
        const baseUrl = API_URL.replace('/api', '');
    
        // Get trademark from category_id
        let trademark = 'UNKNOWN';
        
        // Kiểm tra và lấy tên thương hiệu từ category_id
        if (item.product_id.category_id && 'name' in item.product_id.category_id) {
            trademark = item.product_id.category_id.name.toUpperCase();
            console.log('Found trademark from category:', trademark);
        }
    
        // Fallback nếu không tìm thấy trademark
        // if (trademark === 'UNKNOWN') {
        //     const productName = item.product_id.name.toLowerCase();
        //     if (productName.includes('iphone')) {
        //         trademark = 'APPLE';
        //     } else if (productName.includes('samsung')) {
        //         trademark = 'SAMSUNG';
        //     } else if (productName.includes('xiaomi')) {
        //         trademark = 'XIAOMI';
        //     }
        //     console.log('Using fallback trademark:', trademark);
        // }
    
        // Get product name and clean it
        const productName = item.product_id.baseProductName?.replace(/\s+/g, '') || 
                           item.product_id.name.replace(/[^a-zA-Z0-9]/g, '');
    
        // Construct the full path
        const imageName = item.product_id.images[0];
        const fullPath = `/images/phone/${trademark}/${productName}/${imageName}`;
        
        console.log('Image path details:', {
            baseUrl,
            trademark,
            productName,
            imageName,
            fullPath,
            categoryDetails: item.product_id.category_id
        });
    
        return `${baseUrl}${fullPath}`;
    };
    
    const handlePayment = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Lỗi',
                    detail: 'Vui lòng đăng nhập để thanh toán'
                });
                return;
            }
    
            // Tạo URL thanh toán VNPay mới
            const vnpayResponse = await axios.post(
                `${API_URL}/vnpay/create_payment_url`,
                {
                    amount: order.total.final,
                    orderId: order.id
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
    
            if (vnpayResponse.data.code === '00') {
                window.location.href = vnpayResponse.data.data;
            } else {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Lỗi',
                    detail: 'Không thể tạo liên kết thanh toán'
                });
            }
        } catch (error) {
            console.error('Payment error:', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Lỗi',
                detail: 'Không thể kết nối đến cổng thanh toán'
            });
        }
    };

    return (
        <div className="p-4 max-w-5xl mx-auto">
            <Toast ref={toast} />
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
                    <div className="flex items-center justify-between gap-4">
                        <h2 className="text-2xl font-bold">Đơn hàng #{order.id}</h2>
                        {order.status === 'pending' && (
                            <Button
                                label="Hủy đơn hàng"
                                icon="pi pi-times"
                                className="px-4 py-2 bg-white text-red-600 border border-red-300 rounded-lg hover:bg-red-50 hover:border-red-400 transition-colors duration-200"
                                onClick={handleCancelOrder}
                            />
                        )}
                    </div>                  
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
            <ConfirmDialog />

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
                    <div className="text-right">{order.payment.method.toUpperCase()}</div>
                    
                    <div>Trạng thái thanh toán:</div>
                    <div className="text-right">
                        <Tag 
                            severity={getPaymentStatus(order.status).severity}
                            value={getPaymentStatus(order.status).label}
                        />
                    </div>

                    {order.status === 'pending' && order.payment.method === 'vnpay' && (
                        <>
                            <div></div>
                            <div className="text-right">
                                <Button
                                    label="Đến trang thanh toán"
                                    icon="pi pi-credit-card"
                                    onClick={handlePayment}
                                    className="p-button-success"
                                />
                            </div>
                        </>
                    )}
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