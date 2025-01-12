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
import { Dropdown } from 'primereact/dropdown';
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
  const [brands, setBrands] = useState([{ name: 'Samsung' }, { name: 'iPhone' }]);
  const [selectedBrand, setSelectedBrand] = useState<{ name: string } | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);


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

  const handleUploadError = (message: string) => {
    setAlertMessage(message);
    setShowAlert(true);
  };

  const handleUploadSuccess = () => {
    setShowSuccess(true);
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
        <div className="flex flex-col gap-4 p-4">
          {brands.map((brand, index) => (
            <div key={index} className="border p-2 rounded">
              {brand.name}
            </div>
          ))}
        </div>
      </Dialog>

      <Dialog header={<span className="p-0">Thêm sản phẩm mới</span>} visible={showAddProduct} onHide={() => setShowAddProduct(false)} style={{ width: '70vw' }} >
        <div className="flex flex-col gap-4 mt-1">
          <span className="">
            <label htmlFor="productName" className="block mb-2">Tên sản phẩm</label>
            <InputText id="productName" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder=" " className="p-2 border" />
          </span>
          <span className="mt-0">
            <label htmlFor="price" className="block mb-2">Giá ban đầu</label>
            <InputText id="price" value={price.toString()} onChange={(e) => setPrice(Number(e.target.value))} placeholder=" " className="p-2 border" />
          </span>
          <span className="mt-0">
            <label htmlFor="discount" className="block mb-2">% giảm giá</label>
            <InputText id="discount" value={discount.toString()} onChange={(e) => setDiscount(Number(e.target.value))} placeholder=" " className="p-2 border" />
          </span>
          <span className="mt-0">
            <label htmlFor="discountedPrice" className="block mb-2">Giá sau khi giảm</label>
            <InputText id="discountedPrice" value={calculateDiscountedPrice(price, discount).toString()} readOnly placeholder=" " className="p-2 border" />
          </span>
          <div className="mt-0">
            <label htmlFor="brand" className="block mb-2">Hãng</label>
            <Dropdown id="brand" value={selectedBrand} options={brands} onChange={(e) => setSelectedBrand(e.value)} optionLabel="name" placeholder="Chọn hãng" className="p-1 border" />
          </div>
          <div className="mt-6">
            <label htmlFor="mainImage" className="block mb-2">Ảnh chính (tối đa 2 ảnh)</label>
            <FileUpload mode="advanced" name="mainImage" accept="image/*" maxFileSize={1000000} multiple customUpload uploadHandler={(e) => {
              if (e.files.length > 2) {
                handleUploadError('Chỉ được phép tải lên tối đa 2 ảnh. Vui lòng loại bỏ ảnh không cần thiết và thử lại !');
                e.files.splice(e.files.length);
              } else {
                e.options.clear();
                // Handle the file upload logic here
                //e.options.onUpload(e);
                handleUploadSuccess();
              }
            }} />
          </div>
          <div className="mt-6">
            <label htmlFor="additionalImages" className="block mb-2">Ảnh phụ (tối đa 10 ảnh)</label>
            <FileUpload mode="advanced" name="additionalImages" accept="image/*" maxFileSize={1000000} multiple customUpload uploadHandler={(e) => {
              if (e.files.length > 10) {
                handleUploadError('Chỉ được phép tải lên tối đa 10 ảnh. Vui lòng loại bỏ ảnh không cần thiết và thử lại !');
                e.files.splice(e.files.length);
              } else {
                e.options.clear();
                //e.options.onUpload(e);
                handleUploadSuccess();
              }
            }} />
          </div>
          <div className="mt-0">
            <label htmlFor="productInfo" className="block mb-2">Thông tin sản phẩm</label>
            <InputTextarea id="productInfo" value={productInfo} onChange={(e) => setProductInfo(e.target.value)} placeholder=" " className="p-2 border w-full" autoResize />
          </div>
          <div className="flex gap-4">
            <Button label="Hủy bỏ" className="p-button-secondary border p-2 hover:bg-red-500 hover:text-white mt-0" onClick={() => setShowAddProduct(false)} />
            <Button label="Lưu" className="p-button-secondary border p-2 hover:bg-green-500 hover:text-white mt-0"/>
          </div>
        </div>
      </Dialog>

      <Dialog header={<span className="p-0">Chỉnh sửa sản phẩm</span>} visible={showEditProduct} onHide={() => setShowEditProduct(false)} style={{ width: '70vw' }} >
        <div className="flex flex-col gap-4 mt-1">
        <span className="">
            <label htmlFor="productName" className="block mb-2">Tên sản phẩm</label>
            <InputText id="productName" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder=" " className="p-2 border" />
          </span>
          <span className="mt-0">
            <label htmlFor="price" className="block mb-2">Giá ban đầu</label>
            <InputText id="price" value={price.toString()} onChange={(e) => setPrice(Number(e.target.value))} placeholder=" " className="p-2 border" />
          </span>
          <span className="mt-0">
            <label htmlFor="discount" className="block mb-2">% giảm giá</label>
            <InputText id="discount" value={discount.toString()} onChange={(e) => setDiscount(Number(e.target.value))} placeholder=" " className="p-2 border" />
          </span>
          <span className="mt-0">
            <label htmlFor="discountedPrice" className="block mb-2">Giá sau khi giảm</label>
            <InputText id="discountedPrice" value={calculateDiscountedPrice(price, discount).toString()} readOnly placeholder=" " className="p-2 border" />
          </span>
          <div className="mt-0">
            <label htmlFor="brand" className="block mb-2">Hãng</label>
            <Dropdown id="brand" value={selectedBrand} options={brands} onChange={(e) => setSelectedBrand(e.value)} optionLabel="name" placeholder="Chọn hãng" className="p-1 border" />
          </div>
          <div className="mt-6">
            <label htmlFor="mainImage" className="block mb-2">Ảnh chính (tối đa 2 ảnh)</label>
            <FileUpload mode="advanced" name="mainImage" accept="image/*" maxFileSize={1000000} multiple customUpload uploadHandler={(e) => {
              if (e.files.length > 2) {
                handleUploadError('Chỉ được phép tải lên tối đa 2 ảnh. Vui lòng loại bỏ ảnh không cần thiết và thử lại !');
                e.files.splice(e.files.length);
              } else {
                e.options.clear();
                // Handle the file upload logic here
                //e.options.onUpload(e);
                handleUploadSuccess();
              }
            }} />
          </div>
          <div className="mt-6">
            <label htmlFor="additionalImages" className="block mb-2">Ảnh phụ (tối đa 10 ảnh)</label>
            <FileUpload mode="advanced" name="additionalImages" accept="image/*" maxFileSize={1000000} multiple customUpload uploadHandler={(e) => {
              if (e.files.length > 10) {
                handleUploadError('Chỉ được phép tải lên tối đa 10 ảnh. Vui lòng loại bỏ ảnh không cần thiết và thử lại !');
                e.files.splice(e.files.length);
              } else {
                e.options.clear();
                //e.options.onUpload(e);
                handleUploadSuccess();
              }
            }} />
          </div>
          <div className="mt-0">
            <label htmlFor="productInfo" className="block mb-2">Thông tin sản phẩm</label>
            <InputTextarea id="productInfo" value={productInfo} onChange={(e) => setProductInfo(e.target.value)} placeholder=" " className="p-2 border w-full" autoResize />
          </div>
          <div className="flex gap-4">
            <Button label="Hủy bỏ" className="p-button-secondary border p-2 hover:bg-red-500 hover:text-white mt-0" onClick={() => setShowEditProduct(false)} />
            <Button label="Lưu" className="p-button-secondary border p-2 hover:bg-green-500 hover:text-white mt-0"/>
          </div>
        </div>
      </Dialog>

      <Dialog header="Thông báo" visible={showAlert} onHide={() => setShowAlert(false)} style={{ width: '25vw' }} closable={false}>
        <div className="p-4">
          <p>{alertMessage}</p>
          <Button label="Đóng" onClick={() => setShowAlert(false)} className="p-button-secondary mt-4 p-2 border cursor-pointer hover:bg-red-500" />
        </div>
      </Dialog>

      <Dialog header="Thành công" visible={showSuccess} onHide={() => setShowSuccess(false)} style={{ width: '50vw' }} closable={false}>
        <div className="p-4">
          <p>Upload thành công!</p>
          <Button label="Đóng" onClick={() => setShowSuccess(false)} className="p-button-secondary mt-4 p-2 border cursor-pointer hover:bg-green-500" />
        </div>
      </Dialog>
    </div>
  );
};

export default AdminProducts;