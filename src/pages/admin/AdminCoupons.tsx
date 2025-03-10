import { useRef, useState, useEffect, useCallback } from 'react';
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
import axios from 'axios';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import { ConfirmDialog } from 'primereact/confirmdialog';

interface DecodedToken {
  exp: number;
  role: string;
}

interface CouponData {
  id: string | null;
  name: string;
  code: string;
  type: 'Giảm tuyệt đối' | 'Giảm tương đối';
  value: number;
  minOrderValue: number;
  validity: [Date | null, Date | null];
  enabled: boolean;
}



interface Coupon {
  _id: string;
  name: string;
  code: string;
  discountType: 'FIXED' | 'PERCENTAGE';
  discountValue: number;
  minOrderValue: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [couponData, setCouponData] = useState<CouponData>({
    id: null,
    name: '',
    code: '',
    type: 'Giảm tương đối',
    value: 0,
    minOrderValue: 0,
    validity: [null, null],
    enabled: true
  });
  const [valueUnit, setValueUnit] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const navigate = useNavigate();
  const toast = useRef<Toast>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [couponToDelete, setCouponToDelete] = useState<string | null>(null);

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

  const couponTypes = [
    { label: 'Giảm tuyệt đối', value: 'Giảm tuyệt đối' },
    { label: 'Giảm tương đối', value: 'Giảm tương đối' }
  ];

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    if (!verifyToken()) return;
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('/admin/vouchers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setCoupons(response.data.data);
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
          navigate('/admin/login', { 
              state: { message: 'Phiên đăng nhập đã hết hạn' } 
          });
          return;
      }
      console.error('Error fetching coupons:', error);
      toast.current?.show({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Không thể tải danh sách mã giảm giá'
      });
    } finally {
        setLoading(false);
    }
  };

  const handleAddCoupon = () => {
    setIsEditing(false);
    setShowDialog(true);
    setCouponData({
      id: null,
      name: '',
      code: '',
      type: 'Giảm tuyệt đối',
      value: 0,
      minOrderValue: 0,
      validity: [null, null],
      enabled: true
    });
    setStartDate(null);
    setEndDate(null);
    setValueUnit('VND');
  };

  const handleEditCoupon = (coupon: Coupon) => {
    setIsEditing(true);
    setShowDialog(true);
    const startDate = new Date(coupon.startDate);
    const endDate = new Date(coupon.endDate);

    setCouponData({
      id: coupon._id,
      name: coupon.name,
      code: coupon.code,
      // Fix this line - reversed the mapping
      type: coupon.discountType === 'FIXED' ? 'Giảm tuyệt đối' : 'Giảm tương đối',
      value: coupon.discountValue,
      minOrderValue: coupon.minOrderValue,
      validity: [startDate, endDate],
      enabled: coupon.isActive
    });

    setStartDate(startDate);
    setEndDate(endDate);
    // Fix this line - reversed the mapping
    setValueUnit(coupon.discountType === 'FIXED' ? 'VND' : '%');
  };

  const handleSaveCoupon = async () => {
    if (!verifyToken()) return;
    try {
      // Validate required fields
      if (!couponData.name || !couponData.code || !startDate || !endDate) {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Vui lòng điền đầy đủ thông tin'
        });
        return;
      }

      // Validate dates
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);

      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      // Validate end date is after start date
      if (end.getTime() <= start.getTime()) {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Ngày kết thúc phải sau ngày bắt đầu'
        });
        return;
      }

      // Validate discount value based on type
      if (couponData.type === 'Giảm tương đối') {
        if (couponData.value <= 0 || couponData.value > 100) {
          toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: 'Phần trăm giảm giá phải từ 1% đến 100%'
          });
          return;
        }
      } else { // Giảm tuyệt đối
        if (couponData.value <= 0) {
          toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: 'Giá trị giảm phải lớn hơn 0 VND'
          });
          return;
        }
      }

      const token = localStorage.getItem('adminToken');
      const couponPayload = {
        name: couponData.name.trim(),
        code: couponData.code.trim().toUpperCase(),
        // Fix this line - reversed the mapping
        discountType: couponData.type === 'Giảm tuyệt đối' ? 'FIXED' : 'PERCENTAGE',
        discountValue: couponData.value,
        minOrderValue: couponData.minOrderValue,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        isActive: couponData.enabled
      };

      console.log('Sending payload:', couponPayload);

      if (isEditing && couponData.id) {
        const response = await axios.put(
          `/admin/vouchers/${couponData.id}`,
          couponPayload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data.success) {
          fetchCoupons();
          setShowDialog(false);
          toast.current?.show({
            severity: 'success',
            summary: 'Success',
            detail: 'Cập nhật mã giảm giá thành công'
          });
        }
      } else {
        await axios.post(
          '/admin/vouchers',
          couponPayload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        fetchCoupons();
        setShowDialog(false);
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Tạo mã giảm giá thành công'
        });
      }
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
          navigate('/admin/login', { 
              state: { message: 'Phiên đăng nhập đã hết hạn' } 
          });
          return;
      }
      console.error('Error saving coupon:', error);
      toast.current?.show({
          severity: 'error',
          summary: 'Lỗi',
          detail: error.response?.data?.message || 'Lỗi khi lưu mã giảm giá'
      });
    }
  };

  const handleInputChange = (e: any, field: string) => {
    const value = e.target ? e.target.value : e.value;

    // Validate discount value based on type
    if (field === 'value') {
      if (couponData.type === 'Giảm tương đối') {
        if (value > 100) {
          toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: 'Phần trăm giảm giá không được vượt quá 100%'
          });
          return;
        }
      }
      // Common validation for both types
      if (value < 0) {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Giá trị giảm không được âm'
        });
        return;
      }
    }

    setCouponData({ ...couponData, [field]: value });
    if (field === 'type') {
      setValueUnit(value === 'Giảm tuyệt đối' ? 'VND' : '%');
      // Reset value when changing type to prevent invalid values
      setCouponData(prev => ({
        ...prev,
        type: value,
        value: 0
      }));
    }
  };

  const handleSwitchChange = async (_e: any, couponId: string) => {
    if (!verifyToken()) return;
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.patch(
        `/admin/vouchers/${couponId}/toggle`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        fetchCoupons();
        toast.current?.show({
          severity: 'success',
          summary: 'Thành công',
          detail: 'Trạng thái mã giảm giá đã được cập nhật'
        });
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
          navigate('/admin/login', { 
              state: { message: 'Phiên đăng nhập đã hết hạn' } 
          });
          return;
      }
      console.error('Error toggling voucher status:', error);
      toast.current?.show({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Không thể cập nhật trạng thái mã giảm giá'
      });
    }
  };

  const confirmDelete = (couponId: string) => {
    setCouponToDelete(couponId);
    setShowDeleteDialog(true);
  };

  const handleDeleteCoupon = async () => {
      if (!verifyToken() || !couponToDelete) return;
      
      try {
          const token = localStorage.getItem('adminToken');
          await axios.delete(`/admin/vouchers/${couponToDelete}`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          fetchCoupons();
          toast.current?.show({
              severity: 'success',
              summary: 'Thành công',
              detail: 'Đã xóa mã giảm giá'
          });
      } catch (error) {
          if (axios.isAxiosError(error) && error.response?.status === 401) {
              navigate('/admin/login', { 
                  state: { message: 'Phiên đăng nhập đã hết hạn' } 
              });
              return;
          }
          console.error('Error deleting coupon:', error);
          toast.current?.show({
              severity: 'error',
              summary: 'Lỗi',
              detail: 'Không thể xóa mã giảm giá'
          });
      } finally {
          setShowDeleteDialog(false);
          setCouponToDelete(null);
      }
  };

  const sortedCoupons = [...coupons].sort((a, b) => {
    const aValue = a.isActive ? 1 : 0;
    const bValue = b.isActive ? 1 : 0;
    return bValue - aValue;
  });

  return (
    <div className="p-4">
      <Helmet>
        <title>Quản lí mã giảm giá</title>
        <link rel="icon" href="../../src/assets/img/phone.ico" />
      </Helmet>
      <Toast ref={toast} />
      <div className="flex justify-between items-center mb-4">
        <Button 
          className='border p-2 bg-white shadow-sm hover:bg-blue-50 text-gray-700 rounded-lg transition-all duration-200' 
          label="Thêm mã giảm giá" 
          icon="pi pi-plus" 
          onClick={handleAddCoupon} 
        />
      </div>
  
      <Dialog 
        header={isEditing ? "Chỉnh sửa mã giảm giá" : "Thêm mã giảm giá"} 
        visible={showDialog} 
        style={{ width: '50vw' }} 
        onHide={() => setShowDialog(false)}
        className="rounded-lg shadow-md"
      >
        <div className="p-fluid">
          <div className="p-field">
            <label htmlFor="name">Tên mã giảm giá</label>
            <InputText 
              className='border p-2 rounded-md shadow-sm w-full' 
              id="name" 
              value={couponData.name} 
              onChange={(e) => handleInputChange(e, 'name')} 
            />
          </div>
          <div className="p-field">
            <label htmlFor="code">Code giảm giá</label>
            <InputText 
              className='border p-2 rounded-md shadow-sm w-full' 
              id="code" 
              value={couponData.code} 
              onChange={(e) => handleInputChange(e, 'code')} 
            />
          </div>
          <div className="p-field">
            <label htmlFor="type">Loại giảm giá</label>
            <Dropdown 
              className='border p-1 rounded-md shadow-sm w-full' 
              id="type" 
              value={couponData.type} 
              options={couponTypes} 
              onChange={(e) => handleInputChange(e, 'type')} 
              placeholder="Chọn loại giảm giá" 
            />
          </div>
          <div className="p-field">
            <label htmlFor="value">Giá trị giảm giá</label>
            <div className="p-inputgroup border p-0 rounded-md shadow-sm">
              <InputNumber 
                id="value" 
                value={couponData.value} 
                onChange={(e) => handleInputChange(e, 'value')} 
              />
              <span className="p-inputgroup-addon">{valueUnit}</span>
            </div>
          </div>
          <div className="p-field">
            <label htmlFor="minOrderValue">Mức giá đơn hàng tối thiểu</label>
            <div className="p-inputgroup border p-0 rounded-md shadow-sm">
              <InputNumber 
                id="minOrderValue" 
                value={couponData.minOrderValue} 
                onChange={(e) => handleInputChange(e, 'minOrderValue')} 
                min={0} 
              />
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
              className="w-full border p-2 rounded-md shadow-sm"
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
              className="w-full border p-2 rounded-md shadow-sm"
              minDate={startDate || undefined}
            />
          </div>
          <div className="p-field mt-2 p-2">
            <Button 
              label="Lưu" 
              className='p-2 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 transition-all duration-200'
              onClick={handleSaveCoupon} 
            />
          </div>
        </div>
      </Dialog>
  
      <div className="grid grid-cols-1 gap-4">
        <DataTable value={sortedCoupons} loading={loading} className="shadow-md rounded-lg">
          <Column field="_id" header="ID mã giảm giá" />
          <Column field="name" header="Tên mã giảm giá" />
          <Column field="code" header="Mã giảm giá" />
          <Column
            field="discountValue"
            header="Giá trị giảm"
            body={(rowData: Coupon) =>
              `${rowData.discountValue} ${rowData.discountType === 'FIXED' ? 'VND' : '%'}`}
          />
          <Column
            field="minOrderValue"
            header="Mức giá đơn tối thiểu"
            body={(rowData: Coupon) => `${rowData.minOrderValue} VND`}
          />
          <Column
            field="startDate"
            header="Thời gian hiệu lực"
            body={(rowData: Coupon) =>
              `${new Date(rowData.startDate).toLocaleDateString()} - ${new Date(rowData.endDate).toLocaleDateString()}`}
          />
          <Column
            field="isActive"
            header="Bật/Tắt"
            body={(rowData: Coupon) => (
              <InputSwitch
                checked={rowData.isActive}
                onChange={(e) => handleSwitchChange(e, rowData._id)}
              />
            )}
          />
          <Column
            header="Thao tác"
            body={(rowData: Coupon) => (
              <div className="flex space-x-2">
                <Button
                  icon="pi pi-pencil"
                  className="p-button-rounded p-button-success shadow-md hover:text-blue-600 hover:bg-blue-50"
                  onClick={() => handleEditCoupon(rowData)}
                  tooltip='Chỉnh sửa'
                />
                <Button
                  icon="pi pi-trash"
                  className="p-button-rounded p-button-danger shadow-md hover:text-red-600 hover:bg-red-50 text-red-500"
                  onClick={() => confirmDelete(rowData._id)}
                  tooltip='Xóa'
                />
              </div>
            )}
          />
        </DataTable>

        <ConfirmDialog
          visible={showDeleteDialog}
          onHide={() => setShowDeleteDialog(false)}
          message="Bạn có chắc chắn muốn xóa mã giảm giá này?"
          header="Xác nhận xóa"
          icon="pi pi-exclamation-triangle"
          acceptClassName="p-button-danger text-red-500 border border-red-300 bg-white hover:bg-red-50 hover:text-red-600 transition-all duration-200 rounded-md p-2"
          rejectClassName="p-button-text bg-white text-gray-700 border border-gray-300 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 rounded-md p-2"
          accept={handleDeleteCoupon}
          reject={() => setShowDeleteDialog(false)}
          acceptLabel="Xóa"
          rejectLabel="Hủy"
          pt={{
              root: { className: 'border rounded-lg shadow-lg' },
              header: { className: 'text-xl font-semibold text-gray-800' },
              content: { className: 'p-4' },
              footer: { className: 'flex gap-2 justify-end p-4 bg-gray-50' },
              icon: { className: 'text-yellow-500' }
          }}
        />
      </div>
    </div>
  );
  
};

export default AdminCoupons;

// function setLoading(arg0: boolean) {
//   throw new Error('Function not implemented.');
// }
