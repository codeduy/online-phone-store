import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { RadioButton } from 'primereact/radiobutton';
import { Checkbox } from 'primereact/checkbox';

const UserCart = () => {
  const [deliveryOption, setDeliveryOption] = useState('store');
  const [showDeliveryDialog, setShowDeliveryDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [userInfo, setUserInfo] = useState({
    fullName: '',
    phone: '',
    address: '',
    gender: 'Anh',
    otherReceiver: false
  });
  const [cartItems, setCartItems] = useState([
    { id: 1, name: 'Product A', price: 100000, quantity: 1 },
    { id: 2, name: 'Product B', price: 200000, quantity: 2 },
    // Add more sample items...
  ]);
  const [discountCode, setDiscountCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('bank');
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const handleQuantityChange = (id, delta) => {
    setCartItems(cartItems.map(item => 
      item.id === id ? { ...item, quantity: item.quantity + delta } : item
    ));
  };

  const handleDeleteItem = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const handleApplyDiscount = () => {
    // Add logic to apply discount based on discountCode
    // For example, setDiscountAmount(10000) for a fixed discount or setDiscountAmount(0.1 * total) for a percentage discount
  };

  const handlePlaceOrder = () => {
    // Add logic to place the order
    setShowSuccessDialog(true);
  };

  const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalAfterDiscount = total - discountAmount;

  return (
    <div className="p-4">
      {/* First Row */}
      <div className="flex gap-4 mb-6 justify-center">
        <div className="flex items-center">
          <RadioButton 
            inputId="delivery" 
            name="deliveryOption" 
            value="delivery" 
            onChange={(e) => setDeliveryOption(e.value)} 
            checked={deliveryOption === 'delivery'} 
          />
          <label htmlFor="delivery" className="ml-2">Giao tận nơi</label>
        </div>
        <div className="flex items-center">
          <RadioButton 
            inputId="store" 
            name="deliveryOption" 
            value="store" 
            onChange={(e) => setDeliveryOption(e.value)} 
            checked={deliveryOption === 'store'} 
          />
          <label htmlFor="store" className="ml-2">Nhận tại cửa hàng</label>
        </div>
      </div>

      {/* Second Row */}
      {deliveryOption === 'delivery' && (
        <div className="mb-6">
          <Button label="Xác nhận thông tin nhận hàng" onClick={() => setShowConfirmDialog(true)} className="p-button-secondary mb-4 border p-2" />
          
          <Dialog header="Xác nhận thông tin nhận hàng" visible={showConfirmDialog} onHide={() => setShowConfirmDialog(false)} style={{ width: '40vw' }}>
            <div className="flex flex-col gap-4">
              <div className="flex gap-4">
                <div className="flex items-center">
                  <RadioButton 
                    inputId="male" 
                    name="gender" 
                    value="Anh" 
                    onChange={(e) => setUserInfo({ ...userInfo, gender: e.value })} 
                    checked={userInfo.gender === 'Anh'} 
                  />
                  <label htmlFor="male" className="ml-2">Anh</label>
                </div>
                <div className="flex items-center">
                  <RadioButton 
                    inputId="female" 
                    name="gender" 
                    value="Chị" 
                    onChange={(e) => setUserInfo({ ...userInfo, gender: e.value })} 
                    checked={userInfo.gender === 'Chị'} 
                  />
                  <label htmlFor="female" className="ml-2">Chị</label>
                </div>
              </div>
              <div>
                <label htmlFor="fullName" className="block pb-1">Họ tên</label>
                <InputText 
                  id="fullName" 
                  value={userInfo.fullName} 
                  onChange={(e) => setUserInfo({ ...userInfo, fullName: e.target.value })} 
                  className="p-inputtext-sm w-full border p-2"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block pb-1">Số điện thoại</label>
                <InputText 
                  id="phone" 
                  value={userInfo.phone} 
                  onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })} 
                  className="p-inputtext-sm w-full border p-2"
                />
              </div>
              <div>
                <label htmlFor="address" className="block pb-1">Địa chỉ nhận hàng</label>
                <InputText 
                  id="address" 
                  value={userInfo.address} 
                  onChange={(e) => setUserInfo({ ...userInfo, address: e.target.value })} 
                  className="p-inputtext-sm w-full border p-2"
                />
              </div>
              <div className="flex items-center">
                <Checkbox 
                  inputId="otherReceiver" 
                  checked={userInfo.otherReceiver} 
                  onChange={(e) => setUserInfo({ ...userInfo, otherReceiver: e.checked })} 
                />
                <label htmlFor="otherReceiver" className="ml-2">Người khác nhận hàng</label>
              </div>
              <Button label="Lưu" onClick={() => setShowConfirmDialog(false)} className="p-button-secondary border p-2 hover:bg-green-500 hover:text-white mt-0" />
            </div>
          </Dialog>

          <DataTable value={cartItems} responsiveLayout="scroll">
            <Column field="name" header="Sản phẩm" />
            <Column field="price" header="Giá" body={(rowData) => `${rowData.price.toLocaleString('vi-VN')} đ`} />
            <Column 
              field="quantity" 
              header="Số lượng" 
              body={(rowData) => (
                <div className="flex items-center gap-2">
                  <Button icon="pi pi-minus" onClick={() => handleQuantityChange(rowData.id, -1)} disabled={rowData.quantity === 1} />
                  <span>{rowData.quantity}</span>
                  <Button icon="pi pi-plus" onClick={() => handleQuantityChange(rowData.id, 1)} />
                </div>
              )}
            />
            <Column field="total" header="Tổng cộng" body={(rowData) => `${(rowData.price * rowData.quantity).toLocaleString('vi-VN')} đ`} />
            <Column 
              header="Thao tác" 
              body={(rowData) => (
                <Button icon="pi pi-trash" className="p-button-danger p-button-rounded p-button-text" onClick={() => handleDeleteItem(rowData.id)} />
              )}
            />
          </DataTable>

          <div className="flex gap-4 mt-4 w-100">
            <InputText 
              value={discountCode} 
              onChange={(e) => setDiscountCode(e.target.value)} 
              placeholder="Nhập mã giảm giá" 
              className="p-inputtext-sm w-50 border p-2"
            />
            <Button label="Áp dụng" onClick={handleApplyDiscount} className="p-button-secondary border p-2 hover:bg-green-500 hover:text-white mt-0" />
          </div>

          <div className="mt-4 w-full">
            <h3 className="text-xl font-semibold mb-2">Tổng tiền giỏ hàng</h3>
            <div className="border p-4 rounded-lg bg-white shadow-md w-full md:w-1/2">
              <div className="flex justify-between mb-2">
                <span>Tổng tiền:</span>
                <span>{total.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Tổng tiền (đã áp dụng mã khuyến mãi):</span>
                <span>{totalAfterDiscount.toLocaleString('vi-VN')} đ</span>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="text-xl font-semibold mb-2">Phương thức thanh toán</h3>
            <div className="flex gap-4">
              <div className="flex items-center">
                <RadioButton 
                  inputId="bank" 
                  name="paymentMethod" 
                  value="bank" 
                  onChange={(e) => setPaymentMethod(e.value)} 
                  checked={paymentMethod === 'bank'} 
                />
                <label htmlFor="bank" className="ml-2">Chuyển khoản ngân hàng</label>
              </div>
              <div className="flex items-center">
                <RadioButton 
                  inputId="cod" 
                  name="paymentMethod" 
                  value="cod" 
                  onChange={(e) => setPaymentMethod(e.value)} 
                  checked={paymentMethod === 'cod'} 
                />
                <label htmlFor="cod" className="ml-2">Thanh toán COD</label>
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-4">
            <Button label="Đặt hàng" onClick={handlePlaceOrder} className="p-button-primary border p-3" />
          </div>
        </div>
      )}

        {deliveryOption === 'store' && (
        <div className="mb-6">          
          <Dialog header="Xác nhận thông tin nhận hàng" visible={showConfirmDialog} onHide={() => setShowConfirmDialog(false)} style={{ width: '40vw' }}>
            <div className="flex flex-col gap-4">
              <div className="flex gap-4">
                <div className="flex items-center">
                  <RadioButton 
                    inputId="male" 
                    name="gender" 
                    value="Anh" 
                    onChange={(e) => setUserInfo({ ...userInfo, gender: e.value })} 
                    checked={userInfo.gender === 'Anh'} 
                  />
                  <label htmlFor="male" className="ml-2">Anh</label>
                </div>
                <div className="flex items-center">
                  <RadioButton 
                    inputId="female" 
                    name="gender" 
                    value="Chị" 
                    onChange={(e) => setUserInfo({ ...userInfo, gender: e.value })} 
                    checked={userInfo.gender === 'Chị'} 
                  />
                  <label htmlFor="female" className="ml-2">Chị</label>
                </div>
              </div>
              <div>
                <label htmlFor="fullName" className="block pb-1">Họ tên</label>
                <InputText 
                  id="fullName" 
                  value={userInfo.fullName} 
                  onChange={(e) => setUserInfo({ ...userInfo, fullName: e.target.value })} 
                  className="p-inputtext-sm w-full border p-2"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block pb-1">Số điện thoại</label>
                <InputText 
                  id="phone" 
                  value={userInfo.phone} 
                  onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })} 
                  className="p-inputtext-sm w-full border p-2"
                />
              </div>
              <div>
                <label htmlFor="address" className="block pb-1">Địa chỉ nhận hàng</label>
                <InputText 
                  id="address" 
                  value={userInfo.address} 
                  onChange={(e) => setUserInfo({ ...userInfo, address: e.target.value })} 
                  className="p-inputtext-sm w-full border p-2"
                />
              </div>
              <div className="flex items-center">
                <Checkbox 
                  inputId="otherReceiver" 
                  checked={userInfo.otherReceiver} 
                  onChange={(e) => setUserInfo({ ...userInfo, otherReceiver: e.checked })} 
                />
                <label htmlFor="otherReceiver" className="ml-2">Người khác nhận hàng</label>
              </div>
              <Button label="Lưu" onClick={() => setShowConfirmDialog(false)} className="p-button-secondary border p-2 hover:bg-green-500 hover:text-white mt-0" />
            </div>
          </Dialog>

          <DataTable value={cartItems} responsiveLayout="scroll">
            <Column field="name" header="Sản phẩm" />
            <Column field="price" header="Giá" body={(rowData) => `${rowData.price.toLocaleString('vi-VN')} đ`} />
            <Column 
              field="quantity" 
              header="Số lượng" 
              body={(rowData) => (
                <div className="flex items-center gap-2">
                  <Button icon="pi pi-minus" onClick={() => handleQuantityChange(rowData.id, -1)} disabled={rowData.quantity === 1} />
                  <span>{rowData.quantity}</span>
                  <Button icon="pi pi-plus" onClick={() => handleQuantityChange(rowData.id, 1)} />
                </div>
              )}
            />
            <Column field="total" header="Tổng cộng" body={(rowData) => `${(rowData.price * rowData.quantity).toLocaleString('vi-VN')} đ`} />
            <Column 
              header="Thao tác" 
              body={(rowData) => (
                <Button icon="pi pi-trash" className="p-button-danger p-button-rounded p-button-text" onClick={() => handleDeleteItem(rowData.id)} />
              )}
            />
          </DataTable>

          <div className="flex gap-4 mt-4 w-100">
            <InputText 
              value={discountCode} 
              onChange={(e) => setDiscountCode(e.target.value)} 
              placeholder="Nhập mã giảm giá" 
              className="p-inputtext-sm w-50 border p-2"
            />
            <Button label="Áp dụng" onClick={handleApplyDiscount} className="p-button-secondary border p-2 hover:bg-green-500 hover:text-white mt-0" />
          </div>

          <div className="mt-4 w-full">
            <h3 className="text-xl font-semibold mb-2">Tổng tiền giỏ hàng</h3>
            <div className="border p-4 rounded-lg bg-white shadow-md w-full md:w-1/2">
              <div className="flex justify-between mb-2">
                <span>Tổng tiền:</span>
                <span>{total.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Tổng tiền (đã áp dụng mã khuyến mãi):</span>
                <span>{totalAfterDiscount.toLocaleString('vi-VN')} đ</span>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="text-xl font-semibold mb-2">Phương thức thanh toán</h3>
            <div className="flex gap-4">
              <div className="flex items-center">
                <RadioButton 
                  inputId="bank" 
                  name="paymentMethod" 
                  value="bank" 
                  onChange={(e) => setPaymentMethod(e.value)} 
                  checked={paymentMethod === 'bank'} 
                />
                <label htmlFor="bank" className="ml-2">Chuyển khoản ngân hàng</label>
              </div>
              <div className="flex items-center">
                <RadioButton 
                  inputId="cod" 
                  name="paymentMethod" 
                  value="cod" 
                  onChange={(e) => setPaymentMethod(e.value)} 
                  checked={paymentMethod === 'cod'} 
                />
                <label htmlFor="cod" className="ml-2">Thanh toán COD</label>
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-4">
            <Button label="Đặt hàng" onClick={handlePlaceOrder} className="p-button-primary border p-3" />
          </div>
        </div>
      )}

      <Dialog header="Đặt hàng thành công" visible={showSuccessDialog} onHide={() => setShowSuccessDialog(false)} style={{ width: '30vw' }}>
        <div className="flex flex-col gap-4">
          <p>Đơn hàng của bạn đã được đặt thành công!</p>
          <Button label="Đóng" onClick={() => setShowSuccessDialog(false)} className="p-button-secondary border p-2 hover:bg-green-500 hover:text-white mt-0" />
        </div>
      </Dialog>
    </div>
  );
};

export default UserCart;