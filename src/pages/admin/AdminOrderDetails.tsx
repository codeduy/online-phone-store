import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Steps } from 'primereact/steps';
import { Dropdown } from 'primereact/dropdown';
import { Card } from 'primereact/card';
import axios from 'axios';
import { Toast } from 'primereact/toast';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  exp: number;
  role: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  color: string;
  warranty: string;
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

interface PaymentInfo {
  totalAmount: number;
  discount: number;
  shippingFee: number;
  amountToPay: number;
  amountPaid: number;
  paymentMethod: string;
  paymentStatus: string;
}

interface CustomerInfo {
  fullName: string;
  phoneNumber: string;
  address: string;
}

interface Order {
  id: string;
  status: string;
  orderDate: string;
  products: Product[];
  paymentInfo: PaymentInfo;
  customerInfo: CustomerInfo;
}

const AdminOrderDetails = () => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const toast = useRef<Toast>(null);
  const { id } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem('adminToken');
  console.log('Token:', token);

  const verifyToken = useCallback(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
        navigate('/admin/login', { 
            state: { message: 'Vui lòng đăng nhập để thao tác' } 
        });
        return false;
    }

    try {
        const decoded = jwtDecode<DecodedToken>(token);
        if (decoded.exp * 1000 < Date.now()) {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            navigate('/admin/login', { 
                state: { message: 'Phiên đăng nhập đã hết hạn' } 
            });
            return false;
        }

        if (decoded.role !== 'admin') {
            navigate('/admin/login', { 
                state: { message: 'Bạn không có quyền truy cập' } 
            });
            return false;
        }

        return true;
    } catch (error) {
        console.error('Token verification error:', error);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        navigate('/admin/login', { 
            state: { message: 'Phiên đăng nhập không hợp lệ' } 
        });
        return false;
    }
}, [navigate]);

// Add token check on component mount
useEffect(() => {
    verifyToken();
}, [verifyToken]);

  useEffect(() => {
    if (id) {
        fetchOrderDetails(id);
    }
}, [id]);

const fetchOrderDetails = async (orderId: string) => {
  if (!verifyToken()) return;

  try {
    setLoading(true);
    const token = localStorage.getItem('adminToken');
    const response = await axios.get(`/admin/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });

    if (response.data.success) {
        const orderData = response.data.data;
        
        // Debug log to check response data
        console.log('API Response:', orderData);
        
        // Check if items exist and is an array
        if (orderData && orderData.items && Array.isArray(orderData.items)) {
            // Format products data
            const formattedProducts = orderData.items.map((item: any) => ({
                id: item._id,
                name: item.product_id.name,
                price: item.price,
                quantity: item.quantity,
                warranty: item.product_id.warranty || '12 tháng',
                color: item.color || '',
                product_id: {
                    category_id: item.product_id.category_id,
                    name: item.product_id.name,
                    images: item.product_id.images,
                    price: item.product_id.price,
                    warranty: item.product_id.warranty,
                    ram: item.product_id.ram,
                    storage: item.product_id.storage,
                    baseProductName: item.product_id.baseProductName
                }
            }));

            setOrder({
                ...orderData,
                products: formattedProducts
            });
        } else {
            console.warn('Response data structure:', orderData);
            toast.current?.show({
                severity: 'error',
                summary: 'Lỗi',
                detail: 'Không tìm thấy thông tin sản phẩm trong đơn hàng'
            });
            setOrder({ ...orderData, products: [] });
        }
    }
} catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
          navigate('/admin/login', { 
              state: { message: 'Phiên đăng nhập đã hết hạn' } 
          });
          return;
      }
      console.error('Error fetching order details:', error);
      toast.current?.show({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Không thể tải thông tin đơn hàng'
      });
  } finally {
      setLoading(false);
  }
};

  const orderStatuses = [
    { key: 'pending', label: 'Đang xử lý' },
    { key: 'paid', label: 'Đã thanh toán' },
    { key: 'shipping', label: 'Đang vận chuyển' },
    { key: 'delivered', label: 'Hoàn thành' },
    { key: 'cancelled', label: 'Đã hủy' }
  ];

  const steps = [
    { label: 'Đặt hàng' },
    { label: 'Xác nhận' },
    { label: 'Đang vận chuyển' },
    { label: 'Hoàn thành' },
  ];

interface OrderStatus {
    key: string;
    label: string;
}

interface Step {
    label: string;
}

const handleStatusChange = async (newStatus: string) => {
  if (!verifyToken()) return;
  try {
    const token = localStorage.getItem('adminToken');
    const response = await axios.put(
      `/admin/orders/${id}/status`,
      { status: newStatus },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    if (response.data.success) {
      setOrder(prev => prev ? {...prev, status: newStatus} : null);
      toast.current?.show({
        severity: 'success',
        summary: 'Thành công',
        detail: 'Đã cập nhật trạng thái đơn hàng'
      });
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
        navigate('/admin/login', { 
            state: { message: 'Phiên đăng nhập đã hết hạn' } 
        });
        return;
    }
    console.error('Error updating order status:', error);
    toast.current?.show({
        severity: 'error',
        summary: 'Lỗi',
        detail: 'Không thể cập nhật trạng thái đơn hàng'
    });
  }
};

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!order) {
    return <div>Order not found</div>;
  }

  const getImageUrl = (product: Product): string => {
    console.log('Processing product:', {
        name: product.product_id.name,
        category: product.product_id.category_id,
        images: product.product_id.images
    });

    const baseUrl = `${import.meta.env.VITE_IMAGE_URL}`;

    // Get trademark from category_id
    let trademark = 'UNKNOWN';
    
    // Kiểm tra và lấy tên thương hiệu từ category_id
    if (product.product_id.category_id && 'name' in product.product_id.category_id) {
        trademark = product.product_id.category_id.name.toUpperCase();
        console.log('Found trademark from category:', trademark);
    }

    // Get product name and clean it
    const productName = product.product_id.baseProductName?.replace(/\s+/g, '') || 
                       product.product_id.name.replace(/[^a-zA-Z0-9]/g, '');

    // Construct the full path
    const imageName = product.product_id.images[0];
    const fullPath = `/images/phone/${trademark}/${productName}/${imageName}`;
    
    console.log('Image path details:', {
        baseUrl,
        trademark,
        productName,
        imageName,
        fullPath,
        categoryDetails: product.product_id.category_id
    });

    return `${baseUrl}${fullPath}`;
};

  return (
    <div style={{ padding: '1rem' }}>
      <Helmet>
          <title>Quản lí chi tiết đơn hàng</title>
          <link rel="icon" href="../../src/assets/img/phone.ico" />
      </Helmet>
        <Toast ref={toast} />

        {/* Header Information */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', marginBottom: '1.5rem' }}>
            <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>Chi tiết đơn hàng</h2>
                <div style={{ color: '#6b7280' }}>Mã đơn hàng: {order.id}</div>
                <div style={{ color: '#6b7280' }}>
                    Thời gian đặt hàng: {new Date(order.orderDate).toLocaleString('vi-VN')}
                </div>
            </div>
            <div style={{ textAlign: 'right' }}>
                <Dropdown
                    value={order.status}
                    options={orderStatuses}
                    onChange={(e) => handleStatusChange(e.value)}
                    optionLabel="label"
                    optionValue="key"
                    style={{ width: '100%', maxWidth: '50%' }}
                />
            </div>
        </div>

        {/* Products Section */}
        <Card title="Thông tin sản phẩm" style={{ marginBottom: '1rem' }}>
            {order.products.map((product, index) => (
                <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem', padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                        <img 
                            src={getImageUrl(product)} 
                            alt={product.name} 
                            style={{ width: '5rem', height: '5rem', objectFit: 'cover', marginRight: '1rem' }}
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/images/products/default.jpg';
                            }}
                        />
                        <div>
                            <div style={{ fontWeight: '500' }}>{product.name}</div>
                            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                Thời hạn bảo hành: {product.warranty}
                            </div>
                            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                Màu sắc: {product.color}
                            </div>
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div>Số lượng: {product.quantity}</div>
                        <div>Đơn giá: {product.price.toLocaleString('vi-VN')} VND</div>
                        <div className="font-medium text-blue-700">
                          Thành tiền: {(product.quantity * product.price).toLocaleString('vi-VN')} VND
                        </div>
                    </div>
                </div>
            ))}
        </Card>

        {/* Payment Information */}
        <Card title="Thông tin thanh toán" style={{ marginBottom: '1rem' }}>
          <div className="grid grid-cols-2 gap-4">
            <div>Tổng tiền sản phẩm:</div>
            <div className="text-right text-blue-700">{order.paymentInfo.totalAmount.toLocaleString('vi-VN')} VND</div>
            
            <div>Giảm giá:</div>
            <div className="text-right text-red-600">{order.paymentInfo.discount.toLocaleString('vi-VN')} VND</div>
            
            <div>Phí vận chuyển:</div>
            <div className="text-right">{order.paymentInfo.shippingFee.toLocaleString('vi-VN')} VND</div>
            
            <div className="font-medium text-blue-700">Tổng thanh toán:</div>
            <div className="text-right font-medium text-blue-700">{order.paymentInfo.amountToPay.toLocaleString('vi-VN')} VND</div>
            
            <div>Đã thanh toán:</div>
            <div className={`text-right ${order.paymentInfo.paymentStatus === 'paid' ? 'text-green-700' : 'text-red-600'}`}>
              {order.paymentInfo.amountPaid.toLocaleString('vi-VN')} VND
            </div>
            
            <div>Phương thức thanh toán:</div>
            <div className="text-right">
              {order.paymentInfo.paymentMethod === 'bank' ? 'Chuyển khoản' : 
              order.paymentInfo.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : 
              'Chưa xác định'}
            </div>
            
            <div>Trạng thái thanh toán:</div>
            <div className={`text-right ${order.paymentInfo.paymentStatus === 'paid' ? 'text-green-700' : 'text-red-600'}`}>
              {order.paymentInfo.paymentStatus === 'pending' ? 'Chưa thanh toán' :
              order.paymentInfo.paymentStatus === 'paid' ? 'Đã thanh toán' :
              order.paymentInfo.paymentStatus === 'failed' ? 'Thanh toán thất bại' :
              'Không xác định'}
            </div>
          </div>
        </Card>

        {/* Customer Information */}
        <Card title="Thông tin khách hàng">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>Họ và tên:</div>
                <div style={{ textAlign: 'right' }}>{order.customerInfo.fullName}</div>

                <div>Số điện thoại:</div>
                <div style={{ textAlign: 'right' }}>{order.customerInfo.phoneNumber}</div>

                <div>Địa chỉ nhận hàng:</div>
                <div style={{ textAlign: 'right' }}>{order.customerInfo.address}</div>
            </div>
        </Card>
    </div>
);

};


export default AdminOrderDetails;