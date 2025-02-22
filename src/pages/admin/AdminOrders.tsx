import React, { useState, useRef, useEffect } from 'react';
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
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Toast } from 'primereact/toast';
import { Order } from './types/order';
import { Dropdown } from 'primereact/dropdown';
import { addLocale } from 'primereact/api';
import { InputText } from 'primereact/inputtext';
import { Helmet } from 'react-helmet';

const AdminOrders = () => {
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [showExportOptions, setShowExportOptions] = useState(false);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);
    const toast = useRef<Toast>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);

    const filterOrdersByDate = async (start: Date, end: Date) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('adminToken');
            
            // Format dates for API request
            const startStr = start.toISOString();
            const endStr = end.toISOString();
            
            const response = await axios.get(
                `http://localhost:3000/api/admin/orders/filter/date`,
                {
                    params: {
                        startDate: startStr,
                        endDate: endStr
                    },
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
    
            if (response.data.success) {
                setFilteredOrders(response.data.data);
            } else {
                throw new Error('Failed to filter orders');
            }
        } catch (error) {
            console.error('Error filtering orders:', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Lỗi',
                detail: 'Không thể lọc danh sách đơn hàng'
            });
            setFilteredOrders(orders); // Reset to all orders on error
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (startDate && endDate) {
            filterOrdersByDate(startDate, endDate);
        }
    }, [startDate, endDate]);

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await axios.put(
                `http://localhost:3000/api/admin/orders/${orderId}/status`,
                { status: newStatus },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
    
            if (response.data.success) {
                // Update both orders and filteredOrders states
                setOrders(prevOrders => 
                    prevOrders.map(order => 
                        order.id === orderId ? {...order, status: newStatus as Order['status']} : order
                    )
                );
                
                setFilteredOrders(prevFiltered => 
                    prevFiltered.map(order => 
                        order.id === orderId ? {...order, status: newStatus as Order['status']} : order
                    )
                );
    
                toast.current?.show({
                    severity: 'success',
                    summary: 'Thành công',
                    detail: 'Đã cập nhật trạng thái đơn hàng'
                });
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Lỗi',
                detail: 'Không thể cập nhật trạng thái đơn hàng'
            });
        }
    };
    
    const handleSearch = (value: string) => {
        setSearchQuery(value);
        if (!value.trim()) {
            setFilteredOrders(orders);
            return;
        }
        
        const filtered = orders.filter(order => 
            order.id.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredOrders(filtered);
    };
    

    useEffect(() => {
        fetchOrders();
    }, []);

    const productBodyTemplate = (rowData: Order) => {
        if (!rowData?.products?.length) {
            return <span style={{ color: '#6b7280' }}>Không có sản phẩm</span>;
        }
        return (
            <div style={{ fontSize: '0.875rem' }}>
                {rowData.products.map((product, index) => (
                    <div key={index} style={{ marginBottom: '0.25rem', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: '500' }}>{product.name}</span>
                        <span style={{ color: '#4b5563' }}>
                            {product.quantity} x {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND'
                            }).format(product.price)}
                        </span>
                    </div>
                ))}
            </div>
        );
    };
    

    const statusBodyTemplate = (rowData: Order) => {
        const statusOption = orderStatuses.find(s => s.key === rowData.status);
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Dropdown
                    value={rowData.status}
                    options={orderStatuses}
                    onChange={(e) => handleStatusChange(rowData.id, e.value)}
                    optionLabel="label"
                    optionValue="key"
                    style={{ width: '100%' }}
                    className='border'
                />
            </div>
        );
    };

    // const getStatusClassName = (status: string) => {
    //     switch (status) {
    //         case 'pending':
    //             return 'bg-blue-100 text-blue-700';
    //         case 'paid':
    //             return 'bg-green-100 text-green-700';
    //         case 'shipping':
    //             return 'bg-orange-100 text-orange-700';
    //         case 'delivered':
    //             return 'bg-teal-100 text-teal-700';
    //         case 'cancelled':
    //             return 'bg-red-100 text-red-700';
    //         default:
    //             return 'bg-gray-100 text-gray-700';
    //     }
    // };
    
    const priceBodyTemplate = (rowData: Order) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(rowData.totalAmount);
    };
    
    
    const dateBodyTemplate = (rowData: Order) => {
        try {
            const date = new Date(rowData.orderDate);
            return date.toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return 'Không có ngày';
        }
    };
    

    const customerInfoBodyTemplate = (rowData: Order) => {
        return (
            <span style={{ fontWeight: '500' }}>
                {rowData.customerInfo.fullName}
            </span>
        );
    };
    
    const fetchOrders = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('adminToken');
            const response = await axios.get('http://localhost:3000/api/admin/orders', {
                headers: { Authorization: `Bearer ${token}` }
            });
    
            if (response.data.success) {
                setOrders(response.data.data);
                setFilteredOrders(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Lỗi',
                detail: 'Không thể tải danh sách đơn hàng'
            });
        } finally {
            setLoading(false);
        }
    };

    const orderStatuses = [
        { key: 'pending', label: 'Đang xử lý' },
        { key: 'paid', label: 'Đã thanh toán' },
        { key: 'shipping', label: 'Đang vận chuyển' },
        { key: 'delivered', label: 'Hoàn thành' },
        { key: 'cancelled', label: 'Đã hủy' }
    ];

    const handleFilter = () => {
        let filtered = [...orders];

        // Lọc theo search query nếu có
        if (searchQuery.trim()) {
            filtered = filtered.filter(order => 
                order.id.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Lọc theo ngày nếu cả hai ngày được chọn
        if (startDate && endDate) {
            filtered = filtered.filter(order => {
                const orderDate = new Date(order.orderDate);
                const start = new Date(startDate);
                const end = new Date(endDate);

                // Set thời gian cho ngày bắt đầu là 00:00:00
                start.setHours(0, 0, 0, 0);
                // Set thời gian cho ngày kết thúc là 23:59:59
                end.setHours(23, 59, 59, 999);
                
                return orderDate >= start && orderDate <= end;
            });
        }

        setFilteredOrders(filtered);
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
            const excelData = orders.map(order => ({
                'Mã đơn hàng': order.id,
                'Khách hàng': order.customerInfo.fullName,
                'Sản phẩm': order.products.map(product => 
                    `${product.name} (${product.quantity})`
                ).join(', '),
                'Tổng tiền': order.totalAmount,
                'Ngày đặt': new Date(order.orderDate).toLocaleDateString('vi-VN'),
                'Trạng thái': orderStatuses.find(status => 
                    status.key === order.status
                )?.label || ''
            }));
    
            const worksheet = xlsx.utils.json_to_sheet(excelData);
            const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
            const excelBuffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
            saveAsExcelFile({ buffer: excelBuffer, fileName: 'danh-sach-don-hang' });
        });
    };

    // const exportCSV = () => {
    //     import('papaparse').then(papaparse => {
    //         const csvData = orders.map(order => ({
    //             'Mã đơn hàng': order.id,
    //             'Khách hàng': order.user_id.username,
    //             'Sản phẩm': order.items.map(item => 
    //                 `${item.product_id.name} (${item.quantity})`
    //             ).join(', '),
    //             'Tổng tiền': order.final_amount,
    //             'Ngày đặt': new Date(order.createdAt).toLocaleDateString('vi-VN'),
    //             'Trạng thái': orderStatuses.find(status => 
    //                 status.value === order.status
    //             )?.label || ''
    //         }));
    
    //         const csv = papaparse.unparse(csvData);
    //         const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    //         const url = URL.createObjectURL(blob);
    //         const link = document.createElement('a');
    //         link.setAttribute('href', url);
    //         link.setAttribute('download', `danh-sach-don-hang_${new Date().getTime()}.csv`);
    //         link.click();
    //     });
    // };

    // const exportPDF = () => {
    //     import('jspdf').then(jsPDF => {
    //         const doc = new jsPDF.default();
    //         doc.addFileToVFS("Roboto-Regular.ttf", robotoFontData);
    //         doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
    //         doc.setFont("Roboto");
    
    //         autoTable(doc, {
    //             head: [['STT', 'Khách hàng', 'Sản phẩm', 'Tổng tiền', 'Ngày đặt', 'Trạng thái']],
    //             body: orders.map((order, index) => [
    //                 index + 1,
    //                 order.user_id.username,
    //                 order.items.map(item => 
    //                     `${item.product_id.name} (${item.quantity})`
    //                 ).join(', '),
    //                 new Intl.NumberFormat('vi-VN', {
    //                     style: 'currency',
    //                     currency: 'VND'
    //                 }).format(order.final_amount),
    //                 new Date(order.createdAt).toLocaleDateString('vi-VN'),
    //                 orderStatuses.find(status => 
    //                     status.value === order.status
    //                 )?.label || ''
    //             ]),
    //             styles: { font: 'Roboto' },
    //             headStyles: { 
    //                 font: 'Roboto',
    //                 fillColor: [41, 128, 185],
    //                 textColor: 255
    //             },
    //             bodyStyles: { font: 'Roboto' },
    //             alternateRowStyles: { fillColor: [245, 245, 245] }
    //         });
    
    //         doc.save(`danh-sach-don-hang_${new Date().getTime()}.pdf`);
    //     });
    // };

    // const actionBodyTemplate = (rowData) => {
    //     return (
    //       <Link to={`/admin/orders/${rowData.id}`}>
    //         <Button label="Xem chi tiết" className="p-button-link" />
    //       </Link>
    //     );
    //   };

    return (
        <div style={{ padding: '1rem' }}>
            <Helmet>
                <title>Quản lí đơn hàng</title>
                <link rel="icon" href="../../src/assets/img/phone.ico" />
            </Helmet>
            <Toast ref={toast} />
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
                <div style={{ position: 'relative', width: '100%', maxWidth: '24rem' }}>
                    <i 
                        className="pi pi-search" 
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '0.75rem',
                            transform: 'translateY(-50%)',
                            color: '#6b7280' 
                        }} 
                    />
                    <InputText
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Tìm kiếm theo mã đơn hàng"
                        style={{ 
                            paddingLeft: '2.5rem', 
                            width: '100%',
                            borderColor: '#d1d5db',
                            borderRadius: '0.375rem', 
                        }}
                        className="w-full px-4 py-2 border focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
                    />
                </div>

    
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <Calendar
                        value={startDate}
                        onChange={(e) => {
                            const newDate = e.value as Date;
                            setStartDate(newDate);
                            if (endDate && newDate) {
                                const start = new Date(newDate);
                                start.setHours(0, 0, 0, 0);
                                const end = new Date(endDate);
                                end.setHours(23, 59, 59, 999);
                                filterOrdersByDate(start, end);
                            }
                        }}
                        dateFormat="dd/mm/yy"
                        showIcon
                        style={{ width: '13rem' }}
                        minDate={new Date(2020, 0, 1)}
                        maxDate={endDate || new Date(2030, 11, 31)}
                        placeholder="Từ ngày"
                        showButtonBar
                    />-
                    <Calendar
                        value={endDate}
                        onChange={(e) => {
                            const newDate = e.value as Date;
                            setEndDate(newDate);
                            if (startDate && newDate) {
                                const start = new Date(startDate);
                                start.setHours(0, 0, 0, 0);
                                const end = new Date(newDate);
                                end.setHours(23, 59, 59, 999);
                                filterOrdersByDate(start, end);
                            }
                        }}
                        dateFormat="dd/mm/yy"
                        showIcon
                        style={{ width: '13rem' }}
                        minDate={startDate || new Date(2020, 0, 1)}
                        maxDate={new Date(2030, 11, 31)}
                        placeholder="Đến ngày"
                        showButtonBar
                    />
                    <Button 
                        icon="pi pi-times"
                        onClick={() => {
                            setStartDate(null);
                            setEndDate(null);
                            setFilteredOrders(orders);
                        }}
                        style={{
                            borderRadius: '50%',
                            background: 'transparent',
                            color: '#f03e3e',
                            border: 'none',
                        }}
                        tooltip="Xóa bộ lọc"
                    />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button
                        label="Xuất Excel" 
                        icon="pi pi-file-excel"
                        onClick={exportExcel}
                        style={{
                            border: '1px solid #198754',
                            color: '#198754',
                            background: 'transparent',
                            padding: '0.5rem 1rem',
                        }}
                    />
                </div>
            </div>
            
            <DataTable
                value={filteredOrders.length > 0 ? filteredOrders : orders}
                loading={loading}
                paginator
                rows={10}
                rowsPerPageOptions={[10, 25, 50]}
                className="p-datatable-striped"
                emptyMessage="Không có đơn hàng nào"
            >
                <Column 
                    field="id" 
                    header="Mã đơn hàng" 
                    style={{ width: '15%' }}
                />
                <Column 
                    field="customerInfo.fullName" 
                    header="Khách hàng" 
                    body={customerInfoBodyTemplate}
                    style={{ width: '15%' }}
                />
                <Column 
                    field="products" 
                    header="Sản phẩm" 
                    body={productBodyTemplate}
                    style={{ width: '25%' }}
                />
                <Column 
                    field="totalAmount" 
                    header="Tổng tiền" 
                    body={priceBodyTemplate} 
                    sortable 
                    style={{ width: '15%' }}
                />
                <Column 
                    field="orderDate" 
                    header="Ngày đặt" 
                    body={dateBodyTemplate} 
                    sortable 
                    style={{ width: '15%' }}
                />
                <Column 
                    field="status" 
                    header="Trạng thái" 
                    body={statusBodyTemplate} 
                    style={{ width: '15%' }}
                />
                <Column
                    body={(rowData: Order) => (
                        <Link to={`/admin/orders/${rowData.id}`}>
                            <Button
                                icon="pi pi-eye"
                                className="p-button-text"
                                tooltip="Xem chi tiết"
                            />
                        </Link>
                    )}
                    style={{ width: '10%', textAlign: 'center' }}
                />
            </DataTable>
        </div>
    );
    
};

export default AdminOrders;