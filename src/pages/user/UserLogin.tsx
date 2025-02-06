import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { useEffect } from 'react';

// Định nghĩa kiểu dữ liệu cho form đăng nhập
interface LoginFormData {
  username: string;    // Tên đăng nhập
  password: string;    // Mật khẩu
  rememberMe: boolean; // Ghi nhớ đăng nhập
}

// Component chính
const LoginPage = () => {
  useEffect(() => {
    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const response = await axios.post('http://localhost:3000/api/auth/verify-token', null, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.valid) {
                window.location.href = '/home';
            }
        } catch (error) {
            localStorage.removeItem('token');
        }
    };

    checkAuth();
  }, []);
  // Quản lý dữ liệu form
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: '',
    rememberMe: false
  });

  // Quản lý trạng thái
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Xử lý thay đổi input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Xóa thông báo lỗi khi người dùng bắt đầu nhập
    if (error) setError('');
  };

  // Kiểm tra form trước khi submit
  const validateForm = (): boolean => {
    if (!formData.username) {
      setError('Tên người dùng không được để trống');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 kí tự');
      return false;
    }
    return true;
  };

  // Xử lý đăng nhập
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
        const response = await axios.post('http://localhost:3000/api/auth/login', {
            username: formData.username,
            password: formData.password
        }, {
            withCredentials: true
        });

        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            window.location.href = '/';
        }
    } catch (error: any) {
        setError(error.response?.data?.message || 'Invalid credentials');
    } finally {
        setIsLoading(false);
    }
};

  // Các class CSS thường dùng
  const inputClassName = "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all";
  const labelClassName = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        {/* Header */}
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            E-Commerce Website
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Chào mừng quý khách
          </p>
        </div>

        {/* Form đăng nhập */}
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {/* Hiển thị lỗi nếu có */}
          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          {/* Trường tên đăng nhập */}
          <div>
            <label htmlFor="username" className={labelClassName}>
              Tên người dùng
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              className={`${inputClassName} border-gray-300`}
            />
          </div>

          {/* Trường mật khẩu */}
          <div>
            <label htmlFor="password" className={labelClassName}>
              Mật khẩu
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                className={`${inputClassName} border-gray-300`}
              />
              {/* Nút hiển thị/ẩn mật khẩu */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Checkbox ghi nhớ đăng nhập */}
          <div className="flex items-center">
            <input
              id="rememberMe"
              name="rememberMe"
              type="checkbox"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900">
              Nhớ tài khoản?
            </label>
          </div>

          {/* Nút đăng nhập */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
              ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'}`}
          >
            {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>

          {/* Links */}
          <div className="flex justify-between text-sm">
            <a href="/register" className="text-blue-600 hover:text-blue-500">
              Chưa có tài khoản?
            </a>
            <a href="/forgot-password" className="text-blue-600 hover:text-blue-500">
              Quên mật khẩu?
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;