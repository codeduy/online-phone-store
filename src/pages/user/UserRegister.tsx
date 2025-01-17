import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';

const UserRegister = () => {
    const [username, setUsername] = useState('');
    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);    
    const toast = useRef<Toast>(null);
    const navigate = useNavigate();

    const handleRegister = () => {
        if (!username || !fullName || !phoneNumber || !password || !confirmPassword) {
            toast.current?.show({ severity: 'error', summary: 'Lỗi', detail: 'Vui lòng điền đầy đủ thông tin.', life: 3000 });
            return;
        }
        if (!/^\d+$/.test(phoneNumber)) {
            toast.current?.show({ severity: 'error', summary: 'Lỗi', detail: 'Số điện thoại chỉ được chứa số.', life: 3000 });
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            toast.current?.show({ severity: 'error', summary: 'Lỗi', detail: 'Địa chỉ email không hợp lệ.', life: 3000 });
            return;
        }
        if (password.length < 8) {
            toast.current?.show({ severity: 'error', summary: 'Lỗi', detail: 'Mật khẩu phải có ít nhất 8 kí tự.', life: 3000 });
            return;
        }
        if (password !== confirmPassword) {
            toast.current?.show({ severity: 'error', summary: 'Lỗi', detail: 'Mật khẩu không khớp.', life: 3000 });
            return;
        }
        // Implement registration logic here
        // For now, just navigate to the login page
        toast.current?.show({ severity: 'success', summary: 'Thành công', detail: 'Đăng kí thành công!', life: 3000 });
        navigate('/login');
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleRegister();
        }
    };

    return (
        <div className="flex justify-center items-center h-screen">
            <Toast ref={toast} />
            <div className="p-4 border rounded shadow-md w-96">
                <h2 className="text-center mb-2">E-Commerce Website</h2>
                <h4 className="text-center mb-4">Đăng kí tài khoản người dùng</h4>
                <div className="mb-2">
                    <label htmlFor="username" className="block pb-1">Tên người dùng</label>
                    <InputText 
                        id="username" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        className="p-inputtext-sm w-full border p-2"
                        onKeyDown={handleKeyDown}
                    />
                </div>
                <div className="mb-2">
                    <label htmlFor="fullName" className="block pb-1">Họ và tên</label>
                    <InputText 
                        id="fullName" 
                        value={fullName} 
                        onChange={(e) => setFullName(e.target.value)} 
                        className="p-inputtext-sm w-full border p-2"
                        onKeyDown={handleKeyDown}
                    />
                </div>
                <div className="mb-2">
                    <label htmlFor="phoneNumber" className="block pb-1">Số điện thoại</label>
                    <InputText 
                        id="phoneNumber" 
                        value={phoneNumber} 
                        onChange={(e) => setPhoneNumber(e.target.value)} 
                        className="p-inputtext-sm w-full border p-2"
                        onKeyDown={handleKeyDown}
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="email" className="block pb-1">Địa chỉ email</label>
                    <InputText 
                        id="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        className="p-inputtext-sm w-full border p-2"
                        onKeyDown={handleKeyDown}
                    />
                </div>
                <div className="mb-2">
                    <label htmlFor="password" className="block pb-1">Nhập mật khẩu</label>
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
                <div className="mb-2">
                    <label htmlFor="confirmPassword" className="block pb-1">Nhập lại mật khẩu</label>
                    <div className="relative w-full border">
                        <InputText 
                            id="confirmPassword" 
                            type={showConfirmPassword ? "text" : "password"} 
                            value={confirmPassword} 
                            onChange={(e) => setConfirmPassword(e.target.value)} 
                            className="p-inputtext-sm w-full border p-2 pr-10"
                            onKeyDown={handleKeyDown}
                        />
                        <Button 
                            icon={showConfirmPassword ? "pi pi-eye-slash" : "pi pi-eye"} 
                            className="p-button-text p-button-plain absolute right-0 top-0 h-full" 
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                        />
                    </div>                    
                </div>
                <Button label="Đăng kí" onClick={handleRegister} className="p-button-secondary border p-2 hover:bg-green-500 hover:text-white w-full mb-2" />
                <div className="flex justify-center">
                    <Link to="/login" className="text-blue-500 hover:underline">Đã có tài khoản?</Link>
                </div>
            </div>
        </div>
    );
};

export default UserRegister;