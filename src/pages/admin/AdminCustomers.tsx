import { useState, useEffect, useCallback } from 'react';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Card } from 'primereact/card';
import axios from 'axios';
import { InputSwitch } from 'primereact/inputswitch';
import { debounce } from 'lodash';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
    exp: number;
    role: string;
}

interface Customer {
    _id: string;
    username: string;    
    email: string;       
    status: 'active' | 'inactive'; 
    full_name: string;   
    phone: string;       
    address: string;    
    createdAt: string;   
}

interface CustomerUpdateData {
    email: string;
    full_name: string;
    status: 'active' | 'inactive';
    password?: string;
    phone: string;
    address: string;
}

const AdminCustomers = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredCustomers] = useState<Customer[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [showDialog, setShowDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const verifyToken = useCallback(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            navigate('/admin/login', { 
                state: { message: 'Vui lòng đăng nhập để thao tác' } 
            });
            return false;
        }

        try {
            const decoded = jwtDecode<DecodedToken>(token);
            if (decoded.exp * 1000 < Date.now()) {
                localStorage.removeItem('adminToken');
                localStorage.removeItem('adminUser');
                navigate('/admin/login', { 
                    state: { message: 'Phiên đăng nhập đã hết hạn' } 
                });
                return false;
            }

            if (decoded.role !== 'admin') {
                navigate('/admin/login', { 
                    state: { message: 'Bạn không có quyền truy cập' } 
                });
                return false;
            }

            return true;
        } catch (error) {
            console.error('Token verification error:', error);
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            navigate('/admin/login', { 
                state: { message: 'Phiên đăng nhập không hợp lệ' } 
            });
            return false;
        }
    }, [navigate]);

    // Add token check on component mount
    useEffect(() => {
        verifyToken();
    }, [verifyToken]);

    const debouncedSearch = useCallback(
        debounce(async (searchValue: string) => {
            if (!verifyToken()) return;
            try {
                setLoading(true);
                const token = localStorage.getItem('adminToken');
                
                if (!searchValue.trim()) {
                    // If search is empty, fetch all customers
                    fetchCustomers();
                    return;
                }

                const response = await axios.get(
                    `/admin/customers/search?query=${searchValue}`,
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

                if (response.data.success) {
                    setCustomers(response.data.data);
                }
            } catch (error) {
                if (axios.isAxiosError(error) && error.response?.status === 401) {
                    navigate('/admin/login', { 
                        state: { message: 'Phiên đăng nhập đã hết hạn' } 
                    });
                }
                console.error('Error searching customers:', error);
            } finally {
                setLoading(false);
            }
        }, 1000), // 500ms delay
        [] 
    );

    const handleSearch = (value: string) => {
        setSearchTerm(value);
        debouncedSearch(value);
    };

    const handleToggleStatus = async (customerId: string, currentStatus: string) => {
        if (!verifyToken()) return;
        try {
            const token = localStorage.getItem('adminToken');
            const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
            
            await axios.put(
                `/admin/customers/${customerId}`,
                { status: newStatus },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
    
            // Refresh danh sách khách hàng
            fetchCustomers();
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                navigate('/admin/login', { 
                    state: { message: 'Phiên đăng nhập đã hết hạn' } 
                });
            }
            console.error('Error toggling customer status:', error);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        if (!verifyToken()) return;
        try {
            setLoading(true);
            const token = localStorage.getItem('adminToken');
            const response = await axios.get('/admin/customers', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.data.success) {
                setCustomers(response.data.data);
            } else {
                console.error('Failed to fetch customers:', response.data.message);
            }
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                navigate('/admin/login', { 
                    state: { message: 'Phiên đăng nhập đã hết hạn' } 
                });
            }
            console.error('Error fetching customers:', error);
        } finally {
            setLoading(false);
        }
    };

    // const handleSearch = async () => {
    //     try {
    //         setLoading(true);
    //         const token = localStorage.getItem('adminToken');
    //         const response = await axios.get(`http://localhost:3000/api/admin/customers/search?query=${searchTerm}`, {
    //             headers: { Authorization: `Bearer ${token}` }
    //         });
    //         setCustomers(response.data.data);
    //     } catch (error) {
    //         console.error('Error searching customers:', error);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    const handleEditCustomer = (customer: Customer) => {
        setSelectedCustomer(customer);
        setShowEditDialog(true);
    };

    const handleSaveCustomer = async () => {
        if (!verifyToken()) return;
        try {
            if (!selectedCustomer) return;
    
            const token = localStorage.getItem('adminToken');
            const updateData: CustomerUpdateData = {
                email: selectedCustomer.email,
                full_name: selectedCustomer.full_name,
                status: selectedCustomer.status || 'active', 
                phone: selectedCustomer.phone || '',
                address: selectedCustomer.address || ''
            };
    
            if (password) {
                updateData.password = password;
            }
    
            await axios.put(
                `/admin/customers/${selectedCustomer._id}`,
                updateData,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
    
            fetchCustomers();
            setShowEditDialog(false);
            setPassword('');
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                navigate('/admin/login', { 
                    state: { message: 'Phiên đăng nhập đã hết hạn' } 
                });
            }
            console.error('Error updating customer:', error);
        }
    };

    return (
        <div className="p-4">
            <Helmet>
                <title>Quản lí thông tin khách hàng</title>
                <link rel="icon" href="../../src/assets/img/phone.ico" />
            </Helmet>
            {/* Search Section */}
            <div className="mb-6">
                <div className="relative">
                    <InputText 
                        value={searchTerm} 
                        onChange={(e) => handleSearch(e.target.value)} 
                        placeholder="Tìm kiếm theo tên, email..." 
                        className="w-full lg:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
                    />
                    {/* <i className="pi pi-search absolute left-51 top-1/2 transform -translate-y-1/2 text-gray-400" /> */}
                </div>
            </div>

            {/* DataTable Section */}
            <div className="w-full">
                <Card className="shadow-lg rounded-lg border border-gray-200">
                    <DataTable 
                        value={filteredCustomers.length > 0 ? filteredCustomers : customers} 
                        loading={loading}
                        responsiveLayout="scroll"
                        emptyMessage="Không có khách hàng nào"
                        className="border-spacing-0"
                        pt={{
                            wrapper: { className: 'rounded-lg' },
                            header: { className: 'bg-gray-50 border-b' },
                            thead: { className: 'bg-gray-50' },
                            tbody: { className: 'divide-y divide-gray-200' }
                        }}
                    >
                        <Column field="_id" header="Mã khách hàng" style={{ width: '10%' }} />
                        <Column field="username" header="Tên đăng nhập" style={{ width: '12%' }} />
                        <Column field="full_name" header="Họ và tên" style={{ width: '15%' }} />
                        <Column field="phone" header="Điện thoại" style={{ width: '12%' }} />
                        <Column field="address" header="Địa chỉ" style={{ width: '20%' }} />
                        <Column field="email" header="Email" style={{ width: '15%' }} />
                        <Column 
                            field="status" 
                            header="Trạng thái" 
                            style={{ width: '10%' }}
                            body={(rowData) => (
                                <div className="flex items-center gap-2">
                                    <InputSwitch
                                        checked={rowData.status === 'active'}
                                        onChange={() => handleToggleStatus(rowData._id, rowData.status)}
                                        // className={`transition-colors duration-200 ${
                                        //     rowData.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                                        // }`}
                                    />
                                </div>
                            )}
                        />
                        <Column 
                            header="Thao tác" 
                            style={{ width: '6%' }}
                            body={(rowData) => (
                                <Button 
                                    icon="pi pi-pencil"
                                    onClick={() => handleEditCustomer(rowData)} 
                                    className="p-2 text-gray-600 shadow-md hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200 rounded-full"
                                    tooltip='Chỉnh sửa'
                                />
                            )}
                        />
                    </DataTable>
                </Card>
            </div>

            {/* Not Found Dialog */}
            <Dialog 
                header={<span className="text-xl font-semibold">Thông báo</span>}
                visible={showDialog} 
                onHide={() => setShowDialog(false)} 
                className="w-[400px]"
                pt={{
                    root: { className: 'bg-white rounded-lg shadow-lg' },
                    header: { className: 'border-b p-4' },
                    content: { className: 'p-6' },
                    closeButton: { className: 'hover:bg-gray-100 rounded-full p-2 transition-colors duration-200' }
                }}
            >
                <div className="p-4">
                    <p className="text-gray-700">Không tìm thấy khách hàng có thông tin này.</p>
                </div>
            </Dialog>

            {/* Edit Customer Dialog */}
            <Dialog 
                header={<span className="text-xl font-semibold">Chỉnh sửa khách hàng</span>}
                visible={showEditDialog} 
                onHide={() => setShowEditDialog(false)} 
                className="w-[500px]"
                pt={{
                    root: { className: 'bg-white rounded-lg shadow-lg' },
                    header: { className: 'border-b p-4' },
                    content: { className: 'p-6' },
                    closeButton: { className: 'hover:bg-gray-100 rounded-full p-2 transition-colors duration-200' }
                }}
            >
                {selectedCustomer && (
                    <div className="space-y-6">
                        {/* Full Name */}
                        <div className="relative">
                            <InputText
                                id="full_name"
                                value={selectedCustomer.full_name}
                                onChange={(e) => setSelectedCustomer({ ...selectedCustomer, full_name: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
                            />
                            <label className="absolute -top-2 left-4 bg-white px-1 text-xs text-blue-600">
                                Họ và tên
                            </label>
                        </div>

                        {/* Email */}
                        <div className="relative">
                            <InputText
                                id="email"
                                value={selectedCustomer.email}
                                onChange={(e) => setSelectedCustomer({ ...selectedCustomer, email: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
                            />
                            <label className="absolute -top-2 left-4 bg-white px-1 text-xs text-blue-600">
                                Email
                            </label>
                        </div>

                        {/* Phone */}
                        <div className="relative">
                            <InputText
                                id="phone"
                                value={selectedCustomer.phone}
                                onChange={(e) => setSelectedCustomer({ ...selectedCustomer, phone: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
                            />
                            <label className="absolute -top-2 left-4 bg-white px-1 text-xs text-blue-600">
                                Số điện thoại
                            </label>
                        </div>

                        {/* Address */}
                        <div className="relative">
                            <InputTextarea
                                id="address"
                                value={selectedCustomer.address}
                                onChange={(e) => setSelectedCustomer({ ...selectedCustomer, address: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
                            />
                            <label className="absolute -top-2 left-4 bg-white px-1 text-xs text-blue-600">
                                Địa chỉ
                            </label>
                        </div>

                        {/* Password */}
                        <div className="relative">
                            <InputText
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Để trống nếu không đổi mật khẩu"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
                            />
                            <label className="absolute -top-2 left-4 bg-white px-1 text-xs text-blue-600">
                                Mật khẩu mới
                            </label>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-4 mt-8">
                            <Button 
                                label="Hủy bỏ" 
                                icon="pi pi-times"
                                className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors duration-200"
                                onClick={() => setShowEditDialog(false)}
                            />
                            <Button 
                                label="Lưu" 
                                icon="pi pi-check"
                                className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-green-50 hover:text-green-600 hover:border-green-300 transition-colors duration-200"
                                onClick={handleSaveCustomer}
                            />
                        </div>
                    </div>
                )}
            </Dialog>
        </div>
    );
};

export default AdminCustomers;