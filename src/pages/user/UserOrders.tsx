import React, { useState, useEffect } from 'react';
import { TabMenu } from 'primereact/tabmenu';
import { Calendar } from 'primereact/calendar';
import { DataView } from 'primereact/dataview';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';

interface OrderItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
}

interface Order {
    id: string;
    date: Date;
    total: number;
    status: OrderStatus;
    items: OrderItem[];
}

const sampleOrders: Order[] = [
    {
        id: "ORD001",
        date: new Date('2025-01-15T10:30:00'),
        total: 18990000,
        status: 'delivered',
        items: [{
            id: "ITEM001",
            name: "Samsung Galaxy S21 8GB/128GB",
            price: 18990000,
            quantity: 1,
            image: "/src/assets/img/s21.png"
        }]
    },
    {
        id: "ORD002",
        date: new Date('2025-01-18T14:20:00'),
        total: 34990000,
        status: 'shipping',
        items: [{
            id: "ITEM002",
            name: "Samsung Galaxy Z Fold 3 12GB/256GB",
            price: 34990000,
            quantity: 1,
            image: "/images/products/zfold3.png"
        }]
    },
    {
        id: "ORD003",
        date: new Date('2025-01-20T09:15:00'),
        total: 19990000,
        status: 'pending',
        items: [{
            id: "ITEM003",
            name: "Samsung Galaxy Note 20 8GB/256GB",
            price: 19990000,
            quantity: 1,
            image: "/images/products/note20.png"
        }]
    },
    {
        id: "ORD004",
        date: new Date('2025-01-22T16:45:00'),
        total: 8290000,
        status: 'paid',
        items: [{
            id: "ITEM004",
            name: "Samsung Galaxy A52 6GB/128GB",
            price: 8290000,
            quantity: 1,
            image: "/images/products/a52.png"
        }]
    },
    {
        id: "ORD005",
        date: new Date('2025-01-25T11:30:00'),
        total: 18990000,
        status: 'cancelled',
        items: [{
            id: "ITEM005",
            name: "Samsung Galaxy S21 8GB/128GB",
            price: 18990000,
            quantity: 1,
            image: "/src/assets/img/s21.png"
        }]
    },
    {
        id: "ORD006",
        date: new Date('2025-01-28T13:20:00'),
        total: 34990000,
        status: 'delivered',
        items: [{
            id: "ITEM006",
            name: "Samsung Galaxy Z Fold 3 12GB/256GB",
            price: 34990000,
            quantity: 1,
            image: "/images/products/zfold3.png"
        }]
    },
    {
        id: "ORD007",
        date: new Date('2025-02-01T10:00:00'),
        total: 19990000,
        status: 'shipping',
        items: [{
            id: "ITEM007",
            name: "Samsung Galaxy Note 20 8GB/256GB",
            price: 19990000,
            quantity: 1,
            image: "/images/products/note20.png"
        }]
    },
    {
        id: "ORD008",
        date: new Date('2025-02-03T15:30:00'),
        total: 8290000,
        status: 'pending',
        items: [{
            id: "ITEM008",
            name: "Samsung Galaxy A52 6GB/128GB",
            price: 8290000,
            quantity: 1,
            image: "/images/products/a52.png"
        }]
    },
    {
        id: "ORD009",
        date: new Date('2025-02-05T12:45:00'),
        total: 18990000,
        status: 'paid',
        items: [{
            id: "ITEM009",
            name: "Samsung Galaxy S21 8GB/128GB",
            price: 18990000,
            quantity: 1,
            image: "/src/assets/img/s21.png"
        }]
    },
    {
        id: "ORD010",
        date: new Date('2025-02-08T09:15:00'),
        total: 34990000,
        status: 'delivered',
        items: [{
            id: "ITEM010",
            name: "Samsung Galaxy Z Fold 3 12GB/256GB",
            price: 34990000,
            quantity: 1,
            image: "/images/products/zfold3.png"
        }]
    }
];

type OrderStatus = 'all' | 'pending' | 'paid' | 'shipping' | 'delivered' | 'cancelled';

const UserOrders: React.FC = () => {
    const [isScrolledPastTabs, setIsScrolledPastTabs] = useState(false);
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>(sampleOrders);
    const [activeTab, setActiveTab] = useState(0);
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>(sampleOrders);

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

    const tabs = [
        { label: 'Tất cả', value: 'all' },
        { label: 'Chờ thanh toán', value: 'pending' },
        { label: 'Đã thanh toán', value: 'paid' },
        { label: 'Đang vận chuyển', value: 'shipping' },
        { label: 'Đã giao hàng', value: 'delivered' },
        { label: 'Đã hủy', value: 'cancelled' }
    ];

    const getStatusTag = (status: OrderStatus) => {
        const statusStyles: Record<Exclude<OrderStatus, 'all'>, string> = {
            pending: 'bg-yellow-100 text-yellow-800',
            paid: 'bg-blue-100 text-blue-800',
            shipping: 'bg-purple-100 text-purple-800',
            delivered: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800'
        };
        return `px-3 py-1 rounded-full text-sm ${status in statusStyles ? statusStyles[status as keyof typeof statusStyles] : ''}`;
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

    const OrderItem = ({ order }: { order: Order }) => (
        <div className="grid grid-cols-5 gap-4 p-4 border rounded-lg mb-4 bg-white">
            {/* Column 1: Image (20%) */}
            <div className="col-span-1 flex items-center justify-center">
                <div className="w-24 h-24">
                    <img
                        src={order.items[0].image}
                        alt={order.items[0].name}
                        className="w-full h-full object-contain rounded-lg"
                    />
                </div>
            </div>

            {/* Column 2: Details (80%) */}
            <div className="col-span-4 flex flex-col justify-between">
                {/* Row 1: Title and Date */}
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold">{order.items[0].name}</h3>
                    <span className="text-sm text-gray-600">
                        {new Date(order.date).toLocaleString('vi-VN')}
                    </span>
                </div>

                {/* Row 2: Status Tag */}
                <div className="mb-2">
                    <span className={getStatusTag(order.status)}>
                        {tabs.find(tab => tab.value === order.status)?.label}
                    </span>
                </div>

                {/* Row 3: Price and View Button */}
                <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-red-600">
                        {order.total.toLocaleString('vi-VN')} VND
                    </span>
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
                        Đơn hàng: {filteredOrders.length}
                    </h2>
                </div>
            </div>


            {/* Row 2: Date Filters */}
            <div className='flex rounded'>
                <div className="bg-white p-4 rounded-lg shadow flex gap-4">
                    <Calendar
                        value={startDate}
                        onChange={(e) => e.value !== undefined ? setStartDate(e.value) : setStartDate(null)}
                        placeholder="Từ ngày"
                        showIcon
                        className='border rounded-lg'
                    />
                    -
                    <Calendar
                        value={endDate}
                        onChange={(e) => e.value !== undefined ? setEndDate(e.value) : setEndDate(null)}
                        placeholder="Đến ngày"
                        showIcon
                        className='border rounded-lg'
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
                <DataView
                    value={filteredOrders}
                    itemTemplate={(order) => <OrderItem order={order} />}
                    paginator
                    rows={5}
                    emptyMessage="Không tìm thấy đơn hàng nào"
                />
            </div>
        </div>
    );
};

export default UserOrders;