// import React, { useState } from 'react';
// import { Calendar } from 'primereact/calendar';
// import { Card } from 'primereact/card';
// import { Chart } from 'primereact/chart';
// import { Helmet } from 'react-helmet';

// const AdminStatistics = () => {
//     const [dateRange, setDateRange] = useState<Date | Date[] | undefined>(undefined);

//     const lineChartData = {
//         labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
//         datasets: [
//             {
//                 label: 'Doanh thu hằng ngày',
//                 data: [65, 59, 80, 81, 56, 55, 40],
//                 fill: false,
//                 borderColor: '#42A5F5'
//             },
//             {
//                 label: 'Doanh thu trung bình 1 năm',
//                 data: [28, 48, 40, 19, 86, 27, 90],
//                 fill: false,
//                 borderColor: '#FFA726'
//             }
//         ]
//     };

//     const barChartData = {
//         labels: ['Product A', 'Product B', 'Product C', 'Product D', 'Product E'],
//         datasets: [
//             {
//                 label: 'Tên điện thoại bán chạy nhất',
//                 backgroundColor: '#42A5F5',
//                 data: [65, 59, 80, 81, 56]
//             },
//             {
//                 label: 'Tên hãng có điện thoại bán chạy nhất',
//                 backgroundColor: '#FFA726',
//                 data: [28, 48, 40, 19, 86]
//             }
//         ]
//     };

//     const orderLineChartData = {
//         labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
//         datasets: [
//             {
//                 label: 'Số lượng đơn hàng theo thời gian',
//                 data: [65, 59, 80, 81, 56, 55, 40],
//                 fill: false,
//                 borderColor: '#42A5F5'
//             }
//         ]
//     };

//     const pieChartData = {
//         labels: ['Đã hoàn thành', 'Đang xử lí', 'Bị hủy', 'Trả lại'],
//         datasets: [
//             {
//                 data: [300, 50, 100, 40],
//                 backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#FF6384'],
//                 hoverBackgroundColor: ['#64B5F6', '#81C784', '#FFB74D', '#FF6384']
//             }
//         ]
//     };

//     const avgOrderValueBarChartData = {
//         labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
//         datasets: [
//             {
//                 label: 'Giá trị trung bình các đơn hàng theo thời gian',
//                 backgroundColor: '#42A5F5',
//                 data: [65, 59, 80, 81, 56, 55, 40]
//             }
//         ]
//     };

//     const newCustomersBarChartData = {
//         labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
//         datasets: [
//             {
//                 label: 'Khách hàng mới trong mỗi tháng, năm',
//                 backgroundColor: '#42A5F5',
//                 data: [65, 59, 80, 81, 56, 55, 40]
//             }
//         ]
//     };

//     return (
//         <div className="p-4">
//             <Helmet>
//                 <title>Báo cáo - thống kê</title>
//                 <link rel="icon" href="../../src/assets/img/phone.ico" />
//             </Helmet>
//             {/* First Row */}
//             <div className="flex justify-between mb-4">
//                 <Calendar 
//                     value={dateRange} 
//                     onChange={(e) => setDateRange(e.value)} 
//                     selectionMode="range" 
//                     readOnlyInput 
//                     placeholder="Chọn khoảng thời gian"
//                     className="mr-2 p-2 border"
//                 />
//             </div>

//             {/* Second Row */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <Card className="shadow-lg">
//                     <h3 className="text-xl font-semibold mb-4">Doanh thu hằng ngày so với doanh thu trung bình 1 năm</h3>
//                     <Chart type="line" data={lineChartData} />
//                 </Card>
//                 <Card className="shadow-lg">
//                     <h3 className="text-xl font-semibold mb-4">Tên điện thoại bán chạy nhất và tên hãng có điện thoại bán chạy nhất</h3>
//                     <Chart type="bar" data={barChartData} />
//                 </Card>
//                 <Card className="shadow-lg">
//                     <h3 className="text-xl font-semibold mb-4">Số lượng đơn hàng theo thời gian</h3>
//                     <Chart type="line" data={orderLineChartData} />
//                 </Card>
//                 <Card className="shadow-lg">
//                     <h3 className="text-xl font-semibold mb-4">Tỉ lệ đơn hàng đã hoàn thành, đang xử lí, bị hủy, trả lại</h3>
//                     <Chart type="pie" data={pieChartData} />
//                 </Card>
//                 <Card className="shadow-lg">
//                     <h3 className="text-xl font-semibold mb-4">Giá trị trung bình các đơn hàng theo thời gian</h3>
//                     <Chart type="bar" data={avgOrderValueBarChartData} />
//                 </Card>
//                 <Card className="shadow-lg">
//                     <h3 className="text-xl font-semibold mb-4">Khách hàng mới trong mỗi tháng, năm</h3>
//                     <Chart type="bar" data={newCustomersBarChartData} />
//                 </Card>
//             </div>
//         </div>
//     );
// };

// export default AdminStatistics;