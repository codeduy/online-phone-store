// import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from 'primereact/button';

const UserSidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        {
            label: 'Trang chủ',
            icon: 'pi pi-home',
            path: '/home',
            command: () => { navigate('/home'); }
        },
        {
            label: 'Sản phẩm',
            icon: 'pi pi-box',
            path: '/products',
            command: () => { navigate('/products'); }
        },
        {
            label: 'Đơn hàng',
            icon: 'pi pi-shopping-cart',
            path: '/orders',
            command: () => { navigate('/orders'); }
        },
        {
            label: 'Ưa thích',
            icon: 'pi pi-heart',
            path: '/favorites',
            command: () => { navigate('/favorites'); }
        },
        {
            label: 'Liên hệ',
            icon: 'pi pi-envelope',
            path: '/contact',
            command: () => { navigate('/contact'); }
        },
        {
            label: 'Tin tức & Sự kiện',
            icon: 'pi pi-bell',
            path: '/news',
            command: () => { navigate('/news'); }
        }
    ];

    return (
        <div className="bg-white shadow-md rounded-lg p-4 min-h-[calc(100vh-6rem)] w-45">
            <div className="space-y-2">
                {menuItems.map((item, index) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Button
                            key={index}
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
                            onClick={item.command}
                        >
                            <i className={`${item.icon} mr-2 ${isActive ? 'text-blue-600' : 'text-gray-500'}`}></i>
                            <span className={`flex-1 ${isActive ? 'font-medium' : 'font-normal'}`}>
                                {item.label}
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

export default UserSidebar;