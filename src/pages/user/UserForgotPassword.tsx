import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';

const UserForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false); 
    const [showVerificationFields, setShowVerificationFields] = useState(false);
    const [showPasswordFields, setShowPasswordFields] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const toast = useRef<Toast>(null);
    const navigate = useNavigate();

    useEffect(() => {
        let timer: string | number | NodeJS.Timeout | undefined;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    const handleSendVerificationCode = () => {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            toast.current?.show({ severity: 'error', summary: 'Lỗi', detail: 'Địa chỉ email không hợp lệ.', life: 3000 });
            return;
        }
        // Simulate email existence check
        const emailExists = true; // Replace with actual email existence check
        if (!emailExists) {
            toast.current?.show({ severity: 'error', summary: 'Lỗi', detail: 'Email không tồn tại trên hệ thống!', life: 3000 });
            return;
        }
        // Simulate sending verification code
        setShowVerificationFields(true);
        setCountdown(30);
        toast.current?.show({ severity: 'success', summary: 'Thành công', detail: 'Mã xác nhận đã được gửi!', life: 3000 });
    };

    const handleVerifyCode = () => {
        // Simulate verification code check
        const correctCode = '123456'; // Replace with actual verification code check
        if (verificationCode !== correctCode) {
            toast.current?.show({ severity: 'error', summary: 'Lỗi', detail: 'Mã sai.', life: 3000 });
            return;
        }
        setShowPasswordFields(true);
        toast.current?.show({ severity: 'success', summary: 'Thành công', detail: 'Mã xác nhận đúng!', life: 3000 });
    };

    const handleResetPassword = () => {
        if (newPassword.length < 8) {
            toast.current?.show({ severity: 'error', summary: 'Lỗi', detail: 'Mật khẩu phải có ít nhất 8 kí tự.', life: 3000 });
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.current?.show({ severity: 'error', summary: 'Lỗi', detail: 'Mật khẩu không khớp.', life: 3000 });
            return;
        }
        // Implement password reset logic here
        toast.current?.show({ severity: 'success', summary: 'Thành công', detail: 'Đổi mật khẩu thành công!', life: 3000 });
        navigate('/login');
    };
    
    return (
        <div className="flex justify-center items-center h-screen">
            <Toast ref={toast} />
            <div className="p-4 border rounded shadow-md w-96">
                <h2 className="text-center mb-2">Đặt lại mật khẩu</h2>
                <div className="mb-4">
                    <label htmlFor="email" className="block pb-1">Địa chỉ email</label>
                    <div className="flex">
                        <InputText 
                            id="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            className="p-inputtext-sm w-full border p-2"
                        />
                        <Button 
                            label={countdown > 0 ? `Gửi lại (${countdown}s)` : 'Gửi mã xác nhận'} 
                            onClick={handleSendVerificationCode} 
                            disabled={countdown > 0} 
                            className="ml-2 border p-1"
                        />
                    </div>
                </div>
                {showVerificationFields && (
                    <div className="mb-4">
                        <label htmlFor="verificationCode" className="block pb-1">Mã xác thực</label>
                        <div className="flex">
                            <InputText 
                                id="verificationCode" 
                                value={verificationCode} 
                                onChange={(e) => setVerificationCode(e.target.value)} 
                                className="p-inputtext-sm w-full border p-2"
                            />
                            <Button 
                                label="Xác nhận" 
                                onClick={handleVerifyCode} 
                                className="ml-2 border p-1"
                            />
                        </div>
                    </div>
                )}
                {showPasswordFields && (
                    <>
                        <div className="mb-4">
                            <label htmlFor="newPassword" className="block pb-1">Nhập mật khẩu mới</label>
                            <div className="relative w-full border">
                                <InputText 
                                    id="password" 
                                    type={showPassword ? "text" : "password"} 
                                    value={newPassword} 
                                    onChange={(e) => setNewPassword(e.target.value)} 
                                    className="p-inputtext-sm w-full border p-2 pr-10"
                                />
                                <Button 
                                    icon={showPassword ? "pi pi-eye-slash" : "pi pi-eye"} 
                                    className="p-button-text p-button-plain absolute right-0 top-0 h-full" 
                                    onClick={() => setShowPassword(!showPassword)} 
                                />
                            </div>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="confirmPassword" className="block pb-1">Nhập lại mật khẩu mới</label>
                            <div className="relative w-full border">
                                <InputText 
                                    id="confirmPassword" 
                                    type={showConfirmPassword ? "text" : "password"} 
                                    value={confirmPassword} 
                                    onChange={(e) => setConfirmPassword(e.target.value)} 
                                    className="p-inputtext-sm w-full border p-2 pr-10"
                                />
                                <Button 
                                    icon={showConfirmPassword ? "pi pi-eye-slash" : "pi pi-eye"} 
                                    className="p-button-text p-button-plain absolute right-0 top-0 h-full" 
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                                />
                            </div>   
                        </div>
                        <Button label="Lưu" onClick={handleResetPassword} className="p-button-secondary border p-2 hover:bg-green-500 hover:text-white w-full mb-4" />
                    </>
                )}
            </div>
        </div>
    );
};

export default UserForgotPassword;