import axios from "axios";
import "primereact/resources/themes/lara-light-cyan/theme.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminLayout from "./components/admin/AdminLayout";        
import 'primeicons/primeicons.css';


axios.defaults.baseURL = "http://localhost:8000/api";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          {/* Admin routes */}
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App;