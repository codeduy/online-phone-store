import axios from "axios";
import "primereact/resources/themes/lara-light-cyan/theme.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./components/admin/AdminLayout";        
import 'primeicons/primeicons.css';
import AdminDashboard from "./pages/admin/AdminDashboard";


axios.defaults.baseURL = "http://localhost:8000/api";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          {/* Admin routes */}
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App;