import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from 'primereact/button';

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const menuItems = [
    { label: 'Trang chủ', icon: 'pi pi-home', path: '/admin' },
    { label: 'Quản lý sản phẩm', icon: 'pi pi-box', path: '/admin/products' },
    { label: 'Quản lý mã giảm giá', icon: 'pi pi-tags', path: '/admin/coupons' },
    { label: 'Quản lý đơn hàng', icon: 'pi pi-shopping-cart', path: '/admin/orders' },
    { label: 'Quản lý khách hàng', icon: 'pi pi-users', path: '/admin/customers' },
    { label: 'Tin tức & Sự kiện', icon: 'pi pi-bell', path: '/admin/news' },
    { label: 'Báo cáo thống kê', icon: 'pi pi-chart-bar', path: '/admin/statistics' }
  ];

  return (
    <div className="bg-white shadow-md rounded-lg p-4 min-h-[calc(100vh-6rem)] w-45">
      <div className="space-y-2">
        {menuItems.map(({ label, icon, path }) => {
          const isActive = location.pathname === path;
          return (
            <Button
              key={path}
              className={`
                w-full
                text-left
                transition-all
                duration-200
                flex
                items-center
                gap-2
                px-4
                py-3
                rounded-lg
                hover:bg-blue-50
                ${isActive 
                  ? 'bg-blue-100 text-blue-700 font-medium shadow-sm' 
                  : 'text-gray-700 hover:text-blue-600'
                }
              `}
              onClick={() => navigate(path)}
            >
              <i className={`${icon} mr-2 ${isActive ? 'text-blue-600' : 'text-gray-500'}`}></i>
              <span className={`flex-1 ${isActive ? 'font-medium' : 'font-normal'}`}>
                {label}
              </span>
              {isActive && (
                <div className="w-1 h-full absolute right-0 top-0 bg-blue-500 rounded-l"></div>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default AdminSidebar;