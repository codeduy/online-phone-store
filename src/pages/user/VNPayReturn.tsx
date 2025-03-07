import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const VNPayReturn = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(true);

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                const params = Object.fromEntries(searchParams.entries());
                const token = localStorage.getItem('token');
                
                const response = await axios.post(
                    'http://localhost:3000/api/vnpay/verify-payment',
                    params,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                if (response.data.code === '00') {
                    // Thanh toán thành công
                    const pendingOrder = localStorage.getItem('pendingOrder');
                    if (pendingOrder) {
                        // Tạo đơn hàng
                        await createOrder(JSON.parse(pendingOrder));
                    }
                    navigate('/payment-success');
                } else {
                    // Thanh toán thất bại
                    navigate('/payment-failed');
                }
            } catch (error) {
                console.error('Payment verification error:', error);
                navigate('/payment-failed');
            } finally {
                setIsProcessing(false);
            }
        };

        verifyPayment();
    }, [searchParams, navigate]);

    const createOrder = async (orderData: any) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                'http://localhost:3000/api/orders/create',
                orderData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                localStorage.removeItem('pendingOrder');
            }
        } catch (error) {
            console.error('Error creating order:', error);
        }
    };

    if (isProcessing) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Đang xử lý thanh toán...</p>
                </div>
            </div>
        );
    }

    return null;
};

export default VNPayReturn;