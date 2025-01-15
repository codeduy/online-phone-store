import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';

const UserSidebar = () => {
    const navigate = useNavigate();

    const menuItems = [
        {
            label: 'Trang chủ',
            icon: 'pi pi-home',
            command: () => { navigate('/home'); }
        },
        {
            label: 'Sản phẩm',
            icon: 'pi pi-box',
            command: () => { navigate('/products'); }
        },
        {
            label: 'Đơn hàng',
            icon: 'pi pi-shopping-cart',
            command: () => { navigate('/orders'); }
        },
        {
            label: 'Ưa thích',
            icon: 'pi pi-heart',
            command: () => { navigate('/favorites'); }
        },
        {
            label: 'Liên hệ',
            icon: 'pi pi-envelope',
            command: () => { navigate('/contact'); }
        },
        {
            label: 'Tin tức & Sự kiện',
            icon: 'pi pi-bell',
            command: () => { navigate('/news'); }
        }
    ];

    return (
        <div className="h-full p-0">
            {menuItems.map((item, index) => (
                <Button
                    key={index}
                    label={item.label}
                    icon={item.icon}
                    className="block p-2 w-full mb-2 p-button-text text-left cursor-pointer border hover:bg-gray-200 rounded hover:border-blue-500"
                    onClick={item.command}
                />
            ))}
        </div>
    );
};

export default UserSidebar;