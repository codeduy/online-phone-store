import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';

const AdminSidebar = ({ onItemClick }: { onItemClick: () => void }) => {
  const navigate = useNavigate();
  
  const menuItems = [
    {
      label: 'Trang chủ',
      icon: 'pi pi-home',
      command: () => {navigate('/admin');onItemClick()}
    },
    {
      label: 'Quản lý sản phẩm',
      icon: 'pi pi-box',
      command: () => {navigate('/admin/products');onItemClick();}
    },
    {
      label: 'Quản lý đơn hàng',
      icon: 'pi pi-shopping-cart',
      command: () => {navigate('/admin/orders');onItemClick();}
    },
    {
      label: 'Quản lý khách hàng', 
      icon: 'pi pi-users',
      command: () => {navigate('/admin/customers');onItemClick();}
    },
    {
      label: 'Quản lý thanh toán',
      icon: 'pi pi-credit-card',
      command: () => {navigate('/admin/payments');onItemClick();}
    },
    {
      label: 'Quản lý chi nhánh',
      icon: 'pi pi-building',
      command: () => {navigate('/admin/branches');onItemClick();}
    },
    {
      label: 'Quản lý nhân viên',
      icon: 'pi pi-user',
      command: () => {navigate('/admin/staff');onItemClick();}
    },
    {
      label: 'Quản lý cấp quản lý',
      icon: 'pi pi-users',
      command: () => {navigate('/admin/managers');onItemClick();}
    },
    {
      label: 'Tin tức & Sự kiện',
      icon: 'pi pi-bell',
      command: () => {navigate('/admin/news');onItemClick();}
    },
    {
      label: 'Báo cáo thống kê',
      icon: 'pi pi-chart-bar', 
      command: () => {navigate('/admin/statistics');onItemClick();}
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

export default AdminSidebar;