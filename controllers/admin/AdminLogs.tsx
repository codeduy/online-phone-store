import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import axios from 'axios';

interface Log {
    _id: string;
    action: string;
    module: string;
    details: string;
    timestamp: string;
    ipAddress: string;
    userAgent: string;
    adminId: {
        _id: string;
        name: string;
        email: string;
    };
}

const AdminLogs = () => {
    const [logs, setLogs] = useState<Log[]>([]);
    const [loading, setLoading] = useState(true);
    const toast = useRef<Toast>(null);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('adminToken');
            const response = await axios.get('http://localhost:3000/api/admin/logs', {
                headers: { Authorization: `Bearer ${token}` }
            });
    
            if (response.data.success) {
                setLogs(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching logs:', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Lỗi',
                detail: 'Không thể tải lịch sử hoạt động',
                life: 3000
            });
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (value: string) => {
        return new Date(value).toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    return (
        <div className="p-4 bg-gray-50 min-h-screen">
            <Toast ref={toast} />
            
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
                <h1 className="text-2xl font-semibold text-gray-800 mb-6">
                    Lịch sử hoạt động
                </h1>

                <DataTable 
                    value={logs}
                    loading={loading}
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    className="p-datatable-gridlines"
                    emptyMessage="Không có dữ liệu"
                >
                    <Column 
                        field="timestamp" 
                        header="Thời gian" 
                        body={(rowData) => formatDate(rowData.timestamp)}
                        sortable
                    />
                    <Column 
                        field="adminId.name" 
                        header="Admin" 
                        sortable
                        body={(rowData) => rowData.adminId?.name || 'N/A'}
                    />
                    <Column 
                        field="action" 
                        header="Hành động" 
                        sortable
                        body={(rowData) => {
                            const actionMap: { [key: string]: string } = {
                                'LOGIN': 'Đăng nhập',
                                'LOGOUT': 'Đăng xuất',
                                'CREATE': 'Tạo mới',
                                'UPDATE': 'Cập nhật',
                                'DELETE': 'Xóa',
                                'VIEW': 'Xem'
                            };
                            return actionMap[rowData.action] || rowData.action;
                        }}
                    />
                    <Column 
                        field="module" 
                        header="Module" 
                        sortable
                        body={(rowData) => {
                            const moduleMap: { [key: string]: string } = {
                                'AUTH': 'Xác thực',
                                'PRODUCTS': 'Sản phẩm',
                                'ORDERS': 'Đơn hàng',
                                'CUSTOMERS': 'Khách hàng',
                                'COUPONS': 'Mã giảm giá',
                                'NEWS': 'Tin tức'
                            };
                            return moduleMap[rowData.module] || rowData.module;
                        }}
                    />
                    <Column 
                        field="details" 
                        header="Chi tiết"
                        style={{ maxWidth: '400px' }}
                    />
                    <Column
                        field="userAgent"
                        header="User Agent"
                    />
                    <Column 
                        field="ipAddress" 
                        header="Địa chỉ IP"
                    />
                </DataTable>
            </div>
        </div>
    );
};

export default AdminLogs;