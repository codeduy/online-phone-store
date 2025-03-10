import React, { useState, useRef } from 'react';
import { InputText } from 'primereact/inputtext';
import { InputSwitch } from 'primereact/inputswitch';
import { Dropdown } from 'primereact/dropdown';
import { RadioButton } from 'primereact/radiobutton';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import axiosInstance, { API_CONFIG } from '../../config/axiosInstance';

const AdminSettings = () => {
    const [selectedSetting, setSelectedSetting] = useState('basic');
    const [basicSettings, setBasicSettings] = useState({
        mainTitle: '',
        subTitle: '',
        adminPath: '/admin',
        blockRegistration: false,
        blockLogin: false,
        siteKey: '',
        secretKey: ''
    });
    const [emailSettings, setEmailSettings] = useState({
        smtpServer: '',
        smtpPort: 587,
        username: '',
        password: '',
        senderName: '',
        smtpAuth: true
    });
    const toast = useRef<Toast>(null);

    const handleBasicInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setBasicSettings({ ...basicSettings, [name]: value });
    };

    const handleEmailInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEmailSettings({ ...emailSettings, [name]: value });
    };

    const handleBasicSwitchChange = (e: any) => {
        const { name, checked } = e.target;
        setBasicSettings({ ...basicSettings, [name]: checked });
    };

    const handleEmailDropdownChange = (e: any) => {
        setEmailSettings({ ...emailSettings, smtpPort: e.value });
    };

    const handleEmailSwitchChange = (e: any) => {
        setEmailSettings({ ...emailSettings, smtpAuth: e.value });
    };

    const handleSaveSettings = () => {
        // Implement the logic to save the settings
        toast.current?.show({ severity: 'success', summary: 'Thành công', detail: 'Cấu hình được lưu thành công!', life: 3000 });
    };

    return (
        <div className="p-4">
            <Toast ref={toast} />
            <div className="flex gap-4 mb-4 justify-center">
                <div className="flex items-center">
                    <RadioButton 
                        inputId="basic" 
                        name="settings" 
                        value="basic" 
                        onChange={(e) => setSelectedSetting(e.value)} 
                        checked={selectedSetting === 'basic'} 
                    />
                    <label htmlFor="basic" className="ml-2">Cơ bản</label>
                </div>
                <div className="flex items-center">
                    <RadioButton 
                        inputId="email" 
                        name="settings" 
                        value="email" 
                        onChange={(e) => setSelectedSetting(e.value)} 
                        checked={selectedSetting === 'email'} 
                    />
                    <label htmlFor="email" className="ml-2">Email</label>
                </div>
            </div>

            {selectedSetting === 'basic' && (
                <div className="grid grid-cols-1 md:grid-cols gap-4">
                    <div>
                        <label htmlFor="mainTitle" className="block pb-1">Tiêu đề chính trang web</label>
                        <InputText 
                            id="mainTitle" 
                            name="mainTitle" 
                            value={basicSettings.mainTitle} 
                            onChange={handleBasicInputChange} 
                            className="p-inputtext-sm w-full border p-2"
                        />
                    </div>
                    <div>
                        <label htmlFor="subTitle" className="block pb-1">Tiêu đề phụ trang web</label>
                        <InputText 
                            id="subTitle" 
                            name="subTitle" 
                            value={basicSettings.subTitle} 
                            onChange={handleBasicInputChange} 
                            className="p-inputtext-sm w-full border p-2"
                        />
                    </div>
                    <div>
                        <label htmlFor="adminPath" className="block pb-1">Đường dẫn admin</label>
                        <InputText 
                            id="adminPath" 
                            name="adminPath" 
                            value={basicSettings.adminPath} 
                            onChange={handleBasicInputChange} 
                            className="p-inputtext-sm w-full border p-2"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <label htmlFor="blockRegistration" className="block pb-1">Chặn đăng kí</label>
                        <InputSwitch 
                            id="blockRegistration" 
                            name="blockRegistration" 
                            checked={basicSettings.blockRegistration} 
                            onChange={handleBasicSwitchChange} 
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <label htmlFor="blockLogin" className="block pb-1">Chặn đăng nhập</label>
                        <InputSwitch 
                            id="blockLogin" 
                            name="blockLogin" 
                            checked={basicSettings.blockLogin} 
                            onChange={handleBasicSwitchChange} 
                        />
                    </div>
                    <div>
                        <label htmlFor="siteKey" className="block pb-1">Google Captcha Site Key</label>
                        <InputText 
                            id="siteKey" 
                            name="siteKey" 
                            value={basicSettings.siteKey} 
                            onChange={handleBasicInputChange} 
                            className="p-inputtext-sm w-full border p-2"
                        />
                    </div>
                    <div>
                        <label htmlFor="secretKey" className="block pb-1">Google Captcha Secret Key</label>
                        <InputText 
                            id="secretKey" 
                            name="secretKey" 
                            value={basicSettings.secretKey} 
                            onChange={handleBasicInputChange} 
                            className="p-inputtext-sm w-full border p-2"
                        />
                    </div>
                </div>
            )}

            {selectedSetting === 'email' && (
                <div className="grid grid-cols-1 md:grid-cols gap-4">
                    <div>
                        <label htmlFor="smtpServer" className="block pb-1">SMTP Server</label>
                        <InputText 
                            id="smtpServer" 
                            name="smtpServer" 
                            value={emailSettings.smtpServer} 
                            onChange={handleEmailInputChange} 
                            className="p-inputtext-sm w-full border p-2"
                        />
                    </div>
                    <div>
                        <label htmlFor="smtpPort" className="block pb-1">SMTP Port</label>
                        <Dropdown 
                            id="smtpPort" 
                            name="smtpPort" 
                            value={emailSettings.smtpPort} 
                            options={[587, 465, 25]} 
                            onChange={handleEmailDropdownChange} 
                            className="p-inputtext-sm w-full border p-2"
                        />
                    </div>
                    <div>
                        <label htmlFor="username" className="block pb-1">Username</label>
                        <InputText 
                            id="username" 
                            name="username" 
                            value={emailSettings.username} 
                            onChange={handleEmailInputChange} 
                            className="p-inputtext-sm w-full border p-2"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block pb-1">Password</label>
                        <InputText 
                            id="password" 
                            name="password" 
                            type="password" 
                            value={emailSettings.password} 
                            onChange={handleEmailInputChange} 
                            className="p-inputtext-sm w-full border p-2"
                        />
                    </div>
                    <div>
                        <label htmlFor="senderName" className="block pb-1">Sender Name</label>
                        <InputText 
                            id="senderName" 
                            name="senderName" 
                            value={emailSettings.senderName} 
                            onChange={handleEmailInputChange} 
                            className="p-inputtext-sm w-full border p-2"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <label htmlFor="smtpAuth" className="block pb-1">SMTP Authentication</label>
                        <Dropdown 
                            id="smtpAuth" 
                            name="smtpAuth" 
                            value={emailSettings.smtpAuth} 
                            options={[{ label: 'True', value: true }, { label: 'False', value: false }]} 
                            onChange={handleEmailSwitchChange} 
                            className="p-inputtext-sm w-full border p-2"
                        />
                    </div>
                </div>
            )}

            <Button label="Lưu" onClick={handleSaveSettings} className="p-button-secondary border p-2 hover:bg-green-500 hover:text-white mt-4" />
        </div>
    );
};

export default AdminSettings;