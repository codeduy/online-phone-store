import React, { useState } from 'react';
import { Steps } from 'primereact/steps';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { AiOutlineUser, AiOutlinePhone, AiOutlineEnvironment } from 'react-icons/ai';

interface Product {
    image: string;
    name: string;
    warranty: string;
    quantity: number;
}

interface PaymentInfo {
    totalAmount: number;
    discount: number;
    shippingFee: number;
    amountToPay: number;
    amountPaid: number;
}

interface CustomerInfo {
    fullName: string;
    phoneNumber: string;
    address: string;
}

interface Order {
    id: number;
    status: string;
    orderDate: Date;
    products: Product[];
    paymentInfo: PaymentInfo;
    customerInfo: CustomerInfo;
}

const UserOrderDetail: React.FC = () => {
    const [order] = useState<Order>({
        id: 1,
        status: 'pending',
        orderDate: new Date('2025-01-20T12:02:00'),
        products: [
            {
                image: '/src/assets/img/s21.png',
                name: 'Samsung Galaxy S21',
                warranty: '12 tháng',
                quantity: 2,
            },
        ],
        paymentInfo: {
            totalAmount: 400000,
            discount: 50000,
            shippingFee: 30000,
            amountToPay: 380000,
            amountPaid: 380000,
        },
        customerInfo: {
            fullName: 'Nguyễn Văn A',
            phoneNumber: '0123456789',
            address: '123 Đường ABC, Quận 1, TP.HCM',
        },
    });

    const steps = [
        { label: 'Đặt hàng' },
        { label: 'Xác nhận' },
        { label: 'Đang vận chuyển' },
        { label: 'Hoàn thành' },
    ];

    const getStatusTag = (status: string) => {
        const statusConfig: Record<string, { severity: string; label: string }> = {
            pending: { severity: 'warning', label: 'Chờ thanh toán' },
            paid: { severity: 'info', label: 'Đã thanh toán' },
            shipping: { severity: 'info', label: 'Đang vận chuyển' },
            delivered: { severity: 'success', label: 'Đã giao hàng' },
            cancelled: { severity: 'danger', label: 'Đã hủy' }
        };
        return statusConfig[status] || { severity: 'info', label: status };
    };

    return (
        <div className="p-4 max-w-5xl mx-auto">
            {/* Row 1: Order Info */}
            <div className="grid grid-cols-2 mb-10">
                <div>
                    <h2 className="text-xl font-bold mb-4">Chi tiết đơn hàng</h2>
                    <div className="space-y-2">
                        <div>Mã đơn hàng: #{order.id}</div>
                        <div>Thời gian đặt hàng: {order.orderDate.toLocaleDateString('vi-VN')} {order.orderDate.toLocaleTimeString('vi-VN')}</div>
                    </div>
                </div>
                <div className="text-right">
                    <Tag 
                        severity={getStatusTag(order.status).severity as any}
                        value={getStatusTag(order.status).label}
                    />
                </div>
            </div>

            {/* Row 2: Product Info */}
            <div className="bg-white p-4 rounded-lg shadow mb-10">
                <div className="grid grid-cols-2">
                    <div className="flex">
                        <img src={order.products[0].image} alt={order.products[0].name} className="w-24 h-24 object-contain mr-4" />
                        <div>
                            <div className="font-semibold">{order.products[0].name}</div>
                            <div className="text-gray-600">Bảo hành: {order.products[0].warranty}</div>
                        </div>
                    </div>
                    <div className="text-right">
                        Số lượng: {order.products[0].quantity}
                    </div>
                </div>
            </div>

            {/* Row 3: Order Progress */}
            <div className="mb-10">
                <Steps model={steps} activeIndex={2} />
            </div>

            {/* Row 4: Payment Info */}
            <Card title="Thông tin thanh toán" className="mb-6">
                <div className="grid grid-cols-2 gap-y-2">
                    <div>Tổng tiền sản phẩm:</div>
                    <div className="text-right">{order.paymentInfo.totalAmount.toLocaleString('vi-VN')} VND</div>
                    <div>Giảm giá:</div>
                    <div className="text-right text-red-500">-{order.paymentInfo.discount.toLocaleString('vi-VN')} VND</div>
                    <div>Phí vận chuyển:</div>
                    <div className="text-right">{order.paymentInfo.shippingFee.toLocaleString('vi-VN')} VND</div>
                    <div className="font-bold">Phải thanh toán:</div>
                    <div className="text-right font-bold">{order.paymentInfo.amountToPay.toLocaleString('vi-VN')} VND</div>
                    <div>Đã thanh toán:</div>
                    <div className="text-right text-green-600">{order.paymentInfo.amountPaid.toLocaleString('vi-VN')} VND</div>
                </div>
            </Card>

            {/* Row 5: Customer Info */}
            <Card title="Thông tin nhận hàng" className='mb-6'>
                <div className="grid grid-cols-2 gap-y-2">
                    <div className="flex items-center gap-2">
                        <AiOutlineUser className="text-gray-600" />
                        Họ và tên:
                    </div>
                    <div className="text-right">{order.customerInfo.fullName}</div>
                    <div className="flex items-center gap-2">
                        <AiOutlinePhone className="text-gray-600" />
                        Số điện thoại:
                    </div>
                    <div className="text-right">{order.customerInfo.phoneNumber}</div>
                    <div className="flex items-center gap-2">
                        <AiOutlineEnvironment className="text-gray-600" />
                        Địa chỉ nhận hàng:
                    </div>
                    <div className="text-right">{order.customerInfo.address}</div>
                </div>
            </Card>

            {/* Row 6: Support Info */}
            <Card title="Thông tin hỗ trợ">
                <div className="grid grid-cols-2 gap-y-2">
                    <div className="flex items-center gap-2">
                        <AiOutlinePhone className="text-gray-600" />
                        Số điện thoại cửa hàng:
                    </div>
                    <div className="text-right">028 1234 5678</div>
                    <div className="flex items-center gap-2">
                        <AiOutlineEnvironment className="text-gray-600" />
                        Địa chỉ cửa hàng:
                    </div>
                    <div className="text-right">19 Nguyễn Hữu Thọ, P.Tân Phong, Q.7, TP.HCM</div>
                </div>
            </Card>
        </div>
    );
};

export default UserOrderDetail;