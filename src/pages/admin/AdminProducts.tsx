import { useState } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { DataTable } from 'primereact/datatable';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Column } from 'primereact/column';
import { FileUpload } from 'primereact/fileupload';
import { Card } from 'primereact/card';
import { InputSwitch } from 'primereact/inputswitch';
import { Dropdown } from 'primereact/dropdown';
import 'react-quill/dist/quill.snow.css';
import 'papaparse';
import 'xlsx';
import 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';
import { robotoFontData } from '../../assets/font/fontData';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

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
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [selectedReleaseYear, setSelectedReleaseYear] = useState('');
  const [selectedInternalStorage, setSelectedInternalStorage] = useState('');
  const [selectedRam, setSelectedRam] = useState('');
  const [selectedScreen, setSelectedScreen] = useState('');
  const [selectedDemand, setSelectedDemand] = useState('');
  const [selectedSpecialFeatures, setSelectedSpecialFeatures] = useState([]);

  

  interface Product {
    id: number;
    name: string;
    price: number;
    discount: number;
    category: string;
    image: string;
    releaseYear?: string;
    internalStorage?: string;
    ram?: string;
    screen?: string;
    demand?: string;
    specialFeatures?: string[];
  }

  const releaseYears = [
    { label: '2019', value: '2019' },
    { label: '2020', value: '2020' },
    { label: '2021', value: '2021' },
    { label: '2022', value: '2022' },
    { label: '2023', value: '2023' },
    { label: '2024', value: '2024' },
    { label: '2025', value: '2025' }
  ];
  
  const internalStorages = [
    { label: '64GB', value: '64GB' },
    { label: '128GB', value: '128GB' },
    { label: '256GB', value: '256GB' },
    { label: '512GB', value: '512GB' },
    { label: '1TB', value: '1TB' }
  ];
  
  const rams = [
    { label: '3GB', value: '3GB' },
    { label: '4GB', value: '4GB' },
    { label: '6GB', value: '6GB' },
    { label: '8GB', value: '8GB' },
    { label: '12GB', value: '12GB' }
  ];
  
  const screens = [
    { label: '60Hz', value: '60Hz' },
    { label: '90Hz', value: '90Hz' },
    { label: '120Hz', value: '120Hz' },
    { label: '144Hz', value: '144Hz' }
  ];
  
  const demands = [
    { label: 'Chơi game/cấu hình cao', value: 'Chơi game/cấu hình cao' },
    { label: 'Pin khủng trên 5000mAh', value: 'Pin khủng trên 5000mAh' },
    { label: 'Chụp ảnh - quay phim', value: 'Chụp ảnh - quay phim' },
    { label: 'Mỏng nhẹ', value: 'Mỏng nhẹ' }
  ];
  
  const specialFeatures = [
    { label: 'Kháng nước - bụi', value: 'Kháng nước - bụi' },
    { label: 'Hỗ trợ 5G', value: 'Hỗ trợ 5G' },
    { label: 'Bảo mật khuôn mặt 3D', value: 'Bảo mật khuôn mặt 3D' },
    { label: 'Công nghệ NFC', value: 'Công nghệ NFC' }
  ];

  const [productData, setProductData] = useState({
    productName: '',
    price: 0,
    discount: 0,
    brand: null,
    mainImage: null,
    additionalImages: [],
    productInfo: ''
  });

  const handleInputChange = (e: any, field: string) => {
    const value = e.target ? e.target.value : e.value;
    setProductData({ ...productData, [field]: value });
  };

  const calculateDiscountedPrice = (price: number, discount: number): number => {
      return price - (price * discount / 100);
  };

  const products: Product[] = [
    { 
        id: 1, 
        name: 'Sản phẩm A', 
        price: 100000, 
        discount: 10,
        category: 'Danh mục 1', 
        image: 'image1.jpg' 
    },
    { 
        id: 2, 
        name: 'Sản phẩm B', 
        price: 200000,
        discount: 20, 
        category: 'Danh mục 2', 
        image: 'image2.jpg' 
    },
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

  const handleSaveProduct = () => {
    // Add your save product logic here
    setShowAddProduct(false);
  };

  const handleUploadError = (message: string) => {
    setAlertMessage(message);
    setShowAlert(true);
  };

  const handleUploadSuccess = () => {
    setShowSuccess(true);
  };

  const exportCSV = () => {
    import('papaparse').then(papaparse => {
      const csv = papaparse.unparse(products);
      const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'products_export_' + new Date().getTime() + '.csv');
      link.click();
    });
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
      const worksheet = xlsx.utils.json_to_sheet(products);
      const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
      const excelBuffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      saveAsExcelFile({ buffer: excelBuffer, fileName: 'products' });
    });
  };

  const exportPDF = () => {
    import('jspdf').then(jsPDF => {
      import('jspdf-autotable').then(() => {
        const doc = new jsPDF.default();

        
        doc.addFileToVFS("Roboto-Regular.ttf", robotoFontData);
        doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
        doc.setFont("Roboto");

        autoTable(doc, {
          head: [['Mã sản phẩm', 'Tên sản phẩm', 'Giá sản phẩm', 'Danh mục sản phẩm']],
          body: products.map(product => [product.id, product.name, product.price, product.category]),
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
        doc.save('products.pdf');
      });
    });
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
          label="Xuất danh sách sản phẩm" 
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
            <Column field="price" header="Giá ban đầu" />
            <Column field="discount" header="% giảm" />
            <Column 
              field="discountedPrice" 
              header="Giá sau khi giảm" 
              body={(rowData) => calculateDiscountedPrice(rowData.price, rowData.discount)} 
            />
            <Column field="category" header="Danh mục sản phẩm" />
            <Column 
              field="image" 
              header="Ảnh sản phẩm" 
              body={(rowData) => <img src={rowData.image} alt={rowData.name} className="w-16 h-16" />} 
            />
            <Column 
              header="Thao tác" 
              body={(rowData) => (
                <div className="flex gap-2">
                  <InputSwitch 
                    checked={switchValues[rowData.id] || false} 
                    onChange={(e) => handleSwitchChange(rowData.id, e.value)} 
                  />
                  <Button 
                    icon="pi pi-pencil" 
                    className="p-button-rounded p-button-text pb-6" 
                    onClick={() => handleEditProduct(rowData)} 
                  />
                </div>
              )} 
            />
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
        <div className="mt-0">
            <label htmlFor="logo" className="block mb-2">Logo (tối đa 1 ảnh)</label>
            <FileUpload mode="advanced" name="logo" accept="image/*" maxFileSize={1000000} multiple customUpload uploadHandler={(e) => {
              if (e.files.length > 1) {
                handleUploadError('Chỉ được phép tải lên tối đa 1 ảnh. Vui lòng loại bỏ ảnh không cần thiết và thử lại !');
                e.files.splice(e.files.length); // Keep only the first file
              } else {
                e.options.clear();
                handleUploadSuccess();
              }
            }} />
          </div>
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

      <Dialog header={<span className="p-0">Thêm sản phẩm mới</span>} visible={showAddProduct} onHide={() => setShowAddProduct(false)} style={{ width: '70vw' }}>
      <div className="p-fluid grid grid-cols-2 gap-4">
        {/* Column 1 */}
        <div className="col">
          <div className="p-field">
            <label htmlFor="productName">Tên sản phẩm</label>
            <InputText id="productName" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder=" " className="p-2 border" />
          </div>
          <div className="p-field">
            <label htmlFor="price">Giá ban đầu</label>
            <InputNumber id="price" value={price} onChange={(e) => setPrice(Number(e.value))} min={0} className="p-2 border" />
          </div>
          <div className="p-field">
            <label htmlFor="discount">% giảm giá</label>
            <InputNumber id="discount" value={discount} onChange={(e) => setDiscount(Number(e.value))} min={0} max={100} className="p-2 border" />
          </div>
          <div className="p-field">
            <label htmlFor="discountedPrice">Giá sau khi giảm</label>
            <InputNumber id="discountedPrice" value={calculateDiscountedPrice(price, discount)} readOnly className="p-2 border" />
          </div>
          <div className="p-field">
            <label htmlFor="brand">Hãng</label>
            <Dropdown id="brand" value={selectedBrand} options={brands} onChange={(e) => setSelectedBrand(e.value)} optionLabel="name" placeholder="Chọn hãng" className="p-1 border" />
          </div>
        </div>

        {/* Column 2 */}
        <div className="col">
          <div className="p-field">
            <label htmlFor="releaseYear">Năm ra mắt</label>
            <Dropdown id="releaseYear" value={selectedReleaseYear} options={releaseYears} onChange={(e) => setSelectedReleaseYear(e.value)} optionLabel="label" placeholder="Chọn năm ra mắt" className="p-1 border" />
          </div>
          <div className="p-field">
            <label htmlFor="internalStorage">Bộ nhớ trong</label>
            <Dropdown id="internalStorage" value={selectedInternalStorage} options={internalStorages} onChange={(e) => setSelectedInternalStorage(e.value)} optionLabel="label" placeholder="Chọn bộ nhớ trong" className="p-1 border" />
          </div>
          <div className="p-field">
            <label htmlFor="ram">Dung lượng RAM</label>
            <Dropdown id="ram" value={selectedRam} options={rams} onChange={(e) => setSelectedRam(e.value)} optionLabel="label" placeholder="Chọn dung lượng RAM" className="p-1 border" />
          </div>
          <div className="p-field">
            <label htmlFor="screen">Màn hình</label>
            <Dropdown id="screen" value={selectedScreen} options={screens} onChange={(e) => setSelectedScreen(e.value)} optionLabel="label" placeholder="Chọn màn hình" className="p-1 border" />
          </div>
          <div className="p-field">
            <label htmlFor="demand">Nhu cầu</label>
            <Dropdown id="demand" value={selectedDemand} options={demands} onChange={(e) => setSelectedDemand(e.value)} optionLabel="label" placeholder="Chọn nhu cầu" className="p-1 border" />
          </div>
          <div className="p-field">
            <label htmlFor="specialFeatures">Tính năng đặc biệt</label>
            <Dropdown id="specialFeatures" value={selectedSpecialFeatures} options={specialFeatures} onChange={(e) => setSelectedSpecialFeatures(e.value)} optionLabel="label" placeholder="Chọn tính năng đặc biệt" multiple className="p-1 border" />
          </div>
        </div>
      </div>

      <div className="mt-6">
        <label htmlFor="mainImage" className="block mb-2">Ảnh chính (tối đa 2 ảnh)</label>
        <FileUpload mode="advanced" name="mainImage" accept="image/*" maxFileSize={1000000} multiple customUpload uploadHandler={(e) => {
          if (e.files.length > 2) {
            handleUploadError('Chỉ được phép tải lên tối đa 2 ảnh. Vui lòng loại bỏ ảnh không cần thiết và thử lại !');
            e.files.splice(e.files.length);
          } else {
            e.options.clear();
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
        <Button label="Lưu" className="p-button-secondary border p-2 hover:bg-green-500 hover:text-white mt-0" onClick={handleSaveProduct} />
      </div>
    </Dialog>

    <Dialog header={<span className="p-0">Chỉnh sửa sản phẩm</span>} visible={showEditProduct} onHide={() => setShowEditProduct(false)} style={{ width: '70vw' }}>
    <div className="p-fluid grid grid-cols-2 gap-4">
      {/* Column 1 */}
      <div className="col">
        <div className="p-field">
          <label htmlFor="productName">Tên sản phẩm</label>
          <InputText id="productName" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder=" " className="p-2 border" />
        </div>
        <div className="p-field">
          <label htmlFor="price">Giá ban đầu</label>
          <InputNumber id="price" value={price} onChange={(e) => setPrice(Number(e.value))} min={0} className="p-2 border" />
        </div>
        <div className="p-field">
          <label htmlFor="discount">% giảm giá</label>
          <InputNumber id="discount" value={discount} onChange={(e) => setDiscount(Number(e.value))} min={0} max={100} className="p-2 border" />
        </div>
        <div className="p-field">
          <label htmlFor="discountedPrice">Giá sau khi giảm</label>
          <InputNumber id="discountedPrice" value={calculateDiscountedPrice(price, discount)} readOnly className="p-2 border" />
        </div>
        <div className="p-field">
          <label htmlFor="brand">Hãng</label>
          <Dropdown id="brand" value={selectedBrand} options={brands} onChange={(e) => setSelectedBrand(e.value)} optionLabel="name" placeholder="Chọn hãng" className="p-1 border" />
        </div>
      </div>

      {/* Column 2 */}
      <div className="col">
        <div className="p-field">
          <label htmlFor="releaseYear">Năm ra mắt</label>
          <Dropdown id="releaseYear" value={selectedReleaseYear} options={releaseYears} onChange={(e) => setSelectedReleaseYear(e.value)} optionLabel="label" placeholder="Chọn năm ra mắt" className="p-1 border" />
        </div>
        <div className="p-field">
          <label htmlFor="internalStorage">Bộ nhớ trong</label>
          <Dropdown id="internalStorage" value={selectedInternalStorage} options={internalStorages} onChange={(e) => setSelectedInternalStorage(e.value)} optionLabel="label" placeholder="Chọn bộ nhớ trong" className="p-1 border" />
        </div>
        <div className="p-field">
          <label htmlFor="ram">Dung lượng RAM</label>
          <Dropdown id="ram" value={selectedRam} options={rams} onChange={(e) => setSelectedRam(e.value)} optionLabel="label" placeholder="Chọn dung lượng RAM" className="p-1 border" />
        </div>
        <div className="p-field">
          <label htmlFor="screen">Màn hình</label>
          <Dropdown id="screen" value={selectedScreen} options={screens} onChange={(e) => setSelectedScreen(e.value)} optionLabel="label" placeholder="Chọn màn hình" className="p-1 border" />
        </div>
        <div className="p-field">
          <label htmlFor="demand">Nhu cầu</label>
          <Dropdown id="demand" value={selectedDemand} options={demands} onChange={(e) => setSelectedDemand(e.value)} optionLabel="label" placeholder="Chọn nhu cầu" className="p-1 border" />
        </div>
        <div className="p-field">
          <label htmlFor="specialFeatures">Tính năng đặc biệt</label>
          <Dropdown id="specialFeatures" value={selectedSpecialFeatures} options={specialFeatures} onChange={(e) => setSelectedSpecialFeatures(e.value)} optionLabel="label" placeholder="Chọn tính năng đặc biệt" multiple className="p-1 border" />
        </div>
      </div>
    </div>

    <div className="mt-6">
      <label htmlFor="mainImage" className="block mb-2">Ảnh chính (tối đa 2 ảnh)</label>
      <FileUpload mode="advanced" name="mainImage" accept="image/*" maxFileSize={1000000} multiple customUpload uploadHandler={(e) => {
        if (e.files.length > 2) {
          handleUploadError('Chỉ được phép tải lên tối đa 2 ảnh. Vui lòng loại bỏ ảnh không cần thiết và thử lại !');
          e.files.splice(e.files.length);
        } else {
          e.options.clear();
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
      <Button label="Lưu" className="p-button-secondary border p-2 hover:bg-green-500 hover:text-white mt-0" onClick={handleSaveProduct} />
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


