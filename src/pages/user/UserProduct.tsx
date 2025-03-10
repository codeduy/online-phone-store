import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Slider } from 'primereact/slider';
import { Checkbox } from 'primereact/checkbox';
import { Carousel } from 'primereact/carousel';
import { Toast } from 'primereact/toast';
import { Rating } from 'primereact/rating';
import ComparisonBar from '../../components/user/ComparisonBar';
import { Product } from '../user/types/product';
import { useComparison } from '../../components/user/ComparisonContext';
import axios from 'axios';
import { Helmet } from 'react-helmet';

const API_URL = `${import.meta.env.VITE_API_URL}`;

const formatPrice = (price: number | undefined): string => {
  if (typeof price !== 'number' || isNaN(price)) return '0';
  return new Intl.NumberFormat('vi-VN').format(price);
};

const getDisplayName = (product: Product): string => {
  const isIphone = product.name.toLowerCase().includes('iphone');
  if (isIphone) {
    return `${product.baseProductName} ${product.variant?.storage || ''}`;
  }
  return `${product.baseProductName} ${product.variant?.ram || ''}/${product.variant?.storage || ''}`;
};

const UserProduct = () => {
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
  const toast = useRef<Toast>(null);
  const navigate = useNavigate();

  const [productsByBrand, setProductsByBrand] = useState<ProductsByBrand>({});
  const [isLoading, setIsLoading] = useState(false);
  const [favoriteProducts, setFavoriteProducts] = useState<string[]>([]);
  const { addProduct, getComparisonProducts } = useComparison();

  const fetchProductsByBrand = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching products...');
      const response = await axios.get(`${API_URL}/products/by-brand`);
      console.log('Response:', response.data);
      
      if (response.data.success) {
        const formattedData = Object.keys(response.data.data).reduce((acc, brand) => {
          acc[brand] = response.data.data[brand].map((product: any) => ({
            ...product,
            discountPrice: Number(product.discountPrice) || Number(product.price) || 0,
            originalPrice: Number(product.originalPrice) || Number(product.price) || 0,
            discount: Number(product.discount) || 0
          }));
          return acc;
        }, {} as ProductsByBrand);
    
        console.log('Formatted product data:', formattedData);
        setProductsByBrand(formattedData);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Lỗi',
        detail: 'Không thể tải danh sách sản phẩm'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsByBrand();
  }, []);

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

  const generateProductLink = (product: Product): string => {
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

  const brands = ['Samsung', 'Apple', 'Xiaomi', 'Realme', 'Vivo', 'OnePlus', 'Techno'];
  const releaseYears = ['2019', '2020', '2021', '2022', '2023', '2024', '2025'];
  const memoryOptions = ['64GB', '128GB', '256GB', '512GB', '1TB'];
  const ramOptions = ['3GB', '4GB', '6GB', '8GB', '12GB'];
  const screenOptions = ['60Hz', '90Hz', '120Hz', '144Hz'];
  const needsOptions = ['Chơi game/Cấu hình cao', 'Pin khủng trên 5000mAh', 'Chụp ảnh, quay phim', 'Mỏng nhẹ'];
  const featuresOptions = ['Kháng nước, bụi', 'Hỗ trợ 5G', 'Bảo mật khuôn mặt 3D', 'Công nghệ NFC'];

  interface ProductsByBrand {
    [key: string]: Product[];
  }

  const productTemplate = (product: Product): JSX.Element => {

    const price = product.discountPrice || product.originalPrice || 0;
    const displayPrice = formatPrice(price);

    const imageUrl = product.images && product.images.length > 0 
    ? `${API_URL.replace('/api', '')}/images/phone/${typeof product.trademark === 'string' ? product.trademark.toUpperCase() : product.trademark.name.toUpperCase()}/${product.baseProductName.replace(/\s+/g, '')}/${product.images[0]}`
    : '/fallback-image.jpg';

    return (
      <div className="w-[320px] bg-white rounded-lg shadow-lg border border-gray-200 p-6 h-[480px] flex flex-col ">
          {/* Image section */}
          <div className="relative group h-48 w-48 mx-auto mb-6">
              <img 
                  src={imageUrl}
                  alt={getDisplayName(product)} 
                  className="w-full h-full object-contain rounded-lg transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/fallback-image.jpg';
                  }}
              />
          </div>

          {/* Product info section */}
          <div className="flex flex-col flex-grow">
              <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 text-center line-clamp-2 mb-3">
                      {getDisplayName(product)}
                  </h3>
                  <div className="flex items-center justify-center">
                      <span className="text-red-600 font-bold text-xl">{displayPrice} VND</span>
                      {product.discount > 0 && (
                          <span className="ml-2 px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full">
                              -{product.discount}%
                          </span>
                      )}
                  </div>
              </div>

              {/* Actions section */}
              <div className="mt-auto">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex flex-col gap-3">
                          <Link to={`/products/detail/${generateProductLink(product)}`}>
                              <Button 
                                  label="Xem chi tiết" 
                                  className="w-full px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-colors duration-200"
                              />
                          </Link>
                          <Button 
                              label="So sánh" 
                              icon="pi pi-exchange"
                              onClick={() => handleAddToComparison(product)} 
                              className="w-full px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-green-50 hover:text-green-600 hover:border-green-300 transition-colors duration-200"
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
                              // value={product.rating?.average || 0}
                              value={5}
                              readOnly 
                              stars={5} 
                              cancel={false}
                              pt={{
                                  onIcon: { className: 'text-yellow-400' },
                                  offIcon: { className: 'text-gray-300' }
                              }}
                              className='mb-2'
                          />
                      </div>
                  </div>
              </div>
          </div>
      </div>
    );
  };

  // const generateSlug = (name: string) => {
  //   return name.toLowerCase().replace(/ /g, '-');
  // };

  const handleFilter = (_e: React.MouseEvent<HTMLButtonElement>) => {
    // Build query parameters
    const queryParams = {
      hang: selectedBrands.length ? selectedBrands.join(',') : undefined,
      price: priceRange ? `${priceRange[0]}-${priceRange[1]}` : undefined,
      manhinh: selectedScreen.length ? selectedScreen.join(',') : undefined,
      nam: selectedYears.length ? selectedYears.join(',') : undefined,
      bonho: selectedMemory.length ? selectedMemory.join(',') : undefined,
      ram: selectedRam.length ? selectedRam.join(',') : undefined,
      nhucau: selectedNeeds.length ? selectedNeeds.join(',') : undefined,
      tinhnang: selectedFeatures.length ? selectedFeatures.join(',') : undefined
    };
  
    // Remove undefined values and ensure all values are strings
    const cleanParams = Object.fromEntries(
      Object.entries(queryParams)
        .filter(([_, v]) => v != null)
        .map(([key, value]) => [key, String(value)])
    ) as Record<string, string>;
  
    // Convert to query string
    const queryString = new URLSearchParams(cleanParams).toString();
  
    // Navigate to filter page with query parameters
    navigate({
      pathname: '/user-products-filter',
      search: `?${queryString}`
    });
  };

  const handleCheckboxChange = (selectedItems: string[], setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {
    if (selectedItems.includes(value)) {
      setSelectedItems(selectedItems.filter(item => item !== value));
    } else {
      setSelectedItems([...selectedItems, value]);
    }
  };

  // const filteredProducts = Object.values(productsByBrand).flat().filter(product => 
  //   product.name.toLowerCase().includes(searchTerm.toLowerCase())
  // );

    return (
      <div className="p-4 bg-gray-50 min-h-screen">
        <Helmet>
            <title>Sản phẩm</title>
            <link rel="icon" href="../../src/assets/img/phone.ico" />
        </Helmet>
        <Toast ref={toast} />

        {/* Filter Section */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div>
              <Button label="Hãng" className="w-full px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-colors duration-200" 
              onClick={(e) => brandOverlayRef.current?.toggle(e)} />
              <OverlayPanel ref={brandOverlayRef} className="w-64 shadow-lg rounded-lg">
                {brands.map((brand) => (
                  <div key={brand} className="p-field-checkbox p-2 cursor-pointer">
                    <Checkbox className='border rounded' inputId={brand} value={brand} onChange={(_e) => handleCheckboxChange(selectedBrands, setSelectedBrands, brand)} checked={selectedBrands.includes(brand)} />
                    <label htmlFor={brand} className="ml-2 cursor-pointer text-gray-700">{brand}</label>
                  </div>
                ))}
              </OverlayPanel>
            </div>
            <div>
                <Button 
                    label="Giá" 
                    className="w-full px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-colors duration-200"
                    onClick={(e) => priceOverlayRef.current?.toggle(e)} 
                />
                <OverlayPanel ref={priceOverlayRef} className="w-64 p-4 shadow-lg rounded-lg">
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
                </OverlayPanel>
            </div>
            <div>
              <Button label="Năm ra mắt" className="w-full px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-colors duration-200" 
              onClick={(e) => yearOverlayRef.current?.toggle(e)} />
              <OverlayPanel ref={yearOverlayRef} className="w-64 shadow-lg rounded-lg">
                {releaseYears.map((year) => (
                  <div key={year} className="p-2 hover:bg-gray-50 cursor-pointer">
                    <Checkbox className='border rounded' inputId={year} value={year} onChange={(_e) => handleCheckboxChange(selectedYears, setSelectedYears, year)} checked={selectedYears.includes(year)} />
                    <label htmlFor={year} className="ml-2 cursor-pointer text-gray-700">{year}</label>
                  </div>
                ))}
              </OverlayPanel>
            </div>
            <div>
              <Button label="Bộ nhớ trong" className="w-full px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-colors duration-200" 
              onClick={(e) => memoryOverlayRef.current?.toggle(e)} />
              <OverlayPanel ref={memoryOverlayRef} className="w-64 shadow-lg rounded-lg">
                {memoryOptions.map((memory) => (
                  <div key={memory} className="p-2 hover:bg-gray-50 cursor-pointer">
                    <Checkbox className='border rounded' inputId={memory} value={memory} onChange={(_e) => handleCheckboxChange(selectedMemory, setSelectedMemory, memory)} checked={selectedMemory.includes(memory)} />
                    <label htmlFor={memory} className="ml-2 cursor-pointer text-gray-700">{memory}</label>
                  </div>
                ))}
              </OverlayPanel>
            </div>
            <div>
              <Button label="Dung lượng ram" className="w-full px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-colors duration-200" 
              onClick={(e) => ramOverlayRef.current?.toggle(e)} />
              <OverlayPanel ref={ramOverlayRef} className="w-64 shadow-lg rounded-lg">
                {ramOptions.map((ram) => (
                  <div key={ram} className="p-2 hover:bg-gray-50 cursor-pointer">
                    <Checkbox className='border rounded' inputId={ram} value={ram} onChange={(_e) => handleCheckboxChange(selectedRam, setSelectedRam, ram)} checked={selectedRam.includes(ram)} />
                    <label htmlFor={ram} className="ml-2 cursor-pointer text-gray-700">{ram}</label>
                  </div>
                ))}
              </OverlayPanel>
            </div>
            <div>
              <Button label="Màn hình" className="w-full px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-colors duration-200" 
              onClick={(e) => screenOverlayRef.current?.toggle(e)} />
              <OverlayPanel ref={screenOverlayRef} className="w-64 shadow-lg rounded-lg">
                {screenOptions.map((screen) => (
                  <div key={screen} className="p-2 hover:bg-gray-50 cursor-pointer">
                    <Checkbox className='border rounded' inputId={screen} value={screen} onChange={(_e) => handleCheckboxChange(selectedScreen, setSelectedScreen, screen)} checked={selectedScreen.includes(screen)} />
                    <label htmlFor={screen} className="ml-2 cursor-pointer text-gray-700">{screen}</label>
                  </div>
                ))}
              </OverlayPanel>
            </div>
            <div>
              <Button label="Nhu cầu" className="w-full px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-colors duration-200" 
              onClick={(e) => needsOverlayRef.current?.toggle(e)} />
              <OverlayPanel ref={needsOverlayRef} className="w-64 shadow-lg rounded-lg">
                {needsOptions.map((need) => (
                  <div key={need} className="p-2 hover:bg-gray-50 cursor-pointer">
                    <Checkbox className='border rounded' inputId={need} value={need} onChange={(_e) => handleCheckboxChange(selectedNeeds, setSelectedNeeds, need)} checked={selectedNeeds.includes(need)} />
                    <label htmlFor={need} className="ml-2 cursor-pointer text-gray-700">{need}</label>
                  </div>
                ))}
              </OverlayPanel>
            </div>
            <div>
              <Button label="Tính năng đặc biệt" className="w-full px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-colors duration-200" 
              onClick={(e) => featuresOverlayRef.current?.toggle(e)} />
              <OverlayPanel ref={featuresOverlayRef} className="w-64 shadow-lg rounded-lg">
                {featuresOptions.map((feature) => (
                  <div key={feature} className="p-2 hover:bg-gray-50 cursor-pointer">
                    <Checkbox className='border rounded' inputId={feature} value={feature} onChange={(_e) => handleCheckboxChange(selectedFeatures, setSelectedFeatures, feature)} checked={selectedFeatures.includes(feature)} />
                    <label htmlFor={feature} className="ml-2 cursor-pointer text-gray-700">{feature}</label>
                  </div>
                ))}
              </OverlayPanel>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <Button 
                label="Lọc" 
                icon="pi pi-filter" 
                className="w-full sm:w-auto px-6 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-colors duration-200"
                onClick={handleFilter} 
            />
        </div>
        </div>
        </div>
        {/* End Filter Section */}        

        {/* Products Section */}   
        {isLoading ? (
            <div className="flex justify-center items-center h-40">
                <i className="pi pi-spinner pi-spin text-blue-500 text-4xl"></i>
            </div>
        ) : Object.keys(productsByBrand).length > 0 ? (
            Object.entries(productsByBrand).map(([brand, products]) => (
                <div key={brand} className="mb-12 bg-white rounded-lg shadow-lg border border-gray-200 p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        <h2 className="text-2xl font-semibold text-gray-800">
                            Sản phẩm của {brand}
                        </h2>
                        <Link to={`/products/${brand.toLowerCase()}`}>
                            <Button 
                                label="Xem tất cả" 
                                icon="pi pi-angle-right" 
                                iconPos="right" 
                                className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-colors duration-200"
                            />
                        </Link>
                    </div>
                    <Carousel 
                      value={products} 
                      itemTemplate={productTemplate} 
                      numVisible={4}
                      numScroll={1}
                      circular={true}
                      autoplayInterval={5000}
                      className="p-2"
                      pt={{
                          root: { className: 'overflow-hidden' },
                          content: { className: 'flex items-stretch' },
                          container: { className: 'flex items-stretch gap-3' },
                          previousButton: { 
                              className: 'bg-white text-gray-700 hover:bg-gray-100 transition-colors duration-200' 
                          },
                          nextButton: { 
                              className: 'bg-white text-gray-700 hover:bg-gray-100 transition-colors duration-200' 
                          }
                      }}
                      responsiveOptions={[
                          {
                              breakpoint: '1400px',
                              numVisible: 4,
                              numScroll: 1
                          },
                          {
                              breakpoint: '1024px',
                              numVisible: 3,
                              numScroll: 1
                          },
                          {
                              breakpoint: '768px',
                              numVisible: 2,
                              numScroll: 1
                          },
                          {
                              breakpoint: '560px',
                              numVisible: 1,
                              numScroll: 1
                          }
                      ]}
                    />
                </div>
            ))
        ) : (
            <div className="text-center p-6 bg-white rounded-lg shadow-lg border border-gray-200">
                <p className="text-gray-600">Không có sản phẩm nào</p>
            </div>
        )}

        {/* Comparison Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-50">
            <ComparisonBar />
        </div>
      </div>
    );
};

export default UserProduct;