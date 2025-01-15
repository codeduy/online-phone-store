import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Card } from 'primereact/card';

interface Customer {
    id: number;
    username: string;
    phone: string;
    address: string;
    email: string;
}

const StaffCustomers = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [showDialog, setShowDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);

    // Sample data
    const customers: Customer[] = [
        { id: 1, username: 'user1', phone: '0123456789', address: 'Address 1', email: 'user1@example.com' },
        { id: 2, username: 'user2', phone: '0987654321', address: 'Address 2', email: 'user2@example.com' },
        // Add more sample customers...
    ];

    const handleSearch = () => {
        const filtered = customers.filter(customer =>
            customer.username.includes(searchTerm) ||
            customer.phone.includes(searchTerm) ||
            customer.address.includes(searchTerm) ||
            customer.email.includes(searchTerm)
        );
        setFilteredCustomers(filtered);
        if (filtered.length === 0) {
            setShowDialog(true);
        }
    };

    const handleEditCustomer = (customer: Customer) => {
        setSelectedCustomer(customer);
        setShowEditDialog(true);
    };

    const handleSaveCustomer = () => {
        // Add logic to save customer details
        setShowEditDialog(false);
    };

    return (
        <div className="p-4">
            {/* First Row */}
            <div className="flex flex-wrap gap-4 mb-6 items-center">
                <div className="flex gap-2 items-center">
                    <InputText 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                        placeholder="Tìm kiếm khách hàng" 
                        className="p-inputtext-sm border p-2"
                    />
                    <Button 
                        label="Tìm kiếm" 
                        onClick={handleSearch}
                        className="p-button-primary p-2 border  cursor-pointer"
                    />
                </div>
            </div>

            {/* Second Row */}
            <div className="w-full">
                <Card className="shadow-lg">
                    <DataTable value={filteredCustomers.length > 0 ? filteredCustomers : customers} responsiveLayout="scroll">
                        <Column field="id" header="Mã khách hàng" />
                        <Column field="username" header="Tên đăng nhập" />
                        <Column field="phone" header="Điện thoại" />
                        <Column field="address" header="Địa chỉ" />
                        <Column field="email" header="Email" />
                        <Column 
                            header="Thao tác" 
                            body={(rowData) => (
                                <Button 
                                    label="Chỉnh sửa" 
                                    onClick={() => handleEditCustomer(rowData)} 
                                    className="p-button-secondary p-2 border"
                                />
                            )}
                        />
                    </DataTable>
                </Card>
            </div>

            {/* Dialog for no customer found */}
            <Dialog header="Thông báo" visible={showDialog} onHide={() => setShowDialog(false)} style={{ width: '25vw' }}>
                <div className="p-4">
                    <p>Không tìm thấy khách hàng có thông tin này.</p>
                    {/* <Button label="Đóng" onClick={() => setShowDialog(false)} className="p-button-secondary mt-4 p-2 border cursor-pointer hover:bg-red-500" /> */}
                </div>
            </Dialog>

            {/* Dialog for editing customer */}
            <Dialog header="Chỉnh sửa khách hàng" visible={showEditDialog} onHide={() => setShowEditDialog(false)} style={{ width: '21vw' }} closable={false}>
                <div className="p-4">
                    {selectedCustomer && (
                        <div className="flex flex-col gap-4">
                            <span className="">
                                <label htmlFor="phone" className='block pb-1'>Điện thoại</label>
                                <InputText id="phone" className='p-2 border w-60' value={selectedCustomer.phone} onChange={(e) => setSelectedCustomer({ ...selectedCustomer, phone: e.target.value })} />
                            </span>
                            <span className="">
                                <label htmlFor="address" className='block pb-1'>Địa chỉ</label>
                                <InputTextarea id="address" className='p-2 border w-60' value={selectedCustomer.address} onChange={(e) => setSelectedCustomer({ ...selectedCustomer, address: e.target.value })} />
                            </span>
                            <span className="">
                                <label htmlFor="email" className='block pb-1'>Email</label>
                                <InputText id="email" className='p-2 border w-60' value={selectedCustomer.email} onChange={(e) => setSelectedCustomer({ ...selectedCustomer, email: e.target.value })} />
                            </span>
                            <span className="">
                                <label htmlFor="password" className='block pb-1'>Mật khẩu</label>
                                <InputText id="password" className='p-2 border w-60' type="password" placeholder="Nhập mật khẩu mới" />
                            </span>
                            <div className="flex gap-4">
                                <Button label="Hủy bỏ" className="p-button-secondary border p-2 hover:bg-red-500 hover:text-white mt-0" onClick={() => setShowEditDialog(false)} />
                                <Button label="Lưu" className="p-button-secondary border p-2 hover:bg-green-500 hover:text-white mt-0" onClick={handleSaveCustomer} />
                            </div>
                        </div>
                    )}
                </div>
            </Dialog>
        </div>
    );
};

export default StaffCustomers;