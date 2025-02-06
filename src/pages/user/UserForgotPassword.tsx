import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

enum ResetStep {
  EMAIL_INPUT = 'EMAIL_INPUT',
  VERIFY_CODE = 'VERIFY_CODE',
  NEW_PASSWORD = 'NEW_PASSWORD'
}

interface ForgotPasswordForm {
  email: string;
  verificationCode: string;
  newPassword: string;
  confirmPassword: string;
}

const ForgotPasswordPage = () => {
  const [formData, setFormData] = useState<ForgotPasswordForm>({
    email: '',
    verificationCode: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [currentStep, setCurrentStep] = useState<ResetStep>(ResetStep.EMAIL_INPUT);
  const [showPassword, setShowPassword] = useState({
    new: false,
    confirm: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Giả lập kiểm tra email tồn tại trong hệ thống
  const checkEmailExists = async (email: string): Promise<boolean> => {
    // Đây là nơi bạn sẽ gọi API thực tế để kiểm tra email
    // Hiện tại chúng ta giả lập với một Promise
    return new Promise((resolve) => {
      setTimeout(() => {
        // Giả sử email có đuôi @example.com là tồn tại
        resolve(email.endsWith('@example.com'));
      }, 1000);
    });
  };

  const handleSendVerificationCode = async () => {
    setIsLoading(true);
    try {
        await axios.post('http://localhost:3000/api/auth/check-email', {
            email: formData.email
        });
        setCurrentStep(ResetStep.VERIFY_CODE);
        setCountdown(30);
    } catch (error: any) {
        setError(error.response?.data?.message || 'Error sending verification code');
    } finally {
        setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setIsLoading(true);
    try {
        const response = await axios.post('http://localhost:3000/api/auth/verify-code', {
            email: formData.email,
            code: formData.verificationCode
        });
        setCurrentStep(ResetStep.NEW_PASSWORD);
        localStorage.setItem('resetToken', response.data.resetToken);
    } catch (error: any) {
        setError(error.response?.data?.message || 'Invalid verification code');
    } finally {
        setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setIsLoading(true);
    try {
        const resetToken = localStorage.getItem('resetToken');
        await axios.post('http://localhost:3000/api/auth/reset-password', {
            resetToken,
            newPassword: formData.newPassword
        });
        localStorage.removeItem('resetToken');
        alert('Password reset successful');
        window.location.href = '/login';
    } catch (error: any) {
        setError(error.response?.data?.message || 'Error resetting password');
    } finally {
        setIsLoading(false);
    }
  };

  const inputClassName = "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all";
  const buttonClassName = "w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed";
  const labelClassName = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Đặt lại mật khẩu
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {currentStep === ResetStep.VERIFY_CODE && 'Nhập mã xác nhận đã được gửi đến email của bạn'}
            {currentStep === ResetStep.NEW_PASSWORD && 'Tạo mật khẩu mới'}
          </p>
        </div>

        {error && (
          <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
            {error}
          </div>
        )}

        <div className="mt-8 space-y-6">
          {currentStep === ResetStep.EMAIL_INPUT && (
            <div>
              <label htmlFor="email" className={labelClassName}>
                Địa chỉ email
              </label>
              <div className="flex gap-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={inputClassName}
                  placeholder="example@email.com"
                />
                <button
                  onClick={handleSendVerificationCode}
                  disabled={isLoading || countdown > 0}
                  className={`${buttonClassName} whitespace-nowrap`}
                >
                  {isLoading ? 'Đang kiểm tra...' : countdown > 0 ? `Gửi lại (${countdown}s)` : 'Gửi mã'}
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Nhập email đã đăng ký để nhận mã xác nhận
              </p>
            </div>
          )}

          {currentStep === ResetStep.VERIFY_CODE && (
            <div>
              <label htmlFor="verificationCode" className={labelClassName}>
                Mã xác nhận
              </label>
              <div className="flex gap-2">
                <input
                  id="verificationCode"
                  name="verificationCode"
                  type="text"
                  value={formData.verificationCode}
                  onChange={handleChange}
                  className={inputClassName}
                  placeholder="Nhập mã 6 số"
                />
                <button
                  onClick={handleVerifyCode}
                  disabled={isLoading}
                  className={buttonClassName}
                >
                  {isLoading ? 'Đang xác thực...' : 'Xác nhận'}
                </button>
              </div>
            </div>
          )}

          {currentStep === ResetStep.NEW_PASSWORD && (
            <>
              <div>
                <label htmlFor="newPassword" className={labelClassName}>
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={showPassword.new ? "text" : "password"}
                    value={formData.newPassword}
                    onChange={handleChange}
                    className={inputClassName}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword.new ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className={labelClassName}>
                  Xác nhận mật khẩu
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword.confirm ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={inputClassName}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                onClick={handleResetPassword}
                disabled={isLoading}
                className={buttonClassName}
              >
                {isLoading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
              </button>
            </>
          )}

          <div className="text-center">
            <a href="/login" className="text-sm text-blue-600 hover:text-blue-500">
              Quay lại đăng nhập
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;