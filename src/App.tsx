import axios from "axios";
import "primereact/resources/themes/lara-light-cyan/theme.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./components/admin/AdminLayout";        
import 'primeicons/primeicons.css';
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminStaffs from "./pages/admin/AdminStaffs";
import AdminNews from "./pages/admin/AdminNews.tsx";
import AdminStatistics from "./pages/admin/AdminStatistics";
import AdminProfile from "./pages/admin/AdminProfile.tsx";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminCoupons from "./pages/admin/AdminCoupons";
import AdminOrderDetails from "./pages/admin/AdminOrderDetails";

import StaffDashboard from "./pages/staff/StaffDashboard";
import StaffProducts from "./pages/staff/StaffProducts";
import StaffOrders from "./pages/staff/StaffOrders.tsx";
import StaffCustomers from "./pages/staff/StaffCustomers";
import StaffPayments from "./pages/staff/StaffPayments.tsx";
import StaffNews from "./pages/staff/StaffNews";
import StaffStatistics from "./pages/staff/StaffStatistics";
import StaffProfile from "./pages/staff/StaffProfile.tsx";
import StaffLogin from "./pages/staff/StaffLogin";
import StaffLayout from "./components/staff/StaffLayout";
import StaffCoupons from "./pages/staff/StaffCoupons";
import StaffOrderDetails from "./pages/staff/StaffOrderDetails";

import UserLayout from "./components/user/UserLayout";
import UserHome from "./pages/user/UserHome";
import UserCart from "./pages/user/UserCart";
import UserProfile from "./pages/user/UserProfile";
import UserLogin from "./pages/user/UserLogin";
import UserRegister from "./pages/user/UserRegister.tsx";
import UserForgotPassword from "./pages/user/UserForgotPassword";
import UserProduct from "./pages/user/UserProduct.tsx";
import UserProductsByBrand from "./pages/user/UserProductsByBrand";
import UserProductsFilter from "./pages/user/UserProductsFilter.tsx";
import UserProductDetail from "./pages/user/UserProductDetail.tsx";
import { CartProvider } from "./pages/user/CartContext";
import UserProductReview from "./pages/user/UserProductReview.tsx";
import UserProductsCompare from "./pages/user/UserProductsCompare.tsx";
import UserOrders from "./pages/user/UserOrders.tsx";

axios.defaults.baseURL = "http://localhost:8000/api";

const App = () => {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="staffs" element={<AdminStaffs />} />
            <Route path="news" element={<AdminNews />} />
            <Route path="statistics" element={<AdminStatistics />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="coupons" element={<AdminCoupons />} />
            <Route path="/admin/orders/:id" element={<AdminOrderDetails/>} />
            {/* Admin routes */}
          </Route>

          <Route path="/admin/login" element={<AdminLogin />} />

          <Route path="/staff" element={<StaffLayout />}>
            <Route index element={<Navigate to="/staff/dashboard" />} />
            <Route path="dashboard" element={<StaffDashboard />} />
            <Route path="products" element={<StaffProducts />} />
            <Route path="orders" element={<StaffOrders />} />
            <Route path="customers" element={<StaffCustomers />} />
            <Route path="payments" element={<StaffPayments />} />          
            <Route path="news" element={<StaffNews />} />
            <Route path="statistics" element={<StaffStatistics />} />
            <Route path="profile" element={<StaffProfile />} />
            <Route path="coupons" element={<StaffCoupons />} />
            <Route path="/staff/orders/:id" element={<StaffOrderDetails/>} />
            {/* Staff routes */}
          </Route>

          <Route path="/staff/login" element={<StaffLogin />} />
          

          <Route path="/" element={<UserLayout />}>
            <Route index element={<Navigate to="/home" />} />
            <Route path="home" element={<UserHome />} />
            <Route path="cart" element={<UserCart />} />
            <Route path="profile" element={<UserProfile />} /> 
            <Route path="products" element={<UserProduct />} />    
            <Route path="products/:brand" element={<UserProductsByBrand />} />
            <Route path="user-products-filter" element={<UserProductsFilter />} />
            <Route path="/product/:slug" element={<UserProductDetail/>} />
            <Route path="/product/:slug/review" element={<UserProductReview/>} />
            <Route path="/products/compare/:comparisonUrl" element={<UserProductsCompare />} />
            <Route path="/product/compare/:comparisonUrl" element={<UserProductsCompare />} />
            <Route path="/orders" element={<UserOrders/>}/> 
            {/* User routes */}
          </Route>
          <Route path="logout" element={<Navigate to="/login" />} />
          <Route path="login" element={<UserLogin />} />
          <Route path="register" element={<UserRegister />} />
          <Route path="forgot-password" element={<UserForgotPassword />} />
        </Routes>
      </BrowserRouter>
      </CartProvider>
  )
}

export default App;