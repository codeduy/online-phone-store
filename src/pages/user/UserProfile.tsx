import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { FileUpload } from 'primereact/fileupload';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { useEffect } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet';

const UserProfile = () => {
    useEffect(() => {
        const loadUserProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                
                if (!token) {
                    window.location.href = '/login';
                    return;
                }
        
                const response = await axios.get('/auth/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
        
                if (response.data.success) {
                    const userData = response.data.user;
                    setProfile({
                        username: userData.username || '',
                        fullName: userData.profile.fullName || '',
                        address: userData.profile.address || '',
                        phone: userData.profile.phone || '',
                        position: userData.profile.position || 'customer'
                    });
        
                    // Set profile image if exists
                    if (userData.profile.imageUrl) {
                        setProfileImage(`${import.meta.env.VITE_IMAGE_URL}${userData.profile.imageUrl}`);
                    }
                }
            } catch (error) {
                console.error('Error loading profile:', error);
                if (axios.isAxiosError(error) && error.response?.status === 401) {
                    // Token expired or invalid
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                } else {
                    setDialogMessage('Lỗi tải thông tin người dùng');
                    setDialogVisible(true);
                }
            }
        };
    
        loadUserProfile();
    }, []);

    const [profile, setProfile] = useState({
        username: 'user',
        fullName: 'Guest',
        address: '123 user St, User City',
        phone: '1234567890',
        position: 'User'
    });
    const [profileImage, setProfileImage] = useState<string | ArrayBuffer | null>(null);
    const [passwordError, setPasswordError] = useState('');
    const [dialogVisible, setDialogVisible] = useState(false);
    const [dialogMessage, setDialogMessage] = useState('');
    const [passwordDialogVisible, setPasswordDialogVisible] = useState(false);
    const [successDialogVisible, setSuccessDialogVisible] = useState(false);
    const [passwords, setPasswords] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleFileUpload = async (e: any) => {
        try {
            if (e.files.length > 1) {
                alert('Chỉ được upload tối đa 1 ảnh');
                return;
            }
    
            const token = localStorage.getItem('token');
            if (!token) {
                window.location.href = '/login';
                return;
            }
    
            const file = e.files[0];
            
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setDialogMessage('Vui lòng chọn file ảnh');
                setDialogVisible(true);
                return;
            }
    
            // Validate file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                setDialogMessage('Kích thước ảnh tối đa là 2MB');
                setDialogVisible(true);
                return;
            }
    
            const formData = new FormData();
            formData.append('profileImage', file);
            formData.append('fullName', profile.fullName);
            formData.append('address', profile.address || '');
            formData.append('phone', profile.phone || '');
    
            const response = await axios.put(
                '/auth/profile',
                formData,
                {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
    
            if (response.data.user) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
                
                // Update profile image using the URL from backend
                if (response.data.user.profile.imageUrl) {
                    setProfileImage(`${import.meta.env.VITE_IMAGE_URL}${response.data.user.profile.imageUrl}`);
                }
                
                setDialogMessage('Cập nhật ảnh đại diện thành công');
                setDialogVisible(true);
                e.options.clear(); // Clear the FileUpload component
            }
        } catch (error: any) {
            setDialogMessage(error.response?.data?.message || 'Lỗi upload ảnh');
            setDialogVisible(true);
        }
    };
    

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProfile({ ...profile, [name]: value });
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswords({ ...passwords, [name]: value });
    };

    const handleSaveProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                window.location.href = '/login';
                return;
            }
    
            if (!profile.fullName || profile.fullName.length < 2) {
                setDialogMessage('Họ và tên phải có ít nhất 2 kí tự');
                setDialogVisible(true);
                return;
            }

            if (profile.phone && profile.phone.trim() !== '') {
                // Check if phone contains only digits
                const phoneRegex = /^\d{10}$/;
                if (!phoneRegex.test(profile.phone)) {
                    setDialogMessage('Số điện thoại phải có đúng 10 chữ số');
                    setDialogVisible(true);
                    return;
                }
            }
    
            const formData = new FormData();
            formData.append('fullName', profile.fullName);
            formData.append('address', profile.address || '');
            formData.append('phone', profile.phone || '');
    
            const response = await axios.put(
                '/auth/profile',
                formData,
                {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
    
            if (response.data.user) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
                setSuccessDialogVisible(true);
            }
        } catch (error: any) {
            setDialogMessage(error.response?.data?.message || 'Lỗi cập nhật thông tin');
            setDialogVisible(true);
        }
    };

    const handleChangePassword = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                window.location.href = '/login';
                return;
            }
    
            // Clear previous errors
            setPasswordError('');
    
            // Validate passwords
            if (!passwords.oldPassword || !passwords.newPassword || !passwords.confirmPassword) {
                setPasswordError('Vui lòng điền đầy đủ thông tin');
                return;
            }
    
            if (passwords.newPassword !== passwords.confirmPassword) {
                setPasswordError('Mật khẩu mới không khớp');
                return;
            }
    
            if (passwords.newPassword.length < 8) {
                setPasswordError('Mật khẩu mới phải có ít nhất 8 kí tự');
                return;
            }
    
            await axios.put(
                '/auth/change-password',
                {
                    oldPassword: passwords.oldPassword,
                    newPassword: passwords.newPassword
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
    
            // Reset form
            setPasswords({
                oldPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
    
            setPasswordDialogVisible(false);
            setDialogMessage('Đổi mật khẩu thành công');
            setDialogVisible(true);
        } catch (error: any) {
            setPasswordError(error.response?.data?.message || 'Lỗi đổi mật khẩu');
        }
    };

    return (
        <div className="p-4">
            <Helmet>
                <title>Thông tin người dùng</title>
                <link rel="icon" href={`${import.meta.env.VITE_IMAGE_URL}/images/favicon/phone.ico`} />
            </Helmet>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Column 1: Profile Image */}
                <div className="flex flex-col items-center space-y-6">
                    <div className="relative">
                        {profileImage ? (
                            <div className="relative group">
                                <img 
                                    src={profileImage as string} 
                                    alt="Profile" 
                                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = '/images/default-avatar.png'; // Fallback image
                                        target.onerror = null; // Prevent infinite loop
                                    }}
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                                    <i className="pi pi-camera text-white text-xl"></i>
                                </div>
                            </div>
                        ) : (
                            <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center border-4 border-white shadow-lg">
                                <i className="pi pi-user text-4xl text-gray-400"></i>
                            </div>
                        )}
                    </div>
                    <FileUpload 
                        name="profileImage" 
                        customUpload 
                        uploadHandler={handleFileUpload}
                        accept="image/*" 
                        maxFileSize={1000000} 
                        mode="advanced" 
                        chooseLabel="Chọn ảnh"
                        uploadLabel="Tải lên"
                        cancelLabel="Hủy"
                        pt={{
                            content: { className: 'border border-gray-300 rounded-lg' },
                            chooseButton: { 
                                className: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 transition-colors duration-200 rounded-lg px-4 py-2' 
                            }
                        }}
                    />
                </div>
    
                {/* Column 2: Profile Information */}
                <div className="space-y-6">
                    {/* Username */}
                    <div className="relative">
                        <InputText 
                            id="username" 
                            name="username" 
                            value={profile.username} 
                            onChange={handleInputChange} 
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 opacity-60 cursor-not-allowed"
                            disabled
                        />
                        <label className="absolute -top-2 left-4 bg-white px-1 text-xs text-gray-500">
                            Tên người dùng
                        </label>
                    </div>
    
                    {/* Full Name */}
                    <div className="relative">
                        <InputText 
                            id="fullName" 
                            name="fullName" 
                            value={profile.fullName} 
                            onChange={handleInputChange} 
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
                        />
                        <label className="absolute -top-2 left-4 bg-white px-1 text-xs text-blue-600">
                            Họ và tên <span className="text-red-500">*</span>
                        </label>
                    </div>
    
                    {/* Address */}
                    <div className="relative">
                        <InputTextarea 
                            id="address" 
                            name="address" 
                            value={profile.address} 
                            onChange={handleInputChange} 
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
                        />
                        <label className="absolute -top-2 left-4 bg-white px-1 text-xs text-blue-600">
                            Địa chỉ 
                            {/* <span className="text-red-500">*</span> */}
                        </label>
                    </div>
    
                    {/* Phone */}
                    <div className="relative">
                        <InputText 
                            id="phone" 
                            name="phone" 
                            value={profile.phone} 
                            onChange={handleInputChange} 
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
                        />
                        <label className="absolute -top-2 left-4 bg-white px-1 text-xs text-blue-600">
                            Số điện thoại 
                            {/* <span className="text-red-500">*</span> */}
                        </label>
                    </div>
    
                    {/* Action Buttons */}
                    <div className="flex justify-start gap-4 pt-4">
                        <Button 
                            label="Lưu" 
                            icon="pi pi-check"
                            onClick={handleSaveProfile}
                            className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-green-50 hover:text-green-600 hover:border-green-300 transition-colors duration-200"
                        />
                        <Button 
                            label="Thay đổi mật khẩu" 
                            icon="pi pi-lock"
                            onClick={() => setPasswordDialogVisible(true)}
                            className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-colors duration-200"
                        />
                    </div>
                </div>
            </div>
    
            {/* Message Dialog */}
            <Dialog 
                header={<span className="text-xl font-semibold">Thông báo</span>}
                visible={dialogVisible} 
                onHide={() => setDialogVisible(false)} 
                className="w-[400px]"
                pt={{
                    root: { className: 'bg-white rounded-lg shadow-lg' },
                    header: { className: 'border-b p-4' },
                    content: { className: 'p-6' },
                    closeButton: { className: 'hover:bg-gray-100 rounded-full p-2 transition-colors duration-200' }
                }}
            >
                <p className="text-gray-600">{dialogMessage}</p>
            </Dialog>
    
            {/* Change Password Dialog */}
            <Dialog 
                header={<span className="text-xl font-semibold">Thay đổi mật khẩu</span>}
                visible={passwordDialogVisible} 
                onHide={() => setPasswordDialogVisible(false)} 
                className="w-[500px]"
                pt={{
                    root: { className: 'bg-white rounded-lg shadow-lg' },
                    header: { className: 'border-b p-4' },
                    content: { className: 'p-6' },
                    closeButton: { className: 'hover:bg-gray-100 rounded-full p-2 transition-colors duration-200' }
                }}
            >
                <div className="space-y-6">
                    {/* Current Password */}
                    <div className="relative">
                        <InputText 
                            id="oldPassword" 
                            name="oldPassword" 
                            type="password" 
                            value={passwords.oldPassword} 
                            onChange={handlePasswordChange} 
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
                        />
                        <label className="absolute -top-2 left-4 bg-white px-1 text-xs text-blue-600">
                            Mật khẩu hiện tại
                        </label>
                    </div>
    
                    {/* New Password */}
                    <div className="relative">
                        <InputText 
                            id="newPassword" 
                            name="newPassword" 
                            type="password" 
                            value={passwords.newPassword} 
                            onChange={handlePasswordChange} 
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
                        />
                        <label className="absolute -top-2 left-4 bg-white px-1 text-xs text-blue-600">
                            Mật khẩu mới
                        </label>
                    </div>
    
                    {/* Confirm Password */}
                    <div className="relative">
                        <InputText 
                            id="confirmPassword" 
                            name="confirmPassword" 
                            type="password" 
                            value={passwords.confirmPassword} 
                            onChange={handlePasswordChange} 
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
                        />
                        <label className="absolute -top-2 left-4 bg-white px-1 text-xs text-blue-600">
                            Nhập lại mật khẩu mới
                        </label>
                    </div>
    
                    {passwordError && (
                        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                            {passwordError}
                        </div>
                    )}
    
                    {/* Action Buttons */}
                    <div className="flex justify-end gap-4 pt-4">
                        <Button 
                            label="Hủy" 
                            icon="pi pi-times"
                            onClick={() => setPasswordDialogVisible(false)}
                            className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                        />
                        <Button 
                            label="Lưu" 
                            icon="pi pi-check"
                            onClick={handleChangePassword}
                            className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-green-50 hover:text-green-600 hover:border-green-300 transition-colors duration-200"
                        />
                    </div>
                </div>
            </Dialog>
    
            {/* Success Dialog */}
            <Dialog 
                header={<span className="text-xl font-semibold">Thành công</span>}
                visible={successDialogVisible} 
                onHide={() => setSuccessDialogVisible(false)}
                className="w-[400px]"
                pt={{
                    root: { className: 'bg-white rounded-lg shadow-lg' },
                    header: { className: 'border-b p-4' },
                    content: { className: 'p-6' },
                    closeButton: { className: 'hover:bg-gray-100 rounded-full p-2 transition-colors duration-200' }
                }}
            >
                <div className="flex items-center gap-3">
                    <i className="pi pi-check-circle text-green-500 text-2xl"></i>
                    <p className="text-gray-600">Thông tin đã được cập nhật thành công!</p>
                </div>
            </Dialog>
        </div>
    );
};

export default UserProfile;