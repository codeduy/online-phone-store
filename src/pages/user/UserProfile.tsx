import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { FileUpload } from 'primereact/fileupload';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { useEffect } from 'react';
import axios from 'axios';

const UserProfile = () => {
    useEffect(() => {
        const loadUserProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                const userData = localStorage.getItem('user');
                
                if (!token || !userData) {
                    window.location.href = '/login';
                    return;
                }
    
                const user = JSON.parse(userData);
                setProfile({
                    username: user.username || '',
                    fullName: user.profile?.fullName || '',
                    address: user.profile?.address || '',
                    phone: user.profile?.phone || '',
                    position: user.profile?.position || 'customer'
                });
    
                // Load profile image if exists
                if (user.profile?.imageUrl) {
                    setProfileImage(`http://localhost:3000${user.profile.imageUrl}`);
                }
            } catch (error) {
                console.error('Error loading profile:', error);
                setDialogMessage('Lỗi tải thông tin người dùng');
                setDialogVisible(true);
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
            const formData = new FormData();
            formData.append('profileImage', file);
            formData.append('fullName', profile.fullName);
            formData.append('address', profile.address || '');
            formData.append('phone', profile.phone || '');
    
            const response = await axios.put(
                'http://localhost:3000/api/auth/profile',
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
                const reader = new FileReader();
                reader.onload = (e: any) => {
                    setProfileImage(e.target.result);
                };
                reader.readAsDataURL(file);
                setDialogMessage('Tải lên ảnh đại diện thành công');
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
    
            const formData = new FormData();
            formData.append('fullName', profile.fullName);
            formData.append('address', profile.address || '');
            formData.append('phone', profile.phone || '');
    
            const response = await axios.put(
                'http://localhost:3000/api/auth/profile',
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
                'http://localhost:3000/api/auth/change-password',
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Column 1: Profile Image */}
                <div className="flex flex-col items-center ">
                    <div className="mb-4">
                        {profileImage ? (
                            <img src={profileImage as string} alt="Profile" className="w-32 h-32 rounded-full" />
                        ) : (
                            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                                <span>No Image</span>
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
                        emptyTemplate={<p className="m-0">Kéo và thả ảnh vào đây để tải lên.</p>}
                        chooseLabel="Chọn ảnh"
                        uploadLabel='Tải lên'
                        cancelLabel='Hủy'
                        className='border'
                    />
                </div>

                {/* Column 2: Profile Information */}
                <div className="flex flex-col gap-4">
                    <div>
                        <label htmlFor="username" className="block pb-1">Tên người dùng</label>
                        <InputText 
                            id="username" 
                            name="username" 
                            value={profile.username} 
                            onChange={handleInputChange} 
                            className="p-inputtext-sm w-full border p-2"
                            disabled
                        />
                    </div>
                    <div>
                        <label htmlFor="fullName" className="block pb-1">Họ và tên <span className="text-red-500">*</span></label>
                        <InputText 
                            id="fullName" 
                            name="fullName" 
                            value={profile.fullName} 
                            onChange={handleInputChange} 
                            className="p-inputtext-sm w-full border p-2"
                        />
                    </div>
                    <div>
                    <label htmlFor="address" className="block pb-1">Địa chỉ</label>
                        <InputTextarea 
                            id="address" 
                            name="address" 
                            value={profile.address} 
                            onChange={handleInputChange} 
                            className="p-inputtext-sm w-full border p-2"
                        />
                    </div>
                    <div>
                        <label htmlFor="phone" className="block pb-1">Số điện thoại</label>
                        <InputText 
                            id="phone" 
                            name="phone" 
                            value={profile.phone} 
                            onChange={handleInputChange} 
                            className="p-inputtext-sm w-full border p-2"
                        />
                    </div>
                    {/* <div>
                        <label htmlFor="position" className="block pb-1">Chức vụ</label>
                        <InputText 
                            id="position" 
                            name="position" 
                            value={profile.position} 
                            onChange={handleInputChange} 
                            className="p-inputtext-sm w-full border p-2"
                            disabled
                        />
                    </div> */}
                    <div className="flex gap-2">
                        <Button label="Lưu" onClick={handleSaveProfile} className="p-button-secondary border p-2 hover:bg-green-500 hover:text-white mt-0" />
                        <Button label="Thay đổi mật khẩu" onClick={() => setPasswordDialogVisible(true)} className="p-button-secondary border p-2 hover:bg-blue-500 hover:text-white mt-0" />
                    </div>
                </div>
            </div>

            <Dialog header="Thông báo" visible={dialogVisible} onHide={() => setDialogVisible(false)}>
                <p>{dialogMessage}</p>
            </Dialog>

            <Dialog header="Thay đổi mật khẩu" visible={passwordDialogVisible} onHide={() => setPasswordDialogVisible(false)}>
                <div className="flex flex-col gap-4">
                    <div>
                        <label htmlFor="oldPassword" className="block pb-1">Mật khẩu hiện tại</label>
                        <InputText 
                            id="oldPassword" 
                            name="oldPassword" 
                            type="password" 
                            value={passwords.oldPassword} 
                            onChange={handlePasswordChange} 
                            className="p-inputtext-sm w-full border p-2"
                        />
                    </div>
                    <div>
                        <label htmlFor="newPassword" className="block pb-1">Mật khẩu mới</label>
                        <InputText 
                            id="newPassword" 
                            name="newPassword" 
                            type="password" 
                            value={passwords.newPassword} 
                            onChange={handlePasswordChange} 
                            className="p-inputtext-sm w-full border p-2"
                        />
                    </div>
                    <div>
                        <label htmlFor="confirmPassword" className="block pb-1">Nhập lại mật khẩu mới</label>
                        <InputText 
                            id="confirmPassword" 
                            name="confirmPassword" 
                            type="password" 
                            value={passwords.confirmPassword} 
                            onChange={handlePasswordChange} 
                            className="p-inputtext-sm w-full border p-2"
                        />
                    </div>
                    {passwordError && <div className="text-red-500">{passwordError}</div>}
                    <Button label="Lưu" onClick={handleChangePassword} className="p-button-secondary border p-2 hover:bg-green-500 hover:text-white mt-0" />
                </div>
            </Dialog>

            <Dialog header="Thành công" visible={successDialogVisible} onHide={() => setSuccessDialogVisible(false)}>
                <p>Profile saved successfully!</p>
            </Dialog>
        </div>
    );
};

export default UserProfile;