import { useState, useEffect, useRef, useCallback } from 'react';
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
import axios from 'axios';
import { Toast } from 'primereact/toast';
import { debounce } from 'lodash';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
    exp: number;
    role: string;
}

interface ProductSpec {
  color_options: never[];
  os: string;
  cpu: string;
  gpu: string;
  camera: {
      main: string;
      front: string;
  };
  display: {
      type: string;
      size: string;
      refresh_rate: string;
      brightness: string;
  };
  battery: {
      capacity: string;
      charging: string;
  };
}

interface ProductData {
  description: string;
  id: string;
  name: string;
  baseProductName: string;
  price: number;
  originalPrice: number;
  discountPrice: number;
  discount: number;
  category: string;
  trademark: string;
  images: string[];
  ram: string;
  storage: string;
  stock: number;
  status: string;
  release_year: number;
  needs: string[];
  special_features: string[];
  rating: number;
  link: string;
  specs?: ProductSpec;
}

interface Product {
  id: string;
  name: string;
  baseProductName: string;
  price: number;
  originalPrice: number;
  discountPrice: number;
  discount: number;
  category: string;
  trademark: string;
  images: string[];
  ram: string;
  storage: string;
  stock: number;
  status: string;
  release_year: number;
  needs: string[];
  special_features: string[];
  rating: number;
  link: string;
  specs?: ProductSpec;
}

interface Category {
  _id: string;
  name: string;
  description: string;
  parent_category_id: string | null;
  link: string;
  meta: string;
  logo_url: string;
}

interface CustomFile extends File {
  objectURL?: string;
}

interface OptionType {
  label: string;
  value: string;
}

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
  const [selectedProduct, setSelectedProduct] = useState<ProductData | null>(null);
  const [switchValues, setSwitchValues] = useState<{ [key: number]: boolean }>({});
  const [brands, setBrands] = useState<Array<{_id: string, name: string, logo_url: string}>>([]);
  const [selectedBrand, setSelectedBrand] = useState<Category | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [selectedReleaseYear, setSelectedReleaseYear] = useState('');
  const [selectedInternalStorage, setSelectedInternalStorage] = useState('');
  const [selectedRam, setSelectedRam] = useState('');
  const [selectedScreen, setSelectedScreen] = useState('');
  const [selectedSpecialFeatures, setSelectedSpecialFeatures] = useState<string[]>([]);
  const [selectedDemand, setSelectedDemand] = useState<string[]>([]);
  

  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const toast = useRef<Toast>(null);

  const [mainImages, setMainImages] = useState<File[]>([]);
  const [additionalImages, setAdditionalImages] = useState<File[]>([]);

  const [productDetails, setProductDetails] = useState({
    os: '',
    cpu: '',
    gpu: '',
    camera: {
      main: '',
      front: ''
    },
    display: {
      type: '',
      size: '',
      refresh_rate: '',
      brightness: ''
    },
    battery: {
      capacity: '',
      charging: ''
    },
    color_options: [] as string[]
  });
  
  const [colorOption, setColorOption] = useState('');
  const [colorOptions, setColorOptions] = useState<string[]>([]);
  const [stock, setStock] = useState(0);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [categoryLogo, setCategoryLogo] = useState<File | null>(null);

  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [showEditCategory, setShowEditCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryLogo, setNewCategoryLogo] = useState<File | null>(null);

  const [showDeleteCategoryConfirm, setShowDeleteCategoryConfirm] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
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

useEffect(() => {
    verifyToken();
}, [verifyToken]);

  const handleLogoUpload = (event: any) => {
    if (event.files && event.files.length > 0) {
      setCategoryLogo(event.files[0]); // Lấy file đầu tiên
      handleUploadSuccess();
    }
  };

  const loadProductForEdit = async (rowData: ProductData) => {
    try {
      const response = await axios.get(
        `/admin/products/${rowData.id}/details`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
  
      if (response.data.success) {
        const { data } = response.data;
        
        // Set basic product info
        setSelectedProduct(data);
        setProductName(data.name);
        setPrice(data.price);
        setDiscount(data.discount || 0);
        setStock(data.stock || 0);
        
        // Kiểm tra và xử lý trademark một cách an toàn
        let trademark = null;
        if (data.trademark) {
          // Nếu trademark là object
          if (typeof data.trademark === 'object') {
            trademark = categories.find(cat => cat._id === data.trademark._id);
          } 
          // Nếu trademark là string (ID)
          else if (typeof data.trademark === 'string') {
            trademark = categories.find(cat => cat._id === data.trademark);
          }
        }
        setSelectedBrand(trademark);
  
        // Set specs from product
        setSelectedRam(data.ram);
        setSelectedInternalStorage(data.storage); 
        setSelectedReleaseYear(data.release_year.toString());
  
        // Xử lý needs và special_features một cách an toàn
        try {
          let needsArray = data.needs || [];
          let specialFeaturesArray = data.special_features || [];
  
          // Kiểm tra và parse JSON nếu cần
          if (typeof needsArray === 'string') {
            try {
              needsArray = JSON.parse(needsArray);
            } catch {
              needsArray = [];
            }
          }
          
          if (typeof specialFeaturesArray === 'string') {
            try {
              specialFeaturesArray = JSON.parse(specialFeaturesArray);
            } catch {
              specialFeaturesArray = [];
            }
          }
  
          // Đảm bảo kết quả là mảng và loại bỏ các phần tử trống
          setSelectedDemand(Array.isArray(needsArray) ? needsArray.filter(Boolean) : []);
          setSelectedSpecialFeatures(Array.isArray(specialFeaturesArray) ? specialFeaturesArray.filter(Boolean) : []);
  
        } catch (e) {
          console.error('Error parsing needs/features:', e);
          setSelectedDemand([]);
          setSelectedSpecialFeatures([]);
        }
  
        // Set detailed specs một cách an toàn
        if (data.details) {
          setProductDetails({
            os: data.details.os || '',
            cpu: data.details.cpu || '',
            gpu: data.details.gpu || '',
            camera: {
              main: data.details.camera?.main || '',
              front: data.details.camera?.front || ''
            },
            display: {
              type: data.details.display?.type || '',
              size: data.details.display?.size || '',
              refresh_rate: data.details.display?.refresh_rate || '', 
              brightness: data.details.display?.brightness || ''
            },
            battery: {
              capacity: data.details.battery?.capacity || '',
              charging: data.details.battery?.charging || ''
            },
            color_options: data.details.color_options || []
          });
  
          setColorOptions(data.details.color_options || []);
        }
  
        setShowEditProduct(true);
      }
    } catch (error) {
      console.error('Error loading product details:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Lỗi',
        detail: 'Không thể tải thông tin sản phẩm'
      });
    }
  };

  const handleUpdateCategory = async () => {
    try {
      if (!editCategory) return;
  
      const formData = new FormData();
      formData.append('name', newCategoryName);
      formData.append('link', `/products/${newCategoryName.toLowerCase()}`);
      if (newCategoryLogo) {
        formData.append('logo', newCategoryLogo);
      }
  
      const response = await axios.put(
        `/admin/products/categories/${editCategory._id}`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
  
      if (response.data.success) {
        toast.current?.show({
          severity: 'success',
          summary: 'Thành công',
          detail: 'Đã cập nhật hãng'
        });
        setShowEditCategory(false);
        fetchCategories();
      }
    } catch (error) {
      console.error('Error updating category:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Lỗi',
        detail: 'Không thể cập nhật hãng'
      });
    }
  };
  

  const handleAddCategory = async () => {
    try {
      if (!brandName || !categoryLogo) {
        toast.current?.show({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Vui lòng điền đầy đủ thông tin và chọn logo'
        });
        return;
      }
  
      const formData = new FormData();
      formData.append('name', brandName);
      formData.append('description', `Điện thoại ${brandName} chính hãng`);
      formData.append('link', `/products/${brandName.toLowerCase()}`);
      formData.append('meta', '');
      formData.append('logo', categoryLogo);
  
      const response = await axios.post(
        '/admin/products/categories',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
  
      if (response.data.success) {
        toast.current?.show({
          severity: 'success',
          summary: 'Thành công',
          detail: 'Đã thêm hãng mới'
        });
        setShowAddCategory(false);
        setBrandName('');
        setCategoryLogo(null);
        fetchCategories(); // Refresh danh sách
      }
    } catch (error) {
      console.error('Error adding category:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Lỗi',
        detail: 'Không thể thêm hãng'
      });
    }
  };

  const handleSearch = debounce(async (text: string) => {
    if (!verifyToken()) return;
    if (!text.trim()) {
      fetchProducts();
      return;
    }
  
    try {
      const response = await axios.get(
        `/admin/products/search?query=${text}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
  
      if (response.data.success) {
        setProducts(response.data.data);
      }
    } catch (error) {
      console.error('Error searching products:', error);
    }
  }, 300);

  const handleDemandChange = (e: any) => {
    const newValue = Array.isArray(e.value) ? e.value : [];
    if (newValue.length <= 4) {
        setSelectedDemand(newValue);
    }
};

const handleSpecialFeaturesChange = (e: any) => {
    const newValue = Array.isArray(e.value) ? e.value : [];
    if (newValue.length <= 4) {
        setSelectedSpecialFeatures(newValue);
    }
};

  const onMainImageUpload = (e: any) => {
    if (e.files.length > 2) {
        handleUploadError('Chỉ được phép tải lên tối đa 2 ảnh');
        e.files.splice(2);
        return;
    }
    setMainImages(e.files);
    handleUploadSuccess();
  };

  const onAdditionalImageUpload = (e: any) => {
    if (e.files.length > 10) {
        handleUploadError('Chỉ được phép tải lên tối đa 10 ảnh');
        e.files.splice(10);
        return;
    }
    setAdditionalImages(e.files);
    handleUploadSuccess();
  };
  

  const token = localStorage.getItem('adminToken');
  console.log('Token:', token); // Debug log
    const fetchCategories = async () => {
      try {
          const token = localStorage.getItem('adminToken');
          const response = await axios.get('/admin/products/categories', {
              headers: { Authorization: `Bearer ${token}` }
          });

          if (response.data.success) {
              // Lọc ra các category là hãng (parent_category_id là null)
              const brands = response.data.data.filter((cat: Category) => cat.parent_category_id === null);
              setCategories(brands);
              console.log('Fetched brands:', brands); // Debug log
          }
      } catch (error) {
          console.error('Error fetching categories:', error);
          toast.current?.show({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to fetch categories'
          });
      }
  };

  useEffect(() => {
    fetchCategories();
}, []);

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
    { label: 'Chơi game/Cấu hình cao', value: 'Chơi game/Cấu hình cao' },
    { label: 'Pin khủng trên 5000mAh', value: 'Pin khủng trên 5000mAh' },
    { label: 'Chụp ảnh, quay phim', value: 'Chụp ảnh, quay phim' },
    { label: 'Mỏng nhẹ', value: 'Mỏng nhẹ' }
  ];
  
  const specialFeatures = [
    { label: 'Kháng nước, bụi', value: 'Kháng nước, bụi' },
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

  const handleDeleteProduct = async (productId: string) => {
    if (!verifyToken()) return;
    try {
        const token = localStorage.getItem('adminToken');
        const response = await axios.delete(
            `/admin/products/${productId}`, 
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );

        if (response.data.success) {
            toast.current?.show({
                severity: 'success',
                summary: 'Thành công',
                detail: 'Đã xóa sản phẩm'
            });
            
            // Đóng dialog xác nhận xóa
            setShowDeleteConfirm(false);
            
            // Reset state productToDelete
            setProductToDelete(null);
            
            // Fetch lại danh sách sản phẩm
            await fetchProducts();
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        toast.current?.show({
            severity: 'error',
            summary: 'Lỗi',
            detail: 'Không thể xóa sản phẩm'
        });
    }
};

const handleDeleteCategory = async (categoryId: string) => {
    try {
        const token = localStorage.getItem('adminToken');
        await axios.delete(`/admin/products/categories/${categoryId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        toast.current?.show({
            severity: 'success',
            summary: 'Thành công',
            detail: 'Đã xóa danh mục'
        });

        fetchCategories(); // Refresh categories
    } catch (error) {
        console.error('Error deleting category:', error);
        toast.current?.show({
            severity: 'error',
            summary: 'Lỗi',
            detail: 'Không thể xóa danh mục'
        });
    }
};

  const fetchProducts = async () => {
    if (!verifyToken()) return;
    try {
        setLoading(true);
        const token = localStorage.getItem('adminToken');
        const response = await axios.get('/admin/products', {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
            setProducts(response.data.data);
        }
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
            navigate('/admin/login', { 
                state: { message: 'Phiên đăng nhập đã hết hạn' } 
            });
        }
        console.error('Error fetching products:', error);
        toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to fetch products'
        });
    } finally {
        setLoading(false);
    }
};

// Add useEffect to fetch data
useEffect(() => {
    fetchProducts();
}, []);

  const handleInputChange = (e: any, field: string) => {
    const value = e.target ? e.target.value : e.value;
    setProductData({ ...productData, [field]: value });
  };

  const calculateDiscountedPrice = (price: number, discount: number): number => {
      return price - (price * discount / 100);
  };  

  const handleSwitchChange = (id: number, value: boolean): void => {
    setSwitchValues((prevValues) => ({
      ...prevValues,
      [id]: value,
    }));
  };


  const handleEditSave = async () => {
    if (!verifyToken()) return;
    try {
        if (!selectedProduct || !selectedBrand?._id) {
            toast.current?.show({
                severity: 'error',
                summary: 'Lỗi', 
                detail: 'Vui lòng chọn hãng sản phẩm'
            });
            return;
        }

        const formData = new FormData();
        
        // Basic info
        formData.append('price', price.toString());
        formData.append('stock', stock.toString());
        formData.append('release_year', selectedReleaseYear || '');
        formData.append('discount', discount.toString());

        // Product details
        const details = {
            os: productDetails.os,
            cpu: productDetails.cpu,
            gpu: productDetails.gpu,
            camera: productDetails.camera,
            display: productDetails.display,
            battery: productDetails.battery,
            color_options: colorOptions,
            trademark: selectedBrand.name
        };

        formData.append('details', JSON.stringify(details));

        // Append all images - always update images if there are any
        mainImages.forEach(file => {
            formData.append('images', file);
        });
        
        additionalImages.forEach(file => {
            formData.append('images', file);
        });

        const response = await axios.put(
            `/admin/products/${selectedProduct.id}`,
            formData,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            }
        );

        if (response.data.success) {
            toast.current?.show({
                severity: 'success',
                summary: 'Thành công',
                detail: 'Đã cập nhật sản phẩm'
            });
            setShowEditProduct(false);
            setMainImages([]);
            setAdditionalImages([]);
            fetchProducts();
        }
    } catch (error) {
        console.error('Error updating product:', error);
        toast.current?.show({
            severity: 'error',
            summary: 'Lỗi',
            detail: 'Không thể cập nhật sản phẩm'
        });
    }
};

  const handleSaveProduct = async () => {
    if (!verifyToken()) return;
    try {
        // Validate required fields
        if (!selectedBrand || !productName || !price || !selectedInternalStorage || stock < 0) {
            toast.current?.show({
                severity: 'error',
                summary: 'Lỗi',
                detail: 'Vui lòng điền đầy đủ thông tin bắt buộc'
            });
            return;
        }

        // Create product data
        const formData = new FormData();
        
        // Basic product info
        formData.append('name', productName);
        formData.append('price', price.toString());
        formData.append('stock', stock.toString());
        formData.append('category_id', selectedBrand._id);
        formData.append('ram', selectedRam || '');
        formData.append('storage', selectedInternalStorage);
        formData.append('release_year', selectedReleaseYear || new Date().getFullYear().toString());
        
        // Product details
        const productDetailsData = {
            ...productDetails,
            color_options: colorOptions,
            trademark: selectedBrand.name
        };
        formData.append('productDetails', JSON.stringify(productDetailsData));

        // Images
        mainImages.forEach(file => {
            formData.append('images', file);
        });
        
        additionalImages.forEach(file => {
            formData.append('images', file);
        });

        // Features
        formData.append('needs', JSON.stringify(selectedDemand));
        formData.append('special_features', JSON.stringify(selectedSpecialFeatures));

        const token = localStorage.getItem('adminToken');
        const response = await axios.post(
            '/admin/products',
            formData,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            }
        );

        if (response.data.success) {
            toast.current?.show({
                severity: 'success',
                summary: 'Thành công',
                detail: 'Đã thêm sản phẩm mới'
            });
            setShowAddProduct(false);
            resetForm();
            fetchProducts();
            window.location.reload();
        }
    } catch (error: any) {
        console.error('Error creating product:', error);
        toast.current?.show({
            severity: 'error',
            summary: 'Lỗi',
            detail: error.response?.data?.message || 'Không thể thêm sản phẩm'
        });
    }
};

// Add a reset form function
const resetForm = () => {
  setProductName('');
  setPrice(0);
  setDiscount(0);
  setStock(0);
  setSelectedBrand(null);
  setMainImages([]);
  setAdditionalImages([]);
  setSelectedDemand([]);
  setSelectedSpecialFeatures([]);
  setProductDetails({
      os: '',
      cpu: '',
      gpu: '',
      camera: { main: '', front: '' },
      display: { type: '', size: '', refresh_rate: '', brightness: '' },
      battery: { capacity: '', charging: '' },
      color_options: []
  });
  setColorOptions([]);
  setColorOption('');
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

  const demandItemTemplate = (option: any) => {
    return (
        <div className="flex align-items-center">
            <div className="flex align-items-center gap-2">
                <input
                    type="checkbox"
                    checked={selectedDemand.includes(option.value)}
                    onChange={() => {}}
                    className="cursor-pointer"
                />
                <span>{option.label}</span>
            </div>
        </div>
    );
};

// Thay đổi template item cho Dropdown specialFeatures
const specialFeatureItemTemplate = (option: any) => {
    return (
        <div className="flex align-items-center">
            <div className="flex align-items-center gap-2">
                <input
                    type="checkbox"
                    checked={selectedSpecialFeatures.includes(option.value)}
                    onChange={() => {}}
                    className="cursor-pointer"
                />
                <span>{option.label}</span>
            </div>
        </div>
    );
};

  return (
    <div className="p-4">
        <Helmet>
            <title>Quản lí sản phẩm</title>
            <link rel="icon" href="../../src/assets/img/phone.ico" />
        </Helmet>
       <Toast ref={toast} />
      {/* First Row */}
      <div className="flex flex-wrap gap-4 mb-6"> 
      <Button 
        label="Thêm danh mục sản phẩm" 
        onClick={() => setShowAddCategory(true)} 
        className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 transition-colors duration-200 py-2 px-4 rounded-lg flex items-center gap-2"
      />

      <Button 
        label="Xem danh sách hãng" 
        onClick={() => setShowBrandList(true)} 
        className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 transition-colors duration-200 py-2 px-4 rounded-lg flex items-center gap-2"
      />

        <Button 
          label="Thêm sản phẩm mới" 
          onClick={() => setShowAddProduct(true)} 
          className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 transition-colors duration-200 py-2 px-4 rounded-lg flex items-center gap-2"
        />

        <Button 
          label="Xuất danh sách sản phẩm" 
          onClick={() => setShowExportOptions(!showExportOptions)} 
          className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 transition-colors duration-200 py-2 px-4 rounded-lg flex items-center gap-2"
        />

        {showExportOptions && (
          <div className="flex gap-2">
            <Button 
              type="button" 
              icon="pi pi-file" 
              rounded 
              onClick={exportCSV} 
              className="p-2 hover:bg-gray-100 transition-colors duration-200"
              tooltip="CSV"
            />
            <Button 
              type="button" 
              icon="pi pi-file-excel" 
              severity="success" 
              rounded 
              onClick={exportExcel}
              className="p-2 hover:bg-green-100 transition-colors duration-200" 
              tooltip="XLS"
            />
            <Button 
              type="button" 
              icon="pi pi-file-pdf" 
              severity="warning" 
              rounded 
              onClick={exportPDF}
              className="p-2 hover:bg-orange-100 transition-colors duration-200" 
              tooltip="PDF"
            />
          </div>
        )}

        <div className="flex items-center bg-white border border-gray-300 rounded-lg px-3 py-2 hover:border-gray-400 transition-colors duration-200">
          <i className="pi pi-search text-gray-500 mr-2" />
          <InputText 
            id="search" 
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              handleSearch(e.target.value);
            }}
            placeholder="Tìm kiếm sản phẩm" 
            className="border-0 outline-none w-full text-gray-700 placeholder-gray-400"
          />
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
              body={(rowData) => {
                const imageUrl = rowData.images && rowData.images[0] 
                  ? `/images/phone/${rowData.trademark.toUpperCase()}/${rowData.name.replace(/\s+/g, '')}/${rowData.images[0]}`
                  : '/images/no-image.png';
                
                return (
                  <img 
                    src={`${import.meta.env.VITE_IMAGE_URL}${imageUrl}`}
                    alt={rowData.name} 
                    className="w-16 h-16 object-contain"
                    // onError={(e) => {
                    //   const target = e.target as HTMLImageElement;
                    //   target.src = '/images/no-image.png';
                    // }}
                  />
                )
              }} 
            />

            <Column 
              header="Thao tác" 
              body={(rowData) => (
                <div className="flex gap-2">
                  <Button 
                    icon="pi pi-pencil"
                    onClick={() => loadProductForEdit(rowData)}
                    className="
                      p-button-rounded 
                      p-button-text 
                      text-gray-500 
                      hover:text-blue-600 
                      hover:bg-blue-50
                      transition-all 
                      duration-200
                      shadow-md
                    "
                    tooltip="Chỉnh sửa"
                    tooltipOptions={{ position: 'top' }}
                  />
                  <Button 
                    icon="pi pi-trash"
                    onClick={() => {
                      setProductToDelete(rowData.id);
                      setShowDeleteConfirm(true);
                    }}
                    className="
                      p-button-rounded 
                      p-button-danger 
                      p-button-text 
                      text-red-500 
                      hover:text-red-600 
                      hover:bg-red-50
                      transition-all 
                      duration-200                      
                    "
                    tooltip="Xóa"
                    tooltipOptions={{ position: 'top' }}
                  />
                </div>
              )} 
            />

          </DataTable>
        </Card>
      </div>

      {/* Dialogs */}
      <Dialog 
      header={<span className="text-xl font-semibold">Thêm danh mục sản phẩm</span>} 
      visible={showAddCategory} 
      onHide={() => {
          setShowAddCategory(false);
          setBrandName('');
          setCategoryLogo(null);
      }} 
      className="w-[500px]"
      pt={{
          root: { className: 'bg-white rounded-lg shadow-lg' },
          header: { className: 'border-b p-4' },
          content: { className: 'p-6' },
          closeButton: { 
              className: 'hover:bg-gray-100 rounded-full p-2 transition-colors duration-200' 
          },
          closeButtonIcon: { 
              className: 'text-gray-500 hover:text-gray-700' 
          }
      }}
>
    <div className="flex flex-col gap-6">
        <div className="relative">
            <InputText 
                id="brandName" 
                value={brandName} 
                onChange={(e) => setBrandName(e.target.value)} 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200" 
                placeholder=" "
            />
            <label 
                htmlFor="brandName" 
                className={`absolute left-4 transition-all duration-200 ${
                    brandName ? 'text-xs text-blue-600 -top-2 bg-white px-1' : 'text-gray-500 top-2'
                }`}
            >
                Tên hãng
            </label>
        </div>

        <div>
            <label className="text-gray-700 font-medium mb-2 block">
                Logo (tối đa 1 ảnh)
            </label>
            <FileUpload
                mode="advanced"
                name="logo"
                accept="image/*"
                maxFileSize={1000000}
                auto
                customUpload
                uploadHandler={handleLogoUpload}
                onClear={() => setCategoryLogo(null)}
                chooseLabel="Chọn logo"
                className="w-full"
                pt={{
                    content: { className: 'border border-gray-300 rounded-lg' },
                    chooseButton: { 
                        className: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 transition-colors duration-200' 
                    }
                }}
            />
        </div>

        <div className="flex gap-4 justify-end mt-4">
            <Button 
                label="Hủy bỏ" 
                className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors duration-200" 
                onClick={() => {
                    setShowAddCategory(false);
                    setBrandName('');
                    setCategoryLogo(null);
                }} 
            />
            <Button 
                label="Thêm" 
                className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                    !brandName || !categoryLogo 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-green-50 hover:text-green-600 hover:border-green-300'
                }`}
                onClick={handleAddCategory}
                disabled={!brandName || !categoryLogo}
            />
        </div>
    </div>
</Dialog>

      <Dialog 
          header={<span className="p-0">Danh sách hãng</span>} 
          visible={showBrandList} 
          onHide={() => setShowBrandList(false)}
          className="w-[500px]"
      >
          <div className="flex flex-col gap-4 p-4">
              {categories.length > 0 ? (
                  categories.map((category) => (
                      <div key={category._id} className="flex items-center justify-between border p-3 rounded-lg">
                          <div className="flex items-center gap-4">
                              <img 
                                  src={`${import.meta.env.VITE_IMAGE_URL}${category.logo_url}`}
                                  alt={`${category.name} logo`}
                                  className="w-12 h-12 object-contain"
                                  onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.src = '/src/assets/img/default-logo.png';
                                  }}
                              />
                              <div>
                                  <h3 className="font-medium">{category.name}</h3>
                                  <p className="text-sm text-gray-500">{category.description}</p>
                              </div>
                          </div>
                          <div className="flex gap-2">
                              <Button 
                                  icon="pi pi-pencil" 
                                  className="p-button-text p-button-rounded"
                                  onClick={() => {
                                      setEditCategory(category);
                                      setNewCategoryName(category.name);
                                      setShowEditCategory(true);
                                  }}
                              />
                              <Button 
                                  icon="pi pi-trash" 
                                  className="p-button-text p-button-rounded p-button-danger"
                                  onClick={() => {
                                      setCategoryToDelete(category._id);
                                      setShowDeleteCategoryConfirm(true);
                                  }}
                              />
                          </div>
                      </div>
                  ))
              ) : (
                  <div className="text-center text-gray-500">
                      <p>Không có hãng nào</p>
                  </div>
              )}
          </div>
      </Dialog>

      <Dialog
        header="Xác nhận xóa hãng"
        visible={showDeleteCategoryConfirm}
        onHide={() => {
          setShowDeleteCategoryConfirm(false);
          setCategoryToDelete(null);
        }}
        footer={
          <div className="flex justify-end gap-2">
            <Button
              label="Hủy"
              className="
                text-gray-700 
                hover:text-blue-600 
                transition-all 
                duration-200
                p-button-text
                font-normal
                p-2 
                border
              "
              onClick={() => {
                setShowDeleteCategoryConfirm(false);
                setCategoryToDelete(null);
              }}
            />
            <Button
              label="Xóa"
              className="
                bg-red-500 
                text-white 
                hover:bg-red-600 
                transition-all 
                duration-200
                font-medium
                rounded-lg
                p-2
              "
              onClick={() => {
                if (categoryToDelete) {
                  handleDeleteCategory(categoryToDelete);
                  setShowDeleteCategoryConfirm(false);
                  setCategoryToDelete(null);
                }
              }}
            />
          </div>
        }
        className="shadow-md rounded-lg bg-white w-[400px]"
      >
        <div className="p-4">
          <p className="text-gray-700">Bạn có chắc chắn muốn xóa hãng này?</p>
          <p className="text-sm text-gray-500 mt-2">Lưu ý: Không thể xóa hãng đang có sản phẩm.</p>
        </div>
      </Dialog>

      <Dialog
          header="Chỉnh sửa hãng"
          visible={showEditCategory}
          onHide={() => {
              setShowEditCategory(false);
              setEditCategory(null);
              setNewCategoryName('');
              setNewCategoryLogo(null);
          }}
          className="w-[400px]"
      >
          <div className="p-fluid">
              <div className="p-field mb-4">
                  <label htmlFor="categoryName" className="block mb-2">Tên hãng</label>
                  <InputText
                      id="categoryName"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
                  />
              </div>
              <div className="p-field mb-4">
                  <label className="block mb-2">Logo mới (không bắt buộc)</label>
                  <FileUpload
                      mode="basic"
                      accept="image/*"
                      maxFileSize={1000000}
                      auto
                      customUpload
                      chooseLabel="Chọn logo"
                      uploadHandler={(e) => {
                          if (e.files && e.files[0]) {
                              setNewCategoryLogo(e.files[0]);
                              handleUploadSuccess();
                          }
                      }}
                      className="w-full"
                  />
              </div>
              <div className="flex gap-2 justify-end mt-4">
                  <Button
                      label="Hủy"
                      className="
                        text-gray-700 
                        hover:text-blue-600 
                        transition-all 
                        duration-200
                        p-button-text
                        font-normal
                        border p-2
                      "
                      onClick={() => {
                          setShowEditCategory(false);
                          setEditCategory(null);
                          setNewCategoryName('');
                          setNewCategoryLogo(null);
                      }}
                  />
                  <Button
                      label="Cập nhật"
                      className="
                        bg-green-500 
                        text-white 
                        hover:bg-green-600 
                        transition-all 
                        duration-200
                        font-medium
                        rounded-lg
                      "
                      onClick={handleUpdateCategory}
                      disabled={!newCategoryName}
                  />
              </div>
          </div>
      </Dialog>


      <Dialog 
          header={<span className="text-xl font-semibold">Thêm sản phẩm mới</span>} 
          visible={showAddProduct} 
          onHide={() => setShowAddProduct(false)} 
          className="w-[90vw]"
          pt={{
              root: { className: 'bg-white rounded-lg shadow-lg' },
              header: { className: 'border-b p-4' },
              content: { className: 'p-6' },
              closeButton: { 
                  className: 'hover:bg-gray-100 rounded-full p-2 transition-colors duration-200' 
              },
              closeButtonIcon: { 
                  className: 'text-gray-500 hover:text-gray-700' 
              }
          }}
      >
          <div className="grid grid-cols-2 gap-8">
              {/* Column 1 - Basic Information */}
              <div className="space-y-6">
                  {/* Product Name */}
                  <div className="relative">
                      <InputText 
                          id="productName" 
                          value={productName} 
                          onChange={(e) => setProductName(e.target.value)} 
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200" 
                          placeholder=" "
                      />
                      <label 
                          htmlFor="productName" 
                          className={`absolute left-4 transition-all duration-200 ${
                              productName ? 'text-xs text-blue-600 -top-2 bg-white px-1' : 'text-gray-500 top-2'
                          }`}
                      >
                          Tên sản phẩm
                      </label>
                  </div>

                  {/* Price and Stock */}
                  <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                          <InputNumber 
                              id="price" 
                              value={price} 
                              onChange={(e) => setPrice(Number(e.value))} 
                              min={0}
                              mode="currency"
                              currency="VND"
                              locale="vi-VN"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
                          />
                          <label className="absolute -top-2 left-4 bg-white px-1 text-xs text-blue-600">
                              Giá ban đầu
                          </label>
                      </div>

                      <div className="relative">
                          <InputNumber 
                              id="stock" 
                              value={stock} 
                              onChange={(e) => setStock(Number(e.value))} 
                              min={0}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
                          />
                          <label className="absolute -top-2 left-4 bg-white px-1 text-xs text-blue-600">
                              Tồn kho
                          </label>
                      </div>
                  </div>

                  {/* Discount */}
                  <div className="relative">
                      <InputNumber 
                          id="discount" 
                          value={discount} 
                          onChange={(e) => setDiscount(Number(e.value))} 
                          min={0} 
                          max={100}
                          suffix="%"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
                      />
                      <label className="absolute -top-2 left-4 bg-white px-1 text-xs text-blue-600">
                          % giảm giá
                      </label>
                  </div>

                  {/* Discounted Price */}
                  <div className="relative">
                      <InputNumber 
                          id="discountedPrice" 
                          value={calculateDiscountedPrice(price, discount)} 
                          readOnly
                          mode="currency"
                          currency="VND"
                          locale="vi-VN"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      />
                      <label className="absolute -top-2 left-4 bg-white px-1 text-xs text-blue-600">
                          Giá sau khi giảm
                      </label>
                  </div>

                  {/* Brand Selection */}
                  <div className="relative">
                      <Dropdown 
                          id="brand" 
                          value={selectedBrand} 
                          options={categories}
                          onChange={(e) => setSelectedBrand(e.value)} 
                          optionLabel="name"
                          placeholder="Chọn hãng"
                          className="w-full border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
                      />
                      <label className="absolute -top-2 left-4 bg-white px-1 text-xs text-blue-600">
                          Hãng sản xuất
                      </label>
                  </div>

                  {/* Technical Specifications */}
                  <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800">Thông số kỹ thuật</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                          {/* OS */}
                          <div className="relative">
                              <InputText
                                  value={productDetails.os}
                                  onChange={(e) => setProductDetails({...productDetails, os: e.target.value})}
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
                                  placeholder=" "
                              />
                              <label className="absolute -top-2 left-4 bg-white px-1 text-xs text-blue-600">
                                  Hệ điều hành
                              </label>
                          </div>

                          {/* CPU */}
                          <div className="relative">
                              <InputText
                                  value={productDetails.cpu}
                                  onChange={(e) => setProductDetails({...productDetails, cpu: e.target.value})}
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
                                  placeholder=" "
                              />
                              <label className="absolute -top-2 left-4 bg-white px-1 text-xs text-blue-600">
                                  CPU
                              </label>
                          </div>

                          {/* GPU */}
                          <div className="relative">
                              <InputText
                                  value={productDetails.gpu}
                                  onChange={(e) => setProductDetails({...productDetails, gpu: e.target.value})}
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
                                  placeholder=" "
                              />
                              <label className="absolute -top-2 left-4 bg-white px-1 text-xs text-blue-600">
                                  GPU
                              </label>
                          </div>

                          {/* Camera */}
                          <div className="space-y-4">
                              <label className="block text-sm font-medium text-gray-700">Camera</label>
                              <div className="grid grid-cols-2 gap-2">
                                  <div className="relative">
                                      <InputText
                                          value={productDetails.camera.main}
                                          onChange={(e) => setProductDetails({
                                              ...productDetails,
                                              camera: {...productDetails.camera, main: e.target.value}
                                          })}
                                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
                                          placeholder="Camera chính"
                                      />
                                  </div>
                                  <div className="relative">
                                      <InputText
                                          value={productDetails.camera.front}
                                          onChange={(e) => setProductDetails({
                                              ...productDetails,
                                              camera: {...productDetails.camera, front: e.target.value}
                                          })}
                                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
                                          placeholder="Camera trước"
                                      />
                                  </div>
                              </div>
                          </div>

                          {/* Display */}
                          <div className="space-y-4 col-span-2">
                              <label className="block text-sm font-medium text-gray-700">Màn hình</label>
                              <div className="grid grid-cols-2 gap-2">
                                  <InputText
                                      value={productDetails.display.type}
                                      onChange={(e) => setProductDetails({
                                          ...productDetails,
                                          display: {...productDetails.display, type: e.target.value}
                                      })}
                                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
                                      placeholder="Loại màn hình"
                                  />
                                  <InputText
                                      value={productDetails.display.size}
                                      onChange={(e) => setProductDetails({
                                          ...productDetails,
                                          display: {...productDetails.display, size: e.target.value}
                                      })}
                                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
                                      placeholder="Kích thước"
                                  />
                                  <InputText
                                      value={productDetails.display.refresh_rate}
                                      onChange={(e) => setProductDetails({
                                          ...productDetails,
                                          display: {...productDetails.display, refresh_rate: e.target.value}
                                      })}
                                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
                                      placeholder="Tần số quét"
                                  />
                                  <InputText
                                      value={productDetails.display.brightness}
                                      onChange={(e) => setProductDetails({
                                          ...productDetails,
                                          display: {...productDetails.display, brightness: e.target.value}
                                      })}
                                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
                                      placeholder="Độ sáng"
                                  />
                              </div>
                          </div>

                          {/* Battery */}
                          <div className="space-y-4 col-span-2">
                              <label className="block text-sm font-medium text-gray-700">Pin</label>
                              <div className="grid grid-cols-2 gap-2">
                                  <InputText
                                      value={productDetails.battery.capacity}
                                      onChange={(e) => setProductDetails({
                                          ...productDetails,
                                          battery: {...productDetails.battery, capacity: e.target.value}
                                      })}
                                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
                                      placeholder="Dung lượng"
                                  />
                                  <InputText
                                      value={productDetails.battery.charging}
                                      onChange={(e) => setProductDetails({
                                          ...productDetails,
                                          battery: {...productDetails.battery, charging: e.target.value}
                                      })}
                                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
                                      placeholder="Công nghệ sạc"
                                  />
                              </div>
                          </div>
                      </div>
                  </div>
              </div>

              {/* Column 2 - Additional Information */}
              <div className="space-y-6">
                  {/* Release Year */}
                  <div className="relative">
                      <Dropdown
                          value={selectedReleaseYear}
                          options={releaseYears}
                          onChange={(e) => setSelectedReleaseYear(e.value)}
                          optionLabel="label"
                          placeholder="Chọn năm ra mắt"
                          className="w-full border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
                      />
                      <label className="absolute -top-2 left-4 bg-white px-1 text-xs text-blue-600">
                          Năm ra mắt
                      </label>
                  </div>

                  {/* Storage */}
                  <div className="relative">
                      <Dropdown
                          value={selectedInternalStorage}
                          options={internalStorages}
                          onChange={(e) => setSelectedInternalStorage(e.value)}
                          optionLabel="label"
                          placeholder="Chọn bộ nhớ trong"
                          className="w-full border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
                      />
                      <label className="absolute -top-2 left-4 bg-white px-1 text-xs text-blue-600">
                          Bộ nhớ trong
                      </label>
                  </div>

                  {/* RAM */}
                  <div className="relative">
                      <Dropdown
                          value={selectedRam}
                          options={rams}
                          onChange={(e) => setSelectedRam(e.value)}
                          optionLabel="label"
                          placeholder="Chọn dung lượng RAM"
                          className="w-full border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
                      />
                      <label className="absolute -top-2 left-4 bg-white px-1 text-xs text-blue-600">
                          Dung lượng RAM
                      </label>
                  </div>

                  {/* Colors */}
                  <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Màu sắc</label>
                      <div className="flex items-center gap-2">
                          <InputText
                              value={colorOption}
                              onChange={(e) => setColorOption(e.target.value)}
                              placeholder="Nhập màu sắc"
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
                          />
                          <Button
                              icon="pi pi-plus"
                              onClick={() => {
                                  if (colorOption) {
                                      setColorOptions([...colorOptions, colorOption]);
                                      setColorOption('');
                                  }
                              }}
                              className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                          />
                      </div>
                      <div className="flex flex-wrap gap-2">
                          {colorOptions.map((color, index) => (
                              <div key={index} className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                                  <span className="text-gray-700">{color}</span>
                                  <Button
                                      icon="pi pi-times"
                                      onClick={() => setColorOptions(colorOptions.filter((_, i) => i !== index))}
                                      className="p-1 hover:bg-gray-200 rounded-full transition-colors duration-200"
                                  />
                              </div>
                          ))}
                      </div>
                  </div>

                  {/* Demands */}
                  <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                          Nhu cầu sử dụng (chọn tối đa 4)
                      </label>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                          {demands.map((demand) => (
                              <div key={demand.value} className="flex items-center gap-2">
                                  <input
                                      type="checkbox"
                                      id={`demand-${demand.value}`}
                                      checked={selectedDemand.includes(demand.value)}
                                      onChange={(e) => {
                                          const newValue = e.target.checked
                                              ? [...selectedDemand, demand.value]
                                              : selectedDemand.filter(v => v !== demand.value);
                                          if (!e.target.checked || newValue.length <= 4) {
                                              setSelectedDemand(newValue);
                                          }
                                      }}
                                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  <label htmlFor={`demand-${demand.value}`} className="text-gray-700 cursor-pointer">
                                      {demand.label}
                                  </label>
                              </div>
                          ))}
                      </div>
                  </div>

                  {/* Special Features */}
                  <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                          Tính năng đặc biệt (chọn tối đa 4)
                      </label>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                          {specialFeatures.map((feature) => (
                              <div key={feature.value} className="flex items-center gap-2">
                                  <input
                                      type="checkbox"
                                      id={`feature-${feature.value}`}
                                      checked={selectedSpecialFeatures.includes(feature.value)}
                                      onChange={(e) => {
                                          const newValue = e.target.checked
                                              ? [...selectedSpecialFeatures, feature.value]
                                              : selectedSpecialFeatures.filter(v => v !== feature.value);
                                          if (!e.target.checked || newValue.length <= 4) {
                                              setSelectedSpecialFeatures(newValue);
                                          }
                                      }}
                                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  <label htmlFor={`feature-${feature.value}`} className="text-gray-700 cursor-pointer">
                                      {feature.label}
                                  </label>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          </div>

          {/* Product Images */}
          <div className="mt-8 space-y-6">
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ảnh chính (tối đa 2 ảnh)
                  </label>
                  <FileUpload
                      name="mainImage"
                      multiple
                      accept="image/*"
                      maxFileSize={5000000}
                      customUpload
                      uploadHandler={(e) => {
                          if (e.files.length > 2) {
                              handleUploadError('Chỉ được phép tải lên tối đa 2 ảnh');
                              return;
                          }
                          setMainImages(e.files);
                          handleUploadSuccess();
                      }}
                      onClear={() => setMainImages([])}
                      pt={{
                          content: { className: 'border border-gray-300 rounded-lg' },
                          chooseButton: { 
                              className: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 transition-colors duration-200 rounded-lg px-4 py-2' 
                          }
                      }}
                  />
              </div>

              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ảnh phụ (tối đa 10 ảnh)
                  </label>
                  <FileUpload
                      name="additionalImages"
                      multiple
                      accept="image/*"
                      maxFileSize={5000000}
                      customUpload
                      uploadHandler={(e) => {
                          if (e.files.length > 10) {
                              handleUploadError('Chỉ được phép tải lên tối đa 10 ảnh');
                              return;
                          }
                          setAdditionalImages(e.files);
                          handleUploadSuccess();
                      }}
                      onClear={() => setAdditionalImages([])}
                      pt={{
                          content: { className: 'border border-gray-300 rounded-lg' },
                          chooseButton: { 
                              className: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 transition-colors duration-200 rounded-lg px-4 py-2' 
                          }
                      }}
                  />
              </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 mt-8">
              <Button 
                  label="Hủy bỏ" 
                  className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors duration-200"
                  onClick={() => setShowAddProduct(false)}
              />
              <Button 
                  label="Lưu" 
                  className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-green-50 hover:text-green-600 hover:border-green-300 transition-colors duration-200"
                  onClick={handleSaveProduct}
              />
          </div>
      </Dialog>

      <Dialog 
          header={<span className="text-xl font-semibold">Chỉnh sửa sản phẩm</span>} 
          visible={showEditProduct} 
          onHide={() => setShowEditProduct(false)} 
          className="w-[90vw]"
          pt={{
              root: { className: 'bg-white rounded-lg shadow-lg' },
              header: { className: 'border-b p-4' },
              content: { className: 'p-6' },
              closeButton: { 
                  className: 'hover:bg-gray-100 rounded-full p-2 transition-colors duration-200' 
              },
              closeButtonIcon: { 
                  className: 'text-gray-500 hover:text-gray-700' 
              }
          }}
      >
          <div className="grid grid-cols-2 gap-8">
              {/* Column 1 - Basic Information */}
              <div className="space-y-6">
                  {/* Product Name - Disabled */}
                  <div className="relative">
                      <InputText 
                          id="productName" 
                          value={productName} 
                          disabled
                          readOnly
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 opacity-60 cursor-not-allowed" 
                      />
                      <label className="absolute -top-2 left-4 bg-white px-1 text-xs text-gray-500">
                          Tên sản phẩm
                      </label>
                  </div>

                  {/* Price and Stock */}
                  <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                          <InputNumber 
                              id="price" 
                              value={price} 
                              onChange={(e) => setPrice(Number(e.value))} 
                              min={0}
                              mode="currency"
                              currency="VND"
                              locale="vi-VN"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
                          />
                          <label className="absolute -top-2 left-4 bg-white px-1 text-xs text-blue-600">
                              Giá ban đầu
                          </label>
                      </div>

                      <div className="relative">
                          <InputNumber 
                              id="stock" 
                              value={stock} 
                              onChange={(e) => setStock(Number(e.value))} 
                              min={0}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
                          />
                          <label className="absolute -top-2 left-4 bg-white px-1 text-xs text-blue-600">
                              Tồn kho
                          </label>
                      </div>
                  </div>

                  {/* Discount */}
                  <div className="relative">
                      <InputNumber 
                          id="discount" 
                          value={discount} 
                          onChange={(e) => setDiscount(Number(e.value))} 
                          min={0} 
                          max={100}
                          suffix="%"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
                      />
                      <label className="absolute -top-2 left-4 bg-white px-1 text-xs text-blue-600">
                          % giảm giá
                      </label>
                  </div>

                  {/* Discounted Price */}
                  <div className="relative">
                      <InputNumber 
                          id="discountedPrice" 
                          value={calculateDiscountedPrice(price, discount)} 
                          readOnly
                          mode="currency"
                          currency="VND"
                          locale="vi-VN"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      />
                      <label className="absolute -top-2 left-4 bg-white px-1 text-xs text-blue-600">
                          Giá sau khi giảm
                      </label>
                  </div>

                  {/* Brand Selection - Disabled */}
                  <div className="relative">
                      <Dropdown 
                          id="brand" 
                          value={selectedBrand} 
                          options={categories}
                          disabled
                          readOnly
                          optionLabel="name"
                          placeholder="Chọn hãng"
                          className="w-full border border-gray-300 rounded-lg bg-gray-50 opacity-60 cursor-not-allowed"
                      />
                      <label className="absolute -top-2 left-4 bg-white px-1 text-xs text-gray-500">
                          Hãng sản xuất
                      </label>
                  </div>

                  {/* Technical Specifications */}
                  <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800">Thông số kỹ thuật</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                          {/* OS */}
                          <div className="relative">
                              <InputText
                                  value={productDetails.os}
                                  onChange={(e) => setProductDetails({...productDetails, os: e.target.value})}
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
                                  placeholder=" "
                              />
                              <label className="absolute -top-2 left-4 bg-white px-1 text-xs text-blue-600">
                                  Hệ điều hành
                              </label>
                          </div>

                          {/* CPU */}
                          <div className="relative">
                              <InputText
                                  value={productDetails.cpu}
                                  onChange={(e) => setProductDetails({...productDetails, cpu: e.target.value})}
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
                                  placeholder=" "
                              />
                              <label className="absolute -top-2 left-4 bg-white px-1 text-xs text-blue-600">
                                  CPU
                              </label>
                          </div>

                          {/* GPU */}
                          <div className="relative">
                              <InputText
                                  value={productDetails.gpu}
                                  onChange={(e) => setProductDetails({...productDetails, gpu: e.target.value})}
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
                                  placeholder=" "
                              />
                              <label className="absolute -top-2 left-4 bg-white px-1 text-xs text-blue-600">
                                  GPU
                              </label>
                          </div>

                          {/* Camera */}
                          <div className="space-y-4">
                              <label className="block text-sm font-medium text-gray-700">Camera</label>
                              <div className="grid grid-cols-2 gap-2">
                                  <div className="relative">
                                      <InputText
                                          value={productDetails.camera.main}
                                          onChange={(e) => setProductDetails({
                                              ...productDetails,
                                              camera: {...productDetails.camera, main: e.target.value}
                                          })}
                                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
                                          placeholder="Camera chính"
                                      />
                                  </div>
                                  <div className="relative">
                                      <InputText
                                          value={productDetails.camera.front}
                                          onChange={(e) => setProductDetails({
                                              ...productDetails,
                                              camera: {...productDetails.camera, front: e.target.value}
                                          })}
                                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
                                          placeholder="Camera trước"
                                      />
                                  </div>
                              </div>
                          </div>

                          {/* Display */}
                          <div className="space-y-4 col-span-2">
                              <label className="block text-sm font-medium text-gray-700">Màn hình</label>
                              <div className="grid grid-cols-2 gap-2">
                                  <InputText
                                      value={productDetails.display.type}
                                      onChange={(e) => setProductDetails({
                                          ...productDetails,
                                          display: {...productDetails.display, type: e.target.value}
                                      })}
                                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
                                      placeholder="Loại màn hình"
                                  />
                                  <InputText
                                      value={productDetails.display.size}
                                      onChange={(e) => setProductDetails({
                                          ...productDetails,
                                          display: {...productDetails.display, size: e.target.value}
                                      })}
                                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
                                      placeholder="Kích thước"
                                  />
                                  <InputText
                                      value={productDetails.display.refresh_rate}
                                      onChange={(e) => setProductDetails({
                                          ...productDetails,
                                          display: {...productDetails.display, refresh_rate: e.target.value}
                                      })}
                                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
                                      placeholder="Tần số quét"
                                  />
                                  <InputText
                                      value={productDetails.display.brightness}
                                      onChange={(e) => setProductDetails({
                                          ...productDetails,
                                          display: {...productDetails.display, brightness: e.target.value}
                                      })}
                                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
                                      placeholder="Độ sáng"
                                  />
                              </div>
                          </div>

                          {/* Battery */}
                          <div className="space-y-4 col-span-2">
                              <label className="block text-sm font-medium text-gray-700">Pin</label>
                              <div className="grid grid-cols-2 gap-2">
                                  <InputText
                                      value={productDetails.battery.capacity}
                                      onChange={(e) => setProductDetails({
                                          ...productDetails,
                                          battery: {...productDetails.battery, capacity: e.target.value}
                                      })}
                                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
                                      placeholder="Dung lượng"
                                  />
                                  <InputText
                                      value={productDetails.battery.charging}
                                      onChange={(e) => setProductDetails({
                                          ...productDetails,
                                          battery: {...productDetails.battery, charging: e.target.value}
                                      })}
                                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
                                      placeholder="Công nghệ sạc"
                                  />
                              </div>
                          </div>
                      </div>
                  </div>
              </div>

              {/* Column 2 */}
              <div className="space-y-6">
                  {/* Release Year */}
                  <div className="relative">
                      <Dropdown
                          value={selectedReleaseYear}
                          options={releaseYears}
                          onChange={(e) => setSelectedReleaseYear(e.value)}
                          optionLabel="label"
                          placeholder="Chọn năm ra mắt"
                          className="w-full border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
                      />
                      <label className="absolute -top-2 left-4 bg-white px-1 text-xs text-blue-600">
                          Năm ra mắt
                      </label>
                  </div>

                  {/* Storage - Disabled */}
                  <div className="relative">
                      <Dropdown
                          value={selectedInternalStorage}
                          options={internalStorages}
                          disabled
                          readOnly
                          className="w-full border border-gray-300 rounded-lg bg-gray-50 opacity-60 cursor-not-allowed"
                      />
                      <label className="absolute -top-2 left-4 bg-white px-1 text-xs text-gray-500">
                          Bộ nhớ trong
                      </label>
                  </div>

                  {/* RAM - Disabled */}
                  <div className="relative">
                      <Dropdown
                          value={selectedRam}
                          options={rams}
                          disabled
                          readOnly
                          className="w-full border border-gray-300 rounded-lg bg-gray-50 opacity-60 cursor-not-allowed"
                      />
                      <label className="absolute -top-2 left-4 bg-white px-1 text-xs text-gray-500">
                          Dung lượng RAM
                      </label>
                  </div>

                  {/* Demands - Disabled */}
                  <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                          Nhu cầu sử dụng
                      </label>
                      <div className="space-y-2 bg-gray-50 p-4 rounded-lg opacity-60">
                          {demands.map((demand) => (
                              <div key={demand.value} className="flex items-center gap-2">
                                  <input
                                      type="checkbox"
                                      checked={selectedDemand.includes(demand.value)}
                                      disabled
                                      className="w-4 h-4 rounded border-gray-300 cursor-not-allowed"
                                  />
                                  <label className="text-gray-700 cursor-not-allowed">
                                      {demand.label}
                                  </label>
                              </div>
                          ))}
                      </div>
                  </div>

                  {/* Special Features - Disabled */}
                  <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                          Tính năng đặc biệt
                      </label>
                      <div className="space-y-2 bg-gray-50 p-4 rounded-lg opacity-60">
                          {specialFeatures.map((feature) => (
                              <div key={feature.value} className="flex items-center gap-2">
                                  <input
                                      type="checkbox"
                                      checked={selectedSpecialFeatures.includes(feature.value)}
                                      disabled
                                      className="w-4 h-4 rounded border-gray-300 cursor-not-allowed"
                                  />
                                  <label className="text-gray-700 cursor-not-allowed">
                                      {feature.label}
                                  </label>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          </div>

          {/* Product Images */}
          <div className="mt-8 space-y-6">
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ảnh chính (tối đa 2 ảnh)
                  </label>
                  <FileUpload
                      mode="advanced"
                      name="mainImage"
                      accept="image/*"
                      maxFileSize={1000000}
                      multiple
                      customUpload
                      uploadHandler={(e) => {
                          if (e.files.length > 2) {
                              handleUploadError('Chỉ được phép tải lên tối đa 2 ảnh');
                              return;
                          }
                          setMainImages(e.files);
                          handleUploadSuccess();
                      }}
                      onClear={() => setMainImages([])}
                      pt={{
                          content: { className: 'border border-gray-300 rounded-lg' },
                          chooseButton: { 
                              className: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 transition-colors duration-200 rounded-lg px-4 py-2' 
                          }
                      }}
                  />
              </div>

              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ảnh phụ (tối đa 10 ảnh)
                  </label>
                  <FileUpload
                      mode="advanced"
                      name="additionalImages"
                      accept="image/*"
                      maxFileSize={1000000}
                      multiple
                      customUpload
                      uploadHandler={(e) => {
                          if (e.files.length > 10) {
                              handleUploadError('Chỉ được phép tải lên tối đa 10 ảnh');
                              return;
                          }
                          setAdditionalImages(e.files);
                          handleUploadSuccess();
                      }}
                      onClear={() => setAdditionalImages([])}
                      pt={{
                          content: { className: 'border border-gray-300 rounded-lg' },
                          chooseButton: { 
                              className: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 transition-colors duration-200 rounded-lg px-4 py-2' 
                          }
                      }}
                  />
              </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 mt-8">
              <Button 
                  label="Hủy bỏ" 
                  className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors duration-200"
                  onClick={() => setShowEditProduct(false)}
              />
              <Button 
                  label="Lưu" 
                  className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-green-50 hover:text-green-600 hover:border-green-300 transition-colors duration-200"
                  onClick={handleEditSave}
              />
          </div>
      </Dialog>

      <Dialog 
        header="Thông báo" 
        visible={showAlert} 
        onHide={() => setShowAlert(false)} 
        style={{ width: '25vw' }} 
        closable={false} 
        className="shadow-md rounded-lg bg-white"
      >
        <div className="p-4">
          <p className="text-gray-700">{alertMessage}</p>
          <Button 
            label="Đóng" 
            onClick={() => setShowAlert(false)} 
            className="
              w-full
              mt-4
              p-2
              rounded-lg
              border
              text-gray-700
              transition-all
              duration-200
              hover:bg-red-50
              hover:text-red-600
              shadow-sm
            "
          />
        </div>
      </Dialog>

      <Dialog 
        header="Thành công" 
        visible={showSuccess} 
        onHide={() => setShowSuccess(false)} 
        style={{ width: '50vw' }} 
        closable={false} 
        className="shadow-md rounded-lg bg-white"
      >
        <div className="p-4">
          <p className="text-blue-700 font-medium">Upload thành công!</p>
          <Button 
            label="Đóng" 
            onClick={() => setShowSuccess(false)} 
            className="
              w-full
              mt-4
              p-2
              rounded-lg
              border
              text-gray-700
              transition-all
              duration-200
              hover:bg-green-50
              hover:text-green-600
              shadow-sm
            "
          />
        </div>
      </Dialog>

      <Dialog 
        header="Xác nhận xóa" 
        visible={showDeleteConfirm} 
        onHide={() => {
            setShowDeleteConfirm(false);
            setProductToDelete(null);
        }}
        className="rounded-lg shadow-md"  
      >
        <div className="p-4">
          <p className="text-gray-700 mb-4">Bạn có chắc chắn muốn xóa sản phẩm này?</p>  
          
          <div className="flex justify-end gap-2">  
            <Button 
              label="Hủy" 
              className="
                p-button-text 
                bg-white
                text-gray-700 
                border 
                border-gray-300
                hover:bg-blue-50 
                hover:text-blue-600 
                transition-all 
                duration-200 
                rounded-md
                p-2
              " 
              onClick={() => {
                  setShowDeleteConfirm(false);
                  setProductToDelete(null);
              }} 
            />
            <Button 
              label="Xóa" 
              className="
                p-button-danger 
                text-red-500 
                border
                border-red-300
                bg-white 
                hover:bg-red-50 
                hover:text-red-600 
                transition-all 
                duration-200 
                rounded-md 
                p-2
              " 
              onClick={() => {
                  if (productToDelete) {
                      handleDeleteProduct(productToDelete);
                  }
              }} 
            />
          </div>
        </div>
      </Dialog>

    </div>
  );
};

export default AdminProducts;


