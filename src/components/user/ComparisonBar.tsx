import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { useNavigate } from 'react-router-dom';
import { Product } from '../../pages/user/types/product';
import { useComparison } from './ComparisonContext';
import axios from 'axios';
// import { useCallback } from 'react';
// import { debounce } from 'lodash';

const API_URL = `${import.meta.env.VITE_API_URL}`;

interface ComparisonBarProps {
  // availableProducts: Product[];
}

// interface SearchResponse {
//   success: boolean;
//   data: Product[];
// }

interface ProductData {
  [key: string]: Product;
}


// const getDisplayName = (product: Product): string => {
//   return product.name.toLowerCase().includes('iphone') 
//     ? `${product.baseProductName} ${product.variant?.storage || ''}`
//     : `${product.baseProductName} ${product.variant?.ram || ''}/${product.variant?.storage || ''}`;
// };

const ComparisonBar: React.FC<ComparisonBarProps> = ({  }) => {
  const { 
    comparisonProducts: products, 
    isMinimized,
    addProduct: onAddProduct,
    removeProduct: onRemoveProduct,
    clearProducts: onClearProducts,
    setMinimized
  } = useComparison();

  const [showDialog, setShowDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const toast = React.useRef<Toast>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [productDatabase, setProductDatabase] = useState<{[key: string]: Product}>({});
  const debouncedSearch = React.useRef<NodeJS.Timeout>();

  const formatPrice = (price: number | undefined): string => {
    if (typeof price !== 'number' || isNaN(price)) return '0';
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const searchProducts = async (searchTerm: string) => {
    setProductDatabase({});
    if (!searchTerm || !searchTerm.trim()) {
        setIsLoading(false);
        return;
    }

    try {
        setIsLoading(true);

        setProductDatabase({});
        const response = await axios.get(`${API_URL}/products/search`, {
            params: { query: searchTerm }
        });

        if (response.data.success) {
            const formattedData: ProductData = {};
            response.data.data.forEach((product: any) => {
                console.log('Raw product data:', product);
                
                const productKey = generateSlug(product.name + '-' + product.variant?.storage);
                
                // Fix price handling
                const originalPrice = Number(product.originalPrice) || Number(product.price) || 0;
                const discount = Number(product.discount) || 0;
                const discountPrice = Number(product.discountPrice) || 
                  (originalPrice * (1 - discount / 100));

                console.log('Processed price values:', {
                    originalPrice,
                    discount,
                    discountPrice
                });

                formattedData[productKey] = {
                    id: product._id,
                    name: product.name,
                    baseProductName: product.baseProductName,
                    trademark: product.trademark,
                    images: Array.isArray(product.images) ? product.images : [product.image],
                    originalPrice: originalPrice,
                    discountPrice: discountPrice,
                    discount: discount,
                    price: originalPrice, // Add the required price property
                    link: product.link || '', // Add the required link property
                    rating: product.rating?.average || 0,
                    specs: {
                        os: product.specs?.os || product.productDetails?.os || 'N/A',
                        cpu: product.specs?.cpu || product.productDetails?.cpu || 'N/A',
                        gpu: product.specs?.gpu || product.productDetails?.gpu || 'N/A',
                        ram: product.variant?.ram || 'N/A',
                        storage: product.variant?.storage || 'N/A',
                        rearCamera: product.specs?.rearCamera || product.productDetails?.camera?.main || 'N/A',
                        frontCamera: product.specs?.frontCamera || product.productDetails?.camera?.front || 'N/A',
                        screenTech: product.specs?.screenTech || product.productDetails?.display?.type || 'N/A',
                        screenSize: product.specs?.screenSize || product.productDetails?.display?.size || 'N/A',
                        refreshRate: product.specs?.refreshRate || product.productDetails?.display?.refresh_rate || 'N/A',
                        brightness: product.specs?.brightness || product.productDetails?.display?.brightness || 'N/A',
                        battery: product.specs?.battery || product.productDetails?.battery?.capacity || 'N/A',
                        charging: product.specs?.charging || product.productDetails?.battery?.charging || 'N/A'
                    },
                    variant: {
                        ram: product.variant?.ram,
                        storage: product.variant?.storage
                    }
                };
            });

            console.log('Formatted products:', formattedData);
            setProductDatabase(formattedData);
        }
    } catch (error) {
        console.error('Search error:', error);
        setProductDatabase({});
        toast.current?.show({
            severity: 'error',
            summary: 'Lỗi',
            detail: 'Không thể tìm kiếm sản phẩm'
        });
    } finally {
        setIsLoading(false);
    }
};
  
  // Cập nhật hàm handleSearchChange
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Clear timeout if exists
    if (debouncedSearch.current) {
        clearTimeout(debouncedSearch.current);
    }

    // Always clear previous results when search term changes
    setProductDatabase({});
    
    // Only search if there's a value
    if (value.trim()) {
        debouncedSearch.current = setTimeout(() => {
            searchProducts(value);
        }, 300);
    }
};

  const handleCompareNow = async () => {
    if (products.length < 2) {
        toast.current?.show({ 
            severity: 'warn', 
            summary: 'Thông báo', 
            detail: 'Cần tối thiểu 2 sản phẩm để so sánh',
            life: 3000
        });
        return;
    }

    try {
        // Generate URL-friendly slugs
        const productSlugs = products.map(product => {
            const name = product.baseProductName.toLowerCase().replace(/ /g, '-');
            const storage = product.variant?.storage || '';
            const isIphone = name.includes('iphone');
            const slug = isIphone 
                ? `${name}-${storage}`
                : `${name}-${product.variant?.ram}-${storage}`;
            return slug.replace(/\s+/g, '-');
        }).join('-vs-');

        // Navigate to comparison page
        navigate(`/products/compare/${productSlugs}`, {
            state: { products }
        });

    } catch (error) {
        console.error('[CompareNow] Error:', error);
        toast.current?.show({
            severity: 'error',
            summary: 'Lỗi',
            detail: 'Không thể so sánh sản phẩm. Vui lòng thử lại sau.',
            life: 3000
        });
    }
};

// Sửa hàm getDisplayName
const getDisplayName = (product: Product): string => {
  const isIphone = product.baseProductName.toLowerCase().includes('iphone');
  if (isIphone) {
      return `${product.baseProductName} ${product.variant?.storage}`; // Don't show RAM for iPhone
  }
  return `${product.baseProductName} ${product.variant?.ram}/${product.variant?.storage}`;
};

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/ /g, '-');
  };

//   const filteredProducts = Object.values(productDatabase).filter(product => 
//     product.name.toLowerCase().includes(searchTerm.toLowerCase())
// );

const handleAddProduct = (product: Product) => {
  if (products.length >= 3) {
      toast.current?.show({
          severity: 'warn',
          summary: 'Giới hạn so sánh',
          detail: 'Chỉ có thể so sánh tối đa 3 sản phẩm',
          life: 3000
      });
      return;
  }
  
  // Thêm sản phẩm
  onAddProduct(product);
  
  // Đóng dialog và reset state
  setShowDialog(false);
  setSearchTerm('');
  setProductDatabase({});
  
  // Thông báo thêm thành công
  toast.current?.show({
      severity: 'success',
      summary: 'Thành công',
      detail: 'Đã thêm sản phẩm vào so sánh',
      life: 3000
  });
};

  const getImageUrl = (product: Product): string => {
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
    // const imagePath = product.images[0];

    let imagePath = product.images[0];
    if (imagePath.startsWith('/images/phone/')) {
        // If the image path already contains the full path, extract just the filename
        imagePath = imagePath.split('/').pop() || 'main.jpg';
    }
    
    const fullUrl = `${baseUrl}/images/phone/${formattedTrademark}/${formattedName}/${imagePath}`;
    
    return fullUrl;
  };

  return (
    <>
      <Toast ref={toast} />
      
      {!isMinimized && products.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg p-4 flex justify-center items-center">
          <div className="flex justify-center items-center space-x-4 ml-auto">
          {products.map(product => (
            <div key={product.id} className="p-2 border rounded-lg flex flex-col items-center">
              <img 
                src={getImageUrl(product)} 
                alt={getDisplayName(product)} 
                className="w-20 h-20 object-cover mb-2"
                onError={(e) => {
                  console.error('Image load error:', {
                    product: product.name,
                    trademark: product.trademark,
                    attemptedUrl: (e.target as HTMLImageElement).src
                  });
                  const target = e.target as HTMLImageElement;
                  target.src = '/fallback-image.jpg';
                }}
              />
              <h3 className="text-sm font-bold">
                {getDisplayName(product)}
              </h3>
              <Button 
                icon="pi pi-times" 
                className="p-button-rounded p-button-danger p-button-text"
                onClick={() => onRemoveProduct(product.id)}
              />
            </div>
          ))}
            {products.length < 3 && (
              <Button 
                label="Thêm sản phẩm" 
                icon="pi pi-plus" 
                className="p-button-success" 
                onClick={() => setShowDialog(true)} 
                tooltip={products.length >= 3 ? "Đã đạt giới hạn so sánh" : undefined}
              />
            )}
            <div className="p-2 flex flex-col items-center">
              <Button 
                label="So sánh ngay" 
                icon="pi pi-check" 
                className="p-button-primary mb-2 border p-2" 
                onClick={handleCompareNow} 
              />
              <Button 
                label="Xóa tất cả sản phẩm" 
                icon="pi pi-trash" 
                className="p-button-danger border p-2" 
                onClick={onClearProducts} 
              />
            </div>
          </div>
          <Button 
            label="Thu gọn" 
            icon="pi pi-chevron-down" 
            className="p-button-secondary ml-auto" 
            onClick={() => setMinimized(true)} 
          />
        </div>
      )}

      {isMinimized && products.length > 0 && (
        <Button 
          label="Hiện so sánh" 
          icon="pi pi-chevron-up" 
          className="p-button-secondary fixed bottom-0 left-6 m-4 bg-white p-4 border" // Changed right-0 to left-0
          onClick={() => setMinimized(false)} 
      />
      )}

<Dialog 
  header="Thêm sản phẩm để so sánh" 
  visible={showDialog} 
  style={{ width: '50vw' }} 
  onHide={() => {
    setShowDialog(false);
    setSearchTerm('');
    setProductDatabase({});
  }}
>
  <div className="p-inputgroup mb-4">
    <InputText 
      placeholder="Tìm kiếm sản phẩm" 
      value={searchTerm} 
      onChange={handleSearchChange}
    />
    <Button icon="pi pi-search" />
  </div>
  <div className="mt-4">
    {isLoading ? (
      <div className="text-center">
        <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
        <p>Đang tìm kiếm sản phẩm...</p>
      </div>
    ) : searchTerm && Object.keys(productDatabase).length > 0 ? (
      <div className="search-results">
        {Object.values(productDatabase).map((product) => (
          <div 
            key={`search-${product.id}`}
            className="p-2 border rounded-lg flex justify-between items-center mb-2 hover:bg-gray-50 cursor-pointer"
            onClick={() => handleAddProduct(product)}
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16">
                <img 
                  src={getImageUrl(product)}
                  alt={getDisplayName(product)}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    console.error('Image load error:', {
                      product: product.name,
                      trademark: product.trademark,
                      attemptedUrl: (e.target as HTMLImageElement).src
                    });
                    const target = e.target as HTMLImageElement;
                    target.src = '/fallback-image.jpg';
                  }}
                />
              </div>
              <div>
                <h3 className="font-semibold">{getDisplayName(product)}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-red-500 font-bold">
                    {formatPrice(product.discountPrice)} VND
                  </span>
                  {product.discount > 0 && (
                    <span className="px-2 py-1 bg-red-500 text-white text-xs rounded">
                      -{product.discount}%
                    </span>
                  )}
                </div>
                {product.originalPrice > product.discountPrice && (
                  <span className="text-gray-500 line-through text-sm">
                    {formatPrice(product.originalPrice)} VND
                  </span>
                )}
              </div>
            </div>
            <Button 
              icon="pi pi-plus"
              className="p-button-rounded p-button-text"
              disabled={products.some(p => p.id === product.id) || products.length >= 3}
            />
          </div>
        ))}
      </div>
    ) : searchTerm ? (
      <div className="text-center p-4">
        <p>Không tìm thấy sản phẩm phù hợp</p>
      </div>
    ) : (
      <div className="text-center p-4">
        <p>Nhập tên sản phẩm để tìm kiếm</p>
      </div>
    )}
  </div>
</Dialog>
    </>
  );
};

export default ComparisonBar; 