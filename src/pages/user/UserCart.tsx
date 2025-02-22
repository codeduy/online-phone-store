import React, { createContext, useState, useContext, useRef, useEffect } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { RadioButton } from 'primereact/radiobutton';
import { Checkbox } from 'primereact/checkbox';
import { useCart } from './CartContext';
import { Helmet } from 'react-helmet';
import axios from 'axios';
import { Toast } from 'primereact/toast';
import { useLocation, useNavigate  } from 'react-router-dom';

const API_URL = 'http://localhost:3000/api';

interface CreateOrderPayload {
  items: {
      product_id: string;
      quantity: number;
      price: number;
      color?: string;
  }[];
  shipping_info: {
      fullName: string;
      phone: string;
      address: string;
  };
  total_amount: number;
  shipping_fee: number;
  discount?: number;
  final_amount: number;
  voucher_code?: string;
  status: 'pending';
}

interface UserProfile {
  full_name: string;
  phone_number: string;
  address: string;
}

const UserCart = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
    useEffect(() => {
    // Check if we should scroll to top
    if (location.state?.scrollToTop) {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
  }, [location]);

  const { 
    cartItems, 
    loading, 
    error, 
    removeFromCart, 
    updateQuantity,
    total,
    appliedVoucher,
    discountAmount,
    finalAmount,
    fetchCart,
    setCartItems,
    applyVoucher,
    removeVoucher 
  } = useCart();

  const [deliveryOption, setDeliveryOption] = useState('delivery');
  const [showDeliveryDialog, setShowDeliveryDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank');
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isLoadingVoucher, setIsLoadingVoucher] = useState(false);
  const [userInfo, setUserInfo] = useState({
    fullName: '',
    phone: '',
    address: '',
    gender: 'Anh',
    otherReceiver: false
  });

  useEffect(() => {
    const clearCartAfterOrder = async () => {
        if (cartItems.length === 0) {
            try {
                // Clear cart in backend
                const token = localStorage.getItem('token');
                if (token) {
                    await axios.delete(`${API_URL}/cart/clear`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                }
            } catch (error) {
                console.error('Error clearing cart:', error);
            }
        }
    };

    clearCartAfterOrder();
}, [cartItems.length]);

const handleCreateOrder = async () => {
  try {
      if (!userProfile) {
          toast.current?.show({
              severity: 'warn',
              summary: 'Thông báo',
              detail: 'Vui lòng cập nhật thông tin nhận hàng',
              life: 3000
          });
          return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
          toast.current?.show({
              severity: 'error',
              summary: 'Lỗi',
              detail: 'Vui lòng đăng nhập để đặt hàng',
              life: 3000
          });
          return;
      }

      const orderData = {
          items: cartItems.map(item => ({
              product_id: item.product_id._id,
              quantity: item.quantity,
              price: item.price,
              color: '',
              link: item.product_id.images?.[0] || ''
          })),
          shipping_info: {
              fullName: userInfo.fullName || userProfile.full_name,
              phone: userInfo.phone || userProfile.phone_number,
              address: userInfo.address || userProfile.address
          },
          total_amount: total,
          shipping_fee: 0,
          discount: discountAmount,
          final_amount: finalAmount,
          payment_method: paymentMethod
      };

      const response = await axios.post(
          `${API_URL}/orders/create`,
          orderData,
          {
              headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
              }
          }
      );

      if (response.data.success) {
          await setCartItems([]);
          
          if (appliedVoucher) {
              await removeVoucher();
          }

          toast.current?.show({
              severity: 'success',
              summary: 'Thành công',
              detail: 'Đã tạo đơn hàng thành công',
              life: 3000
          });

          navigate(`/orders/${response.data.data.id}`);
      }
  } catch (error: any) {
      console.error('Error creating order:', error);
      toast.current?.show({
          severity: 'error',
          summary: 'Lỗi',
          detail: error.response?.data?.message || 'Lỗi khi tạo đơn hàng',
          life: 3000
      });
  }
};

  useEffect(() => {
    if (appliedVoucher) {
      setDiscountCode(appliedVoucher.code);
    }
  }, [appliedVoucher]);


  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 50) { // Limit name length
      setUserInfo(prev => ({
        ...prev,
        fullName: value
      }));
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, ''); // Only allow digits
    if (value.length <= 10) { // Limit to 10 digits
      setUserInfo(prev => ({
        ...prev,
        phone: value
      }));
    }
  };

  const handleUpdateUserInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      if (!token || !userId) {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Vui lòng đăng nhập để cập nhật thông tin'
        });
        return;
      }
  
      // Send update request to backend
      const response = await axios.put(
        `${API_URL}/users/profile/${userId}`,
        {
          full_name: userInfo.fullName,
          phone_number: userInfo.phone,
          address: userInfo.address
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
  
      if (response.data.success) {
        // Update local state
        setUserProfile({
          full_name: userInfo.fullName,
          phone_number: userInfo.phone,
          address: userInfo.address
        });
  
        toast.current?.show({
          severity: 'success',
          summary: 'Thành công',
          detail: 'Đã cập nhật thông tin thành công'
        });
  
        setShowConfirmDialog(false);
      } else {
        throw new Error(response.data.message || 'Cập nhật thông tin thất bại');
      }
    } catch (error) {
      console.error('Error updating user info:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Lỗi',
        detail: 'Không thể cập nhật thông tin. Vui lòng thử lại sau.'
      });
    }
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        
        if (!token || !userId) {
          console.log('No token or userId found');
          return;
        }
  
        const response = await axios.get(
          `${API_URL}/users/profile/${userId}`,
          {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
  
        if (response.data.success) {
          setUserProfile(response.data.data);
          // Pre-fill userInfo with profile data
          setUserInfo(prevInfo => ({
            ...prevInfo,
            fullName: response.data.data.full_name || '',
            phone: response.data.data.phone_number || '',
            address: response.data.data.address || ''
          }));
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };
  
    fetchUserProfile();
  }, []);

  const toast = useRef<Toast>(null);

  const handleQuantityChange = async (id: string, newQuantity: number) => {
    try {
        if (newQuantity < 1) {
            toast.current?.show({
                severity: 'warn',
                summary: 'Cảnh báo',
                detail: 'Số lượng phải lớn hơn 0'
            });
            return;
        }
        
        await updateQuantity(id, newQuantity);
        toast.current?.show({
            severity: 'success',
            summary: 'Thành công',
            detail: 'Đã cập nhật số lượng'
        });
    } catch (error: any) {
        toast.current?.show({
            severity: 'error',
            summary: 'Lỗi',
            detail: error.message || 'Không thể cập nhật số lượng'
        });
        
        // Refresh cart để đồng bộ lại số lượng
        await fetchCart();
    }
};

  const handleDeleteItem = (id: string) => {
    setItemToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
        try {
            await removeFromCart(itemToDelete);
            
            toast.current?.show({
                severity: 'success',
                summary: 'Thành công',
                detail: 'Đã xóa sản phẩm khỏi giỏ hàng'
            });

            await fetchCart();
            
            if (cartItems.length === 1) {
                setCartItems([]);
            }
        } catch (error: any) {
            toast.current?.show({
                severity: 'error',
                summary: 'Lỗi',
                detail: error.message || 'Không thể xóa sản phẩm'
            });
        }
    }
    setShowDeleteDialog(false);
    setItemToDelete(null);
  };

  const handleRemoveVoucher = async () => {
    try {
        const token = localStorage.getItem('token');
        
        if (!token) {
            toast.current?.show({
                severity: 'error',
                summary: 'Lỗi',
                detail: 'Vui lòng đăng nhập để thực hiện'
            });
            return;
        }

        const response = await axios.delete(
            `${API_URL}/cart/remove-voucher`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (response.data.success) {
            setDiscountCode('');
            await fetchCart(); // Refresh cart data
            toast.current?.show({
                severity: 'info',
                summary: 'Thông báo',
                detail: 'Đã hủy mã giảm giá'
            });
        }
    } catch (error: any) {
        toast.current?.show({
            severity: 'error',
            summary: 'Lỗi',
            detail: error.response?.data?.message || 'Không thể hủy mã giảm giá'
        });
    }
};

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
        toast.current?.show({
            severity: 'warn',
            summary: 'Cảnh báo',
            detail: 'Vui lòng nhập mã giảm giá'
        });
        return;
    }

    try {
        setIsLoadingVoucher(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
            toast.current?.show({
                severity: 'error',
                summary: 'Lỗi',
                detail: 'Vui lòng đăng nhập để sử dụng mã giảm giá'
            });
            return;
        }

        const response = await axios.post(
            `${API_URL}/cart/apply-voucher`,
            { code: discountCode.trim() },
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (response.data.success) {
            await fetchCart(); // Refresh cart data
            // Không cần setDiscountCode ở đây vì useEffect sẽ tự cập nhật
            toast.current?.show({
                severity: 'success',
                summary: 'Thành công',
                detail: 'Đã áp dụng mã giảm giá'
            });
        }
    } catch (error: any) {
        toast.current?.show({
            severity: 'error',
            summary: 'Lỗi',
            detail: error.response?.data?.message || 'Không thể áp dụng mã giảm giá'
        });
    } finally {
        setIsLoadingVoucher(false);
    }
  };

  const handlePlaceOrder = () => {
    setShowSuccessDialog(true);
  };

  // Loading State
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <i className="pi pi-spin pi-spinner text-3xl"></i>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-red-500">
        <i className="pi pi-exclamation-circle text-3xl mb-4"></i>
        <p>{error}</p>
      </div>
    );
  }

  // const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalAfterDiscount = total - discountAmount;

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <i className="pi pi-shopping-cart text-4xl text-gray-400 mb-4"></i>
          <p className="text-gray-600 text-xl font-medium">
            Giỏ hàng của bạn đang trống
          </p>
          <p className="text-gray-500 mt-2">
            Vui lòng chọn thêm sản phẩm để mua sắm nhé!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <Helmet>
        <title>Giỏ hàng</title>
        <link rel="icon" href="../../src/assets/img/phone.ico" />
      </Helmet>
      <Toast ref={toast} />
      {/* Delivery Options */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Phương thức nhận hàng</h2>
        <div className="flex gap-8 justify-center">
          <div className="flex items-center hover:bg-gray-50 p-3 rounded-lg transition-colors">
            <RadioButton 
              inputId="delivery" 
              name="deliveryOption" 
              value="delivery" 
              onChange={(e) => setDeliveryOption(e.value)} 
              checked={deliveryOption === 'delivery'} 
              className={
                deliveryOption === 'delivery'
                  ? "border-none"     // Khi check -> không có border
                  : "border border-gray-400 rounded-lg" // Khi chưa check -> có border
              }
            />
            <label htmlFor="delivery" className="ml-2 cursor-pointer font-medium text-gray-700">Giao tận nơi</label>
          </div>
          <div className="flex items-center hover:bg-gray-50 p-3 rounded-lg transition-colors">
            <RadioButton 
              inputId="store" 
              name="deliveryOption" 
              value="store" 
              onChange={(e) => setDeliveryOption(e.value)} 
              checked={deliveryOption === 'store'} 
              className={
                deliveryOption === 'store'
                  ? "border-none"     // Khi check -> không có border
                  : "border border-gray-400 rounded-lg" // Khi chưa check -> có border
              }
            />
            <label htmlFor="store" className="ml-2 cursor-pointer font-medium text-gray-700">Nhận tại cửa hàng</label>
          </div>
        </div>
      </div>

      {deliveryOption === 'delivery' && (
        <div className="space-y-6">
          <Button 
            label="Xác nhận thông tin nhận hàng" 
            onClick={() => {
              if (!localStorage.getItem('token')) {
                toast.current?.show({
                  severity: 'warn',
                  summary: 'Warning',
                  detail: 'Vui lòng đăng nhập để tiếp tục'
                });
                return;
              }
              // Load profile data into form
              if (userProfile) {
                setUserInfo(prevInfo => ({
                  ...prevInfo,
                  fullName: userProfile.full_name,
                  phone: userProfile.phone_number,
                  address: userProfile.address
                }));
              }
              setShowConfirmDialog(true);
            }} 
            className="p-button-secondary w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          />
          
          <Dialog 
            header="Xác nhận thông tin nhận hàng" 
            visible={showConfirmDialog} 
            onHide={() => setShowConfirmDialog(false)} 
            className="w-full md:w-[600px]"
          >
            <div className="flex flex-col gap-4 p-4">
            {userProfile ? (
              <>
              <div className="flex gap-6">
                <div className="flex items-center">
                  <RadioButton 
                    inputId="male" 
                    name="gender" 
                    value="Anh" 
                    onChange={(e) => setUserInfo({ ...userInfo, gender: e.value })} 
                    checked={userInfo.gender === 'Anh'} 
                    className={
                      userInfo.gender === 'Anh'
                          ? "border-none"     // When checked -> no border
                          : "border border-gray-400 rounded-lg" // When unchecked -> has border
                  } 
                  />
                  <label htmlFor="male" className="ml-2 font-medium">Anh</label>
                </div>
                <div className="flex items-center">
                  <RadioButton 
                    inputId="female" 
                    name="gender" 
                    value="Chị" 
                    onChange={(e) => setUserInfo({ ...userInfo, gender: e.value })} 
                    checked={userInfo.gender === 'Chị'} 
                    className={
                      userInfo.gender === 'Chị'
                          ? "border-none"     // When checked -> no border
                          : "border border-gray-400 rounded-lg" // When unchecked -> has border
                    } 
                  />
                  <label htmlFor="female" className="ml-2 font-medium">Chị</label>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Họ tên</label>
                  <InputText 
                    id="fullName" 
                    value={userInfo.fullName} 
                    onChange={handleFullNameChange}
                    placeholder="Nhập họ tên"
                    className={`w-full p-3 rounded-lg border ${
                      userInfo.fullName.length < 2 
                        ? 'border-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:border-blue-500'
                    } focus:ring-1 focus:ring-blue-500`}
                  />
                  {userInfo.fullName && userInfo.fullName.length < 2 && (
                    <small className="text-red-500">Họ tên phải có ít nhất 2 ký tự</small>
                  )}
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                  <InputText 
                    id="phone" 
                    value={userInfo.phone} 
                    onChange={handlePhoneChange}
                    placeholder="Nhập số điện thoại (10 số)"
                    className={`w-full p-3 rounded-lg border ${
                      userInfo.phone && userInfo.phone.length !== 10 
                        ? 'border-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:border-blue-500'
                    } focus:ring-1 focus:ring-blue-500`}
                  />
                  {userInfo.phone && userInfo.phone.length !== 10 && (
                    <small className="text-red-500">Số điện thoại phải có 10 số</small>
                  )}
                </div>
                
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ nhận hàng</label>
                  <InputText 
                    id="address" 
                    value={userInfo.address} 
                    onChange={(e) => setUserInfo({ ...userInfo, address: e.target.value })} 
                    className="w-full p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center mt-2">
                {/* <Checkbox 
                  inputId="otherReceiver" 
                  checked={userInfo.otherReceiver} 
                  onChange={(e) => setUserInfo({ ...userInfo, otherReceiver: e.checked })} 
                  className={
                    userInfo.otherReceiver
                        ? "border-none"     // When checked -> no border
                        : "border" // When unchecked -> has border
                } 
                />
                <label htmlFor="otherReceiver" className="hover:cursor-pointer ml-2 text-gray-700">Người khác nhận hàng</label> */}
              </div>

              <Button 
                label="Lưu thông tin" 
                onClick={handleUpdateUserInfo}
                disabled={!userInfo.fullName || !userInfo.phone || !userInfo.address}
                className={`mt-4 ${
                  !userInfo.fullName || !userInfo.phone || !userInfo.address
                    ? 'bg-gray-400'
                    : 'bg-green-600 hover:bg-green-700'
                } text-white px-6 py-3 rounded-lg transition-colors`}
              />
              </>) : (
                <div className="text-center py-4">
                <i className="pi pi-spin pi-spinner text-2xl"></i>
                <p className="mt-2">Đang tải thông tin...</p>
              </div>
            )}
            </div>
          </Dialog>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <DataTable 
                value={cartItems} 
                responsiveLayout="scroll"
                className="border-none"
                rowHover
            >
                <Column 
                field="name" 
                header="Sản phẩm" 
                body={(rowData) => (
                    <div className="p-4">
                        <span className="text-gray-800 font-medium">{rowData.name}</span>
                    </div>
                )}
                className="p-4 text-gray-800 font-medium"
              />
                <Column 
                    field="price" 
                    header="Giá" 
                    body={(rowData) => (
                        <span className="text-gray-700 font-medium">
                            {rowData.price.toLocaleString('vi-VN')} đ
                        </span>
                    )} 
                />
                <Column 
                    field="quantity" 
                    header="Số lượng"                                                                                             
                    body={(rowData) => (
                        <div className="flex items-center gap-3">
                            <Button 
                                icon="pi pi-minus" 
                                onClick={() => handleQuantityChange(rowData._id, rowData.quantity - 1)} 
                                disabled={rowData.quantity <= 1}
                                className="p-button-rounded p-button-secondary w-10 h-10"
                            />
                            <span className="font-medium text-gray-800 w-8 text-center">
                                {rowData.quantity}
                            </span>
                            <Button 
                                icon="pi pi-plus" 
                                onClick={() => handleQuantityChange(rowData._id, rowData.quantity + 1)}
                                className="p-button-rounded p-button-secondary w-10 h-10"
                            />
                        </div>
                    )}
                />
                <Column 
                    field="subtotal" 
                    header="Tổng cộng" 
                    body={(rowData) => (
                        <span className="text-gray-800 font-semibold">
                            {(rowData.price * rowData.quantity).toLocaleString('vi-VN')} đ
                        </span>
                    )} 
                />
                <Column 
                    header="Thao tác" 
                    body={(rowData) => (
                        <Button 
                            icon="pi pi-trash" 
                            className="p-button-danger p-button-rounded p-button-text" 
                            onClick={() => handleDeleteItem(rowData._id)}
                        />
                    )}
                />
            </DataTable>
          </div>

          <div className="flex gap-4 items-center bg-white p-4 rounded-lg shadow-md">
            <div className="flex-1 relative">
              <InputText 
                value={discountCode} 
                onChange={(e) => setDiscountCode(e.target.value.toUpperCase())} 
                placeholder="Nhập mã giảm giá" 
                disabled={isLoadingVoucher || appliedVoucher !== null}
                className={`w-full p-3 rounded-lg border ${
                  appliedVoucher 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-300'
                } focus:border-blue-500 focus:ring-1 focus:ring-blue-500 uppercase`}
              />
              {appliedVoucher && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <i className="pi pi-check text-green-500"></i>
                </div>
              )}
            </div>
            {appliedVoucher ? (
              <Button 
                icon="pi pi-times"
                label="Hủy"
                onClick={handleRemoveVoucher}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
              />
            ) : (
              <Button 
                label="Áp dụng" 
                onClick={handleApplyDiscount}
                loading={isLoadingVoucher}
                disabled={!discountCode.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
              />
            )}
          </div>

          {appliedVoucher && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-green-800">{appliedVoucher.name}</h4>
                  <p className="text-sm text-green-600">
                    {appliedVoucher.discountType === 'FIXED' 
                      ? `Giảm ${appliedVoucher.discountValue.toLocaleString('vi-VN')}đ`
                      : `Giảm ${appliedVoucher.discountValue}%`
                    }
                  </p>
                </div>
                <span className="text-green-600 font-medium">
                  -{discountAmount.toLocaleString('vi-VN')}đ
                </span>
              </div>
            </div>
          )}

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Tổng tiền giỏ hàng</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Tổng tiền:</span>
                <span className="text-gray-800 font-semibold">{total.toLocaleString('vi-VN')} đ</span>
              </div>
              
              {appliedVoucher && (
                <div className="flex justify-between items-center py-2 border-b text-blue-600">
                  <span className="flex items-center gap-2">
                    <i className="pi pi-tag"></i>
                    <span>Mã giảm giá ({appliedVoucher.code}):</span>
                  </span>
                  <span className="font-medium">
                    {appliedVoucher.discountType === 'FIXED' 
                      ? `-${appliedVoucher.discountValue.toLocaleString('vi-VN')}đ`
                      : `-${appliedVoucher.discountValue}%`
                    }
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Tổng tiền thanh toán:</span>
                <div className="text-right">
                  {appliedVoucher && (
                    <div className="text-sm text-gray-500 line-through mb-1">
                      {total.toLocaleString('vi-VN')} đ
                    </div>
                  )}
                  <span className="text-green-600 font-semibold text-lg">
                    {totalAfterDiscount.toLocaleString('vi-VN')} đ
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Phương thức thanh toán</h3>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <RadioButton 
                  inputId="bank" 
                  name="paymentMethod" 
                  value="bank" 
                  onChange={(e) => setPaymentMethod(e.value)} 
                  checked={paymentMethod === 'bank'} 
                  className={
                    paymentMethod === 'bank'
                      ? "border-none"     
                      : "border border-gray-400 rounded-lg" 
                  }
                />
                <label htmlFor="bank" className="hover:cursor-pointer ml-2 font-medium text-gray-700">Chuyển khoản ngân hàng</label>
              </div>
              <div className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <RadioButton 
                  inputId="cod" 
                  name="paymentMethod" 
                  value="cod" 
                  onChange={(e) => setPaymentMethod(e.value)} 
                  checked={paymentMethod === 'cod'}
                  className={
                    paymentMethod === 'cod'
                      ? "border-none"     // Khi check -> không có border
                      : "border border-gray-400 rounded-lg" // Khi chưa check -> có border
                  } 
                />
                <label htmlFor="cod" className="hover:cursor-pointer ml-2 font-medium text-gray-700">Thanh toán COD</label>
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-8">
            <Button 
                label="Đặt hàng" 
                icon="pi pi-shopping-cart"
                onClick={handleCreateOrder}
                disabled={!userProfile || cartItems.length === 0}
                className={`mt-4 w-50 ${
                    !userProfile || cartItems.length === 0
                        ? 'bg-gray-400'
                        : 'bg-green-600 hover:bg-green-700'
                } text-white px-6 py-3 rounded-lg transition-colors`}
            />
          </div>
        </div>
      )}

      {deliveryOption === 'store' && (
        <div className="space-y-6">
          <Dialog 
            header="Xác nhận thông tin nhận hàng" 
            visible={showConfirmDialog} 
            onHide={() => setShowConfirmDialog(false)} 
            className="w-full md:w-[600px]"
          >
            <div className="flex flex-col gap-4 p-4">
            {userProfile ? (
              <>
              <div className="flex gap-6">
                <div className="flex items-center">
                  <RadioButton 
                    inputId="male" 
                    name="gender" 
                    value="Anh" 
                    onChange={(e) => setUserInfo({ ...userInfo, gender: e.value })} 
                    checked={userInfo.gender === 'Anh'} 
                    className={
                      userInfo.gender === 'Chị'
                        ? "border-none"     // Khi check -> không có border
                        : "border border-gray-400 rounded-lg" // Khi chưa check -> có border
                    } 
                  />
                  <label htmlFor="male" className="ml-2 font-medium">Anh</label>
                </div>
                <div className="flex items-center">
                  <RadioButton 
                    inputId="female" 
                    name="gender" 
                    value="Chị" 
                    onChange={(e) => setUserInfo({ ...userInfo, gender: e.value })} 
                    checked={userInfo.gender === 'Chị'} 
                  />
                  <label htmlFor="female" className="ml-2 font-medium">Chị</label>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Họ tên</label>
                  <InputText 
                    id="fullName" 
                    value={userInfo.fullName} 
                    onChange={(e) => setUserInfo({ ...userInfo, fullName: e.target.value })} 
                    className="w-full p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                  <InputText 
                    id="phone" 
                    value={userInfo.phone} 
                    onChange={handlePhoneChange}
                    placeholder="Nhập số điện thoại (10 số)"
                    className={`w-full p-3 rounded-lg border ${
                      userInfo.phone && userInfo.phone.length !== 10 
                        ? 'border-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:border-blue-500'
                    } focus:ring-1 focus:ring-blue-500`}
                  />
                  {userInfo.phone && userInfo.phone.length !== 10 && (
                    <small className="text-red-500">Số điện thoại phải có 10 số</small>
                  )}
                </div>
                
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ nhận hàng</label>
                  <InputText 
                    id="address" 
                    value={userInfo.address} 
                    onChange={(e) => setUserInfo({ ...userInfo, address: e.target.value })} 
                    className="w-full p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center mt-2">
                {/* <Checkbox 
                  inputId="otherReceiver" 
                  checked={userInfo.otherReceiver} 
                  onChange={(e) => setUserInfo({ ...userInfo, otherReceiver: e.checked })} 
                />
                <label htmlFor="otherReceiver" className="ml-2 text-gray-700">Người khác nhận hàng</label> */}
              </div>

              <Button 
                label="Lưu thông tin" 
                onClick={handleUpdateUserInfo}
                disabled={!userInfo.fullName || !userInfo.phone || !userInfo.address}
                className={`mt-4 ${
                  !userInfo.fullName || !userInfo.phone || !userInfo.address
                    ? 'bg-gray-400'
                    : 'bg-green-600 hover:bg-green-700'
                } text-white px-6 py-3 rounded-lg transition-colors`}
              />
              </>
            ) : (
                <div className="text-center py-4">
                  <i className="pi pi-spin pi-spinner text-2xl"></i>
                  <p className="mt-2">Đang tải thông tin...</p>
                </div>
            )}
            </div>
          </Dialog>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <DataTable 
              value={cartItems} 
              responsiveLayout="scroll"
              className="border-none"
              rowHover
            >
              <Column field="name" header="Sản phẩm" className="p-4 text-gray-800 font-medium" />
              <Column 
                field="price" 
                header="Giá" 
                body={(rowData) => (
                  <span className="text-gray-700 font-medium">
                    {rowData.price.toLocaleString('vi-VN')} đ
                  </span>
                )} 
              />
              <Column 
                  field="quantity" 
                  header="Số lượng" 
                  body={(rowData) => (
                      <div className="flex items-center gap-3">
                          <Button 
                              icon="pi pi-minus" 
                              onClick={() => handleQuantityChange(rowData._id, rowData.quantity - 1)} 
                              disabled={rowData.quantity <= 1}
                              className="p-button-rounded p-button-secondary w-10 h-10"
                          />
                          <span className="font-medium text-gray-800 w-8 text-center">
                              {rowData.quantity}
                          </span>
                          <Button 
                              icon="pi pi-plus" 
                              onClick={() => handleQuantityChange(rowData._id, rowData.quantity + 1)}
                              className="p-button-rounded p-button-secondary w-10 h-10"
                          />
                      </div>
                  )}
              />
              <Column 
                field="total" 
                header="Tổng cộng" 
                body={(rowData) => (
                  <span className="text-gray-800 font-semibold">
                    {(rowData.price * rowData.quantity).toLocaleString('vi-VN')} đ
                  </span>
                )} 
              />
              <Column 
                header="Thao tác" 
                body={(rowData) => (
                  <Button 
                    icon="pi pi-trash" 
                    className="p-button-danger p-button-rounded p-button-text" 
                    onClick={() => handleDeleteItem(rowData._id)}
                  />
                )}
              />
            </DataTable>
          </div>

          <div className="flex gap-4 items-center bg-white p-4 rounded-lg shadow-md">
            <div className="flex-1 relative">
              <InputText 
                value={discountCode} 
                onChange={(e) => setDiscountCode(e.target.value.toUpperCase())} 
                placeholder="Nhập mã giảm giá" 
                disabled={isLoadingVoucher || appliedVoucher !== null}
                className={`w-full p-3 rounded-lg border ${
                  appliedVoucher 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-300'
                } focus:border-blue-500 focus:ring-1 focus:ring-blue-500 uppercase`}
              />
              {appliedVoucher && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <i className="pi pi-check text-green-500"></i>
                </div>
              )}
            </div>
            {appliedVoucher ? (
              <Button 
                icon="pi pi-times"
                label="Hủy"
                onClick={handleRemoveVoucher}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
              />
            ) : (
              <Button 
                label="Áp dụng" 
                onClick={handleApplyDiscount}
                loading={isLoadingVoucher}
                disabled={!discountCode.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
              />
            )}
          </div>

          {appliedVoucher && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-green-800">{appliedVoucher.name}</h4>
                  <p className="text-sm text-green-600">
                    {appliedVoucher.discountType === 'FIXED' 
                      ? `Giảm ${appliedVoucher.discountValue.toLocaleString('vi-VN')}đ`
                      : `Giảm ${appliedVoucher.discountValue}%`
                    }
                  </p>
                </div>
                <span className="text-green-600 font-medium">
                  -{discountAmount.toLocaleString('vi-VN')}đ
                </span>
              </div>
            </div>
          )}

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Tổng tiền giỏ hàng</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Tổng tiền:</span>
                <span className="text-gray-800 font-semibold">{total.toLocaleString('vi-VN')} đ</span>
              </div>

              {appliedVoucher && (
                <div className="flex justify-between items-center py-2 border-b text-blue-600">
                  <span className="flex items-center gap-2">
                    <i className="pi pi-tag"></i>
                    <span>Mã giảm giá ({appliedVoucher.code}):</span>
                  </span>
                  <span className="font-medium">
                    {appliedVoucher.discountType === 'FIXED' 
                      ? `-${appliedVoucher.discountValue.toLocaleString('vi-VN')}đ`
                      : `-${appliedVoucher.discountValue}%`
                    }
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Tổng tiền (đã áp dụng mã khuyến mãi):</span>
                <span className="text-green-600 font-semibold text-lg">{totalAfterDiscount.toLocaleString('vi-VN')} đ</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Phương thức thanh toán</h3>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <RadioButton 
                  inputId="bank" 
                  name="paymentMethod" 
                  value="bank" 
                  onChange={(e) => setPaymentMethod(e.value)} 
                  checked={paymentMethod === 'bank'} 
                  className={
                    paymentMethod === 'bank'
                      ? "border-none"     
                      : "border border-gray-400 rounded-lg" 
                  } 
                />
                <label htmlFor="bank" className="hover:cursor-pointer ml-2 font-medium text-gray-700">Chuyển khoản ngân hàng</label>
              </div>
              <div className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <RadioButton 
                  inputId="cod" 
                  name="paymentMethod" 
                  value="cod" 
                  onChange={(e) => setPaymentMethod(e.value)} 
                  checked={paymentMethod === 'cod'} 
                  className={
                    paymentMethod === 'cod'
                      ? "border-none"     // Khi check -> không có border
                      : "border border-gray-400 rounded-lg" // Khi chưa check -> có border
                  } 
                />
                <label htmlFor="cod" className="hover:cursor-pointer ml-2 font-medium text-gray-700">Thanh toán COD</label>
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-8">
            <Button 
                label="Đặt hàng" 
                icon="pi pi-shopping-cart"
                onClick={handleCreateOrder}
                disabled={!userProfile || cartItems.length === 0}
                className={`mt-4 w-50 ${
                    !userProfile || cartItems.length === 0
                        ? 'bg-gray-400'
                        : 'bg-green-600 hover:bg-green-700'
                } text-white px-6 py-3 rounded-lg transition-colors`}
            />
          </div>
        </div>
      )}

      <Dialog 
        header="Đặt hàng thành công" 
        visible={showSuccessDialog} 
        onHide={() => setShowSuccessDialog(false)} 
        className="w-full md:w-[500px]"
      >
        <div className="p-6 text-center">
          <i className="pi pi-check-circle text-5xl text-green-500 mb-4"></i>
          <p className="text-xl font-medium text-gray-800 mb-4">Đơn hàng của bạn đã được đặt thành công. Vui lòng đến cửa hàng gần nhất để nhận hàng!</p>
          <Button 
            label="Đóng" 
            onClick={() => setShowSuccessDialog(false)} 
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
          />
        </div>
      </Dialog>

      <Dialog
        visible={showDeleteDialog}
        onHide={() => setShowDeleteDialog(false)}
        header="Xác nhận xóa"
        footer={(
          <div className="flex justify-end gap-3">
            <Button
              label="Hủy"
              icon="pi pi-times"
              onClick={() => setShowDeleteDialog(false)}
              className="p-button-text p-2 border"
            />
            <Button
              label="Xóa"
              icon="pi pi-trash"
              onClick={confirmDelete}
              className="p-button-danger p-2 border hover:bg-red-500"
              autoFocus
            />
          </div>
        )}
        className="w-full md:w-[400px]"
      >
        <div className="flex flex-col items-center gap-4 py-4">
          <i className="pi pi-exclamation-triangle text-5xl text-yellow-500" />
          <p className="text-center">
            Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?
          </p>
        </div>
      </Dialog>
    </div>
  );
};

export default UserCart;