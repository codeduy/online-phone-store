import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import { IoLocationOutline, IoCallOutline, IoMailOutline, IoTimeOutline, IoLogoFacebook, IoLogoTwitter, IoLogoInstagram } from 'react-icons/io5';
import axios from 'axios';
import { Helmet } from 'react-helmet';

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (!formData.name || !formData.email || !formData.phone || !formData.subject || !formData.message) {
                toast.current?.show({
                    severity: 'warn',
                    summary: 'Cảnh báo',
                    detail: 'Vui lòng điền đầy đủ thông tin',
                    life: 3000
                });
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Lỗi',
                    detail: 'Email không hợp lệ',
                    life: 3000
                });
                return;
            }

            if (formData.phone.length !== 10) {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Lỗi',
                    detail: 'Số điện thoại phải có 10 chữ số',
                    life: 3000
                });
                return;
            }

            const response = await axios.post('/api/contacts', formData);
            
            if (response.data.success) {
                toast.current?.show({
                    severity: 'success',
                    summary: 'Thành công',
                    detail: response.data.message,
                    life: 3000
                });

                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    subject: '',
                    message: ''
                });
            }
        } catch (error: any) {
            console.error('Contact submission error:', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Lỗi',
                detail: error.response?.data?.message || 'Có lỗi xảy ra',
                life: 3000
            });
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 bg-gray-50 min-h-screen">
            <Helmet>
                <title>Liên hệ</title>
                <link rel="icon" href={`${import.meta.env.VITE_IMAGE_URL}/images/favicon/phone.ico`} />
            </Helmet>
            <Toast ref={toast} />

            {/* Map Section */}
            <div className="mb-12">
                <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Liên Hệ Với Chúng Tôi</h1>
                <div className="h-[400px] w-full rounded-xl shadow-lg overflow-hidden transform hover:shadow-2xl transition-all duration-300">
                    <iframe 
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3920.0325415516713!2d106.69763591033289!3d10.731973554130496!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317528b2747a81a3%3A0x33c1813055acb613!2sTon%20Duc%20Thang%20University!5e0!3m2!1sen!2s!4v1737799036316!5m2!1sen!2s" 
                        width="100%" 
                        height="100%" 
                        style={{ border: 0 }}
                        loading="lazy" 
                        allowFullScreen
                        className="filter contrast-125"
                    />
                </div>
            </div>

            {/* Contact Form and Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Contact Form */}
                <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">Gửi Thông Tin Hỗ Trợ</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Họ và tên
                            </label>
                            <InputText
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="border w-full p-3 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <InputText
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="border w-full p-3 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Số điện thoại
                            </label>
                            <InputText
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/[^0-9]/g, '');
                                    setFormData({ ...formData, phone: value });
                                }}
                                className="border w-full p-3 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                                required
                                pattern="[0-9]*"
                                maxLength={10}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Chủ đề
                            </label>
                            <InputText
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                className="border w-full p-3 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Lời nhắn
                            </label>
                            <InputTextarea
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                rows={5}
                                className="border w-full p-3 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-none"
                                required
                            />
                        </div>
                        <Button
                            type="submit"
                            label="Gửi Thông Tin"
                            className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
                        />
                    </form>
                </div>

                {/* Contact Info */}
                <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
                    <h2 className="text-2xl font-bold mb-8 text-gray-800 border-b pb-4">Thông Tin Liên Hệ</h2>
                    <div className="space-y-8">
                        {/* Basic Contact Info */}
                        <div className="space-y-6">
                            <div className="flex items-start gap-4 group">
                                <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors duration-200">
                                    <IoLocationOutline className="text-2xl text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg text-gray-800 mb-1">Địa chỉ</h3>
                                    <p className="text-gray-600 leading-relaxed">19 Nguyễn Hữu Thọ, P.Tân Phong, Q.7, TP.HCM</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 group">
                                <div className="p-3 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors duration-200">
                                    <IoCallOutline className="text-2xl text-green-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg text-gray-800 mb-1">Điện thoại</h3>
                                    <p className="text-gray-600">028 1234 5678</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 group">
                                <div className="p-3 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors duration-200">
                                    <IoMailOutline className="text-2xl text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg text-gray-800 mb-1">Email</h3>
                                    <p className="text-gray-600">support@example.com</p>
                                </div>
                            </div>
                        </div>

                        {/* Working Hours */}
                        <div className="pt-6 border-t">
                            <div className="flex items-start gap-4 group mb-4">
                                <div className="p-3 bg-orange-50 rounded-lg group-hover:bg-orange-100 transition-colors duration-200">
                                    <IoTimeOutline className="text-2xl text-orange-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg text-gray-800 mb-3">Giờ làm việc</h3>
                                    <div className="space-y-2 text-gray-600">
                                        <p className="flex ">
                                            <span>Thứ 2 - Thứ 6:</span> 
                                            <span className='ml-5'>8:00 - 17:00</span>
                                        </p>
                                        <p className="flex justify-between">
                                            <span>Thứ 7:</span>
                                            <span>8:00 - 12:00</span>
                                        </p>
                                        <p className="flex justify-between">
                                            <span>Chủ nhật:</span>
                                            <span>Nghỉ</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Social Media */}
                        <div className="pt-6 border-t">
                            <h3 className="font-semibold text-lg text-gray-800 mb-4">Kết nối với chúng tôi</h3>
                            <div className="flex gap-6">
                                <a 
                                    href="https://www.facebook.com" 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors duration-200 group"
                                >
                                    <IoLogoFacebook className="text-2xl text-gray-600 group-hover:text-blue-600 transition-colors duration-200" />
                                </a>
                                <a 
                                    href="https://www.x.com" 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors duration-200 group"
                                >
                                    <IoLogoTwitter className="text-2xl text-gray-600 group-hover:text-blue-400 transition-colors duration-200" />
                                </a>
                                <a 
                                    href="https://www.instagram.com" 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="p-3 bg-gray-50 rounded-lg hover:bg-pink-50 transition-colors duration-200 group"
                                >
                                    <IoLogoInstagram className="text-2xl text-gray-600 group-hover:text-pink-600 transition-colors duration-200" />
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