import React, { useState } from 'react';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { TreeSelect } from 'primereact/treeselect';
import { Card } from 'primereact/card';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';
import 'jspdf-autotable';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { robotoFontData } from '../../assets/font/fontData';

interface Order {
    id: number;
    username: string;
    products: Array<{
        name: string;
        quantity: number;
        price: number;
    }>;
    totalAmount: number;
    orderDate: Date;
    status: string;
}

const StaffOrders = () => {
    const [dateRange, setDateRange] = useState(null);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [showExportOptions, setShowExportOptions] = useState(false);

    // Sample data
    const orders: Order[] = [
        {
            id: 1,
            username: "user1",
            products: [
                { name: "Sản phẩm A", quantity: 2, price: 100000 },
                { name: "Sản phẩm B", quantity: 1, price: 200000 }
            ],
            totalAmount: 400000,
            orderDate: new Date('2024-01-15'),
            status: "pending"
        },
        // Add more sample orders...
    ];

    const orderStatuses = [
        { key: 'pending', label: 'Đang chờ thanh toán' },
        { key: 'paid', label: 'Đã thanh toán' },
        { key: 'processing', label: 'Đang xử lý' },
        { key: 'shipping', label: 'Đang vận chuyển' },
        { key: 'completed', label: 'Hoàn thành' },
        { key: 'cancelled', label: 'Đã hủy' }
    ];

    const handleFilter = () => {
        // if (dateRange[0] && dateRange[1]) {
        //     const filtered = orders.filter(order => 
        //         order.orderDate >= dateRange[0]! && 
        //         order.orderDate <= dateRange[1]!
        //     );
        //     setFilteredOrders(filtered);
        // }
    };

    interface SaveAsExcelFileParams {
        buffer: ArrayBuffer;
        fileName: string;
    }

    const saveAsExcelFile = ({ buffer, fileName }: SaveAsExcelFileParams): void => {
        const data = new Blob([buffer], { type: 'application/octet-stream' });
        saveAs(data, `${fileName}_export_${new Date().getTime()}.xlsx`);
      };
    
      const exportExcel = () => {
        import('xlsx').then(xlsx => {
          const worksheet = xlsx.utils.json_to_sheet(orders);
          const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
          const excelBuffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
          saveAsExcelFile({ buffer: excelBuffer, fileName: 'products' });
        });
      };

      const exportCSV = () => {
        import('papaparse').then(papaparse => {
            const csvData = filteredOrders.map(order => ({
                id: order.id,
                username: order.username,
                products: order.products.map(p => `${p.name} (SL: ${p.quantity})`).join(', '),
                totalAmount: order.totalAmount,
                orderDate: order.orderDate.toLocaleDateString(),
                status: orderStatuses.find(status => status.key === order.status)?.label || ''
            }));
            const csv = papaparse.unparse(csvData);
            const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', 'orders_export_' + new Date().getTime() + '.csv');
            link.click();
        });
    };

    const exportPDF = () => {
        import('jspdf').then(jsPDF => {
            const doc = new jsPDF.default();
            doc.addFileToVFS("Roboto-Regular.ttf", robotoFontData);
            doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
            doc.setFont("Roboto");
            autoTable(doc, {
                head: [['STT', 'Tên đăng nhập', 'Sản phẩm', 'Tổng tiền', 'Ngày đặt', 'Trạng thái']],
                body: filteredOrders.map(order => [
                    order.id,
                    order.username,
                    order.products.map(p => `${p.name} (${p.quantity})`).join(', '),
                    order.totalAmount,
                    order.orderDate.toLocaleDateString(),
                    orderStatuses.find(status => status.key === order.status)?.label || ''
                ]),
                styles: {
                    font: 'Roboto',
                    fontStyle: 'normal'
                  },
                  headStyles: {
                    font: 'Roboto',
                    fontStyle: 'normal'
                  },
                  bodyStyles: {
                    font: 'Roboto',
                    fontStyle: 'normal'
                  }
            });
            doc.save('orders.pdf');
        });
    };

    return (
        <div className="p-4">
            {/* First Row */}
            <div className="flex flex-wrap gap-4 mb-6 items-center">
                <div className="flex gap-2 items-center">
                    <Calendar 
                        value={dateRange} 
                        onChange={(e) => setDateRange(e.value as [Date | null, Date | null])} 
                        selectionMode="range" 
                        readOnlyInput
                        placeholder="Chọn khoảng thời gian"
                        dateFormat="dd/mm/yy"
                        className='p-2 border'
                    />
                    <Button 
                        label="Lọc" 
                        onClick={handleFilter}
                        className="p-button-primary border cursor-pointer p-2 w-20"
                    />
                </div>
                <Button 
                    label="Xuất danh sách đơn hàng" 
                    onClick={() => setShowExportOptions(!showExportOptions)} 
                    className="border border-gray-300 hover:bg-gray-200 p-2"
                />
                {showExportOptions && (
                <div className="flex gap-2">
                    <Button type="button" icon="pi pi-file" rounded onClick={exportCSV} data-pr-tooltip="CSV" />
                    <Button type="button" icon="pi pi-file-excel" severity="success" rounded onClick={exportExcel} data-pr-tooltip="XLS" />
                    <Button type="button" icon="pi pi-file-pdf" severity="warning" rounded onClick={exportPDF} data-pr-tooltip="PDF" />
                </div>
                )}
            </div>

            {/* Second Row */}
            <div className="w-full">
                <Card className="shadow-lg">
                    <DataTable value={filteredOrders.length > 0 ? filteredOrders : orders} responsiveLayout="scroll">
                        <Column field="id" header="STT" />
                        <Column field="username" header="Tên đăng nhập" />
                        <Column 
                            field="products" 
                            header="Sản phẩm" 
                            body={(rowData) => (
                                <div>
                                    {rowData.products.map((p, index) => (
                                        <div key={index}>{p.name} (SL: {p.quantity})</div>
                                    ))}
                                </div>
                            )}
                        />
                        <Column field="totalAmount" header="Tổng tiền" />
                        <Column 
                            field="orderDate" 
                            header="Thời gian đặt hàng"
                            body={(rowData) => rowData.orderDate.toLocaleDateString()} 
                        />
                        <Column 
                            field="status" 
                            header="Trạng thái" 
                            body={(rowData) => (
                                <TreeSelect
                                    value={rowData.status}
                                    options={orderStatuses.map(status => ({ key: status.key, label: status.label }))}
                                    onChange={(e) => {
                                        rowData.status = e.value;
                                        // Add logic to update order status
                                    }}
                                    className="w-full"
                                />
                            )}
                        />
                    </DataTable>
                </Card>
            </div>
        </div>
    );
};

export default StaffOrders;