import React from 'react';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

const StaffDashboard = () => {
  // Mock data - replace with real API calls
  const stats = {
    todayOrders: 145,
    monthlyRevenue: 250000000,
    dailyRevenue: 12000000,
  };

  const bestSellers = [
    { name: 'Sản phẩm A', sold: 150, revenue: 15000000 },
    { name: 'Sản phẩm B', sold: 120, revenue: 12000000 },
    { name: 'Sản phẩm C', sold: 100, revenue: 10000000 },
  ];

  const staffRanking = [
    { name: 'Staff A', orders: 50, revenue: 5000000 },
    { name: 'Staff B', orders: 40, revenue: 4000000 },
    // Add more sample data...
  ];

  return (
    <div className="p-4">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="shadow-lg">
          <div className="text-center p-4">
            <h3 className="text-lg font-semibold mb-2">Đơn hàng hôm nay</h3>
            <p className="text-2xl text-blue-600">{stats.todayOrders}</p>
          </div>
        </Card>
        
        <Card className="shadow-lg">
          <div className="text-center p-4">
            <h3 className="text-lg font-semibold mb-2">Doanh thu tháng</h3>
            <p className="text-2xl text-green-600">
              {stats.monthlyRevenue.toLocaleString('vi-VN')} đ
            </p>
          </div>
        </Card>

        <Card className="shadow-lg">
          <div className="text-center p-4">
            <h3 className="text-lg font-semibold mb-2">Doanh thu ngày</h3>
            <p className="text-2xl text-orange-600">
              {stats.dailyRevenue.toLocaleString('vi-VN')} đ
            </p>
          </div>
        </Card>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Sản phẩm bán chạy</h3>
          <DataTable value={bestSellers} responsiveLayout="scroll">
            <Column field="name" header="Tên sản phẩm" />
            <Column field="sold" header="Số lượng bán" />
            <Column 
              field="revenue" 
              header="Doanh thu" 
              body={(rowData) => `${rowData.revenue.toLocaleString('vi-VN')} đ`}
            />
          </DataTable>
        </Card>

        <Card className="shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Xếp hạng nhân viên</h3>
          <DataTable value={staffRanking} responsiveLayout="scroll">
            <Column field="name" header="Tên nhân viên" />
            <Column field="orders" header="Đơn hàng đã bán" />
            <Column 
              field="revenue" 
              header="Doanh thu" 
              body={(rowData) => `${rowData.revenue.toLocaleString('vi-VN')} đ`}
            />
          </DataTable>
        </Card>
      </div>
    </div>
  );
};

export default StaffDashboard;