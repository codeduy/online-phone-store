import { Outlet } from "react-router-dom";
import Header from "../Header";
import AdminSidebar from "./AdminSidebar";
import { Sidebar } from 'primereact/sidebar';
import '/src/styles/tailwind.css';
import { useState } from 'react';
import { Button } from 'primereact/button';

const AdminLayout = () => {
  const [visible, setVisible] = useState(false);

  const handleSidebarItemClick = () => {
    setVisible(false);
  };

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-white shadow-md border border-gray-300 rounded-lg m-4 p-4"> {/* Added border and rounded-lg */}
        <Header />
        <Button icon="pi pi-bars" onClick={() => setVisible(!visible)} 
        className="p-button-text border mt-3 p-2 hover:bg-green-500 cursor-pointer" />
      </header>
      <Sidebar visible={visible} onHide={() => setVisible(false)} className="w-50">
        <AdminSidebar onItemClick={handleSidebarItemClick} />
      </Sidebar>
      <div className="flex flex-1">        
        <main className="flex-1 p-4 overflow-auto bg-gray-100 border border-gray-300 rounded-lg ml-4 mr-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
  
};

export default AdminLayout;