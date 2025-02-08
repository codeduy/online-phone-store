import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTruck, faCreditCard, faHeadset, faMapMarkerAlt, faPhone, faEnvelope } from '@fortawesome/free-solid-svg-icons';

const UserFooter = () => {
    return (
        <footer className="bg-gray-600 text-white p-3 mt-1 rounded-lg pl-12">
            <div className="container mx-auto px-4">
                {/* Top icons section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 ml-12 pl-10">
                    <div className="flex items-center justify-center md:justify-start">
                        <FontAwesomeIcon icon={faTruck} className="text-xl md:text-2xl mr-2" />
                        <span className="text-xl ">Miễn phí giao hàng</span>
                    </div>
                    <div className="flex items-center justify-center md:justify-start">
                        <FontAwesomeIcon icon={faCreditCard} className="text-xl md:text-2xl mr-2" />
                        <span className="text-xl">Thanh toán nhanh chóng</span>
                    </div>
                    <div className="flex items-center justify-center md:justify-start">
                        <FontAwesomeIcon icon={faHeadset} className="text-xl md:text-2xl mr-2" />
                        <span className="text-xl">Hỗ trợ 24/7</span>
                    </div>
                </div>

                {/* Information sections */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 ml-12 pl-10">
                    <div className="text-center md:text-left px-4">
                        <h4 className="text-lg font-bold mb-4">Mobile Shop</h4>
                        <div className="space-y-2">
                            <p className="flex items-center justify-center md:justify-start">
                                <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
                                <span className="text-2sm">Địa chỉ: 123 Đường ABC, Quận XYZ</span>
                            </p>
                            <p className="flex items-center justify-center md:justify-start">
                                <FontAwesomeIcon icon={faPhone} className="mr-2" />
                                <span className="text-2sm">Số điện thoại: 0123 456 789</span>
                            </p>
                            <p className="flex items-center justify-center md:justify-start">
                                <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                                <span className="text-2sm">Email: info@example.com</span>
                            </p>
                        </div>
                    </div>
                    
                    <div className="text-center md:text-left px-4">
                        <h4 className="text-lg font-bold mb-4">Thông tin</h4>
                        <ul className="space-y-2">
                            <li><Link to="/about" className="text-sm hover:underline">Về chúng tôi</Link></li>
                            <li><Link to="/shipping-info" className="text-2sm hover:underline">Thông tin giao hàng</Link></li>
                            <li><Link to="/privacy-policy" className="text-2sm hover:underline">Chính sách bảo mật</Link></li>
                            <li><Link to="/terms-conditions" className="text-2sm hover:underline">Điều khoản & Điều kiện</Link></li>
                        </ul>
                    </div>

                    <div className="text-center md:text-left px-4">
                        <h4 className="text-lg font-bold mb-4">Chăm sóc khách hàng</h4>
                        <ul className="space-y-2">
                            <li><Link to="/contact" className="text-2sm hover:underline">Liên hệ với chúng tôi</Link></li>
                            <li><Link to="/store-locations" className="text-2sm hover:underline">Các chi nhánh cửa hàng</Link></li>
                            <li><Link to="/blog" className="text-2sm hover:underline">Blog hướng dẫn</Link></li>
                        </ul>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default UserFooter;