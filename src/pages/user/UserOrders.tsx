import React, { useState, useEffect, useRef } from 'react';
import { TabMenu } from 'primereact/tabmenu';
import { Calendar } from 'primereact/calendar';
import { DataView } from 'primereact/dataview';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Toast } from 'primereact/toast';
import { Helmet } from 'react-helmet';

const API_URL = 'http://localhost:3000/api';

interface OrderItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    color: string;
    product_id: {
        category_id?: {
            _id: string;
            name: string;
        } | string;  
        ram?: string;
        storage?: string;
        baseProductName?: string;
    };
}

interface Order {
    id: string;
    date: Date;
    total: number;
    final_amount: number;
    discount: number;
    shipping_fee: number;
    status: OrderStatus;
    payment_method: string;
    payment_status: string;
    user_profile: {
        fullName: string;
        phone: string;
        address: string;
    };
    items: OrderItem[];
    created_at: Date;
    confirmed_at?: Date;
    shipped_at?: Date;
    delivered_at?: Date;
    cancelled_at?: Date;
}

type OrderStatus = 'all' | 'pending' | 'paid' | 'shipping' | 'delivered' | 'cancelled';

const UserOrders: React.FC = () => {
    const [isScrolledPastTabs, setIsScrolledPastTabs] = useState(false);
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);  // Initialize as empty array
    const [activeTab, setActiveTab] = useState(0);
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]); // Initialize as empty array
    const [loading, setLoading] = useState(true); // Start with loading true
    const [error, setError] = useState<string | null>(null);
    const toast = useRef<Toast>(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const token = localStorage.getItem('token');
                const userId = localStorage.getItem('userId');

                if (!token || !userId) {
                    setError('Vui lòng đăng nhập để xem đơn hàng');
                    return;
                }

                const response = await axios.get(
                    `${API_URL}/orders/user/${userId}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );

                if (response.data.success) {
                    console.log('Received orders:', response.data.data);
                    setOrders(response.data.data);
                    setFilteredOrders(response.data.data);
                } else {
                    throw new Error(response.data.message);
                }
            } catch (error: any) {
                console.error('Error fetching orders:', error);
                setError(error.response?.data?.message || 'Không thể tải danh sách đơn hàng');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');
    
            if (!token || !userId) {
                toast.current?.show({
                    severity: 'warn',
                    summary: 'Chưa đăng nhập',
                    detail: 'Vui lòng đăng nhập để xem danh sách đơn hàng',
                    life: 3000
                });
                setOrders([]);
                setFilteredOrders([]);
                return;
            }
    
            const params = new URLSearchParams();
            if (tabs[activeTab].value !== 'all') {
                params.append('status', tabs[activeTab].value);
            }
            if (startDate) {
                params.append('startDate', startDate.toISOString());
            }
            if (endDate) {
                params.append('endDate', endDate.toISOString());
            }
    
            const response = await axios.get(
                `${API_URL}/orders/user/${userId}${params.toString() ? `?${params.toString()}` : ''}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
    
            if (response.data.success) {
                setOrders(response.data.data);
                setFilteredOrders(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                setError('Phiên đăng nhập hết hạn');
            } else {
                setError(error instanceof Error ? error.message : 'Lỗi khi tải đơn hàng');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [activeTab, startDate, endDate]);

    useEffect(() => {
        const handleScroll = () => {
            const tabsElement = document.getElementById('status-tabs');
            if (tabsElement) {
                const tabsPosition = tabsElement.getBoundingClientRect().top;
                setIsScrolledPastTabs(tabsPosition < 0);
            }
        };
        
    
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        let filtered = [...orders];
    
        // Filter by status
        if (tabs[activeTab].value !== 'all') {
            filtered = filtered.filter(order => order.status === tabs[activeTab].value);
        }
    
        // Filter by date range
        if (startDate || endDate) {
            filtered = filtered.filter(order => {
                const orderDate = new Date(order.date);
                
                // Reset time parts to compare dates only
                const orderDateTime = new Date(
                    orderDate.getFullYear(),
                    orderDate.getMonth(),
                    orderDate.getDate()
                ).getTime();
    
                if (startDate && endDate) {
                    const start = new Date(
                        startDate.getFullYear(),
                        startDate.getMonth(),
                        startDate.getDate()
                    ).getTime();
                    const end = new Date(
                        endDate.getFullYear(),
                        endDate.getMonth(),
                        endDate.getDate()
                    ).getTime();
                    return orderDateTime >= start && orderDateTime <= end;
                } else if (startDate) {
                    const start = new Date(
                        startDate.getFullYear(),
                        startDate.getMonth(),
                        startDate.getDate()
                    ).getTime();
                    return orderDateTime >= start;
                } else if (endDate) {
                    const end = new Date(
                        endDate.getFullYear(),
                        endDate.getMonth(),
                        endDate.getDate()
                    ).getTime();
                    return orderDateTime <= end;
                }
                return true;
            });
        }
    
        setFilteredOrders(filtered);
    }, [activeTab, startDate, endDate, orders]);

    const tabs = [
        { label: 'Tất cả', value: 'all' },
        { label: 'Chờ thanh toán', value: 'pending' },
        { label: 'Đã thanh toán', value: 'paid' },
        { label: 'Đang vận chuyển', value: 'shipping' },
        { label: 'Đã giao hàng', value: 'delivered' },
        { label: 'Đã hủy', value: 'cancelled' }
    ];

    const getStatusTag = (status: OrderStatus) => {
        const statusStyles: Record<OrderStatus, string> = {
            all: 'bg-gray-100 text-gray-800 border border-gray-300',
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
            paid: 'bg-blue-100 text-blue-800 border-blue-300',
            shipping: 'bg-purple-100 text-purple-800 border-purple-300',
            delivered: 'bg-green-100 text-green-800 border-green-300',
            cancelled: 'bg-red-100 text-red-800 border-red-300'
        };
    
        return `px-3 py-1 rounded-full text-sm font-medium ${statusStyles[status]}`;
    };

    const getStatusLabel = (status: OrderStatus): string => {
        const statusLabels: Record<OrderStatus, string> = {
            all: 'Tất cả',
            pending: 'Chờ thanh toán',
            paid: 'Đã thanh toán',
            shipping: 'Đang vận chuyển',
            delivered: 'Đã giao hàng',
            cancelled: 'Đã hủy'
        };
        return statusLabels[status];
    };

    useEffect(() => {
        let filtered = [...orders];

        if (tabs[activeTab].value !== 'all') {
            filtered = filtered.filter(order => order.status === tabs[activeTab].value);
        }

        if (startDate && endDate) {
            filtered = filtered.filter(order => {
                const orderDate = new Date(order.date);
                return orderDate >= startDate && orderDate <= endDate;
            });
        }
        

        setFilteredOrders(filtered);
    }, [activeTab, startDate, endDate, orders]);

    const getImageUrl = (item: OrderItem): string => {
        // Check if item has product_id
        if (!item.product_id || !item.image) {
            console.warn('No image or product info found:', item);
            return '/fallback-image.jpg';
        }
    
        const baseUrl = API_URL.replace('/api', '');
    
        // If image path is already complete
        if (item.image.startsWith('/images/')) {
            const fullUrl = `${baseUrl}${item.image}`;
            console.log('Using existing image path:', fullUrl);
            return fullUrl;
        }
    
        // Get trademark from product name
        let trademark = 'UNKNOWN';
        if (item.product_id.category_id && 
            typeof item.product_id.category_id === 'object' && 
            'name' in item.product_id.category_id) {
            trademark = item.product_id.category_id.name.toUpperCase();
        } 
        // else if (item.name.toLowerCase().includes('iphone')) {
        //     trademark = 'APPLE';
        // } else if (item.name.toLowerCase().includes('samsung')) {
        //     trademark = 'SAMSUNG';
        // } else if (typeof item.product_id.category_id === 'string') {
        //     trademark = item.product_id.category_id.toUpperCase();
        // }
    
        // Get product name
        const productName = item.product_id.baseProductName?.replace(/\s+/g, '') || 
                           item.name.replace(/\s+/g, '');
    
        // Construct the full path
        const fullPath = `/images/phone/${trademark}/${productName}/${item.image}`;
        
        console.log('Generated image path:', {
            baseUrl,
            trademark,
            productName,
            imageName: item.image,
            fullPath
        });
    
        return `${baseUrl}${fullPath}`;
    };

    // Update the OrderItem component
    const OrderItem = ({ order }: { order: Order }) => (
        <div className="grid grid-cols-5 gap-4 p-4 border rounded-lg mb-4 bg-white">
            {/* Column 1: Image (20%) */}
            <div className="col-span-1 flex items-center justify-center">
                <div className="relative w-24 h-24">
                    <img
                        src={getImageUrl(order.items[0])}
                        alt={order.items[0].name}
                        className="w-full h-full object-contain rounded-lg"
                        // onError={(e) => {
                        //     console.error('Image load error:', {
                        //         product: order.items[0].name,
                        //         src: (e.target as HTMLImageElement).src
                        //     });
                        //     const target = e.target as HTMLImageElement;
                        //     target.onerror = null;
                        //     target.src = '/fallback-image.jpg';
                        // }}
                        // loading="lazy"
                    />
                </div>
            </div>

            {/* Column 2: Details (80%) */}
            <div className="col-span-4 flex flex-col justify-between">
                {/* Row 1: Title and Date */}
                <div className="flex justify-between items-start mb-2 flex-wrap">
                    <div className="flex-1 mr-4">
                        <div className="flex flex-wrap gap-1">
                            {order.items.map((item, index) => (
                                <span key={item.id} className="text-lg font-semibold">
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
                                    {index !== order.items.length - 1 && (
                                        <span className="mx-1 text-gray-400">,</span>
                                    )}
                                </span>
                            ))}
                        </div>
                    </div>
                    <span className="text-sm text-gray-600 whitespace-nowrap shrink-0">
                        {new Date(order.date).toLocaleString('vi-VN')}
                    </span>
                </div>

                {/* Row 2: Status Tag */}
                <div className="mb-2">
                    <span className={getStatusTag(order.status)}>
                        {getStatusLabel(order.status)}
                    </span>
                </div>

                {/* Row 3: Price and View Button */}
                <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                        <span className="text-xl font-bold text-red-600">
                            {order.total.toLocaleString('vi-VN')} VND
                        </span>
                        <span className="text-sm text-gray-600">
                            {order.items.length} sản phẩm
                        </span>
                    </div>
                    <Button
                        label="Xem chi tiết"
                        className="p-button-outlined border p-1"
                        onClick={() => navigate(`/orders/${order.id}`)}
                    />
                </div>
            </div>
        </div>
    );

    return (
        <div className="p-4 space-y-2">
            <Helmet>
                <title>Đơn hàng</title>
                <link rel="icon" href="../../src/assets/img/phone.ico" />
            </Helmet>
            <Toast ref={toast} />
            {/* Fixed container for tabs */}
            <div 
                className={`flex fixed top-0 bg-white z-50 transition-all duration-300 transform ${
                    isScrolledPastTabs ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'
                }`}
            >
                <div className="container mx-auto p-4">
                    <TabMenu 
                        model={tabs} 
                        activeIndex={activeTab} 
                        onTabChange={(e) => setActiveTab(e.index)}
                        className="shadow-lg"
                        pt={{
                            menuitem: ({ state }: { state: { active: boolean } }) => ({
                                className: state.active 
                                    ? 'bg-blue-50 cursor-pointer' 
                                    : 'hover:text-blue-600 cursor-pointer transition-colors duration-200'
                            })
                        }}
                    />
                </div>
            </div>

            {/* Row 1: Total Orders */}
            <div className='justify-center flex'>
                <div className="bg-white p-4 rounded-lg shadow">
                    <h2 className="text-xl font-bold">
                        Đơn hàng: {loading ? '...' : filteredOrders.length}
                    </h2>
                </div>
            </div>

            {/* Show error if exists */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}


            {/* Row 2: Date Filters */}
            <div className='flex rounded'>
                <div className="bg-white p-4 rounded-lg shadow flex gap-4">
                <Calendar
                    value={startDate}
                    onChange={(e) => {
                        const newDate = e.value ? new Date(e.value.setHours(0, 0, 0, 0)) : null;
                        setStartDate(newDate);
                    }}
                    placeholder="Từ ngày"
                    showIcon
                    className='p-2 border rounded-lg'
                />
                -
                <Calendar
                    value={endDate}
                    onChange={(e) => {
                        const newDate = e.value ? new Date(e.value.setHours(23, 59, 59, 999)) : null;
                        setEndDate(newDate);
                    }}
                    placeholder="Đến ngày"
                    showIcon
                    className='p-2 border rounded-lg'
                    minDate={startDate || undefined}
                />
                </div>
            </div>


            {/* Row 3: Status Tabs */}
            <div id="status-tabs" className='flex'>
                <div className="bg-white rounded-lg shadow">
                    <TabMenu 
                        model={tabs} 
                        activeIndex={activeTab} 
                        onTabChange={(e) => setActiveTab(e.index)}
                        className="shadow-lg"
                        pt={{
                            menuitem: ({ state }: { state: { active: boolean } }) => ({
                                className: state.active 
                                    ? 'bg-blue-50 cursor-pointer' 
                                    : 'hover:text-blue-600 cursor-pointer transition-colors duration-200'
                            })
                        }}
                    />
                </div>
            </div>


            {/* Row 4: Orders List */}
            <div className="bg-white rounded-lg shadow">
                {loading ? (
                    <div className="flex justify-center items-center p-8">
                        <i className="pi pi-spinner pi-spin text-2xl"></i>
                    </div>
                ) : (
                    <DataView
                        value={filteredOrders}
                        itemTemplate={(order) => <OrderItem order={order} />}
                        paginator
                        rows={5}
                        emptyMessage="Không tìm thấy đơn hàng nào"
                    />
                )}
            </div>
        </div>
    );
};

export default UserOrders;