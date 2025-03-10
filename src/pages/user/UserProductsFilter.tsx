import React, { useState, useRef, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Rating } from 'primereact/rating';
import { Link, useNavigate } from 'react-router-dom';
import { Checkbox } from 'primereact/checkbox';
import { Toast } from 'primereact/toast';
import { Slider } from 'primereact/slider';
import { OverlayPanel } from 'primereact/overlaypanel';
// import { Dialog } from 'primereact/dialog';
// import { InputText } from 'primereact/inputtext';
import ComparisonBar from '../../components/user/ComparisonBar';
// import { Product } from '../user/types/product';
import { useComparison } from '../../components/user/ComparisonContext';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Product } from './types/product';

// interface Product {
//   id: string;
//   name: string;
//   baseProductName: string;
//   images: string[];
//   trademark: string;
//   price: number;
//   originalPrice: number;
//   discountPrice: number;
//   discount: number; // Make sure discount is always a number
//   rating: {
//     average: number;
//     count: number;
//   };
//   specs: {
//     os: string;
//     cpu: string;
//     gpu: string;
//     ram: string;
//     storage: string;
//     screenTech: string;
//     screenSize: string;
//     refreshRate: string;
//     rearCamera: string;
//     frontCamera: string;
//     battery: string;
//     charging: string;
//   };
//   variant: {
//     ram: string;
//     storage: string;
//   };
//   link: string;
//   meta: string;
//   needs: string[];
//   special_features: string[];
// }

const API_URL = `${import.meta.env.VITE_API_URL}`;

const UserProductsFilter = () => {
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000000]);
  const [selectedMemory, setSelectedMemory] = useState<string[]>([]);
  const [selectedRam, setSelectedRam] = useState<string[]>([]);
  const [selectedScreen, setSelectedScreen] = useState<string[]>([]);
  const [selectedNeeds, setSelectedNeeds] = useState<string[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const brandOverlayRef = useRef<OverlayPanel>(null);
  const priceOverlayRef = useRef<OverlayPanel>(null);
  const yearOverlayRef = useRef<OverlayPanel>(null);
  const memoryOverlayRef = useRef<OverlayPanel>(null);
  const ramOverlayRef = useRef<OverlayPanel>(null);
  const screenOverlayRef = useRef<OverlayPanel>(null);
  const needsOverlayRef = useRef<OverlayPanel>(null);
  const featuresOverlayRef = useRef<OverlayPanel>(null);
  const [favoriteProducts, setFavoriteProducts] = useState<string[]>([]);
  // const [comparisonProducts, setComparisonProducts] = useState<Product[]>([]);
  const toast = useRef<Toast>(null);
  const navigate = useNavigate();
  const [sortOption, setSortOption] = useState<string | null>(null);
  const { addProduct, getComparisonProducts } = useComparison();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  const brands = ['Samsung', 'Apple', 'Xiaomi', 'Realme', 'Vivo', 'OnePlus', 'Techno'];
  const releaseYears = ['2019', '2020', '2021', '2022', '2023', '2024', '2025'];
  const memoryOptions = ['64GB', '128GB', '256GB', '512GB', '1TB'];
  const ramOptions = ['3GB', '4GB', '6GB', '8GB', '12GB'];
  const screenOptions = ['60Hz', '90Hz', '120Hz', '144Hz'];
  const needsOptions = ['Chơi game/Cấu hình cao', 'Pin khủng trên 5000mAh', 'Chụp ảnh, quay phim', 'Mỏng nhẹ'];
  const featuresOptions = ['Kháng nước, bụi', 'Hỗ trợ 5G', 'Bảo mật khuôn mặt 3D', 'Công nghệ NFC'];

  // Removed duplicate Product interface as it's already defined above

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}/products/filter${location.search}`);
        if (response.data.success) {
          setProducts(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.current?.show({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Không thể tải danh sách sản phẩm'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [location.search]);

  const handleAddToComparison = (product: Product) => {
      try {
        const currentProducts = getComparisonProducts();
        
        if (currentProducts.length >= 3) {
          toast.current?.show({
            severity: 'warn',
            summary: 'Giới hạn so sánh',
            detail: 'Chỉ có thể so sánh tối đa 3 sản phẩm',
            life: 3000
          });
          return;
        }
  
        if (currentProducts.some(p => p.id === product.id)) {
          toast.current?.show({
            severity: 'warn',
            summary: 'Đã tồn tại',
            detail: 'Sản phẩm này đã có trong danh sách so sánh',
            life: 3000
          });
          return;
        }
  
        addProduct(product);
        
        toast.current?.show({
          severity: 'success',
          summary: 'Thành công',
          detail: 'Đã thêm sản phẩm vào danh sách so sánh',
          life: 3000
        });
      } catch (error) {
        console.error('Error adding to comparison:', error);
        toast.current?.show({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Không thể thêm sản phẩm vào so sánh',
          life: 3000
        });
      }
    };

  const handleSortChange = (option: string) => {
    setSortOption(option);
  };

  const sortedProducts = [...products].sort((a, b) => {
    if (sortOption === 'priceAsc') {
      return Number(a.price) - Number(b.price);
    } else if (sortOption === 'priceDesc') {
      return Number(b.price) - Number(a.price);
    } else if (sortOption === 'discountDesc') {
      return Number(b.discount) - Number(a.discount);
    }
    return 0;
  });

  const toggleFavorite = async (productId: string) => {
      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
  
        if (!token || !userId) {
          toast.current?.show({
            severity: 'warn',
            summary: 'Cảnh báo',
            detail: 'Vui lòng đăng nhập để thêm vào yêu thích',
            life: 3000
          });
          return;
        }
  
        const response = await axios.post(
          `${API_URL}/favorites/toggle`,
          {
            userId,
            productId
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
  
        if (response.data.success) {
          if (response.data.isFavorite) {
            setFavoriteProducts(prev => [...prev, productId]);
          } else {
            setFavoriteProducts(prev => prev.filter(id => id !== productId));
          }
  
          toast.current?.show({
            severity: response.data.isFavorite ? 'success' : 'info',
            summary: 'Thành công',
            detail: response.data.message,
            life: 3000
          });
        }
      } catch (error) {
        console.error('Error toggling favorite:', error);
        toast.current?.show({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Không thể cập nhật trạng thái yêu thích',
          life: 3000
        });
      }
    };

  const generateSlug = (product: Product): string => {
      const baseName = product.baseProductName
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      
      const isIphone = baseName.includes('iphone');
      
      if (isIphone) {
        return `${baseName}-${product.variant?.storage?.toLowerCase()}`;
      } else {
        const ram = product.variant?.ram?.toLowerCase().replace(/\s+/g, '');
        const storage = product.variant?.storage?.toLowerCase().replace(/\s+/g, '');
        return `${baseName}-${ram}-${storage}`;
      }
    };

  const handleCheckboxChange = (selectedItems: string[], setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {
    if (selectedItems.includes(value)) {
      setSelectedItems(selectedItems.filter(item => item !== value));
    } else {
      setSelectedItems([...selectedItems, value]);
    }
  };

  const handleFilter = (_e: React.MouseEvent<HTMLButtonElement>) => {
    const selectedBrandsQuery = selectedBrands.join(',');
    const priceRangeQuery = `${priceRange[0]}-${priceRange[1]}`;
    const selectedScreenQuery = selectedScreen.join(',');
    const selectedReleaseYearQuery = selectedYears.join(',');
    const selectedInternalStorageQuery = selectedMemory.join(',');
    const selectedRamQuery = selectedRam.join(',');
    const selectedDemandQuery = selectedNeeds.join(',');
    const selectedSpecialFeaturesQuery = selectedFeatures.join(',');
  
    const queryString = `hang=${selectedBrandsQuery}&price=${priceRangeQuery}&manhinh=${selectedScreenQuery}&nam=${selectedReleaseYearQuery}&bonho=${selectedInternalStorageQuery}&ram=${selectedRamQuery}&nhucau=${selectedDemandQuery}&tinhnang=${selectedSpecialFeaturesQuery}`;
    navigate(`/user-products-filter?${queryString}`);
  };

  const getImageUrl = (product: Product): string => {

    console.log('Product received in getImageUrl:', {
      id: product.id,
      name: product.name,
      trademark: product.trademark,
      images: product.images,
      baseProductName: product.baseProductName
    });

    if (!product.images || !product.images.length) {
      console.log('No images found for product:', product.name);
      return '/fallback-image.jpg';
    }
  
    if (!product.trademark) {
      console.log('No trademark found for product:', product.name);
      return '/fallback-image.jpg';
    }
  
    // Build image URL
    const baseUrl = API_URL.replace('/api', '');
    const formattedTrademark = typeof product.trademark === 'string' 
      ? product.trademark.toUpperCase() 
      : product.trademark.name.toUpperCase();
    const formattedName = product.baseProductName.replace(/\s+/g, '');
    const imagePath = product.images[0];
    
    const fullUrl = `${baseUrl}/images/phone/${formattedTrademark}/${formattedName}/${imagePath}`;
    
    console.log('Image URL components:', {
      baseUrl,
      formattedTrademark,
      formattedName,
      imagePath,
      fullUrl
    });

    return fullUrl;
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
        <Toast ref={toast} className="z-50" />
        <Helmet>
            <title>Lọc sản phẩm</title>
            <link rel="icon" href="../../src/assets/img/phone.ico" />
        </Helmet>
        
        {/* Filter Section */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="col-span-1 sm:col-span-2 lg:col-span-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Filter Buttons */}
                        {[
                            { label: "Hãng", ref: brandOverlayRef, options: brands },
                            { label: "Giá", ref: priceOverlayRef },
                            { label: "Năm ra mắt", ref: yearOverlayRef, options: releaseYears },
                            { label: "Bộ nhớ trong", ref: memoryOverlayRef, options: memoryOptions },
                            { label: "Dung lượng ram", ref: ramOverlayRef, options: ramOptions },
                            { label: "Màn hình", ref: screenOverlayRef, options: screenOptions },
                            { label: "Nhu cầu", ref: needsOverlayRef, options: needsOptions },
                            { label: "Tính năng đặc biệt", ref: featuresOverlayRef, options: featuresOptions }
                        ].map((filter) => (
                            <div key={filter.label}>
                                <Button 
                                    label={filter.label} 
                                    className="w-full px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-colors duration-200"
                                    onClick={(e) => filter.ref.current?.toggle(e)} 
                                />
                                <OverlayPanel 
                                    ref={filter.ref} 
                                    className="w-64 bg-white rounded-lg shadow-lg border border-gray-200"
                                >
                                    {filter.label === "Giá" ? (
                                        <div className="p-4">
                                            <Slider 
                                                value={priceRange} 
                                                onChange={(e) => setPriceRange(e.value as [number, number])} 
                                                range 
                                                min={0} 
                                                max={50000000} 
                                                className="mb-4"
                                            />
                                            <p className="text-sm text-gray-600">
                                                Giá: {priceRange[0].toLocaleString()}đ - {priceRange[1].toLocaleString()}đ
                                            </p>
                                        </div>
                                    ) : filter.options?.map((option) => (
                                        <div key={option} className="p-3 hover:bg-gray-50 transition-colors duration-200">
                                            <Checkbox 
                                                inputId={option} 
                                                value={option} 
                                                onChange={(_e) => handleCheckboxChange(
                                                    filter.label === "Hãng" ? selectedBrands :
                                                    filter.label === "Năm ra mắt" ? selectedYears :
                                                    filter.label === "Bộ nhớ trong" ? selectedMemory :
                                                    filter.label === "Dung lượng ram" ? selectedRam :
                                                    filter.label === "Màn hình" ? selectedScreen :
                                                    filter.label === "Nhu cầu" ? selectedNeeds :
                                                    selectedFeatures,
                                                    filter.label === "Hãng" ? setSelectedBrands :
                                                    filter.label === "Năm ra mắt" ? setSelectedYears :
                                                    filter.label === "Bộ nhớ trong" ? setSelectedMemory :
                                                    filter.label === "Dung lượng ram" ? setSelectedRam :
                                                    filter.label === "Màn hình" ? setSelectedScreen :
                                                    filter.label === "Nhu cầu" ? setSelectedNeeds :
                                                    setSelectedFeatures,
                                                    option
                                                )} 
                                                checked={
                                                    filter.label === "Hãng" ? selectedBrands.includes(option) :
                                                    filter.label === "Năm ra mắt" ? selectedYears.includes(option) :
                                                    filter.label === "Bộ nhớ trong" ? selectedMemory.includes(option) :
                                                    filter.label === "Dung lượng ram" ? selectedRam.includes(option) :
                                                    filter.label === "Màn hình" ? selectedScreen.includes(option) :
                                                    filter.label === "Nhu cầu" ? selectedNeeds.includes(option) :
                                                    selectedFeatures.includes(option)
                                                }
                                                className="mr-2 border"
                                            />
                                            <label htmlFor={option} className="text-sm text-gray-700 cursor-pointer">
                                                {option}
                                            </label>
                                        </div>
                                    ))}
                                </OverlayPanel>
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* Filter Button */}
                <div className="col-span-1 flex items-center justify-center">
                    <Button 
                        label="Lọc" 
                        icon="pi pi-filter"
                        className="w-full px-4 py-2 bg-blue-600 text-white border border-blue-600 rounded-lg hover:bg-blue-700 hover:border-blue-700 transition-colors duration-200"
                        onClick={handleFilter} 
                    />
                </div>
            </div>
        </div>

        {/* Title and Sort Section */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 mb-6">
            <h1 className="text-2xl font-semibold text-gray-800 mb-4">Lọc sản phẩm theo yêu cầu</h1>
            <div className="flex flex-wrap gap-3">
                <Button 
                    label="Giá thấp - cao" 
                    className={`px-4 py-2 ${
                        sortOption === 'priceAsc' 
                            ? 'bg-blue-600 text-white border-blue-600' 
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300'
                    } border rounded-lg transition-colors duration-200`}
                    onClick={() => handleSortChange('priceAsc')} 
                />
                <Button 
                    label="Giá cao - thấp" 
                    className={`px-4 py-2 ${
                        sortOption === 'priceDesc' 
                            ? 'bg-blue-600 text-white border-blue-600' 
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300'
                    } border rounded-lg transition-colors duration-200`}
                    onClick={() => handleSortChange('priceDesc')} 
                />
                <Button 
                    label="Khuyến mãi hot" 
                    className={`px-4 py-2 ${
                        sortOption === 'discountDesc' 
                            ? 'bg-blue-600 text-white border-blue-600' 
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300'
                    } border rounded-lg transition-colors duration-200`}
                    onClick={() => handleSortChange('discountDesc')} 
                />
            </div>
        </div>

        {/* Product List Section */}
        {loading ? (
            <div className="flex justify-center items-center h-40">
                <i className="pi pi-spinner pi-spin text-blue-500 text-4xl"></i>
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                {sortedProducts.map((product) => (
                    <div key={product.id} className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 flex flex-col items-center relative group hover:shadow-xl transition-shadow duration-300">
                        {product.discount > 0 && (
                            <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                                -{product.discount}%
                            </div>
                        )}
                        <div className="relative w-48 h-48 mb-6">
                            <img 
                                src={getImageUrl(product)}
                                alt={product.name}
                                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = '/fallback-image.jpg';
                                }}
                                loading="lazy"
                            />
                        </div>
                        
                        <h3 className="text-lg font-semibold text-gray-800 text-center line-clamp-2 mb-3">
                            {product.name}
                        </h3>
                        
                        <div className="flex items-center justify-center gap-2 mb-6">
                            <span className="text-red-600 font-bold text-xl">
                                {product.discountPrice.toLocaleString('vi-VN')}đ
                            </span>
                            {product.discount > 0 && (
                                <span className="text-gray-400 line-through text-sm">
                                    {product.originalPrice?.toLocaleString()}đ
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4 w-full mt-auto">
                            <div className="flex flex-col gap-3">
                                <Link to={`/products/detail/${generateSlug(product)}`}>
                                    <Button 
                                        label="Xem chi tiết" 
                                        className="w-full px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-colors duration-200"
                                    />
                                </Link>
                                <Button 
                                    label="So sánh" 
                                    icon="pi pi-exchange"
                                    className="w-full px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-green-50 hover:text-green-600 hover:border-green-300 transition-colors duration-200"
                                    onClick={() => handleAddToComparison(product)} 
                                />
                            </div>
                            <div className="flex flex-col justify-between items-end">
                                <Button 
                                    icon={`pi ${favoriteProducts.includes(product.id) ? 'pi-heart-fill' : 'pi-heart'}`}
                                    label='Yêu thích'
                                    className={`p-2 rounded-full ${
                                        favoriteProducts.includes(product.id) 
                                            ? 'text-red-500 hover:bg-red-50' 
                                            : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                                    } transition-colors duration-200`}
                                    onClick={() => toggleFavorite(product.id)}
                                />
                                <Rating 
                                    // value={product.rating.average} 
                                    value={5}
                                    readOnly 
                                    stars={5} 
                                    cancel={false}
                                    pt={{
                                        onIcon: { className: 'text-yellow-400' },
                                        offIcon: { className: 'text-gray-300' }
                                    }}
                                    className='mb-3'
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}

        {/* Comparison Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-50">
            <ComparisonBar />
        </div>
    </div>
);
};

export default UserProductsFilter;