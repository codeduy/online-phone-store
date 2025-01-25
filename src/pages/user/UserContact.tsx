import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import { IoLocationOutline, IoCallOutline, IoMailOutline, IoTimeOutline, IoLogoFacebook, IoLogoTwitter, IoLogoInstagram } from 'react-icons/io5';

interface ContactForm {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
}

const UserContact: React.FC = () => {
    const toast = useRef<Toast>(null);
    const [formData, setFormData] = useState<ContactForm>({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission
        toast.current?.show({
            severity: 'success',
            summary: 'Thành công',
            detail: 'Thông tin của bạn đã được gửi',
            life: 3000
        });
    };

    return (
        <div className="p-4 space-y-6">
            <Toast ref={toast} />

            {/* Row 1: Map (40% height) */}
            <div className="h-[400px] w-full rounded-lg shadow-lg overflow-hidden">
                <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3920.0325415516713!2d106.69763591033289!3d10.731973554130496!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317528b2747a81a3%3A0x33c1813055acb613!2sTon%20Duc%20Thang%20University!5e0!3m2!1sen!2s!4v1737799036316!5m2!1sen!2s" 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }}
                    loading="lazy" 
                    allowFullScreen
                />
            </div>

            {/* Row 2: Contact Form and Info (60% height) */}
            <div className="grid grid-cols-2 gap-8">
                {/* Column 1: Contact Form */}
                <div className="p-4 bg-white rounded-lg shadow">
                    <h2 className="text-2xl font-bold mb-6">Gửi thông tin hỗ trợ</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Họ và tên
                            </label>
                            <InputText
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full border p-2"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <InputText
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full border p-2"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Số điện thoại
                            </label>
                            <InputText
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/[^0-9]/g, '');
                                    setFormData({ ...formData, phone: value });
                                }}
                                className="w-full border p-2"
                                required
                                pattern="[0-9]*"
                                maxLength={10}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Chủ đề
                            </label>
                            <InputText
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                className="w-full border p-2"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Lời nhắn
                            </label>
                            <InputTextarea
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                rows={5}
                                className="w-full border p-2"
                                required
                            />
                        </div>
                        <Button
                            type="submit"
                            label="Gửi"
                            className="w-full border p-2 flex"
                        />
                    </form>
                </div>

                {/* Column 2: Contact Info */}
                <div className="p-4 bg-white rounded-lg shadow">
                    <h2 className="text-2xl font-bold mb-6">Liên hệ với chúng tôi</h2>
                    <div className="space-y-6">
                        {/* Basic Contact Info */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <IoLocationOutline className="text-2xl text-gray-600" />
                                <div>
                                    <h3 className="font-semibold text-base">Địa chỉ</h3>
                                    <p className="text-base text-gray-600">19 Nguyễn Hữu Thọ, P.Tân Phong, Q.7, TP.HCM</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <IoCallOutline className="text-2xl text-gray-600" />
                                <div>
                                    <h3 className="font-semibold text-base">Phone</h3>
                                    <p className="text-base text-gray-600">028 1234 5678</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <IoMailOutline className="text-2xl text-gray-600" />
                                <div>
                                    <h3 className="font-semibold text-base">Email</h3>
                                    <p className="text-base text-gray-600">support@example.com</p>
                                </div>
                            </div>
                        </div>

                        {/* Working Hours */}
                        <div className="pt-4 border-t">
                            <div className="flex items-center gap-3 mb-2">
                                <IoTimeOutline className="text-2xl text-gray-600" />
                                <h3 className="font-semibold text-base">Giờ làm việc</h3>
                            </div>
                            <div className="ml-9 space-y-1">
                                <p className="text-base text-gray-600">Thứ 2 - Thứ 6: 8:00 - 17:00</p>
                                <p className="text-base text-gray-600">Thứ 7: 8:00 - 12:00</p>
                                <p className="text-base text-gray-600">Chủ nhật: Nghỉ</p>
                            </div>
                        </div>

                        {/* Social Media */}
                        <div className="pt-4 border-t">
                            <h3 className="font-semibold text-base mb-3">Kết nối với chúng tôi</h3>
                            <div className="flex gap-4">
                                <a 
                                    href="https://www.facebook.com" 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-2xl text-gray-600 hover:text-blue-600 transition-colors"
                                >
                                    <IoLogoFacebook />
                                </a>
                                <a 
                                    href="https://www.x.com" 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-2xl text-gray-600 hover:text-blue-400 transition-colors"
                                >
                                    <IoLogoTwitter />
                                </a>
                                <a 
                                    href="https://www.instagram.com" 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-2xl text-gray-600 hover:text-pink-600 transition-colors"
                                >
                                    <IoLogoInstagram />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserContact;