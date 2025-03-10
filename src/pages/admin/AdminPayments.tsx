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

// interface PaymentAccount {
//     id: number;
//     accountNumber: string;
//     accountHolderName: string;
//     bankName: string;
//     isSelected: boolean;
// }

// const AdminPayments = () => {
//     const [paymentAccounts, setPaymentAccounts] = useState<PaymentAccount[]>([
//         { id: 1, accountNumber: '123456789', accountHolderName: 'Nguyen Van A', bankName: 'Vietcombank', isSelected: false },
//         { id: 2, accountNumber: '987654321', accountHolderName: 'Tran Thi B', bankName: 'Techcombank', isSelected: false },
//         // Add more sample accounts...
//     ]);
//     const [showDialog, setShowDialog] = useState(false);
//     const [newAccount, setNewAccount] = useState<PaymentAccount>({
//         id: 0,
//         accountNumber: '',
//         accountHolderName: '',
//         bankName: '',
//         isSelected: false
//     });

//     const handleSwitchChange = (id: number) => {
//         setPaymentAccounts(paymentAccounts.map(account => ({
//             ...account,
//             isSelected: account.id === id ? !account.isSelected : false
//         })));
//     };

//     const handleDelete = (id: number) => {
//         confirmDialog({
//             message: 'Bạn có chắc chắn muốn xóa phương thức thanh toán này?',
//             header: 'Xác nhận xóa',
//             icon: 'pi pi-exclamation-triangle',
//             acceptClassName: 'border p-3',
//             rejectClassName: 'border p-3',
//             accept: () => {
//                 setPaymentAccounts(paymentAccounts.filter(account => account.id !== id));
//             }
//         });
//     };

//     const handleAddAccount = () => {
//         setNewAccount({
//             id: paymentAccounts.length + 1,
//             accountNumber: '',
//             accountHolderName: '',
//             bankName: '',
//             isSelected: false
//         });
//         setShowDialog(true);
//     };

//     const handleSaveAccount = () => {
//         setPaymentAccounts([...paymentAccounts, newAccount]);
//         setShowDialog(false);
//     };

//     return (
//         <div className="p-4">
//             {/* First Row */}
//             <div className="flex justify-between mb-6">
//                 <Button label="Thêm phương thức nhận thanh toán" onClick={handleAddAccount} className="p-button-primary border p-2" />
//             </div>

//             {/* Second Row */}
//             <div className="w-full">
//                 <Card className="shadow-lg">
//                     <h3 className="text-xl font-semibold mb-4">Cấu hình tài khoản nhận thanh toán</h3>
//                     <DataTable value={paymentAccounts} responsiveLayout="scroll">
//                         <Column field="accountNumber" header="Số tài khoản" />
//                         <Column field="accountHolderName" header="Họ tên tài khoản" />
//                         <Column field="bankName" header="Tên ngân hàng" />
//                         <Column 
//                             header="Thao tác" 
//                             body={(rowData) => (
//                                 <div className="flex gap-2">
//                                     <InputSwitch 
//                                         checked={rowData.isSelected} 
//                                         onChange={() => handleSwitchChange(rowData.id)} 
//                                         disabled={paymentAccounts.some(account => account.isSelected && account.id !== rowData.id)}
//                                     />
//                                     <Button 
//                                         icon="pi pi-trash" 
//                                         className="p-button-danger p-button-rounded p-button-text pb-3" 
//                                         onClick={() => handleDelete(rowData.id)} 
//                                     />
//                                 </div>
//                             )}
//                         />
//                     </DataTable>
//                 </Card>
//             </div>

//             {/* Dialog for adding new payment account */}
//             <Dialog header="Thêm phương thức nhận thanh toán" visible={showDialog} onHide={() => setShowDialog(false)} style={{ width: '30vw' }} closable={false}>
//                 <div className="p-4">
//                     <div className="flex flex-col gap-4 w-96">
//                         <div>
//                             <label htmlFor="accountNumber" className="block pb-1">Số tài khoản</label>
//                             <InputText 
//                                 id="accountNumber" 
//                                 value={newAccount.accountNumber} 
//                                 onChange={(e) => setNewAccount({ ...newAccount, accountNumber: e.target.value })} 
//                                 className="p-inputtext-sm w-full border p-2"
//                             />
//                         </div>
//                         <div>
//                             <label htmlFor="accountHolderName" className="block pb-1">Họ tên tài khoản</label>
//                             <InputText 
//                                 id="accountHolderName" 
//                                 value={newAccount.accountHolderName} 
//                                 onChange={(e) => setNewAccount({ ...newAccount, accountHolderName: e.target.value })} 
//                                 className="p-inputtext-sm w-full border p-2"
//                             />
//                         </div>
//                         <div>
//                             <label htmlFor="bankName" className="block pb-1">Tên ngân hàng</label>
//                             <InputText 
//                                 id="bankName" 
//                                 value={newAccount.bankName} 
//                                 onChange={(e) => setNewAccount({ ...newAccount, bankName: e.target.value })} 
//                                 className="p-inputtext-sm w-full border p-2"
//                             />
//                         </div>
//                         <div className="flex gap-4">
//                             <Button label="Hủy bỏ" className="p-button-secondary border p-2 hover:bg-red-500 hover:text-white mt-0" onClick={() => setShowDialog(false)} />
//                             <Button label="Lưu" className="p-button-secondary border p-2 hover:bg-green-500 hover:text-white mt-0" onClick={handleSaveAccount} />
//                         </div>
//                     </div>
//                 </div>
//             </Dialog>
//             <ConfirmDialog className=''/>
//         </div>
//     );
// };

// export default AdminPayments;