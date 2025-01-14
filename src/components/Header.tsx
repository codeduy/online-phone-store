
import React from 'react';
import { Toolbar } from 'primereact/toolbar';
import { Button } from 'primereact/button';
import { ToggleButton } from 'primereact/togglebutton';
import { useState, useRef } from 'react';
import { SplitButton } from 'primereact/splitbutton';
import { Menu } from 'primereact/menu';
import { useNavigate } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import '/src/styles/tailwind.css';


export default function Header() {
  const [darkMode, setDarkMode] = useState(false);
  const menuRef = useRef<Menu>(null);
  const navigate = useNavigate();

  const userMenuItems = [
    {
      label: 'Thông tin người dùng',
      icon: 'pi pi-user',
      command: () => navigate('/admin/profile')
    },
    {
      label: 'Thiết đặt',
      icon: 'pi pi-cog',
      command: () => navigate('/admin/settings')
    },
    {
      label: 'Đăng xuất',
      icon: 'pi pi-sign-out',
      command: () => navigate('/logout')
    }
  ];

  const startContent = (
    <div className="flex items-center gap-2">
      <img
        src="\src\assets\img\logo.png"
        alt="Website Logo"
        className="h-12 w-auto cursor-pointer"
        onClick={() => navigate('/admin')}
      />
    </div>
  );

  const centerContent = (
    <div className="p-inputgroup">
    {/* <span className="p-inputgroup-addon hover:border hover:border-blue-500 cursor-pointer">
      <i className="pi pi-search" />
    </span>
    <InputText placeholder="Tìm kiếm" /> */}
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
      {/* <Button
        icon="pi pi-shopping-cart"
        className="p-button-rounded p-button-text"
        badge="0"
        badgeClassName="p-badge-danger"
        onClick={() => navigate('/cart')}
      /> */}

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
