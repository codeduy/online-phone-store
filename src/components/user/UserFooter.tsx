import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faTruck, 
    faCreditCard, 
    faHeadset, 
    faMapMarkerAlt, 
    faPhone, 
    faEnvelope 
} from '@fortawesome/free-solid-svg-icons';

const UserFooter = () => {
    return (
        <footer className="bg-gradient-to-r from-gray-800 to-gray-900 text-gray-100">
            {/* Service highlights section */}
            <div className="container mx-auto py-8 px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="flex items-center space-x-4 p-4 bg-gray-700/30 rounded-lg transform transition-transform duration-300">
                        <FontAwesomeIcon icon={faTruck} className="text-3xl text-blue-400" />
                        <div>
                            <h3 className="font-semibold text-lg">Miễn phí giao hàng</h3>
                            <p className="text-sm text-gray-300">Cho đơn hàng trên 500k</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4 p-4 bg-gray-700/30 rounded-lg transform transition-transform duration-300">
                        <FontAwesomeIcon icon={faCreditCard} className="text-3xl text-green-400" />
                        <div>
                            <h3 className="font-semibold text-lg">Thanh toán nhanh chóng</h3>
                            <p className="text-sm text-gray-300">Đa dạng phương thức</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4 p-4 bg-gray-700/30 rounded-lg transform transition-transform duration-300">
                        <FontAwesomeIcon icon={faHeadset} className="text-3xl text-purple-400" />
                        <div>
                            <h3 className="font-semibold text-lg">Hỗ trợ 24/7</h3>
                            <p className="text-sm text-gray-300">Luôn sẵn sàng phục vụ</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main footer content */}
            <div className="border-t border-gray-700">
                <div className="container mx-auto py-12 px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {/* Company Info */}
                        <div className="space-y-4">
                            <h4 className="text-xl font-bold mb-6 text-white relative inline-block">
                                Mobile Shop
                                <span className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-blue-500"></span>
                            </h4>
                            <div className="space-y-3">
                                <p className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors duration-200">
                                    <FontAwesomeIcon icon={faMapMarkerAlt} className="text-blue-400" />
                                    <span>123 Đường ABC, Quận XYZ</span>
                                </p>
                                <p className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors duration-200">
                                    <FontAwesomeIcon icon={faPhone} className="text-blue-400" />
                                    <span>0123 456 789</span>
                                </p>
                                <p className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors duration-200">
                                    <FontAwesomeIcon icon={faEnvelope} className="text-blue-400" />
                                    <span>info@example.com</span>
                                </p>
                            </div>
                        </div>

                        {/* Information Links */}
                        <div className="space-y-4">
                            <h4 className="text-xl font-bold mb-6 text-white relative inline-block">
                                Thông tin
                                <span className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-blue-500"></span>
                            </h4>
                            <ul className="space-y-3">
                                <li>
                                    <Link to="/about" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center">
                                        <span className="mr-2">›</span>
                                        Về chúng tôi
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/shipping-info" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center">
                                        <span className="mr-2">›</span>
                                        Thông tin giao hàng
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/privacy-policy" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center">
                                        <span className="mr-2">›</span>
                                        Chính sách bảo mật
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/terms-conditions" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center">
                                        <span className="mr-2">›</span>
                                        Điều khoản & Điều kiện
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Customer Service */}
                        <div className="space-y-4">
                            <h4 className="text-xl font-bold mb-6 text-white relative inline-block">
                                Chăm sóc khách hàng
                                <span className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-blue-500"></span>
                            </h4>
                            <ul className="space-y-3">
                                <li>
                                    <Link to="/contact" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center">
                                        <span className="mr-2">›</span>
                                        Liên hệ với chúng tôi
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/store-locations" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center">
                                        <span className="mr-2">›</span>
                                        Các chi nhánh cửa hàng
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/blog" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center">
                                        <span className="mr-2">›</span>
                                        Blog hướng dẫn
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Copyright */}
            <div className="bg-gray-900">
                <div className="container mx-auto py-4 px-4">
                    <p className="text-center text-gray-400 text-sm">
                        © {new Date().getFullYear()} Mobile Shop. Tất cả các quyền được bảo lưu.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default UserFooter;