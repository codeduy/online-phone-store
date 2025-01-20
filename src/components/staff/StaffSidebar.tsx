import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';

const StaffSidebar = () => {
  const navigate = useNavigate();
  
  const menuItems = [
    {
      label: 'Trang chủ',
      icon: 'pi pi-home',
      command: () => {navigate('/staff');}
    },
    {
      label: 'Quản lý sản phẩm',
      icon: 'pi pi-box',
      command: () => {navigate('/staff/products');}
    },
    {
      label: 'Quản lý mã giảm giá',
      icon: 'pi pi-tags',
      command: () => {navigate('/staff/coupons');}
    },
    {
      label: 'Quản lý đơn hàng',
      icon: 'pi pi-shopping-cart',
      command: () => {navigate('/staff/orders');}
    },
    {
      label: 'Quản lý khách hàng', 
      icon: 'pi pi-users',
      command: () => {navigate('/staff/customers');}
    },
    {
      label: 'Quản lý thanh toán',
      icon: 'pi pi-credit-card',
      command: () => {navigate('/staff/payments');}
    },
    {
      label: 'Tin tức & Sự kiện',
      icon: 'pi pi-bell',
      command: () => {navigate('/staff/news');}
    },
    {
      label: 'Báo cáo thống kê',
      icon: 'pi pi-chart-bar', 
      command: () => {navigate('/staff/statistics');}
    }
  ];

  return (
    <div className="h-full p-4">
      {menuItems.map((item, index) => (
        <Button
          key={index}
          label={item.label}
          icon={item.icon}
          className="block p-2 w-full mb-2 p-button-text text-left cursor-pointer border border-gray-300 rounded hover:bg-gray-200 hover:border-blue-500"
          onClick={item.command}
        />
      ))}
    </div>
  );
};

export default StaffSidebar;