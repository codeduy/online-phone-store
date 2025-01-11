import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { DataTable } from 'primereact/datatable';
import { InputTextarea } from 'primereact/inputtextarea';
import { Column } from 'primereact/column';
import { FileUpload } from 'primereact/fileupload';
import { Checkbox } from 'primereact/checkbox';
import { Card } from 'primereact/card';
import { InputSwitch } from 'primereact/inputswitch';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { classNames } from 'primereact/utils';

const AdminProducts = () => {
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showBrandList, setShowBrandList] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showEditProduct, setShowEditProduct] = useState(false);
  const [brandName, setBrandName] = useState('');
  const [productName, setProductName] = useState('');
  const [discount, setDiscount] = useState(0);
  const [price, setPrice] = useState(0);
  const [productInfo, setProductInfo] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [switchValues, setSwitchValues] = useState<{ [key: number]: boolean }>({});


interface Product {
    id: number;
    name: string;
    price: number;
    category: string;
    image: string;
}

const calculateDiscountedPrice = (price: number, discount: number): number => {
    return price - (price * discount / 100);
};

const products: Product[] = [
    { id: 1, name: 'Sản phẩm A', price: 100000, category: 'Danh mục 1', image: 'image1.jpg' },
    { id: 2, name: 'Sản phẩm B', price: 200000, category: 'Danh mục 2', image: 'image2.jpg' },
];

  

  const handleSwitchChange = (id: number, value: boolean): void => {
    setSwitchValues((prevValues) => ({
      ...prevValues,
      [id]: value,
    }));
  };


  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setProductName(product.name);
    setPrice(product.price);
    setShowEditProduct(true);
  };

  return (
    <div className="p-4">
      {/* First Row */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Button 
          label="Thêm danh mục sản phẩm" 
          onClick={() => setShowAddCategory(true)} 
          className="border border-gray-300 hover:bg-gray-200 p-2"
        />
        <Button 
          label="Xem danh sách hãng" 
          onClick={() => setShowBrandList(true)} 
          className="border border-gray-300 hover:bg-gray-200 p-2"
        />
        <Button 
          label="Thêm sản phẩm mới" 
          onClick={() => setShowAddProduct(true)} 
          className="border border-gray-300 hover:bg-gray-200 p-2"
        />
        <Button 
          label="Xuất danh sách sản phẩm (PDF)" 
          className="border border-gray-300 hover:bg-gray-200 p-2"
        />
        <div className="flex items-center border border-gray-300 rounded p-2">
          <i className="pi pi-search mr-2 cursor-pointer" />
          <span className="p-float-label">
            <InputText id="search" placeholder=" " className="border-0 outline-none" />
            <label htmlFor="search">Tìm kiếm sản phẩm</label>
          </span>
        </div>
      </div>

      {/* Second Row */}
      <div className="w-full">
        <Card className="shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Danh sách sản phẩm</h3>
          <DataTable value={products} responsiveLayout="scroll">
            <Column field="id" header="Mã sản phẩm" />
            <Column field="name" header="Tên sản phẩm" />
            <Column field="price" header="Giá sản phẩm" />
            <Column field="category" header="Danh mục sản phẩm" />
            <Column field="image" header="Ảnh sản phẩm" body={(rowData) => <img src={rowData.image} alt={rowData.name} className="w-16 h-16" />} />
            <Column header="Thao tác" body={(rowData) => (
              <div className="flex gap-2">
                <InputSwitch checked={switchValues[rowData.id] || false} onChange={(e) => handleSwitchChange(rowData.id, e.value)} />
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-text pb-6" onClick={() => handleEditProduct(rowData)} />
              </div>
            )} />
          </DataTable>
        </Card>
      </div>

      {/* Dialogs */}
      <Dialog header={<span className="p-0">Thêm danh mục sản phẩm</span>} visible={showAddCategory} onHide={() => setShowAddCategory(false)} style={{ position: 'relative' }} >
        <div className="flex flex-col gap-4">
        <span className="p-float-label mt-6 ">
            <InputText id="brandName" value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder=" " className="p-2 border" />
            <label htmlFor="brandName">Tên hãng</label>
        </span>
          <FileUpload mode="basic" name="logo" accept="image/*" maxFileSize={1000000} />
          <div className="flex gap-4">
            <Button label="Hủy bỏ" className="p-button-secondary border p-2 hover:bg-red-500 hover:text-white" onClick={() => setShowAddCategory(false)} />
            <Button label="Thêm" className="p-button-secondary border p-2 hover:bg-green-500 hover:text-white"/>
          </div>
        </div>
      </Dialog>

      <Dialog header={<span className="p-0">Danh sách hãng</span>} visible={showBrandList} onHide={() => setShowBrandList(false)}>
        {/* Add brand list content here */}
      </Dialog>

      <Dialog header={<span className="p-0">Thêm sản phẩm mới</span>} visible={showAddProduct} onHide={() => setShowAddProduct(false)} style={{ width: '70vw' }} >
        <div className="flex flex-col gap-4 mt-6">
          <span className="p-float-label">
            <InputText id="productName" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder=" " className="p-2 border" />
            <label htmlFor="productName">Tên sản phẩm</label>
          </span>
          <span className="p-float-label mt-6">
            <InputText id="price" value={price.toString()} onChange={(e) => setPrice(Number(e.target.value))} placeholder=" " className="p-2 border" />
            <label htmlFor="price">Giá ban đầu</label>
          </span>
          <span className="p-float-label mt-6">
            <InputText id="discount" value={discount.toString()} onChange={(e) => setDiscount(Number(e.target.value))} placeholder=" " className="p-2 border" />
            <label htmlFor="discount">% giảm giá</label>
          </span>
          <span className="p-float-label mt-6">
            <InputText id="discountedPrice" value={calculateDiscountedPrice(price, discount).toString()} readOnly placeholder=" " className="p-2 border" />
            <label htmlFor="discountedPrice">Giá sau khi giảm</label>
          </span>
          <FileUpload mode="basic" name="productImage" accept="image/*" maxFileSize={1000000} multiple />
          <span>
            <label htmlFor="productInfo">Thông tin sản phẩm</label>
            <ReactQuill value={productInfo} onChange={setProductInfo} placeholder=" " className="p-2 h-40" />
          </span>
          <div className="flex gap-4">
            <Button label="Hủy bỏ" className="p-button-secondary border p-2 hover:bg-red-500 hover:text-white mt-7" onClick={() => setShowAddProduct(false)} />
            <Button label="Lưu" className="p-button-secondary border p-2 hover:bg-green-500 hover:text-white mt-7"/>
          </div>
        </div>
      </Dialog>

      <Dialog header={<span className="p-0">Chỉnh sửa sản phẩm</span>} visible={showEditProduct} onHide={() => setShowEditProduct(false)} style={{ width: '70vw' }} >
        <div className="flex flex-col gap-4 mt-6">
          <span className="p-float-label">
            <InputText id="editProductName" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder=" " className="p-2 border" />
            <label htmlFor="editProductName">Tên sản phẩm</label>
          </span>
          <span className="p-float-label mt-6">
            <InputText id="editPrice" value={price.toString()} onChange={(e) => setPrice(Number(e.target.value))} placeholder=" " className="p-2 border" />
            <label htmlFor="editPrice">Giá sản phẩm</label>
          </span>
          <span className="p-float-label mt-6">
            <InputText id="editCategory" value={selectedProduct?.category || ''} onChange={(e) => setSelectedProduct({ ...selectedProduct, category: e.target.value })} placeholder=" " className="p-2 border" />
            <label htmlFor="editCategory">Danh mục sản phẩm</label>
          </span>
          <FileUpload mode="basic" name="editProductImage" accept="image/*" maxFileSize={1000000} multiple />
          <div className="flex gap-4">
            <Button label="Hủy bỏ" className="p-button-secondary border p-2 hover:bg-red-500 hover:text-white mt-7" onClick={() => setShowEditProduct(false)} />
            <Button label="Lưu" className="p-button-secondary border p-2 hover:bg-green-500 hover:text-white mt-7"/>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default AdminProducts;