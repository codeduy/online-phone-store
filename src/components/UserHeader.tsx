import { Toolbar } from 'primereact/toolbar';
import { Button } from 'primereact/button';
import { ToggleButton } from 'primereact/togglebutton';
import React, { useEffect, useState, useRef } from 'react';
import { SplitButton } from 'primereact/splitbutton';
import { Menu } from 'primereact/menu';
import { useNavigate } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { OverlayPanel } from 'primereact/overlaypanel';
import '/src/styles/tailwind.css';
import { useCart } from '../pages/user/CartContext.tsx';
import axios from 'axios';
import { Dialog } from 'primereact/dialog';

interface Category {
  _id: string;
  name: string;
  link: string;
  logo_url: string;
}

export default function UserHeader() {
  const [darkMode, setDarkMode] = useState(false);
  const overlayPanelRef = useRef<OverlayPanel>(null);
  const menuRef = useRef<Menu>(null);
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get<Category[]>('http://localhost:3000/api/categories');
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post('/auth/logout');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
    setShowLogoutDialog(false);
  };

  const userMenuItems = isAuthenticated ? [
    {
      label: 'Thông tin người dùng',
      icon: 'pi pi-user',
      command: () => navigate('/profile')
    },
    {
      label: 'Đăng xuất',
      icon: 'pi pi-sign-out',
      command: handleLogout
    }
  ] : [
    {
      label: 'Đăng nhập',
      icon: 'pi pi-sign-in',
      command: () => navigate('/login')
    }
  ];

  const startContent = (
    <div className="flex items-center gap-2">
      <img
        src="\src\assets\img\logo.png"
        alt="Website Logo"
        className="h-12 w-auto cursor-pointer mr-20"
        onClick={() => navigate('/')}
      />
      <Button
          label="Danh mục sản phẩm"
          icon="pi pi-bars"
          className="p-button-secondary p-2 ml-6 border"
          onClick={(e) => overlayPanelRef.current?.toggle(e)}
        />
        <OverlayPanel ref={overlayPanelRef} className="w-64">
          <ul className="list-none p-0 m-0">
            {categories.map((category: Category) => (
              <li
                key={category._id}
                className="p-2 hover:bg-gray-200 cursor-pointer flex items-center gap-3"
                onClick={() => {
                  navigate(category.link);
                  overlayPanelRef.current?.hide();
                }}
              >
                <img 
                  src={`http://localhost:3000${category.logo_url}`}
                  alt={`${category.name} logo`}
                  className="w-10 h-10 object-contain"
                  onError={(e) => {
                    e.currentTarget.src = '/src/assets/img/default-logo.png';
                  }}
                />
                <span className="text-sm">{category.name}</span>
              </li>
            ))}
          </ul>
        </OverlayPanel>
      <span className="p-inputgroup-addon hover:border hover:border-blue-500 cursor-pointer">
        <i className="pi pi-search" />
      </span>
      <InputText placeholder="Tìm kiếm" />      
    </div>
  );

  const centerContent = (
    <div className="p-inputgroup ">
    </div>
  );

  const endContent = (
    <div className="flex items-center gap-4">
      {/* Dark mode toggle */}
      <ToggleButton
        checked={darkMode}
        onChange={(e) => setDarkMode(e.value)}
        onIcon="pi pi-moon"
        offIcon="pi pi-sun"
        className="p-button-rounded p-button-text"
      />

      {/* Shopping cart */}
      <Button
        icon="pi pi-shopping-cart"
        className="p-button-rounded p-button-text"
        badge={cartCount.toString()}
        badgeClassName="p-badge-danger"
        onClick={() => navigate('/cart')}
      />

      {/* User profile */}
      <Menu model={userMenuItems} popup ref={menuRef} />
      <Button
        icon="pi pi-user"
        className="p-button-rounded p-button-text"
        onClick={(e) => menuRef.current && menuRef.current.toggle(e)}
      />
    </div>
  );

  return (
    <div className="card">
      <Toolbar start={startContent} center={centerContent} end={endContent} />
    </div>
  );
}
