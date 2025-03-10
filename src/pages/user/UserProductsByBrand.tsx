import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Rating } from 'primereact/rating';
import ComparisonBar from '../../components/user/ComparisonBar';
import { Product } from '../user/types/product';
import { useComparison } from '../../components/user/ComparisonContext';
import axios from 'axios';
import { Helmet } from 'react-helmet';

const API_URL = `${import.meta.env.VITE_API_URL}`;

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN').format(price);
};

const UserProductsByBrand = () => {
  const { brand = '' } = useParams<{ brand: string }>();
  const navigate = useNavigate();
  const toast = useRef<Toast>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [favoriteProducts, setFavoriteProducts] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<string | null>(null);
  const { addProduct } = useComparison();
  const [loadingStates, setLoadingStates] = useState<{[key: string]: boolean}>({});

  const handleViewDetail = (productId: string) => {
    try {
        // Format URL dựa trên tên sản phẩm
        const product = products.find(p => p.id === productId);
        if (!product) return;

        const formattedName = product.name.toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');
        
        navigate(`/products/detail/${formattedName}`);
    } catch (error) {
        console.error('Navigation error:', error);
        toast.current?.show({
            severity: 'error',
            summary: 'Lỗi',
            detail: 'Không thể xem chi tiết sản phẩm'
        });
    }
};

const toggleFavorite = async (productId: string) => {
  try {
      setLoadingStates(prev => ({ ...prev, [productId]: true }));

      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      if (!token || !userId) {
          toast.current?.show({
              severity: 'warn',
              summary: 'Cảnh báo',
              detail: 'Vui lòng đăng nhập để thêm vào yêu thích'
          });
          return;
      }

      const response = await axios.post(
          `${API_URL}/favorites/toggle`,
          { userId, productId },
          {
              headers: { 'Authorization': `Bearer ${token}` }
          }
      );

      if (response.data.success) {
          setFavoriteProducts(prev => 
              response.data.isFavorite 
                  ? [...prev, productId]
                  : prev.filter(id => id !== productId)
          );
          
          toast.current?.show({
              severity: 'success',
              summary: 'Thành công',
              detail: response.data.isFavorite 
                  ? 'Đã thêm vào danh sách yêu thích'
                  : 'Đã xóa khỏi danh sách yêu thích'
          });
      }
  } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.current?.show({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Không thể cập nhật trạng thái yêu thích'
      });
  } finally {
      setLoadingStates(prev => ({ ...prev, [productId]: false }));
  }
};

const handleAddToComparison = (product: Product) => {
  try {
      addProduct(product);
      toast.current?.show({
          severity: 'success',
          summary: 'Thành công',
          detail: 'Đã thêm sản phẩm vào danh sách so sánh'
      });
  } catch (error: any) {
      console.error('Error adding to comparison:', error);
      toast.current?.show({
          severity: 'error',
          summary: 'Lỗi',
          detail: error.message || 'Không thể thêm sản phẩm vào so sánh'
      });
  }
};

  // Fetch products when component mounts
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${API_URL}/products/brand/${brand}`);
        
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
        setIsLoading(false);
      }
    };

    if (brand) {
      fetchProducts();
    }
  }, [brand]);

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortOption) {
      case 'priceAsc':
        return (a.discountPrice || a.price) - (b.discountPrice || b.price);
      case 'priceDesc':
        return (b.discountPrice || b.price) - (a.discountPrice || a.price);
      case 'discountDesc':
        return (b.discount || 0) - (a.discount || 0);
      default:
        return 0;
    }
  });

  const getImageUrl = (product: Product): string => {
    if (!product.image && (!product.images || !product.images.length)) {
        console.warn('No image found for product:', product.name);
        return '/fallback-image.jpg';
    }

    const imagePath = product.image || product.images[0];
    if (!imagePath) {
        return '/fallback-image.jpg';
    }

    // If the image path is already complete, just return it
    if (imagePath.startsWith('/images/')) {
        return `${API_URL.replace('/api', '')}${imagePath}`;
    }

    // Otherwise construct the full path
    const trademark = (typeof product.trademark === 'string' ? product.trademark : product.trademark?.name)?.toUpperCase() || 'UNKNOWN';
    const productName = product.baseProductName?.replace(/\s+/g, '') || product.name.replace(/\s+/g, '');
    return `${API_URL.replace('/api', '')}/images/phone/${trademark}/${productName}/${imagePath}`;
  };

  const generateProductLink = (product: Product): string => {
    // Remove multiple spaces and special characters
    const baseName = product.baseProductName
      .toLowerCase()
      .replace(/\s+/g, '-') // Replace multiple spaces with single dash
      .replace(/[^a-z0-9-]/g, ''); // Remove special characters except dashes
    
    const isIphone = baseName.includes('iphone');
    
    if (isIphone) {
      return `${baseName}-${product.variant?.storage?.toLowerCase()}`;
    } else {
      // For non-iPhones, ensure consistent formatting
      const ram = product.variant?.ram?.toLowerCase().replace(/\s+/g, '');
      const storage = product.variant?.storage?.toLowerCase().replace(/\s+/g, '');
      return `${baseName}-${ram}-${storage}`;
    }
  };

  const formatDisplayName = (product: Product): string => {
    const isIphone = product.name.toLowerCase().includes('iphone');
    
    if (isIphone) {
      return `${product.baseProductName} ${product.variant?.storage}`;
    }
    return `${product.baseProductName} ${product.variant?.ram}/${product.variant?.storage}`;
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
        <Helmet>
            <title>Sản phẩm thuộc {brand}</title>
            <link rel="icon" href="../../src/assets/img/phone.ico" />
        </Helmet>
        <Toast ref={toast} className="z-50" />

        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 mb-6">
            <h1 className="text-2xl font-semibold text-gray-800 mb-6">
                Sản phẩm của {brand.toUpperCase()}
            </h1>
            
            <div className="flex flex-wrap gap-3">
                <Button 
                    label="Giá cao - thấp" 
                    className={`px-4 py-2 ${
                        sortOption === 'priceDesc' 
                            ? 'bg-blue-600 text-white border-blue-600' 
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300'
                    } border rounded-lg transition-colors duration-200`}
                    onClick={() => setSortOption('priceDesc')} 
                />
                <Button 
                    label="Giá thấp - cao" 
                    className={`px-4 py-2 ${
                        sortOption === 'priceAsc' 
                            ? 'bg-blue-600 text-white border-blue-600' 
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300'
                    } border rounded-lg transition-colors duration-200`}
                    onClick={() => setSortOption('priceAsc')} 
                />
                <Button 
                    label="Khuyến mãi hot" 
                    className={`px-4 py-2 ${
                        sortOption === 'discountDesc' 
                            ? 'bg-blue-600 text-white border-blue-600' 
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300'
                    } border rounded-lg transition-colors duration-200`}
                    onClick={() => setSortOption('discountDesc')} 
                />
            </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
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
                        <div className="relative group w-48 h-48 mb-6">
                            <img 
                                src={getImageUrl(product)}
                                alt={product.name}
                                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                                onError={(e) => {
                                    console.error('Image load error:', {
                                        product: product.name,
                                        src: (e.target as HTMLImageElement).src
                                    });
                                    (e.target as HTMLImageElement).src = '/fallback-image.jpg';
                                }}
                                loading="lazy"
                            />
                        </div>
                        
                        <h3 className="text-lg font-semibold text-gray-800 text-center line-clamp-2 mb-3">
                            {formatDisplayName(product)}
                        </h3>
                        
                        <div className="flex items-center justify-center mb-6">
                            <span className="text-red-600 font-bold text-xl">
                                {formatPrice(product.discountPrice || product.price)} VND
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 w-full mt-auto">
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
                ))}
            </div>
        )}

        {/* Comparison Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-50">
            <ComparisonBar availableProducts={products} />
        </div>
    </div>
);
};

export default UserProductsByBrand;