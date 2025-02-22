import { Toolbar } from 'primereact/toolbar';
import { Button } from 'primereact/button';
import { ToggleButton } from 'primereact/togglebutton';
import { useEffect, useState, useRef } from 'react';
import { Menu } from 'primereact/menu';
import { useNavigate } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { OverlayPanel } from 'primereact/overlaypanel';
import '/src/styles/tailwind.css';
import { useCart } from '../pages/user/CartContext.tsx';
import axios from 'axios';
import { Product } from '../pages/user/types/product';
import { Toast } from 'primereact/toast';

interface Category {
  _id: string;
  name: string;
  link: string;
  logo_url: string;
}

interface SearchResponse {
  success: boolean;
  data: Product[];
}

interface ProductData {
  [key: string]: Product;
}

const API_URL = 'http://localhost:3000/api';

export default function UserHeader() {
  const [darkMode, setDarkMode] = useState(false);
  const overlayPanelRef = useRef<OverlayPanel>(null);
  const menuRef = useRef<Menu>(null);
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchDialog, setShowSearchDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [productDatabase, setProductDatabase] = useState<{[key: string]: Product}>({});
  const debouncedSearch = useRef<NodeJS.Timeout>();
  const toast = useRef<Toast>(null);
  const searchOverlayRef = useRef<OverlayPanel>(null);

  const formatPrice = (price: number | undefined): string => {
    if (typeof price !== 'number' || isNaN(price)) return '0';
    return new Intl.NumberFormat('vi-VN').format(price);
  };
  
  const getDisplayName = (product: Product): string => {
    const isIphone = product.baseProductName.toLowerCase().includes('iphone');
    if (isIphone) {
      return `${product.baseProductName} ${product.variant?.storage}`;
    }
    return `${product.baseProductName} ${product.variant?.ram}/${product.variant?.storage}`;
  };

  const searchProducts = async (searchTerm: string) => {
    setProductDatabase({});
    if (!searchTerm || !searchTerm.trim()) {
      setIsLoading(false);
      searchOverlayRef.current?.hide();
      return;
    }
  
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/products/search`, {
        params: { query: searchTerm }
      });
  
      if (response.data.success) {
        const formattedData: ProductData = {};
        response.data.data.forEach((product: any) => {
          const productKey = product.name + '-' + product.variant?.storage;
          formattedData[productKey] = {
            id: product._id,
            name: product.name,
            baseProductName: product.baseProductName,
            image: Array.isArray(product.images) ? product.images[0] : product.image,
            images: Array.isArray(product.images) ? product.images : [product.image],
            price: Number(product.price),
            originalPrice: Number(product.originalPrice) || Number(product.price),
            discountPrice: Number(product.discountPrice),
            discount: Number(product.discount) || 0,
            variant: product.variant,
            specs: product.specs,
            link: product.link,
            trademark: product.trademark,
          };
        });
        setProductDatabase(formattedData);
        const syntheticEvent = new Event('custom') as unknown as React.SyntheticEvent;
        searchOverlayRef.current?.show(syntheticEvent, document.body);
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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (debouncedSearch.current) {
      clearTimeout(debouncedSearch.current);
    }
  
    setProductDatabase({});
    
    if (value.trim()) {
      debouncedSearch.current = setTimeout(() => {
        searchProducts(value);
      }, 300);
    } else {
      searchOverlayRef.current?.hide();
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

  const handleProductClick = (product: Product) => {
    searchOverlayRef.current?.hide();
    setSearchTerm('');
    setProductDatabase({});
    navigate(`/products/detail/${generateProductLink(product)}`);
  };

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    if (!token || !userId) {
      setIsAuthenticated(false);
      return false;
    }

    try {
      const response = await axios.get('http://localhost:3000/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const isValid = response.data.valid;
      setIsAuthenticated(isValid);
      return isValid;
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
      return false;
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/categories');
        if (response.data && Array.isArray(response.data)) {
          setCategories(response.data);
        } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
          setCategories(response.data.data);
        } else {
          console.error('Unexpected response format:', response.data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.post('http://localhost:3000/api/auth/logout', {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userId');
      setIsAuthenticated(false);
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
    setShowLogoutDialog(false);
  };

  const userMenuItems = isAuthenticated ? [
    {
      label: 'Thông tin người dùng',
      icon: 'pi pi-user',
      command: async () => {
        const isAuth = await checkAuthStatus();
        if (isAuth) {
          navigate('/profile');
        } else {
          handleLogout();
        }
      }
    },
    {
      label: 'Đăng xuất',
      icon: 'pi pi-sign-out',
      command: handleLogout
    }
  ] : [
    {
      label: 'Đăng nhập',
      icon: 'pi pi-sign-in',
      command: () => navigate('/login')
    }
  ];

  const handleCategoryClick = (category: Category) => {
    navigate(category.link);
    overlayPanelRef.current?.hide();
  };

  const startContent = (
    <div className="flex items-center gap-4">
      <img
        src="/src/assets/img/logo.png"
        alt="Website Logo"
        className="h-12 w-auto cursor-pointer transition-transform hover:scale-105"
        onClick={() => navigate('/')}
      />
      <Button
        label="Danh mục sản phẩm"
        icon="pi pi-bars"
        className="border p-2 p-button-outlined p-button-secondary hover:bg-gray-100 transition-colors duration-200"
        onClick={(e) => overlayPanelRef.current?.toggle(e)}
      />
      <OverlayPanel ref={overlayPanelRef} className="w-72 shadow-lg rounded-lg">
        {categories.length > 0 ? (
          <ul className="list-none p-0 m-0 divide-y divide-gray-100">
            {categories.map((category: Category) => (
              <li
                key={category._id}
                className="p-3 hover:bg-gray-50 cursor-pointer flex items-center gap-4 transition-colors duration-200"
                onClick={() => handleCategoryClick(category)}
              >
                <img 
                  src={`http://localhost:3000${category.logo_url}`}
                  alt={`${category.name} logo`}
                  className="w-10 h-10 object-contain rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/src/assets/img/default-logo.png';
                  }}
                />
                <span className="text-sm font-medium text-gray-700 hover:text-blue-600">
                  {category.name}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-4 text-center text-gray-500">
            No categories found
          </div>
        )}
      </OverlayPanel>
      <div className="left-20 flex items-center p-input-icon-left w-96">
        <i className="pi pi-search text-gray-500" />
        <InputText 
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={(e) => {
            if (searchTerm.trim()) {
              searchOverlayRef.current?.show(e, document.body);
            }
          }}
          placeholder="Tìm kiếm sản phẩm..." 
          className="p-2 border ml-5 w-full p-inputtext-sm border-gray-300 rounded-full hover:border-blue-500 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
        />
      </div>
    </div>
  );

  const centerContent = (
    <div className="flex items-center gap-2">
    </div>
  );

  const endContent = (
    <div className="flex items-center gap-6">
      {/* <ToggleButton
        checked={darkMode}
        onChange={(e) => setDarkMode(e.value)}
        onIcon="pi pi-moon"
        offIcon="pi pi-sun"
        className="p-button-rounded p-button-text hover:bg-gray-100"
      /> */}

      <Button
        icon="pi pi-shopping-cart"
        className="p-button-rounded p-button-text hover:bg-gray-100 relative"
        onClick={() => navigate('/cart')}
      >
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {cartCount}
          </span>
        )}
      </Button>

      <Menu model={userMenuItems} popup ref={menuRef} className="shadow-lg" />
      <Button
        icon="pi pi-user"
        className="p-button-rounded p-button-text hover:bg-gray-100"
        onClick={(e) => menuRef.current && menuRef.current.toggle(e)}
      />
    </div>
  );

  const getImageUrl = (product: Product): string => {
    // Debug logs
    // console.log('Product received:', {
    //   id: product.id,
    //   name: product.name,
    //   trademark: product.trademark,
    //   images: product.images
    // });
  
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
    const formattedTrademark = product.trademark.toUpperCase();
    const formattedName = product.name.replace(/\s+/g, '');
    const imagePath = product.images[0];
    
    const fullUrl = `${baseUrl}/images/phone/${formattedTrademark}/${formattedName}/${imagePath}`;
    
    // Debug logs
    // console.log('Image URL components:', {
    //   baseUrl,
    //   formattedTrademark,
    //   formattedName,
    //   imagePath,
    //   fullUrl
    // });
  
    return fullUrl;
  };

  return (
    <div className="sticky top-0 z-50 bg-white shadow-sm">
      <Toolbar 
        start={startContent} 
        center={centerContent} 
        end={endContent} 
        className="border-none px-6"
      />
      
      <OverlayPanel 
        ref={searchOverlayRef}
        className="w-[600px] p-0"
        showCloseIcon
        pt={{
          root: {
            className: 'transform -translate-x-4 translate-y-2' // Added translation
          },
          closeButton: { 
              className: 'hover:bg-red-500 rounded-full p-2 transition-colors duration-200' 
          },
          closeIcon: { 
              className: 'text-dark-500 hover:text-gray-700' 
          }
        }}
        onHide={() => {
          setSearchTerm('');
          setProductDatabase({});
        }}
      >
        <div className="p-4">
          {isLoading ? (
            <div className="text-center py-4">
              <i className="pi pi-spin pi-spinner" style={{ fontSize: '1.5rem' }}></i>
              <p className="mt-2">Đang tìm kiếm sản phẩm...</p>
            </div>
          ) : Object.keys(productDatabase).length > 0 ? (
            <div className="search-results max-h-[70vh] overflow-y-auto">
              {Object.values(productDatabase).map((product) => (
                <div 
                  key={`search-${product.id}`}
                  className="p-2 border rounded-lg flex justify-between items-center mb-2 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleProductClick(product)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16">
                    <img 
                      src={getImageUrl(product)}
                      alt={getDisplayName(product)}
                      className="w-full h-full object-contain"
                      // onError={(e) => {
                      //   const target = e.target as HTMLImageElement;
                      //   console.error('Image load error:', {
                      //     product: product.name,
                      //     trademark: product.trademark,
                      //     attemptedUrl: target.src
                      //   });
                      //   target.src = '/fallback-image.jpg';
                      // }}
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
                </div>
              ))}
            </div>
          ) : searchTerm ? (
            <div className="text-center py-4">
              <p>Không tìm thấy sản phẩm phù hợp</p>
            </div>
          ) : (
            <div className="text-center py-4">
              <p>Nhập tên sản phẩm để tìm kiếm</p>
            </div>
          )}
        </div>
      </OverlayPanel>
    </div>
  );
}