import { Outlet } from "react-router-dom";
import Header from "../Header";
import Sidebar from "./Sidebar";
import '/src/styles/tailwind.css';

const AdminLayout = () => {
  return (
    <div className="h-screen flex flex-col">
      <header className="bg-white shadow-md border border-gray-300 rounded-lg m-4 p-4"> {/* Added border and rounded-lg */}
        <Header />
      </header>
      <div className="flex flex-1">
        <aside className="w-60 bg-white shadow-md border border-gray-300 rounded-lg">
          <Sidebar />
        </aside>
        <main className="flex-1 p-4 overflow-auto bg-gray-100 border border-gray-300 rounded-lg ml-4 mr-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
  
};

export default AdminLayout;