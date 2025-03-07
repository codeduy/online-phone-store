import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Toast } from 'primereact/toast';

const PaymentResult = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const status = searchParams.get('status');
    const toast = React.useRef<Toast>(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const status = params.get('status');
        const orderInfo = params.get('orderInfo');
    
        if (status === 'success') {
            toast.current?.show({
                severity: 'success',
                summary: 'Thành công',
                detail: 'Thanh toán thành công. Đơn hàng của bạn đã được xác nhận.'
            });
            
            // Redirect to order detail page
            const orderId = orderInfo?.split('_')[1];
            if (orderId) {
                setTimeout(() => {
                    navigate(`/orders/${orderId}`);
                }, 2000);
            }
        }
    }, []);

    useEffect(() => {
        const createOrder = async () => {
            if (status === 'success') {
                try {
                    const pendingOrder = localStorage.getItem('pendingOrder');
                    if (pendingOrder) {
                        const token = localStorage.getItem('token');
                        await axios.post(
                            'http://localhost:3000/api/orders/create',
                            JSON.parse(pendingOrder),
                            {
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Content-Type': 'application/json'
                                }
                            }
                        );
                        localStorage.removeItem('pendingOrder');
                    }
                } catch (error) {
                    console.error('Error creating order:', error);
                }
            }
        };

        createOrder();
    }, [status]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            {status === 'success' ? (
                <div className="text-center">
                    <i className="pi pi-check-circle text-6xl text-green-500 mb-4"></i>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Thanh toán thành công</h2>
                    <h1>Quý khách vui lòng đợi nhân viên cửa hàng liên hệ xác nhận đơn hàng!</h1>
                    <p className="text-gray-600 mb-4">
                        Số tiền: {Number(searchParams.get('amount')).toLocaleString('vi-VN')}đ
                    </p>
                    <button 
                        onClick={() => navigate('/orders')}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Xem đơn hàng
                    </button>
                </div>
            ) : (
                <div className="text-center">
                    <i className="pi pi-times-circle text-6xl text-red-500 mb-4"></i>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Thanh toán thất bại</h2>
                    <p className="text-gray-600 mb-4">{searchParams.get('message')}</p>
                    <button 
                        onClick={() => navigate('/cart')}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Quay lại giỏ hàng
                    </button>
                </div>
            )}
        </div>
    );
};

export default PaymentResult;