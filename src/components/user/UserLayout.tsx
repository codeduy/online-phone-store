import { Outlet } from "react-router-dom";
import Header from "../UserHeader";
import '/src/styles/tailwind.css';
import { useState } from 'react';
import { Button } from 'primereact/button';

const UserLayout = () => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-white shadow-md border border-gray-300 rounded-lg m-4 p-4">
        <Header />        
      </header>
      <div className="flex flex-1">        
        <main className="flex-1 p-4 overflow-auto bg-gray-100 border border-gray-300 rounded-lg ml-4 mr-4 mb-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default UserLayout;