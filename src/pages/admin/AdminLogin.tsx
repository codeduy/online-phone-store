import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Password } from 'primereact/password';
import axios from 'axios';
import { Helmet } from 'react-helmet';
import { jwtDecode } from "jwt-decode";

const AdminLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const toast = useRef<Toast>(null);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

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

    // Add axios interceptor to handle token expiration
    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            response => response,
            error => {
                if (error.response?.status === 401 && 
                    error.response?.data?.message?.toLowerCase().includes('token')) {
                    // Token is expired or invalid
                    toast.current?.show({
                        severity: 'warn',
                        summary: 'Phiên đăng nhập hết hạn',
                        detail: 'Vui lòng đăng nhập lại',
                        life: 3000
                    });
                    handleLogout();
                }
                return Promise.reject(error);
            }
        );

        // Cleanup interceptor on component unmount
        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, []);

    // Add token expiration check on mount
    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            try {
                const decodedToken = jwtDecode(token) as { exp?: number };
                if (decodedToken.exp && decodedToken.exp * 1000 < Date.now()) {
                    toast.current?.show({
                        severity: 'warn',
                        summary: 'Phiên đăng nhập hết hạn',
                        detail: 'Vui lòng đăng nhập lại',
                        life: 3000
                    });
                    handleLogout();
                }
            } catch (error) {
                console.error('Token decode error:', error);
                handleLogout();
            }
        }
    }, []);

    const handleLogin = async () => {
        try {
            setLoading(true);
    
            // Debug log
            console.log('Attempting login with:', { username });
    
            if (!username) {
                toast.current?.show({ 
                    severity: 'error', 
                    summary: 'Lỗi', 
                    detail: 'Tên người dùng không được để trống.', 
                    life: 3000 
                });
                return;
            }
            if (password.length < 8) {
                toast.current?.show({ 
                    severity: 'error', 
                    summary: 'Lỗi', 
                    detail: 'Mật khẩu phải có ít nhất 8 kí tự.', 
                    life: 3000 
                });
                return;
            }
    
            const response = await axios.post('/admin/login', {
                username: username.trim(),
                password: password
            });
    
            if (response.data.success) {
                localStorage.setItem('adminToken', response.data.data.token);
                localStorage.setItem('adminUser', JSON.stringify(response.data.data.user));
    
                toast.current?.show({ 
                    severity: 'success', 
                    summary: 'Thành công', 
                    detail: 'Đăng nhập thành công!', 
                    life: 3000 
                });
    
                navigate('/admin/dashboard');
            }
        } catch (error: any) {
            console.error('Login error:', error.response?.data || error);
            toast.current?.show({ 
                severity: 'error', 
                summary: 'Lỗi', 
                detail: error.response?.data?.message || 'Đăng nhập thất bại', 
                life: 3000 
            });
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    };

    return (
        <div className="login-container min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            {/* Background Image Overlay */}
            <div 
                className="absolute inset-0 bg-cover bg-center z-0" 
                style={{
                    backgroundImage: 'url(/src/assets/img/admin-login-bg.jpg)'
                }}
            />

            <Helmet>
                <title>Đăng nhập trang quản lí</title>
                <link rel="icon" href="../../src/assets/img/phone.ico" />
            </Helmet>
            
            <Toast ref={toast} className="z-50" />
            
            {/* Main Content */}
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg relative">
                <div className="space-y-6">
                    {/* Header */}
                    <div className="text-center space-y-2">
                        <h2 className="text-3xl font-extrabold text-gray-900">
                            E-Commerce Website
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Đăng nhập trung tâm quản trị
                        </p>
                    </div>
    
                    {/* Username Input */}
                    <div className="relative">
                        <InputText 
                            id="username" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            onKeyDown={handleKeyDown} 
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
                            placeholder=" "
                        />
                        <label 
                            htmlFor="username" 
                            className="absolute -top-2 left-4 bg-white px-1 text-xs text-blue-600"
                        >
                            Tên người dùng
                        </label>
                    </div>
    
                    {/* Password Input */}
                    <div className="relative">
                        <div className="relative">
                            <InputText 
                                id="password" 
                                type={showPassword ? "text" : "password"} 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                onKeyDown={handleKeyDown} 
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200 pr-10"
                                placeholder=" "
                            />
                            <Button 
                                icon={showPassword ? "pi pi-eye-slash" : "pi pi-eye"} 
                                onClick={() => setShowPassword(!showPassword)} 
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                            />
                        </div>
                        <label 
                            htmlFor="password" 
                            className="absolute -top-2 left-4 bg-white px-1 text-xs text-blue-600"
                        >
                            Mật khẩu
                        </label>
                    </div>
    
                    {/* Login Button */}
                    <Button 
                        label="Đăng nhập" 
                        icon="pi pi-sign-in"
                        onClick={handleLogin}
                        loading={loading}
                        className="w-full px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-colors duration-200"
                        pt={{
                            root: { className: 'flex items-center justify-center gap-2' },
                            label: { className: 'flex-none' },
                            icon: { className: 'text-lg' },
                            loadingIcon: { className: 'mr-2' }
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;

function jwt_decode(token: string) {
    throw new Error('Function not implemented.');
}
