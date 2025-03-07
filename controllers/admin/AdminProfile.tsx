import React, { useState, useEffect } from 'react';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { FileUpload } from 'primereact/fileupload';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';

interface FileUploadHandlerEvent {
    files: File[];
    options: {
        clear: () => void;
        props: any;
    };
}

const AdminProfile = () => {
    const [profile, setProfile] = useState({
        username: 'admin',
        fullName: 'Admin User',
        address: '123 Admin St, Admin City',
        phone: '1234567890',
        position: 'Administrator'
    });
    const [profileImage, setProfileImage] = useState<File | string | null>(null);
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
    const navigate = useNavigate();

    useEffect(() => {
        const loadAdminProfile = async () => {
            try {
                const token = localStorage.getItem('adminToken');
                
                if (!token) {
                    navigate('/admin/login');
                    return;
                }
    
                // Debug log for headers
                console.log('Request Headers:', {
                    'Authorization': `Bearer ${token}`
                });
        
                const response = await axios.get('http://localhost:3000/api/admin/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
        
                // Debug log for response
                console.log('Profile Response:', response.data);
        
                if (response.data.success) {
                    const userData = response.data.data.user;
                    setProfile({
                        username: userData.username,
                        fullName: userData.profile.fullName || '',
                        address: userData.profile.address || '',
                        phone: userData.profile.phone || '',
                        position: 'Administrator'
                    });
        
                    if (userData.profile.imageUrl) {
                        setProfileImage(`http://localhost:3000${userData.profile.imageUrl}`);
                    }
                }
            } catch (error) {
                console.error('Error loading profile:', error);
                // Debug log for error details
                if (axios.isAxiosError(error)) {
                    console.log('Error Response:', error.response?.data);
                    console.log('Error Status:', error.response?.status);
                }
                setDialogMessage('Error loading profile data');
                setDialogVisible(true);
            }
        };
    
        loadAdminProfile();
    }, [navigate]);

    const handleFileUpload = (event: FileUploadHandlerEvent) => {
        if (event.files.length > 1) {
            alert('Chỉ được upload tối đa 1 ảnh');
            return;
        }
    
        const file = event.files[0];
        
        // Lưu File object để gửi lên server
        const imageFile = file;
        
        // Tạo preview
        const reader = new FileReader();
        reader.onload = (e) => {
            if (e.target?.result) {
                setProfileImage(e.target.result as string);
            }
        };
        reader.readAsDataURL(file);
    
        // Clear file input sau khi upload
        event.options.clear();
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
            const token = localStorage.getItem('adminToken');
            
            // Debug log for save profile token
            console.log('Save Profile Token:', token);
            
            if (!token) {
                navigate('/admin/login');
                return;
            }
    
            const formData = new FormData();
            formData.append('fullName', profile.fullName);
            formData.append('address', profile.address);
            formData.append('phone', profile.phone);
    
            // Debug log for form data
            console.log('Form Data:', {
                fullName: profile.fullName,
                address: profile.address,
                phone: profile.phone
            });
    
            if (profileImage instanceof File) {
                formData.append('profileImage', profileImage);
                console.log('Profile Image added to form data');
            }
    
            // Debug log for request headers
            console.log('Save Profile Headers:', { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            });
    
            const response = await axios.put(
                'http://localhost:3000/api/admin/profile',
                formData,
                {
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
    
            // Debug log for save response
            console.log('Save Profile Response:', response.data);
    
            if (response.data.success) {
                setDialogMessage('Profile updated successfully');
                setSuccessDialogVisible(true);
            }
        } catch (error: any) {
            // Debug log for save error
            console.error('Save Profile Error:', error);
            if (axios.isAxiosError(error)) {
                console.log('Error Response:', error.response?.data);
                console.log('Error Status:', error.response?.status);
            }
            setDialogMessage(error.response?.data?.message || 'Error updating profile');
            setDialogVisible(true);
        }
    };

    const handleChangePassword = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            if (!token) {
                navigate('/admin/login');
                return;
            }
    
            if (passwords.newPassword !== passwords.confirmPassword) {
                setPasswordError('New passwords do not match');
                return;
            }
    
            const response = await axios.put(
                'http://localhost:3000/api/admin/change-password',
                {
                    oldPassword: passwords.oldPassword,
                    newPassword: passwords.newPassword
                },
                {
                    headers: { 
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
    
            if (response.data.success) {
                setPasswordDialogVisible(false);
                setDialogMessage('Password changed successfully');
                setDialogVisible(true);
                setPasswords({
                    oldPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
            }
        } catch (error: any) {
            setPasswordError(error.response?.data?.message || 'Error changing password');
        }
    };

    return (
        <div className="p-4">
            <Helmet>
                <title>Thông tin quản trị viên</title>
                <link rel="icon" href="../../src/assets/img/phone.ico" />
            </Helmet>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Column 1: Profile Image */}
                <div className="flex flex-col items-center space-y-6">
                    <div className="relative">
                        {profileImage ? (
                            <img 
                                src={profileImage as string} 
                                alt="Profile" 
                                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                            />
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
                            Địa chỉ <span className="text-red-500">*</span>
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
                            Số điện thoại <span className="text-red-500">*</span>
                        </label>
                    </div>
    
                    {/* Position */}
                    <div className="relative">
                        <InputText 
                            id="position" 
                            name="position" 
                            value={profile.position} 
                            onChange={handleInputChange} 
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 opacity-60 cursor-not-allowed"
                            disabled
                        />
                        <label className="absolute -top-2 left-4 bg-white px-1 text-xs text-gray-500">
                            Chức vụ
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

export default AdminProfile;