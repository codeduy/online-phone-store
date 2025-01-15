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

import UserLayout from "./components/user/UserLayout";
import UserHome from "./pages/user/UserHome";
import UserCart from "./pages/user/UserCart";


axios.defaults.baseURL = "http://localhost:8000/api";

const App = () => {
  return (
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
          
          {/* Admin routes */}
        </Route>

        <Route path="/staff/login" element={<StaffLogin />} />
        

        <Route path="/" element={<UserLayout />}>
          <Route index element={<UserHome />} />
          <Route path="cart" element={<UserCart />} />
          {/* User routes */}
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App;