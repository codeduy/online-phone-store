import { useState, useRef, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Rating } from 'primereact/rating';
import { Link } from 'react-router-dom';
import { Carousel } from 'primereact/carousel';
import ComparisonBar from '../../components/user/ComparisonBar';
import { useComparison } from '../../components/user/ComparisonContext';
import axios from 'axios';
import { retryApiCall } from '../../utils/apiRetry';
import { Helmet } from 'react-helmet';

interface Product {
  id: string;
  name: string;
  baseProductName: string;
  trademark: string;
  price: number | string;
  image?: string;  
  images?: string[];
  rating: {
    average: number;
    count: number;
  };
  needs?: string[];
  special_features?: string[];
  meta: string;
  link: string;
  specs?: {
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
  };
  variant?: {
    storage: string;
    ram: string;
  };
  color_options?: string[];
}

interface ComparisonProduct {
  id: string;
  name: string;
  baseProductName: string;
  price: number;
  images: string[];
  trademark: string;
  link: string;
  originalPrice: number;
  discountPrice: number;
  discount: number;
  meta: string;
  variant?: {
    storage: string;
    ram: string;
  };
  specs?: {
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
  };
}

const API_URL = 'http://localhost:3000/api';

interface BannerItem {
  image: string;
  alt: string;
}

const bannerItems: BannerItem[] = [
  { image: "../../public/images/banner1.jpg", alt: "Banner 1" },
  { image: "../../public/images/banner2.jpg", alt: "Banner 2" },
  { image: "../../public/images/banner3.jpg", alt: "Banner 3" }
];

const bannerTemplate = (item: BannerItem): JSX.Element => {
  return (
    <Link to="/products">
      <img 
        src={item.image} 
        alt={item.alt} 
        className="w-full h-64 object-cover border" 
      />
    </Link>
  );
};

interface BrandProducts {
  [key: string]: Product[];
}

// const bestSellingProductsByBrand: BrandProducts = {
//   Samsung: [
//     { id: '1', name: 'Samsung Galaxy S21', price: '$799', image: '/path/to/samsung1.jpg', rating: 4.5 },
//     { id: '2', name: 'Samsung Galaxy Note 20', price: '$999', image: '/path/to/samsung2.jpg', rating: 4.5 },
//     { id: '3', name: 'Samsung Galaxy A52', price: '$499', image: '/path/to/samsung3.jpg', rating: 4.5 },
//     { id: '4', name: 'Samsung Galaxy Z Fold 3', price: '$1799', image: '/path/to/samsung4.jpg', rating: 4.5 }
//   ],
//   iPhone: [
//     { id: '5', name: 'iPhone 13', price: '$799', image: '/path/to/iphone1.jpg', rating: 4.5 },
//     { id: '6', name: 'iPhone 13 Pro', price: '$999', image: '/path/to/iphone2.jpg', rating: 4.5 },
//     { id: '7', name: 'iPhone 12', price: '$699', image: '/path/to/iphone3.jpg', rating: 4.5 },
//     { id: '8', name: 'iPhone SE', price: '$399', image: '/path/to/iphone4.jpg', rating: 4.5 }
//   ]
//   // Add more products for other brands
// };

// const hotProducts: Product[] = [
//   { id: '9', name: 'Hot Product 1', price: '$299', image: '/path/to/hotproduct1.jpg', rating: 4.5 },
//   { id: '10', name: 'Hot Product 2', price: '$399', image: '/path/to/hotproduct2.jpg', rating: 4.5 },
//   { id: '11', name: 'Hot Product 3', price: '$499', image: '/path/to/hotproduct3.jpg', rating: 4.5 },
//   { id: '12', name: 'Hot Product 4', price: '$599', image: '/path/to/hotproduct4.jpg', rating: 4.5 }   
// ];

const UserHome = () => {
  const [favoriteProducts, setFavoriteProducts] = useState<string[]>([]);
  // const [comparisonProducts, setComparisonProducts] = useState<Product[]>([]);
  const toast = useRef<Toast>(null);
  const { addProduct, getComparisonProducts } = useComparison();
  const [currentUser, setCurrentUser] = useState(null);
  const [userFavorites, setUserFavorites] = useState<string[]>([]);

  const [hotProducts, setHotProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [bestSellingProductsByBrand, setBestSellingProductsByBrand] = useState<{[key: string]: Product[]}>({});

  useEffect(() => {
    // In your UserHome component
    const fetchHotProducts = async () => {
      try {
        setLoading(true);
        console.log('Fetching from:', `${API_URL}/products/hot`);
        const response = await retryApiCall(
          () => axios.get(`${API_URL}/products/hot`),
          {
            maxRetries: 3,
            retryDelay: 1000,
            onRetry: (retryCount, error) => {
              console.log(`Retrying hot products fetch (${retryCount}/3)...`);
              toast.current?.show({
                severity: 'info',
                summary: 'Đang thử lại',
                detail: `Đang tải lại dữ liệu (lần ${retryCount})`,
                life: 2000
              });
            }
          }
        );
        
        if (response.data.success) {
          const formattedProducts = response.data.data;
          console.log('Formatted products:', formattedProducts);
          setHotProducts(formattedProducts);
        }
      } catch (err) {
        console.error('Error details:', err);
        setError('Không thể tải sản phẩm nổi bật');
        toast.current?.show({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Không thể tải sản phẩm nổi bật',
          life: 3000
        });
      } finally {
        setLoading(false);
      }
    };
  
    fetchHotProducts();
  }, []);

  useEffect(() => {
    const fetchProductsByBrand = async () => {
      try {
        const response = await retryApiCall(
          () => axios.get(`${API_URL}/products/by-brand`),
          {
            maxRetries: 3,
            retryDelay: 1000,
            onRetry: (retryCount, error) => {
              console.log(`Retrying products by brand fetch (${retryCount}/3)...`);
              toast.current?.show({
                severity: 'info',
                summary: 'Đang thử lại',
                detail: `Đang tải lại danh sách sản phẩm (lần ${retryCount})`,
                life: 2000
              });
            }
          }
        );
        if (response.data.success) {
          setBestSellingProductsByBrand(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching products by brand:', error);
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Could not load products by brand',
          life: 3000
        });
      }
    };
  
    fetchProductsByBrand();
  }, []);

  useEffect(() => {
    const fetchUserFavorites = async () => {
      try {
        const userId = localStorage.getItem('userId'); // Assuming you store userId in localStorage
        if (!userId) return;

        const response = await axios.get(`${API_URL}/favorites/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.data.success) {
          setUserFavorites(response.data.data.map((product: { _id: any; }) => product._id));
        }
      } catch (error) {
        console.error('Error fetching favorites:', error);
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Could not fetch favorites',
          life: 3000
        });
      }
    };

    fetchUserFavorites();
  }, []);

// Update the handleAddToComparison function
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

    // Convert product images to array format
    let productImages: string[] = [];
    if (product.images && Array.isArray(product.images)) {
      productImages = product.images;
    } else if (product.image) {
      productImages = [product.image];
    }

    // Convert price to number if it's a string
    const price = typeof product.price === 'string' 
      ? parseFloat(product.price.replace(/[^0-9.-]+/g, ''))
      : product.price;

    // Convert Product to ComparisonProduct with all required fields
    const comparisonProduct: ComparisonProduct = {
      id: product.id,
      name: product.name,
      baseProductName: product.baseProductName,
      price: price,
      images: productImages,
      trademark: product.trademark,
      link: product.link,
      originalPrice: price, // Assuming original price is same as price if not specified
      discountPrice: price, // Assuming discount price is same as price if not specified
      discount: 0, // Default discount
      meta: product.meta,
      variant: product.variant || undefined,
      specs: product.specs || undefined
    };

    // Validate required fields
    if (!comparisonProduct.id || !comparisonProduct.name || !comparisonProduct.price) {
      throw new Error('Invalid product data for comparison');
    }

    addProduct(comparisonProduct);
    
    toast.current?.show({
      severity: 'success',
      summary: 'Thêm thành công',
      detail: 'Sản phẩm đã được thêm vào danh sách so sánh',
      life: 3000
    });
  } catch (error) {
    console.error('Error adding to comparison:', error);
    toast.current?.show({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Không thể thêm sản phẩm vào danh sách so sánh',
      life: 3000
    });
  }
};
  
  const toggleFavorite = async (productId: string) => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
  
      // Log debugging information
      console.log('Token:', token);
      console.log('UserId:', userId);
  
      if (!token || !userId) {
        toast.current?.show({
          severity: 'warn',
          summary: 'Warning',
          detail: 'Please login to add favorites',
          life: 3000
        });
        return;
      }
  
      console.log('Sending request to:', `${API_URL}/favorites/toggle`);
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
          },
          withCredentials: true
        }
      );
  
      console.log('Response:', response.data);
  
      if (response.data.success) {
        if (response.data.isFavorite) {
          setUserFavorites(prev => [...prev, productId]);
        } else {
          setUserFavorites(prev => prev.filter(id => id !== productId));
        }
  
        toast.current?.show({
          severity: response.data.isFavorite ? 'success' : 'info',
          summary: 'Success',
          detail: response.data.message,
          life: 3000
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      
      // Check if it's an authentication error
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Session expired. Please login again.',
          life: 3000
        });
        // Optionally redirect to login page or clear local storage
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
      } else {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Could not update favorites',
          life: 3000
        });
      }
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
  
      if (token && userId) {
        try {
          const response = await axios.get(`${API_URL}/auth/verify`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
  
          if (!response.data.valid) {
            // Clear invalid session
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
          }
        } catch (error) {
          console.error('Auth verification failed:', error);
          // Clear invalid session
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
        }
      }
    };
  
    checkAuth();
  }, []);

  const productTemplate = (product: Product): JSX.Element => {
    const formattedPrice = typeof product.price === 'number' 
        ? new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0
          }).format(product.price)
        : product.price;

    const displayName = product.name.toLowerCase().includes('iphone')
        ? `${product.baseProductName} ${product.variant?.storage || ''}`
        : `${product.baseProductName} ${product.variant?.ram || ''}/${product.variant?.storage || ''}`;

    const imageUrl = product.images && product.images.length > 0 
        ? `${API_URL.replace('/api', '')}/images/phone/${product.trademark?.toUpperCase()}/${product.baseProductName.replace(/\s+/g, '')}/${product.images[0]}`
        : '/fallback-image.jpg';

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
  
    return (
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 h-[480px] flex flex-col mr-3">
            {/* Image section */}
            <div className="relative group h-48 w-48 mx-auto mb-6">
                <img 
                    src={imageUrl}
                    alt={displayName} 
                    className="w-full h-full object-contain rounded-lg transition-transform duration-300 group-hover:scale-105" 
                    onError={(e) => {
                        console.error('Image load error:', imageUrl);
                        const target = e.target as HTMLImageElement;
                        target.src = '/fallback-image.jpg';
                    }}
                />
            </div>
  
            {/* Product info section */}
            <div className="flex flex-col flex-grow">
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 text-center line-clamp-2 mb-3">
                        {displayName}
                    </h3>
                    <div className="flex items-center justify-center">
                        <span className="text-red-600 font-bold text-xl">{formattedPrice}</span>
                    </div>
                </div>
  
                {/* Actions section */}
                <div className="mt-auto">
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="flex flex-col gap-3">
                            <Link 
                                to={`/products/detail/${generateProductLink(product)}`} 
                                className="block"
                            >
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
                                icon={`pi ${userFavorites.includes(product.id) ? 'pi-heart-fill' : 'pi-heart'}`}
                                label='Yêu thích'
                                className={`p-1 rounded-full mt-1 ${
                                    userFavorites.includes(product.id) 
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
                                    onIcon: { className: 'text-yellow-400 text-sm' },
                                    offIcon: { className: 'text-gray-300 text-sm' }
                                }}
                                className='mb-3'
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
        <Helmet>
            <title>Trang chủ</title>
            <link rel="icon" href="../../src/assets/img/phone.ico" />
        </Helmet>
        <Toast ref={toast} className="z-50" />

        {/* Banner Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-2">
                <div className="rounded-lg overflow-hidden shadow-lg border border-gray-200">
                    <Carousel 
                        value={bannerItems} 
                        itemTemplate={bannerTemplate}
                        autoplayInterval={5000}
                        circular
                        className="rounded-lg"
                        pt={{
                            content: { className: 'rounded-lg' },
                            previousButton: { 
                                className: 'bg-white/80 text-gray-700 hover:bg-white hover:text-gray-900 transition-colors duration-200' 
                            },
                            nextButton: { 
                                className: 'bg-white/80 text-gray-700 hover:bg-white hover:text-gray-900 transition-colors duration-200' 
                            }
                        }}
                    />
                </div>
            </div>
            <div className="grid grid-rows-2 gap-6">
                <Link to="/products" className="rounded-lg overflow-hidden shadow-lg border border-gray-200 transition-transform duration-300 hover:scale-[1.02]">
                    <img src="../../public/images/banner2.jpg" alt="Banner 2" className="w-full h-32 object-cover" />
                </Link>
                <Link to="/products" className="rounded-lg overflow-hidden shadow-lg border border-gray-200 transition-transform duration-300 hover:scale-[1.02]">
                    <img src="/../../public/images/banner3.jpg" alt="Banner 3" className="w-full h-32 object-cover" />
                </Link>
            </div>
        </div>

        {/* Hot Products Section */}
        <div className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Sản phẩm nổi bật</h2>
            {loading ? (
                <div className="flex justify-center items-center h-40">
                    <i className="pi pi-spinner pi-spin text-blue-500" style={{ fontSize: '2rem' }}></i>
                </div>
            ) : error ? (
                <div className="text-red-600 text-center p-6 bg-red-50 rounded-lg border border-red-200">
                    {error}
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
                    <Carousel 
                        value={hotProducts} 
                        itemTemplate={productTemplate} 
                        numVisible={3} 
                        numScroll={1}
                        className="mt-4"
                        circular
                        autoplayInterval={5000}
                        responsiveOptions={[
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
                        pt={{
                            content: { className: 'px-2' },
                            previousButton: { 
                                className: 'bg-white text-gray-700 hover:bg-gray-100 transition-colors duration-200' 
                            },
                            nextButton: { 
                                className: 'bg-white text-gray-700 hover:bg-gray-100 transition-colors duration-200' 
                            }
                        }}
                    />
                </div>
            )}
        </div>

        {/* Best Selling Products Section */}
        {Object.entries(bestSellingProductsByBrand).map(([brand, products]) => (
            <div key={brand} className="mb-12">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                    Sản phẩm bán chạy của {brand}
                </h2>
                <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {products.map((product) => productTemplate(product))}
                    </div>
                </div>
            </div>
        ))}

        {/* Comparison Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-50">
            <ComparisonBar
                availableProducts={hotProducts}
                onCompare={(products) => {
                    if (products.length < 2) {
                        toast.current?.show({
                            severity: 'warn',
                            summary: 'Chưa đủ sản phẩm',
                            detail: 'Vui lòng chọn ít nhất 2 sản phẩm để so sánh',
                            life: 3000
                        });
                        return;
                    }
                    console.log('Products to compare:', products);
                }}
            />
        </div>
    </div>
);
};

export default UserHome;