import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Checkbox } from 'primereact/checkbox';


const StaffLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const toast = useRef<Toast>(null);
    const navigate = useNavigate();

    const handleLogin = () => {
        if (!username) {
            toast.current?.show({ severity: 'error', summary: 'Lỗi', detail: 'Tên người dùng không được để trống.', life: 3000 });
            return;
        }
        else if (password.length < 8) {
            toast.current?.show({ severity: 'error', summary: 'Lỗi', detail: 'Mật khẩu phải có ít nhất 8 kí tự.', life: 3000 });
            return;
        }
        // Implement login logic here
        // For now, just navigate to the admin dashboard
        toast.current?.show({ severity: 'success', summary: 'Thành công', detail: 'Đăng nhập thành công!', life: 3000 });
        navigate('/');
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    };

    return (
        <div className="flex justify-center items-center h-screen">
            <Toast ref={toast} />
            <div className="p-4 border rounded shadow-md w-96">
                <h2 className="text-center mb-2">E-Commerce Website</h2>
                <h4 className="text-center mb-4">Chào mừng quý khách</h4>
                <div className="mb-4">
                    <label htmlFor="username" className="block pb-1">Tên người dùng</label>
                    <InputText 
                        id="username" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        onKeyDown={handleKeyDown} 
                        className="p-inputtext-sm w-full border p-2"
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="password" className="block pb-1">Mật khẩu</label>
                    <div className="relative w-full border">
                        <InputText 
                            id="password" 
                            type={showPassword ? "text" : "password"} 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            onKeyDown={handleKeyDown} 
                            className="p-inputtext-sm w-full border p-2 pr-10"
                        />
                        <Button 
                            icon={showPassword ? "pi pi-eye-slash" : "pi pi-eye"} 
                            className="p-button-text p-button-plain absolute right-0 top-0 h-full" 
                            onClick={() => setShowPassword(!showPassword)} 
                        />
                    </div>
                </div>
                <div className="mb-4 flex items-center">
                    <Checkbox 
                        inputId="rememberMe" 
                        checked={rememberMe} 
                        onChange={(e) => setRememberMe(e.checked || false)} 
                        className='border'
                    />
                    <label htmlFor="rememberMe" className="ml-2">Nhớ tài khoản?</label>
                </div>
                <Button label="Đăng nhập" onClick={handleLogin} className="p-button-secondary border p-2 hover:bg-green-500 hover:text-white w-full" />
                <div className="flex justify-between">
                    <Link to="/register" className="text-blue-500 hover:underline">Chưa có tài khoản?</Link>
                    <Link to="/forgot-password" className="text-blue-500 hover:underline">Quên mật khẩu?</Link>                    
                </div>
            </div>
        </div>
    );
};

export default StaffLogin;