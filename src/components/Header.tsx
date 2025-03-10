import { useRef } from 'react';
import { Toolbar } from 'primereact/toolbar';
import { Button } from 'primereact/button';
// import { ToggleButton } from 'primereact/togglebutton';
import { Menu } from 'primereact/menu';
import { useNavigate } from 'react-router-dom';
import '/src/styles/tailwind.css';
import '/src/styles/darkmode.css';
import axios from 'axios';

export default function Header() {
  // const [darkMode, setDarkMode] = useState(false);
  const menuRef = useRef<Menu>(null);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
        const token = localStorage.getItem('adminToken');
        if (token) {
            await axios.post('/admin/logout', {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
        }
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        navigate('/admin/login');
    }
  };

  // useEffect(() => {
  //   if (darkMode) {
  //     document.body.classList.add('dark-mode');
  //   } else {
  //     document.body.classList.remove('dark-mode');
  //   }
  // }, [darkMode]);

  const userMenuItems = [
    {
      label: 'Thông tin người dùng',
      icon: 'pi pi-user',
      command: () => navigate('/admin/profile'),
    },
    {
      label: 'Lịch sử hoạt động',
      icon: 'pi pi-history',
      command: () => navigate('/admin/logs'),
    },
    {
      label: 'Đăng xuất',
      icon: 'pi pi-sign-out',
      command: handleLogout,
    },
  ];

  const startContent = (
    <div className="flex items-center gap-4">
      <img
        src={`${import.meta.env.VITE_IMAGE_URL}/images/logo/logo.png`}
        alt="Website Logo"
        className="h-10 w-auto cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => navigate('/admin')}
      />
    </div>
  );

  const centerContent = (
    <div className="p-inputgroup hidden sm:flex">
      {/* Uncomment when search feature is added */}
      {/* <span className="p-inputgroup-addon hover:border hover:border-blue-500 cursor-pointer">
        <i className="pi pi-search" />
      </span>
      <InputText placeholder="Tìm kiếm" /> */}
    </div>
  );

  const endContent = (
    <div className="flex items-center gap-4">
      {/* Dark mode toggle */}
      {/* <ToggleButton
        checked={darkMode}
        onChange={(e) => setDarkMode(e.value)}
        onIcon="pi pi-moon"
        offIcon="pi pi-sun"
        className="p-button-rounded p-button-text"
        tooltip={darkMode ? "Bật chế độ sáng" : "Bật chế độ tối"}
      /> */}

      {/* User profile */}
      <Menu model={userMenuItems} popup ref={menuRef} />
      <Button
        icon="pi pi-user"
        className="p-button-rounded p-button-text shadow-md hover:text-blue-600 hover:bg-blue-50"
        onClick={(e) => menuRef.current && menuRef.current.toggle(e)}
      />
    </div>
  );

  return (
    <div className="card bg-white dark:bg-gray-800 shadow-md rounded-lg p-4">
      <Toolbar start={startContent} center={centerContent} end={endContent} />
    </div>
  );
}
