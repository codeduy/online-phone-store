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
          {/* Admin routes */}
        </Route>

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