import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

// Định nghĩa kiểu dữ liệu cho form
interface FormData {
  username: string;    // Tên đăng nhập
  fullName: string;    // Họ và tên
  phoneNumber: string; // Số điện thoại
  email: string;       // Email
  password: string;    // Mật khẩu
  confirmPassword: string; // Xác nhận mật khẩu
}

// Định nghĩa kiểu dữ liệu cho các lỗi
interface FormErrors {
  [key: string]: string;
}

// Component chính
const UserRegister = () => {
  // Quản lý dữ liệu form
  const [formData, setFormData] = useState<FormData>({
    username: '',
    fullName: '',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Quản lý trạng thái lỗi và loading
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  // Quản lý hiển thị/ẩn mật khẩu
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Kiểm tra dữ liệu form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Kiểm tra các trường bắt buộc
    Object.keys(formData).forEach(key => {
      if (!formData[key as keyof FormData]) {
        newErrors[key] = 'Trường này là bắt buộc';
      }
    });

    // Kiểm tra số điện thoại chỉ chứa số
    if (formData.phoneNumber && !/^\d+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Số điện thoại chỉ được chứa số';
    }

    // Kiểm tra email hợp lệ
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Địa chỉ email không hợp lệ';
    }

    // Kiểm tra độ dài mật khẩu
    if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Mật khẩu phải có ít nhất 8 kí tự';
    }

    // Kiểm tra mật khẩu xác nhận
    if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu không khớp';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Xử lý thay đổi input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Xóa lỗi khi người dùng bắt đầu nhập
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Xử lý submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Giả lập gọi API
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Đăng ký thành công!');
    } catch (error) {
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  // Các class CSS thường dùng
  const inputClassName = "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all";
  const errorClassName = "text-red-500 text-sm mt-1";
  const labelClassName = "block text-sm font-medium text-gray-700 mb-1";

  // Danh sách các trường input cơ bản
  const basicFields = [
    { name: 'username', label: 'Tên người dùng', type: 'text' },
    { name: 'fullName', label: 'Họ và tên', type: 'text' },
    { name: 'phoneNumber', label: 'Số điện thoại', type: 'tel' },
    { name: 'email', label: 'Địa chỉ email', type: 'email' }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        {/* Header */}
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            E-Commerce Website
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Đăng ký tài khoản người dùng
          </p>
        </div>

        {/* Form đăng ký */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Các trường thông tin cơ bản */}
            {basicFields.map(field => (
              <div key={field.name}>
                <label htmlFor={field.name} className={labelClassName}>
                  {field.label}
                </label>
                <input
                  id={field.name}
                  name={field.name}
                  type={field.type}
                  value={formData[field.name as keyof FormData]}
                  onChange={handleChange}
                  className={`${inputClassName} ${errors[field.name] ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors[field.name] && (
                  <p className={errorClassName}>{errors[field.name]}</p>
                )}
              </div>
            ))}

            {/* Trường mật khẩu */}
            {[
              { name: 'password', label: 'Nhập mật khẩu' },
              { name: 'confirmPassword', label: 'Nhập lại mật khẩu' }
            ].map(field => (
              <div key={field.name}>
                <label htmlFor={field.name} className={labelClassName}>
                  {field.label}
                </label>
                <div className="relative">
                  <input
                    id={field.name}
                    name={field.name}
                    type={field.name === 'password' ? (showPassword ? 'text' : 'password') : (showConfirmPassword ? 'text' : 'password')}
                    value={formData[field.name as keyof FormData]}
                    onChange={handleChange}
                    className={`${inputClassName} ${errors[field.name] ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {/* Nút hiển thị/ẩn mật khẩu */}
                  <button
                    type="button"
                    onClick={() => field.name === 'password' ? setShowPassword(!showPassword) : setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {field.name === 'password' ? 
                      (showPassword ? <EyeOff size={20} /> : <Eye size={20} />) :
                      (showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />)
                    }
                  </button>
                </div>
                {errors[field.name] && (
                  <p className={errorClassName}>{errors[field.name]}</p>
                )}
              </div>
            ))}
          </div>

          {/* Nút đăng ký */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
              ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'}`}
          >
            {isLoading ? 'Đang xử lý...' : 'Đăng ký'}
          </button>

          {/* Link đăng nhập */}
          <div className="text-center">
            <a href="/login" className="text-sm text-blue-600 hover:text-blue-500">
              Đã có tài khoản?
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserRegister;