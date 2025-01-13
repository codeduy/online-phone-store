import { Outlet } from "react-router-dom";
import Header from "../Header";
import AdminSidebar from "./AdminSidebar";
import '/src/styles/tailwind.css';
import { useState } from 'react';
import { Button } from 'primereact/button';

const AdminLayout = () => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-white shadow-md border border-gray-300 rounded-lg m-4 p-4">
        <Header />        
      </header>
      <div className="flex flex-1">
        <aside className="w-69 bg-white shadow-md border border-gray-300 rounded-lg ml-4 mb-4 p-4">
          <AdminSidebar />
        </aside>
        <main className="flex-1 p-4 overflow-auto bg-gray-100 border border-gray-300 rounded-lg ml-4 mr-4 mb-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;