// import React, { useState } from 'react';
// import { InputText } from 'primereact/inputtext';
// import { Button } from 'primereact/button';
// import { DataTable } from 'primereact/datatable';
// import { Column } from 'primereact/column';
// import { InputSwitch } from 'primereact/inputswitch';
// import { Card } from 'primereact/card';
// import { Dialog } from 'primereact/dialog';
// import { ConfirmDialog } from 'primereact/confirmdialog';
// import { confirmDialog } from 'primereact/confirmdialog';

// interface Staff {
//     id: number;
//     username: string;
//     fullName: string;
//     email: string;
//     address: string;
//     phone: string;
//     gender: string;
//     birthYear: number;
//     salary: number;
//     position: string;
//     createdAt: Date;
//     isEnabled: boolean;
// }

// const AdminStaffs = () => {
//     const [staffs, setStaffs] = useState<Staff[]>([
//         { id: 1, username: 'user1', fullName: 'Nguyen Van A', email: 'user1@example.com', address: 'Address 1', phone: '0123456789', gender: 'Male', birthYear: 1990, salary: 1000, position: 'Manager', createdAt: new Date('2022-01-01'), isEnabled: true },
//         { id: 2, username: 'user2', fullName: 'Tran Thi B', email: 'user2@example.com', address: 'Address 2', phone: '0987654321', gender: 'Female', birthYear: 1992, salary: 800, position: 'Staff', createdAt: new Date('2022-02-01'), isEnabled: false },
//         // Add more sample staffs...
//     ]);
//     const [searchTerm, setSearchTerm] = useState('');
//     const [filteredStaffs, setFilteredStaffs] = useState<Staff[]>([]);
//     const [showDialog, setShowDialog] = useState(false);
//     const [newStaff, setNewStaff] = useState<Staff>({
//         id: 0,
//         username: '',
//         fullName: '',
//         email: '',
//         address: '',
//         phone: '',
//         gender: '',
//         birthYear: new Date().getFullYear(),
//         salary: 0,
//         position: '',
//         createdAt: new Date(),
//         isEnabled: true
//     });

//     const handleSearch = () => {
//         const filtered = staffs.filter(staff =>
//             staff.username.includes(searchTerm) ||
//             staff.fullName.includes(searchTerm) ||
//             staff.email.includes(searchTerm) ||
//             staff.address.includes(searchTerm) ||
//             staff.phone.includes(searchTerm)
//         );
//         setFilteredStaffs(filtered);
//         if (filtered.length === 0) {
//             setShowDialog(true);
//         }
//     };

//     const handleAddStaff = () => {
//         setNewStaff({
//             id: staffs.length + 1,
//             username: '',
//             fullName: '',
//             email: '',
//             address: '',
//             phone: '',
//             gender: '',
//             birthYear: new Date().getFullYear(),
//             salary: 0,
//             position: '',
//             createdAt: new Date(),
//             isEnabled: true
//         });
//         setShowDialog(true);
//     };

//     const handleSaveStaff = () => {
//         setStaffs([...staffs, newStaff]);
//         setShowDialog(false);
//     };

//     const handleSwitchChange = (id: number) => {
//         setStaffs(staffs.map(staff => ({
//             ...staff,
//             isEnabled: staff.id === id ? !staff.isEnabled : staff.isEnabled
//         })));
//     };

//     return (
//         <div className="p-4">
//             {/* First Row */}
//             <div className="flex justify-between mb-6">
//                 <div className="flex gap-2 items-center">
//                     <InputText 
//                         value={searchTerm} 
//                         onChange={(e) => setSearchTerm(e.target.value)} 
//                         placeholder="Tìm kiếm nhân viên" 
//                         className="p-inputtext-sm border p-2"
//                     />
//                     <Button 
//                         label="Tìm kiếm" 
//                         onClick={handleSearch}
//                         className="p-button-primary border p-2"
//                     />
//                 </div>
//                 <Button label="Thêm thông tin nhân viên" onClick={handleAddStaff} className="p-button-primary border p-2" />
//             </div>

//             {/* Second Row */}
//             <div className="w-full">
//                 <Card className="shadow-lg">
//                     <DataTable value={filteredStaffs.length > 0 ? filteredStaffs : staffs} responsiveLayout="scroll">
//                         <Column field="id" header="Mã nhân viên" />
//                         <Column field="username" header="Tên đăng nhập" />
//                         <Column field="fullName" header="Họ và tên" />
//                         <Column field="email" header="Email" />
//                         <Column field="address" header="Địa chỉ" />
//                         <Column field="phone" header="Số điện thoại" />
//                         <Column field="gender" header="Giới tính" />
//                         <Column field="birthYear" header="Năm sinh" />
//                         <Column field="salary" header="Mức lương" />
//                         <Column field="position" header="Chức vụ" />
//                         <Column field="createdAt" header="Ngày tạo tài khoản" body={(rowData) => rowData.createdAt.toLocaleDateString()} />
//                         <Column 
//                             header="Kích hoạt/Vô hiệu hóa" 
//                             body={(rowData) => (
//                                 <InputSwitch 
//                                     checked={rowData.isEnabled} 
//                                     onChange={() => handleSwitchChange(rowData.id)} 
//                                 />
//                             )}
//                         />
//                     </DataTable>
//                 </Card>
//             </div>

//             {/* Dialog for adding new staff */}
//             <Dialog header="Thêm thông tin nhân viên" visible={showDialog} onHide={() => setShowDialog(false)} style={{ width: '50vw' }} closable={false}>
//                 <div className="p-4">
//                     <div className="flex flex-col gap-4">
//                         <div>
//                             <label htmlFor="username" className="block pb-1">Tên đăng nhập</label>
//                             <InputText 
//                                 id="username" 
//                                 value={newStaff.username} 
//                                 onChange={(e) => setNewStaff({ ...newStaff, username: e.target.value })} 
//                                 className="p-inputtext-sm w-full border p-2"
//                             />
//                         </div>
//                         <div>
//                             <label htmlFor="fullName" className="block pb-1">Họ và tên</label>
//                             <InputText 
//                                 id="fullName" 
//                                 value={newStaff.fullName} 
//                                 onChange={(e) => setNewStaff({ ...newStaff, fullName: e.target.value })} 
//                                 className="p-inputtext-sm w-full border p-2"
//                             />
//                         </div>
//                         <div>
//                             <label htmlFor="email" className="block pb-1">Email</label>
//                             <InputText 
//                                 id="email" 
//                                 value={newStaff.email} 
//                                 onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })} 
//                                 className="p-inputtext-sm w-full border p-2"
//                             />
//                         </div>
//                         <div>
//                             <label htmlFor="address" className="block pb-1">Địa chỉ</label>
//                             <InputText 
//                                 id="address" 
//                                 value={newStaff.address} 
//                                 onChange={(e) => setNewStaff({ ...newStaff, address: e.target.value })} 
//                                 className="p-inputtext-sm w-full border p-2"
//                             />
//                         </div>
//                         <div>
//                             <label htmlFor="phone" className="block pb-1">Số điện thoại</label>
//                             <InputText 
//                                 id="phone" 
//                                 value={newStaff.phone} 
//                                 onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })} 
//                                 className="p-inputtext-sm w-full border p-2"
//                             />
//                         </div>
//                         <div>
//                             <label htmlFor="gender" className="block pb-1">Giới tính</label>
//                             <InputText 
//                                 id="gender" 
//                                 value={newStaff.gender} 
//                                 onChange={(e) => setNewStaff({ ...newStaff, gender: e.target.value })} 
//                                 className="p-inputtext-sm w-full border p-2"
//                             />
//                         </div>
//                         <div>
//                             <label htmlFor="birthYear" className="block pb-1">Năm sinh</label>
//                             <InputText 
//                                 id="birthYear" 
//                                 value={newStaff.birthYear} 
//                                 onChange={(e) => setNewStaff({ ...newStaff, birthYear: parseInt(e.target.value) })} 
//                                 className="p-inputtext-sm w-full border p-2"
//                             />
//                         </div>
//                         <div>
//                             <label htmlFor="salary" className="block pb-1">Mức lương</label>
//                             <InputText 
//                                 id="salary" 
//                                 value={newStaff.salary} 
//                                 onChange={(e) => setNewStaff({ ...newStaff, salary: parseFloat(e.target.value) })} 
//                                 className="p-inputtext-sm w-full border p-2"
//                             />
//                         </div>
//                         <div>
//                             <label htmlFor="position" className="block pb-1">Chức vụ</label>
//                             <InputText 
//                                 id="position" 
//                                 value={newStaff.position} 
//                                 onChange={(e) => setNewStaff({ ...newStaff, position: e.target.value })} 
//                                 className="p-inputtext-sm w-full border p-2"
//                             />
//                         </div>
//                         <div>
//                             <label htmlFor="password" className="block pb-1">Mật khẩu</label>
//                             <InputText 
//                                 id="password" 
//                                 type="password"
//                                 placeholder="Nhập mật khẩu mới" 
//                                 className="p-inputtext-sm w-full border p-2"
//                             />
//                         </div>
//                         <div className="flex gap-4">
//                             <Button label="Hủy bỏ" className="p-button-secondary border p-2 hover:bg-red-500 hover:text-white mt-0" onClick={() => setShowDialog(false)} />
//                             <Button label="Lưu" className="p-button-secondary border p-2 hover:bg-green-500 hover:text-white mt-0" onClick={handleSaveStaff} />
//                         </div>
//                     </div>
//                 </div>
//             </Dialog>
//             <ConfirmDialog />
//         </div>
//     );
// };

// export default AdminStaffs;