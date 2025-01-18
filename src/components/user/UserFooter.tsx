import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTruck, faCreditCard, faHeadset, faMapMarkerAlt, faPhone, faEnvelope } from '@fortawesome/free-solid-svg-icons';

const UserFooter = () => {
    return (
        <footer className="bg-gray-600 text-white p-3 mt-1 rounded-lg">
            <div className="flex justify-around mb-8">
                <div className="flex items-center">
                    <FontAwesomeIcon icon={faTruck} className="text-2xl mr-2" />
                    <span>Miễn phí giao hàng</span>
                </div>
                <div className="flex items-center">
                    <FontAwesomeIcon icon={faCreditCard} className="text-2xl mr-2" />
                    <span>Thanh toán nhanh chóng</span>
                </div>
                <div className="flex items-center">
                    <FontAwesomeIcon icon={faHeadset} className="text-2xl mr-2" />
                    <span>Hỗ trợ 24/7</span>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                    <h4 className="text-lg font-bold mb-2">Mobile Shop</h4>
                    <p><FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />Địa chỉ: 123 Đường ABC, Quận XYZ</p>
                    <p><FontAwesomeIcon icon={faPhone} className="mr-2" />Số điện thoại: 0123 456 789</p>
                    <p><FontAwesomeIcon icon={faEnvelope} className="mr-2" />Email: info@example.com</p>
                </div>
                <div>
                    <h4 className="text-lg font-bold mb-2">THÔNG TIN</h4>
                    <ul>
                        <li><Link to="/about" className="hover:underline">Về chúng tôi</Link></li>
                        <li><Link to="/shipping-info" className="hover:underline">Thông tin giao hàng</Link></li>
                        <li><Link to="/privacy-policy" className="hover:underline">Chính sách bảo mật</Link></li>
                        <li><Link to="/terms-conditions" className="hover:underline">Điều khoản & Điều kiện</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-lg font-bold mb-2">Chăm sóc khách hàng</h4>
                    <ul>
                        <li><Link to="/contact" className="hover:underline">Liên hệ với chúng tôi</Link></li>
                        <li><Link to="/store-locations" className="hover:underline">Các chi nhánh cửa hàng</Link></li>
                        <li><Link to="/blog" className="hover:underline">Blog hướng dẫn</Link></li>
                    </ul>
                </div>
            </div>
        </footer>
    );
};

export default UserFooter;