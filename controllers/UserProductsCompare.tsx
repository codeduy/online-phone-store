import React, { useState, useEffect, useRef } from 'react';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Rating } from 'primereact/rating';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import s21 from '/src/assets/img/s21.png';
import { useCart } from './CartContext';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { useCallback } from 'react';
import { debounce } from 'lodash';

interface Product {
    productDetails: any;
    variant: any;
    baseProductName: any;
    id: string;
    name: string;
    images: string[];
    trademark: string;
    originalPrice: number;
    discountPrice: number;
    discount: number;
    rating: number;
    specs: {
        os: string;
        cpu: string;
        gpu: string;
        ram: string;
        storage: string;
        rearCamera: string;
        frontCamera: string;
        screenTech: string;
        screenSize: string;
        refreshRate: string;
        brightness: string;
        battery: string;
        charging: string;
    };
}

interface LocationState {
    comparisonData?: Product[];
    products?: Product[];
  }

interface ProductData {
    [key: string]: Product;
}

const API_URL = "http://localhost:3000/api";

const UserProductsCompare = () => {
    // const [selectedProducts, setSelectedProducts] = useState<(Product | null)[]>([]);
    const [showDialog, setShowDialog] = useState(false);
    const [activeSlot, setActiveSlot] = useState<number | null>(null);
    const { comparisonUrl } = useParams();
    const [activeIndexes] = useState([0]);
    const [products, setProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const toast = useRef<Toast>(null);
    const [showOnlyDifferences, setShowOnlyDifferences] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);    
    const [isLoading, setIsLoading] = useState(false);
    const [productDatabase, setProductDatabase] = useState<ProductData>({});

    const location = useLocation();
    const locationState = location.state as LocationState;

    const searchProducts = async (searchTerm: string) => {
        if (!searchTerm.trim()) {
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
                    console.log('Raw product data:', product);
                    
                    const productKey = generateSlug(product.name + '-' + product.variant?.storage);

                    const images = product.images || [product.image];
                    console.log('Processed images:', images);
                    
                    // Fix price handling
                    const originalPrice = Number(product.originalPrice) || Number(product.price) || 0;
                    const discount = Number(product.discount) || 0;
                    const discountPrice = product.discountPrice || 
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
                        productDetails: product.productDetails || {},
                        trademark: product.trademark || product.productDetails?.trademark || 'Unknown',
                        images: images.map((img: string) => 
                            img.startsWith('/images/') ? img : `/images/phone/${product.trademark?.toUpperCase()}/${product.baseProductName.replace(/\s+/g, '')}/${img}`
                        ),
                        originalPrice: originalPrice,
                        discountPrice: discountPrice,
                        discount: discount,
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
    
                console.log('Formatted search results:', formattedData);
                setProductDatabase(formattedData);
            }
        } catch (error) {
            console.error('[SearchProducts] Error:', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Lỗi',
                detail: 'Không thể tải danh sách sản phẩm',
                life: 3000
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    // Add debounce to prevent too many API calls
    const debouncedSearch = useCallback(
        debounce((term: string) => {
            searchProducts(term);
        }, 500),
        []
    );

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        debouncedSearch(value);
    };

    const formatDisplayName = (product: Product): string => {
        const isIphone = product.name.toLowerCase().includes('iphone');
        if (isIphone) {
            // For iPhones, show without RAM
            return `${product.baseProductName} ${product.specs.storage}`;
        }
        // For other products, show with RAM
        return `${product.name}`;
    };

    useEffect(() => {
        const fetchComparisonData = async () => {
            try {
                if (location.state?.products) {
                    console.log('Original products from state:', location.state.products);
                    
                    // Maintain original data structure without transforming
                    const formattedProducts = location.state.products.map((product: {
                        productDetails: any;
                        trademark: any; id: any; name: any; baseProductName: any; images: any; image: any; originalPrice: any; price: number; discountPrice: any; discount: any; rating: { average: any; }; specs: { os: any; cpu: any; gpu: any; camera: { main: any; front: any; }; rearCamera: any; frontCamera: any; display: { type: any; size: any; refresh_rate: any; brightness: any; }; screenTech: any; screenSize: any; refreshRate: any; brightness: any; battery: { capacity: any; charging: any; }; charging: any; }; variant: { ram: any; storage: any; }; 
}) => ({
                        id: product.id,
                        name: product.name,
                        baseProductName: product.baseProductName,
                        images: product.images || [product.image], // Handle both array and single image
                        trademark: product.trademark || product.productDetails?.trademark,
                        originalPrice: product.originalPrice || product.price,
                        discountPrice: product.discountPrice || (product.price * (1 - (product.discount || 0) / 100)),
                        discount: product.discount || 0,
                        rating: product.rating?.average || product.rating || 0,
                        specs: {
                            os: product.specs.os,
                            cpu: product.specs.cpu,
                            gpu: product.specs.gpu,
                            ram: product.variant.ram,
                            storage: product.variant.storage,
                            rearCamera: product.specs.camera?.main || product.specs.rearCamera,
                            frontCamera: product.specs.camera?.front || product.specs.frontCamera,
                            screenTech: product.specs.display?.type || product.specs.screenTech,
                            screenSize: product.specs.display?.size || product.specs.screenSize,
                            refreshRate: product.specs.display?.refresh_rate || product.specs.refreshRate,
                            brightness: product.specs.display?.brightness || product.specs.brightness,
                            battery: product.specs.battery?.capacity || product.specs.battery,
                            charging: product.specs.battery?.charging || product.specs.charging
                        },
                        variant: {
                            ram: product.variant.ram,
                            storage: product.variant.storage
                        }
                    }));
    
                    console.log('Formatted products:', formattedProducts);
                    setProducts(formattedProducts);
                    return;
                }
                // ... rest of the code
            } catch (error) {
                console.error('Error in fetchComparisonData:', error);
            }
        };
    
        fetchComparisonData();
    }, [comparisonUrl, location.state]);

    // useEffect(() => {
    //     if (comparisonUrl) {
    //         const productSlugs = comparisonUrl.split('-vs-');
    //         console.log('Product slugs:', productSlugs);
    
    //         const selectedProducts = productSlugs
    //             .map(slug => {
    //                 const product = productDatabase[slug];
    //                 console.log(`Found product for slug ${slug}:`, product);
    //                 return product;
    //             })
    //             .filter(Boolean);
    
    //         console.log('Selected products:', selectedProducts);
    //         setProducts(selectedProducts);
    //     }
    // }, [comparisonUrl]);

    const formatProductName = (name: string) => {
        return name
            .split('-')
            .join(' ')
            .toUpperCase();
    };

    useEffect(() => {
        const handleScroll = () => {
            const row1Height = document.getElementById('row1')?.offsetHeight || 0;
            const scrollThreshold = row1Height * 0.8;
            setIsScrolled(window.scrollY > scrollThreshold);
        };
    
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navigate = useNavigate();
    const getProductNames = () => {
        if (products.length === 0) return 'So sánh sản phẩm';
        return `<span class="text-lg">So sánh sản phẩm</span><br/><br/>
                <span class="text-lg">
                    ${products.map(p => formatDisplayName(p)).join('<br/><br/>&<br/><br/>')}
                </span>`;
    };

    const removeProduct = (productId: string) => {
        const updatedProducts = products.filter(p => p.id !== productId);
        if (updatedProducts.length === 1) {
            toast.current?.show({
                severity: 'info',
                summary: 'Thông báo',
                detail: 'Bạn có thể thêm sản phẩm khác để so sánh',
                life: 3000
            });
        }
        const newUrl = updatedProducts.map(product => {
            const name = product.baseProductName.toLowerCase().replace(/ /g, '-');
            const storage = product.variant?.storage || '';
            const isIphone = name.includes('iphone');
            const slug = isIphone 
                ? `${name}-${storage}`
                : `${name}-${product.variant?.ram}-${storage}`;
            return slug.replace(/\s+/g, '-');
        }).join('-vs-');
        setProducts(updatedProducts);
        
        navigate(`/products/compare/${newUrl}`, {
            state: { 
                products: updatedProducts 
            },
            replace: true
        });
    };

    const addProduct = (product: Product) => {
        const updatedProducts = [...products, {
            ...product,
            trademark: product.trademark || product.productDetails?.trademark,
        }];
        
        const newUrl = updatedProducts.map(product => {
            const name = product.baseProductName.toLowerCase().replace(/ /g, '-');
            const storage = product.variant?.storage || '';
            const isIphone = name.includes('iphone');
            const slug = isIphone 
                ? `${name}-${storage}`                                              // For iPhones: only include storage
                : `${name}-${product.variant?.ram}-${storage}`;                     // For others: include RAM and storage
            return slug.replace(/\s+/g, '-');
        }).join('-vs-');
    
        // Navigate với state mới
        navigate(`/products/compare/${newUrl}`, {
            state: { 
                products: updatedProducts 
            },
            replace: true                                                           // Use replace to avoid adding to history stack
        });
        
        setShowDialog(false);
    };

    const formatPrice = (price?: number) => {
        if (price === undefined || price === null) return '0';
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    const generateSlug = (name: string) => {
        return name.toLowerCase().replace(/ /g, '-');
    };

    // const renderSpecifications = () => {
    //     const specCategories = {
    //         hardware: [
    //             { key: 'os', label: 'Hệ điều hành' },
    //             { key: 'cpu', label: 'Chip xử lý (CPU)' },
    //             { key: 'gpu', label: 'Chip đồ họa (GPU)' },
    //         ],
    //         memory: [
    //             { key: 'ram', label: 'RAM' },
    //             { key: 'storage', label: 'Bộ nhớ trong' },
    //         ],
    //         camera: [
    //             { key: 'camera.main', label: 'Camera sau' },
    //             { key: 'camera.front', label: 'Camera trước' },
    //         ],
    //         display: [
    //             { key: 'display.type', label: 'Công nghệ màn hình' },
    //             { key: 'display.size', label: 'Kích thước màn hình' },
    //             { key: 'display.refresh_rate', label: 'Tần số quét' },
    //             { key: 'display.brightness', label: 'Độ sáng tối đa' },
    //         ],
    //         battery: [
    //             { key: 'battery.capacity', label: 'Dung lượng pin' },
    //             { key: 'battery.charging', label: 'Công nghệ sạc' },
    //         ],
    //     };

    //     const getNestedValue = (obj: any, path: string) => {
    //         return path.split('.').reduce((acc, part) => acc?.[part], obj);
    //     };

    //     const hasDifferences = (specKey: string): boolean => {
    //         if (products.length < 2) return false;
    //         const firstValue = getNestedValue(products[0].specs, specKey);
    //         return products.some(p => getNestedValue(p.specs, specKey) !== firstValue);
    //     };

    //     return (
    //         <>
    //             {Object.entries(specCategories).map(([category, specs]) => (
    //                 <div key={category} className="grid grid-cols-4 gap-4 border rounded-lg mb-4">
    //                     <div className="col-span-4">
    //                         <Accordion multiple activeIndex={[0]}>
    //                             <AccordionTab header={category.charAt(0).toUpperCase() + category.slice(1)}>
    //                                 <div className="grid grid-cols-4">
    //                                     <div className="p-4">
    //                                         <ul className="list-none p-0 m-0">
    //                                             {specs.map(({ key, label }) => (
    //                                                 (!showOnlyDifferences || hasDifferences(key)) && (
    //                                                     <li key={key} className="mb-6 pb-2 border-b border-gray-200">
    //                                                         {label}
    //                                                     </li>
    //                                                 )
    //                                             ))}
    //                                         </ul>
    //                                     </div>
    //                                     {products.map((product) => (
    //                                         <div key={product.id} className="flex flex-col gap-4 p-4">
    //                                             {specs.map(({ key }) => (
    //                                                 (!showOnlyDifferences || hasDifferences(key)) && (
    //                                                     <div key={key} className="mb-2 pb-2 border-b border-gray-200">
    //                                                         {getNestedValue(product.specs, key) || 'N/A'}
    //                                                     </div>
    //                                                 )
    //                                             ))}
    //                                         </div>
    //                                     ))}
    //                                     {products.length < 3 && (
    //                                         <div className="flex flex-col gap-4 p-4">
    //                                             {/* Empty column for potential third product */}
    //                                         </div>
    //                                     )}
    //                                 </div>
    //                             </AccordionTab>
    //                         </Accordion>
    //                     </div>
    //                 </div>
    //             ))}
    //         </>
    //     );
    // };

    const renderProductCards = () => {
        return (
            <>
                {/* Fixed container for minimized view */}
                <div 
                    className={`fixed border shadow-lg top-0  bg-white z-50 transition-all duration-300 transform ${
                        isScrolled ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'
                    }`}
                    style={{ height: '140px', maxWidth: '1200px', width: '100%', right: '50px' }}
                >
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-4 gap-4">
                            {/* Checkbox */}
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={showOnlyDifferences}
                                    onChange={(e) => setShowOnlyDifferences(e.target.checked)}
                                    className="w-4 h-4 mr-2 ml-10"
                                />
                                <label className="text-sm text-gray-600 ">Chỉ xem điểm khác biệt</label>
                            </div>
    
                            {/* Minimized Product Cards */}                            
                            {products.map((product) => (
                                <Link 
                                    key={product.id} 
                                    to={`/products/detail/${generateProductLink(product)}`}
                                >
                                    <div className="p-2 mt-2 border rounded-lg shadow">
                                        <div className="grid grid-cols-2 gap-2">
                                            {/* Column 1: Image */}
                                            <div className="flex items-center justify-center h-full">
                                                <div className="aspect-w-4 aspect-h-3 w-24 h-24">
                                                    <img 
                                                        src={getImageUrl(product)}
                                                        alt={product.name}
                                                        className="w-full h-39 object-contain mb-4"
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            console.error('Image load error:', {
                                                                product: product.name,
                                                                src: target.src
                                                            });
                                                            target.onerror = null; // Prevent infinite loop
                                                            target.src = '/fallback-image.jpg';
                                                        }}
                                                        loading="lazy"
                                                    />
                                                </div>
                                            </div>
                                            {/* Column 2: Content */}
                                            <div className="flex flex-col justify-center">
                                                <h3 className="text-sm font-semibold mb-1">
                                                    {formatDisplayName(product)}
                                                </h3>
                                                <div className="flex items-center space-x-1">
                                                    <span className="text-red-500 font-bold text-sm">
                                                        {formatPrice(product.discountPrice)} VND
                                                    </span>
                                                    <span className="px-1 py-0.5 bg-red-500 text-white text-sm rounded">
                                                        -{product.discount}%
                                                    </span>
                                                </div>
                                                {product.originalPrice && (
                                                    <span className="text-gray-500 line-through text-sm">
                                                        {formatPrice(product.originalPrice)} VND
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Link>                                    
                            ))}
                        </div>
                    </div>
                </div>
    
                {/* Main content */}
                <div id="row1" className="space-y-4">
                    {/* Title and Checkbox row */}
                    <div className={`grid grid-cols-4 gap-4 transition-opacity duration-300 ${isScrolled ? 'opacity-0' : 'opacity-100'}`}>
                        <div>
                            {/* Title */}
                            <h2 
                                className="text-xl font-bold mb-4"
                                dangerouslySetInnerHTML={{ 
                                    __html: getProductNames() 
                                }}
                            />
                            {/* Checkbox */}
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={showOnlyDifferences}
                                    onChange={(e) => setShowOnlyDifferences(e.target.checked)}
                                    className="w-4 h-4 mr-2"
                                />
                                <label className="text-sm text-gray-600">Chỉ xem điểm khác biệt</label>
                            </div>
                        </div>
    
                        {/* Product cards */}
                        {products.map((product) => (
                            <div key={product.id} className="p-4 border rounded-lg shadow">                                
                                <div className="relative">
                                    {products.length > 1 && (
                                        <Button 
                                            icon="pi pi-times" 
                                            className="absolute top-0 right-0 p-button-text bg-white border border-black p-button-danger z-10"
                                            onClick={() => removeProduct(product.id)}
                                        />
                                    )}
                                    <Link to={`/products/detail/${generateProductLink(product)}`}>
                                        <div className="flex items-center justify-center">
                                            <div className="aspect-w-4 aspect-h-3 w-48 h-48 mb-4">
                                                <img 
                                                    src={getImageUrl(product)}
                                                    alt={product.name}
                                                    className="w-full h-48 object-contain mb-4"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        console.error('Image load error:', {
                                                            product: product.name,
                                                            src: target.src
                                                        });
                                                        target.onerror = null; // Prevent infinite loop
                                                        target.src = '/fallback-image.jpg';
                                                    }}
                                                    loading="lazy"
                                                />
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-semibold text-center">
                                            {formatDisplayName(product)}
                                        </h3>
                                        <div className="flex flex-col items-center">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-red-500 font-bold">
                                                    {formatPrice(product.discountPrice)} VND
                                                </span>
                                                <span className="px-2 py-1 bg-red-500 text-white text-xs rounded">
                                                    -{product.discount}%
                                                </span>
                                            </div>
                                            {product.originalPrice && (
                                                <span className="text-gray-500 line-through text-sm">
                                                    {formatPrice(product.originalPrice)} VND
                                                </span>
                                            )}
                                        </div>
                                    </Link>                            
                                    <Rating value={product.rating} readOnly stars={5} cancel={false} className="justify-center mt-5" />
                                </div>
                            </div>
                        ))}
    
                        {/* Add product button */}
                        {products.length < 3 && (
                            <div className="p-4 border rounded-lg">
                                <Button 
                                    label="Thêm sản phẩm" 
                                    icon="pi pi-plus"
                                    iconPos="left"
                                    className="p-button-outlined w-full h-full flex justify-center items-center gap-1"
                                    onClick={() => {
                                        setActiveSlot(products.length);
                                        setShowDialog(true);
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </>
        );
    };

    const filteredProducts = Object.values(productDatabase).flat().filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const { addToCart, fetchCart } = useCart();

    const handleAddToCart = async (product: Product) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Lỗi',
                    detail: 'Vui lòng đăng nhập để thêm vào giỏ hàng'
                });
                return;
            }
    
            const formattedName = formatDisplayName(product);
            
            // Call API with formatted name
            const response = await axios.post(
                `${API_URL}/cart/add`,
                {
                    productId: product.id,
                    quantity: 1,
                    formattedName
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
    
            if (response.data.success) {
                // Refresh cart data after adding item
                await fetchCart();
                
                toast.current?.show({
                    severity: 'success',
                    summary: 'Thành công',
                    detail: 'Đã thêm sản phẩm vào giỏ hàng'
                });
            }
        } catch (error: any) {
            toast.current?.show({
                severity: 'error',
                summary: 'Lỗi',
                detail: error.response?.data?.message || 'Không thể thêm vào giỏ hàng'
            });
        }
    };

    const handleBuyNow = async (product: Product) => {
        try {
            await handleAddToCart(product);
            navigate('/cart');
        } catch (error) {
            // Error is already handled in handleAddToCart
        }
    };

    const hasDifferences = (specKey: keyof Product['specs']): boolean => {
        if (products.length < 2) return false;
        const firstValue = products[0].specs[specKey];
        return products.some(p => p.specs[specKey] !== firstValue);
    };

    const hasAnyDifferencesInGroup = (specs: string[]): boolean => {
        if (products.length < 2) return false;
        return specs.some(spec => hasDifferences(spec as keyof Product['specs']));
    };

    const getImageUrl = (product: Product): string => {
        // Debug logs
        console.log('GetImageUrl Input:', {
            id: product.id,
            name: product.name,
            images: product.images,
            trademark: product.trademark
        });
    
        if (!product.images || !product.images.length) {
            console.warn('No images found for:', product.name);
            return '/fallback-image.jpg';
        }
    
        const baseUrl = API_URL.replace('/api', '');
        let imagePath = product.images[0];
    
        // Clean up image path to avoid duplicate segments
        if (imagePath.startsWith('/images/')) {
            // Image path already includes the base path
            console.log('Using existing image path:', baseUrl + imagePath);
            return baseUrl + imagePath;
        }

        const trademark = product.trademark
    
        const formattedTrademark = trademark.toUpperCase();
        // Otherwise construct the full path
        // const formattedTrademark = product.trademark?.toUpperCase() || 'UNKNOWN';
        const formattedName = product.baseProductName?.replace(/\s+/g, '') || '';
        const fullPath = `/images/phone/${formattedTrademark}/${formattedName}/${imagePath}`;
        
        console.log('Constructed image path:', {
            baseUrl,
            formattedTrademark,
            formattedName,
            imagePath,
            fullPath
        });
    
        return baseUrl + fullPath;
    };

    const generateProductLink = (product: Product): string => {
        try {
          // Xử lý tên cơ bản trước
          const baseName = product.baseProductName
            .toLowerCase()
            .replace(/\s+/g, '-') // Thay thế khoảng trắng bằng dấu gạch ngang
            .replace(/[^a-z0-9-]/g, ''); // Loại bỏ ký tự đặc biệt
      
          // Kiểm tra xem có phải iPhone không
          const isIphone = baseName.includes('iphone');
      
          if (isIphone) {
            // Đối với iPhone: chỉ thêm dung lượng bộ nhớ
            const storage = product.variant?.storage?.toLowerCase()
              .replace(/\s+/g, '')
              .replace('gb', 'gb');
            return `${baseName}-${storage}`;
          } else {
            // Đối với các sản phẩm khác: thêm cả RAM và bộ nhớ
            const ram = product.variant?.ram?.toLowerCase()
              .replace(/\s+/g, '')
              .replace('gb', 'gb');
            const storage = product.variant?.storage?.toLowerCase()
              .replace(/\s+/g, '')
              .replace('gb', 'gb');
      
            // Thêm "5g" nếu tên sản phẩm có chứa "5g"
            const has5G = product.baseProductName.toLowerCase().includes('5g');
            const suffix = has5G ? '-5g' : '';
      
            return `${baseName}${suffix}-${ram}-${storage}`;
          }
        } catch (error) {
          console.error('Error generating product link:', error);
          return '#'; // Trả về # nếu có lỗi
        }
    };

    return (        
        <div className="p-4">
            <Toast ref={toast} />
            <div className="flex flex-col gap-8">
                {/* Row 1: Title and Product Cards */}
                {renderProductCards()}                
                {/* {renderSpecifications()} */}
                {/* Row 2: Configuration & Memory */}
                {(!showOnlyDifferences || hasAnyDifferencesInGroup(['os', 'cpu', 'gpu', 'ram', 'storage'])) && (
                    <div className="grid grid-cols-4 gap-4 border rounded-lg">
                        <div className="col-span-4">
                            <Accordion multiple activeIndex={activeIndexes}>
                                <AccordionTab header="Cấu hình & Bộ nhớ">
                                    <div className="grid grid-cols-4">
                                        <div className="p-4">
                                            <ul className="list-none p-0 m-0">
                                                {Object.entries(products[0]?.specs || {})
                                                    .filter(([key]) => ['os', 'cpu', 'gpu', 'ram', 'storage'].includes(key))
                                                    .map(([key, _], index) => (
                                                        (!showOnlyDifferences || hasDifferences(key as keyof Product['specs'])) && (
                                                            <li key={key} className="mb-6 pb-2 border-b border-gray-200">
                                                                {key === 'os' && 'Hệ điều hành'}
                                                                {key === 'cpu' && 'Chip xử lí (CPU)'}
                                                                {key === 'gpu' && 'Chip đồ họa (GPU)'}
                                                                {key === 'ram' && 'RAM'}
                                                                {key === 'storage' && 'Bộ nhớ'}
                                                            </li>
                                                        )
                                                ))}
                                            </ul>
                                        </div>
                                        {products.map((product) => (
                                            <div key={product.id} className="flex flex-col gap-4 p-4">
                                                {Object.entries(product.specs)
                                                    .filter(([key]) => ['os', 'cpu', 'gpu', 'ram', 'storage'].includes(key))
                                                    .map(([key, value]) => (
                                                        (!showOnlyDifferences || hasDifferences(key as keyof Product['specs'])) && (
                                                            <div key={key} className="mb-2 pb-2 border-b border-gray-200">
                                                                {value}
                                                            </div>
                                                        )
                                                ))}
                                            </div>
                                        ))}
                                        <div className="flex flex-col gap-4 p-4">
                                            {/* Empty column for potential third product */}
                                        </div>
                                    </div>
                                </AccordionTab>
                            </Accordion>
                        </div>
                    </div>
                )}
                

                {/* Row 3: Camera & Display */}
                {(!showOnlyDifferences || hasAnyDifferencesInGroup(['rearCamera', 'frontCamera', 'screenTech', 'screenSize', 'refreshRate', 'brightness'])) && (
                    <div className="grid grid-cols-4 gap-4 border rounded-lg">
                        <div className="col-span-4">
                            <Accordion multiple activeIndex={activeIndexes}>
                                <AccordionTab header="Camera & Màn hình">
                                    <div className="grid grid-cols-4">
                                        <div className="p-4">
                                            <ul className="list-none p-0 m-0">
                                                {Object.entries(products[0]?.specs || {})
                                                    .filter(([key]) => ['rearCamera', 'frontCamera', 'screenTech', 'screenSize', 'refreshRate', 'brightness'].includes(key))
                                                    .map(([key, _], index) => (
                                                        (!showOnlyDifferences || hasDifferences(key as keyof Product['specs'])) && (
                                                            <li key={key} className="mb-6 pb-2 border-b border-gray-200">
                                                                {key === 'rearCamera' && 'Độ phân giải camera sau'}
                                                                {key === 'frontCamera' && 'Độ phân giải camera trước'}
                                                                {key === 'screenTech' && 'Công nghệ màn hình'}
                                                                {key === 'screenSize' && 'Kích thước màn hình'}
                                                                {key === 'refreshRate' && 'Tần số quét màn hình'}
                                                                {key === 'brightness' && 'Độ sáng tối đa'}
                                                            </li>
                                                        )
                                                ))}
                                            </ul>
                                        </div>
                                        {products.map((product) => (
                                            <div key={product.id} className="flex flex-col gap-4 p-4">
                                                {Object.entries(product.specs)
                                                    .filter(([key]) => ['rearCamera', 'frontCamera', 'screenTech', 'screenSize', 'refreshRate', 'brightness'].includes(key))
                                                    .map(([key, value]) => (
                                                        (!showOnlyDifferences || hasDifferences(key as keyof Product['specs'])) && (
                                                            <div key={key} className="mb-2 pb-2 border-b border-gray-200">
                                                                {value}
                                                            </div>
                                                        )
                                                ))}
                                            </div>
                                        ))}
                                        <div className="flex flex-col gap-4 p-4">
                                            {/* Empty column for potential third product */}
                                        </div>
                                    </div>
                                </AccordionTab>
                            </Accordion>
                        </div>
                    </div>
                )}
                
                {/* Row 4: Battery & Charging */}
                {(!showOnlyDifferences || hasAnyDifferencesInGroup(['battery', 'charging'])) && (
                    <div className="grid grid-cols-4 gap-4 border rounded-lg">
                        <div className="col-span-4">
                            <Accordion multiple activeIndex={activeIndexes}>
                                <AccordionTab header="Pin & Sạc">
                                    <div className="grid grid-cols-4">
                                        <div className="p-4">
                                            <ul className="list-none p-0 m-0">
                                                {Object.entries(products[0]?.specs || {})
                                                    .filter(([key]) => ['battery', 'charging'].includes(key))
                                                    .map(([key, _], index) => (
                                                        (!showOnlyDifferences || hasDifferences(key as keyof Product['specs'])) && (
                                                            <li key={key} className="mb-6 pb-2 border-b border-gray-200">
                                                                {key === 'battery' && 'Dung lượng pin'}
                                                                {key === 'charging' && 'Hỗ trợ sạc tối đa'}
                                                            </li>
                                                        )
                                                ))}
                                            </ul>
                                        </div>
                                        {products.map((product) => (
                                            <div key={product.id} className="flex flex-col gap-4 p-4">
                                                {Object.entries(product.specs)
                                                    .filter(([key]) => ['battery', 'charging'].includes(key))
                                                    .map(([key, value]) => (
                                                        (!showOnlyDifferences || hasDifferences(key as keyof Product['specs'])) && (
                                                            <div key={key} className="mb-2 pb-2 border-b border-gray-200">
                                                                {value}
                                                            </div>
                                                        )
                                                ))}
                                            </div>
                                        ))}
                                        <div className="flex flex-col gap-4 p-4">
                                            {/* Empty column for potential third product */}
                                        </div>
                                    </div>
                                </AccordionTab>
                            </Accordion>
                        </div>
                    </div>
                )}
                

                {/* Row 5: Purchase Actions */}
                <div className="grid grid-cols-4 gap-4 border rounded-lg">
                    <div className="col-span-1">
                        <h3 className="text-lg font-semibold p-4">Thao tác</h3>
                    </div>
                    {products.map((product) => (
                        <div key={product.id} className="p-4 flex flex-col gap-2">
                            <Button 
                                label="Thêm vào giỏ hàng" 
                                className="p-button-info w-full border p-2"
                                onClick={() => handleAddToCart(product)}
                            />
                            <Button 
                                label="Mua ngay" 
                                className="p-button-success w-full border p-2"
                                onClick={() => handleBuyNow(product)}
                            />
                        </div>
                    ))}
                </div>

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
                                {filteredProducts.map((product, index) => (
                                    <div 
                                        key={`search-${product.id}-${index}`}
                                        className="p-2 border rounded-lg flex justify-between items-center mb-2 hover:bg-gray-50 cursor-pointer"
                                        onClick={() => addProduct(product)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16">
                                                <img 
                                                    src={getImageUrl(product)}
                                                    alt={product.name}
                                                    className="w-full h-16 object-contain"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        console.error('Search result image load error:', {
                                                            product: product.name,
                                                            src: target.src
                                                        });
                                                        target.onerror = null;
                                                        target.src = '/fallback-image.jpg';
                                                    }}
                                                    loading="lazy"
                                                />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">{formatDisplayName(product)}</h3>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-red-500 font-bold">
                                                        {formatPrice(product.discountPrice)} VND
                                                    </span>
                                                    {product.discount > 0 && (
                                                        <span key={`discount-${product.id}`} className="px-2 py-1 bg-red-500 text-white text-xs rounded">
                                                            -{product.discount}%
                                                        </span>
                                                    )}
                                                </div>
                                                {product.originalPrice > product.discountPrice && (
                                                    <span key={`original-${product.id}`} className="text-gray-500 line-through text-sm">
                                                        {formatPrice(product.originalPrice)} VND
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <Button 
                                            icon="pi pi-plus"
                                            className="p-button-rounded p-button-text"
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

        </div>
        </div>
    );
};

export default UserProductsCompare;