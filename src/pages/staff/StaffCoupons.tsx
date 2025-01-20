import React, { useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { InputSwitch } from 'primereact/inputswitch';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { InputNumber } from 'primereact/inputnumber';

const StaffCoupons = () => {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [couponData, setCouponData] = useState({
    id: null,
    name: '',
    code: '',
    type: '',
    value: 0,
    minOrderValue: 0,
    validity: [null, null],
    enabled: true
  });
  const [valueUnit, setValueUnit] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const toast = useRef<Toast>(null);

  const couponTypes = [
    { label: 'Giảm tuyệt đối'},
    { label: 'Giảm tương đối'}
  ];

  const handleAddCoupon = () => {
    setIsEditing(false);
    setShowDialog(true);
    setCouponData({
      id: null,
      name: '',
      code: '',
      type: '',
      value: 0,
      minOrderValue: 0,
      validity: [null, null],
      enabled: true
    });
    setStartDate(null);
    setEndDate(null);
    setValueUnit('');
  };

  const handleEditCoupon = (coupon: any) => {
    setIsEditing(true);
    setShowDialog(true);
    setCouponData(coupon);
    setStartDate(coupon.validity[0]);
    setEndDate(coupon.validity[1]);
    setValueUnit(coupon.type === 'absolute' ? 'VND' : '%');
  };

  const handleSaveCoupon = () => {
    // Check for empty fields
    if (!couponData.name || !couponData.code || !couponData.type || !couponData.value || !couponData.minOrderValue || !startDate || !endDate) {
      toast.current?.show({ 
        severity: 'warn', 
        summary: 'Thông báo', 
        detail: 'Vui lòng hoàn thiện đầy đủ thông tin trước khi lưu', 
        life: 3000 
      });
      return;
    }

    // Check for existing coupon code
    const existingCoupon = coupons.find(coupon => coupon.code.toLowerCase() === couponData.code.toLowerCase() && coupon.id !== couponData.id);
    if (existingCoupon) {
      toast.current?.show({ 
        severity: 'error', 
        summary: 'Thông báo', 
        detail: 'Mã giảm giá đã tồn tại', 
        life: 3000 
      });
      return;
    }

    // Check if discount value is less than minimum order value
    if (couponData.type === 'absolute' && couponData.value >= couponData.minOrderValue) {
      toast.current?.show({ 
        severity: 'error', 
        summary: 'Thông báo', 
        detail: 'Giá trị giảm giá phải thấp hơn mức giá đơn hàng tối thiểu', 
        life: 3000 
      });
      return;
    }

    // Check if relative discount value is less than 100%
    if (couponData.type === 'relative' && couponData.value >= 100) {
      toast.current?.show({ 
        severity: 'error', 
        summary: 'Thông báo', 
        detail: 'Giá trị giảm giá phải thấp hơn 100%!', 
        life: 3000 
      });
      return;
    }

    // Check if start date is before end date
    if (startDate >= endDate) {
      toast.current?.show({ 
        severity: 'error', 
        summary: 'Thông báo', 
        detail: 'Ngày bắt đầu phải nằm trước ngày kết thúc', 
        life: 3000 
      });
      return;
    }

    // Save or update coupon
    if (isEditing) {
      const updatedCoupons = coupons.map(coupon => 
        coupon.id === couponData.id ? { ...couponData, validity: [startDate, endDate] } : coupon
      );
      setCoupons(updatedCoupons);
    } else {
      setCoupons([...coupons, { 
        ...couponData, 
        validity: [startDate, endDate],
        id: coupons.length + 1 
      }]);
    }
    
    setShowDialog(false);
    setCouponData({
      id: null,
      name: '',
      code: '',
      type: '',
      value: 0,
      minOrderValue: 0,
      validity: [null, null],
      enabled: true
    });
    setStartDate(null);
    setEndDate(null);
    setValueUnit('');
  };

  const handleInputChange = (e: any, field: string) => {
    const value = e.target ? e.target.value : e.value;
    setCouponData({ ...couponData, [field]: value });
    if (field === 'type') {
      setValueUnit(value === 'absolute' ? 'VND' : '%');
    }
  };

  const handleSwitchChange = (e: any, couponId: number) => {
    const updatedCoupons = coupons.map(coupon => 
      coupon.id === couponId ? { ...coupon, enabled: e.value } : coupon
    );
    setCoupons(updatedCoupons);
  };

  const handleDeleteCoupon = (couponId: number) => {
    const updatedCoupons = coupons.filter(coupon => coupon.id !== couponId);
    setCoupons(updatedCoupons);
  };

  const sortedCoupons = [...coupons].sort((a, b) => b.enabled - a.enabled);

  return (
    <div className="p-4">
      <Toast ref={toast} />
      <div className="flex justify-between items-center mb-4">
        <Button className='border p-2' label="Thêm mã giảm giá" icon="pi pi-plus" onClick={handleAddCoupon} />
      </div>

      <Dialog header={isEditing ? "Chỉnh sửa mã giảm giá" : "Thêm mã giảm giá"} visible={showDialog} style={{ width: '50vw' }} onHide={() => setShowDialog(false)}>
        <div className="p-fluid">
          <div className="p-field">
            <label htmlFor="name">Tên mã giảm giá</label>
            <InputText className='border p-2' id="name" value={couponData.name} onChange={(e) => handleInputChange(e, 'name')} />
          </div>
          <div className="p-field">
            <label htmlFor="code">Code giảm giá</label>
            <InputText className='border p-2' id="code" value={couponData.code} onChange={(e) => handleInputChange(e, 'code')} />
          </div>
          <div className="p-field">
            <label htmlFor="type">Loại giảm giá</label>
            <Dropdown className='border' id="type" value={couponData.type} options={couponTypes} onChange={(e) => handleInputChange(e, 'type')} placeholder="Chọn loại giảm giá" />
          </div>
          <div className="p-field">
            <label htmlFor="value">Giá trị giảm giá</label>
            <div className="p-inputgroup border p-0">
              <InputNumber id="value" value={couponData.value} onChange={(e) => handleInputChange(e, 'value')} />
              <span className="p-inputgroup-addon">{valueUnit}</span>
            </div>
          </div>
          <div className="p-field">
            <label htmlFor="minOrderValue">Mức giá đơn hàng tối thiểu</label>
            <div className="p-inputgroup border p-0">
              <InputNumber id="minOrderValue" value={couponData.minOrderValue} onChange={(e) => handleInputChange(e, 'minOrderValue')} min={0} />
              <span className="p-inputgroup-addon">VND</span>
            </div>
          </div>
          <div className="p-field">
            <label htmlFor="startDate">Ngày bắt đầu</label>
            <Calendar 
              id="startDate" 
              value={startDate} 
              onChange={(e) => setStartDate(e.value as Date)} 
              dateFormat="dd/mm/yy"
              showIcon
              className="w-full border p-2"
            />
          </div>
          <div className="p-field">
            <label htmlFor="endDate">Ngày kết thúc</label>
            <Calendar 
              id="endDate" 
              value={endDate} 
              onChange={(e) => setEndDate(e.value as Date)} 
              dateFormat="dd/mm/yy"
              showIcon
              className="w-full border p-2"
              minDate={startDate || undefined}
            />
          </div>
          <div className="p-field border mt-2 p-2">
            <Button label="Lưu" onClick={handleSaveCoupon} />
          </div>
        </div>
      </Dialog>

      <div className="grid grid-cols-1 gap-4">
        <DataTable value={sortedCoupons}>
          <Column field="id" header="STT" />
          <Column field="name" header="Tên mã giảm giá" />
          <Column field="code" header="Mã giảm giá" />
          <Column field="value" header="Giá trị giảm" body={(rowData) => `${rowData.value} ${rowData.type === 'absolute' ? 'VND' : '%'}`} />
          <Column field="minOrderValue" header="Mức giá đơn tối thiểu" body={(rowData) => `${rowData.minOrderValue} VND`} />
          <Column field="validity" header="Thời gian hiệu lực" body={(rowData) => `${rowData.validity[0]?.toLocaleDateString()} - ${rowData.validity[1]?.toLocaleDateString()}`} />
          <Column field="enabled" header="Bật/Tắt" body={(rowData) => <InputSwitch checked={rowData.enabled} onChange={(e) => handleSwitchChange(e, rowData.id)} />} />
          <Column header="Thao tác" body={(rowData) => (
            <div className="flex space-x-2">
              <Button icon="pi pi-pencil" className="p-button-rounded p-button-success" onClick={() => handleEditCoupon(rowData)} />
              <Button icon="pi pi-trash" className="p-button-rounded p-button-danger" onClick={() => handleDeleteCoupon(rowData.id)} />
            </div>
          )} />
        </DataTable>
      </div>
    </div>
  );
};

export default StaffCoupons;