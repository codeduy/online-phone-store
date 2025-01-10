import { useNavigate } from 'react-router-dom';
import { Menu } from 'primereact/menu';

const Sidebar = () => {
  const navigate = useNavigate();
  
  const menuItems = [
    {
      label: 'Trang chủ',
      icon: 'pi pi-home',
      command: () => navigate('/admin')
    },
    {
      label: 'Quản lý sản phẩm',
      icon: 'pi pi-box',
      command: () => navigate('/admin/products')
    },
    {
      label: 'Quản lý đơn hàng',
      icon: 'pi pi-shopping-cart',
      command: () => navigate('/admin/orders')
    },
    {
      label: 'Quản lý khách hàng', 
      icon: 'pi pi-users',
      command: () => navigate('/admin/customers')
    },
    {
      label: 'Quản lý thanh toán',
      icon: 'pi pi-credit-card',
      command: () => navigate('/admin/payments')
    },
    {
      label: 'Quản lý chi nhánh',
      icon: 'pi pi-building',
      command: () => navigate('/admin/branches')
    },
    {
      label: 'Quản lý nhân viên',
      icon: 'pi pi-user',
      command: () => navigate('/admin/staff')
    },
    {
      label: 'Quản lý cấp quản lý',
      icon: 'pi pi-users',
      command: () => navigate('/admin/managers')
    },
    {
      label: 'Tin tức & Sự kiện',
      icon: 'pi pi-bell',
      command: () => navigate('/admin/news')
    },
    {
      label: 'Báo cáo thống kê',
      icon: 'pi pi-chart-bar', 
      command: () => navigate('/admin/statistics')
    }
  ];

  return (
    <div className="w-64 min-h-screen bg-white shadow-lg">
      <Menu model={menuItems} className="w-full" />
    </div>
  );
};

export default Sidebar;