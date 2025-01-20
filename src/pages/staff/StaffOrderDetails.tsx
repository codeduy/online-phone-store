import React, { useState } from 'react';
import { Steps } from 'primereact/steps';
import { Dropdown } from 'primereact/dropdown';
import { Card } from 'primereact/card';

const StaffOrderDetails = () => {
  const [order, setOrder] = useState({
    id: 1,
    status: 'pending',
    orderDate: new Date('2025-01-20T12:02:00'),
    products: [
      {
        image: 'path/to/image.jpg',
        name: 'Sản phẩm A',
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

  const orderStatuses = [
    { key: 'pending', label: 'Đang chờ thanh toán' },
    { key: 'paid', label: 'Đã thanh toán' },
    { key: 'processing', label: 'Đang xử lý' },
    { key: 'shipping', label: 'Đang vận chuyển' },
    { key: 'completed', label: 'Hoàn thành' },
    { key: 'cancelled', label: 'Đã hủy' },
  ];

  const steps = [
    { label: 'Đặt hàng' },
    { label: 'Xác nhận' },
    { label: 'Đang vận chuyển' },
    { label: 'Hoàn thành' },
  ];

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

interface OrderStatus {
    key: string;
    label: string;
}

interface Step {
    label: string;
}

const handleStatusChange = (e: { value: string }) => {
    setOrder({ ...order, status: e.value });
};

  return (
    <div className="p-4">
      {/* Row 1 */}
      <div className="grid grid-cols-2 mb-10 ">
        <div>
          <div>Mã đơn hàng: {order.id}</div>
          <div>Thời gian đặt hàng: {order.orderDate.toLocaleDateString()} {order.orderDate.toLocaleTimeString()}</div>
        </div>
        <div className="text-right">
          <Dropdown
            value={order.status}
            options={orderStatuses}
            onChange={handleStatusChange}
            optionLabel="label"
            placeholder="Chọn trạng thái"
            className="w-1/2"
          />
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-2 mb-10">
        <div className="flex">
          <img src={order.products[0].image} alt={order.products[0].name} className="w-20 h-20 mr-4" />
          <div>
            <div>{order.products[0].name}</div>
            <div>Thời hạn bảo hành: {order.products[0].warranty}</div>
          </div>
        </div>
        <div className="text-right">
          Số lượng: {order.products[0].quantity}
        </div>
      </div>

      {/* Row 3 */}
      <div className="mb-10">
        <Steps model={steps} activeIndex={2} />
      </div>

      {/* Row 4 */}
      <Card title="Thông tin thanh toán" className="mb-4">
        <div className="grid grid-cols-2">
          <div>Tổng tiền sản phẩm:</div>
          <div className="text-right">{order.paymentInfo.totalAmount.toLocaleString()} VND</div>
          <div>Giảm giá:</div>
          <div className="text-right">{order.paymentInfo.discount.toLocaleString()} VND</div>
          <div>Phí vận chuyển:</div>
          <div className="text-right">{order.paymentInfo.shippingFee.toLocaleString()} VND</div>
          <div>Phải thanh toán:</div>
          <div className="text-right">{order.paymentInfo.amountToPay.toLocaleString()} VND</div>
          <div>Đã thanh toán:</div>
          <div className="text-right">{order.paymentInfo.amountPaid.toLocaleString()} VND</div>
        </div>
      </Card>

      {/* Row 5 */}
      <Card title="Thông tin khách hàng">
        <div className="grid grid-cols-2">
          <div>Họ và tên:</div>
          <div className="text-right">{order.customerInfo.fullName}</div>
          <div>Số điện thoại:</div>
          <div className="text-right">{order.customerInfo.phoneNumber}</div>
          <div>Địa chỉ nhận hàng:</div>
          <div className="text-right">{order.customerInfo.address}</div>
        </div>
      </Card>
    </div>
  );
};

export default StaffOrderDetails;