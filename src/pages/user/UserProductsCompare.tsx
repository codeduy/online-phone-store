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

interface Product {
    id: string;
    name: string;
    images: string[];
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

interface ProductData {
    [key: string]: Product;
}

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

    const productDatabase: ProductData = {
        'samsung-galaxy-s21': {
            id: '1',
            name: 'Samsung Galaxy S21',
            images: ['/src/assets/img/s21.png'],
            originalPrice: 20990000,
            discountPrice: 18990000,
            discount: 10,
            rating: 4.5,
            specs: {
                os: 'Android 11',
                cpu: 'Exynos 2100',
                gpu: 'Mali-G78 MP14',
                ram: '8GB',
                storage: '128GB',
                rearCamera: '12MP + 12MP + 64MP',
                frontCamera: '10MP',
                screenTech: 'Dynamic AMOLED 2X',
                screenSize: '6.2 inches',
                refreshRate: '120Hz',
                brightness: '1300 nits',
                battery: '4000mAh',
                charging: '25W'
            }
        },
        'samsung-galaxy-note-20': {
            id: '2',
            name: 'Samsung Galaxy Note 20',
            images: ['/images/products/note20.png'],
            originalPrice: 23990000,
            discountPrice: 19990000,
            discount: 17, 
            rating: 4.3,
            specs: {
                os: 'Android 10',
                cpu: 'Exynos 990',
                gpu: 'Mali-G77 MP11',
                ram: '8GB',
                storage: '256GB',
                rearCamera: '12MP + 64MP + 12MP',
                frontCamera: '10MP',
                screenTech: 'Super AMOLED Plus',
                screenSize: '6.7 inches',
                refreshRate: '60Hz',
                brightness: '1200 nits',
                battery: '4300mAh',
                charging: '25W'
            }
        },
        'samsung-galaxy-a52': {
            id: '3',
            name: 'Samsung Galaxy A52',
            images: ['/images/products/a52.png'],
            originalPrice: 9290000,
            discountPrice: 8290000,
            discount: 11,
            rating: 4.0,
            specs: {
                os: 'Android 11',
                cpu: 'Snapdragon 720G',
                gpu: 'Adreno 618',
                ram: '6GB',
                storage: '128GB',
                rearCamera: '64MP + 12MP + 5MP + 5MP',
                frontCamera: '32MP',
                screenTech: 'Super AMOLED',
                screenSize: '6.5 inches',
                refreshRate: '90Hz',
                brightness: '800 nits',
                battery: '4500mAh',
                charging: '25W'
            }
        },
        'samsung-galaxy-z-fold-3': {
            id: '4',
            name: 'Samsung Galaxy Z Fold 3',
            images: ['/images/products/zfold3.png'],
            originalPrice: 41990000,
            discountPrice: 34990000,
            discount: 17, 
            rating: 4.8,
            specs: {
                os: 'Android 11',
                cpu: 'Snapdragon 888',
                gpu: 'Adreno 660',
                ram: '12GB',
                storage: '256GB',
                rearCamera: '12MP + 12MP + 12MP',
                frontCamera: '4MP + 10MP',
                screenTech: 'Dynamic AMOLED 2X',
                screenSize: '7.6 inches',
                refreshRate: '120Hz',
                brightness: '1200 nits',
                battery: '4400mAh',
                charging: '25W'
            }
        }
    };

    useEffect(() => {
        if (comparisonUrl) {
            const productSlugs = comparisonUrl.split('-vs-');
            console.log('Product slugs:', productSlugs);
    
            const selectedProducts = productSlugs
                .map(slug => {
                    const product = productDatabase[slug];
                    console.log(`Found product for slug ${slug}:`, product);
                    return product;
                })
                .filter(Boolean);
    
            console.log('Selected products:', selectedProducts);
            setProducts(selectedProducts);
        }
    }, [comparisonUrl]);

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
                    ${products.map(p => formatProductName(p.name)).join('<br/><br/>&<br/><br/>')}
                </span>`;
    };

    const removeProduct = (productId: string) => {
        const updatedProducts = products.filter(p => p.id !== productId);
        setProducts(updatedProducts);
        
        // Update URL to reflect removed product
        const newUrl = updatedProducts
            .map(p => generateSlug(p.name))
            .join('-vs-');
            
        navigate(`/products/compare/${newUrl}`);
    };

    const addProduct = (product: Product) => {
        // Add product to products array
        const updatedProducts = [...products, product];
        setProducts(updatedProducts);
        
        // Update URL with new product
        const newUrl = updatedProducts
            .map(p => generateSlug(p.name))
            .join('-vs-');
        navigate(`/products/compare/${newUrl}`);
        
        // Close dialog
        setShowDialog(false);
    };

    const formatPrice = (price: number) => {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    const generateSlug = (name: string) => {
        return name.toLowerCase().replace(/ /g, '-');
    };

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
                                <Link to={`/product/${generateSlug(product.name)}`}>
                                    <div key={product.id} className="p-2 mt-2 border rounded-lg shadow">
                                        <div className="grid grid-cols-2 gap-2">
                                            {/* Column 1: Image */}
                                            <div className="flex items-center justify-center h-full">
                                            <div className="aspect-w-4 aspect-h-3 w-24 h-24">  {/* Reduced fixed size */}
                                                <img 
                                                    src={product.images[0]} 
                                                    alt={product.name}
                                                    className="w-full h-full object-contain rounded"
                                                />
                                            </div>
                                            </div>

                                            {/* Column 2: Content */}
                                            <div className="flex flex-col justify-center">
                                                <h3 className="text-sm font-semibold mb-1">
                                                    {product.name}
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
                                <Button 
                                    icon="pi pi-times" 
                                    className="absolute top-0 right-0 p-button-text bg-white border border-black p-button-danger z-10"
                                    onClick={() => removeProduct(product.id)}
                                />
                                    <Link to={`/product/${generateSlug(product.name)}`}>
                                        <div className="flex items-center justify-center">
                                            <div className="aspect-w-4 aspect-h-3 w-48 h-48 mb-4">
                                                <img 
                                                    src={product.images[0]} 
                                                    alt={product.name}
                                                    className="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
                                                />
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-semibold text-center">
                                            {product.name}
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

    const { addToCart } = useCart();
      
    const handleAddToCart = (product: Product) => {
        const formattedName = productDatabase.ramOptions 
            // ? `Điện thoại ${productDatabase.name} ${productDatabase.ramOptions[selectedMemory]}/${selectedMemory}`
            // : `Điện thoại ${productDatabase.name} ${selectedMemory}`;
        
        const cartItem = {
            // id: Date.now(),
            // name: formattedName,
            // price: productDatabase.prices[selectedMemory],
            // quantity: 1,
            // memory: selectedMemory,
            // ram: productDatabase.ramOptions ? product.ramOptions[selectedMemory] : undefined
        };
        addToCart(cartItem);
    };

    const handleBuyNow = (product: Product) => {
        handleAddToCart(product);
        navigate('/cart');
    };

    const hasDifferences = (specKey: keyof Product['specs']): boolean => {
        if (products.length < 2) return false;
        const firstValue = products[0].specs[specKey];
        return products.some(p => p.specs[specKey] !== firstValue);
    };

    return (        
        <div className="p-4">
            <Toast ref={toast} />
            <div className="flex flex-col gap-8">
                {/* Row 1: Title and Product Cards */}
                {renderProductCards()}                

                {/* Row 2: Configuration & Memory */}
                <div className="grid grid-cols-4 gap-4 border rounded-lg">
                    <div className="col-span-4">
                        <Accordion multiple activeIndex={activeIndexes}>
                            <AccordionTab header="Cấu hình & Bộ nhớ">
                                <div className="grid grid-cols-4">
                                    <div className="p-4">
                                        <ul className="list-none p-0 m-0">
                                            {Object.entries(products[0]?.specs || {})
                                                .filter(([key]) => ['os', 'cpu', 'gpu', 'ram', 'storage'].includes(key))
                                                .map(([key, _]) => (
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

                {/* Row 3: Camera & Display */}
                <div className="grid grid-cols-4 gap-4 border rounded-lg">
                    <div className="col-span-4">
                        <Accordion multiple activeIndex={activeIndexes}>
                            <AccordionTab header="Camera & Màn hình">
                                <div className="grid grid-cols-4">
                                    <div className="p-4">
                                        <ul className="list-none p-0 m-0">
                                            {Object.entries(products[0]?.specs || {})
                                                .filter(([key]) => ['rearCamera', 'frontCamera', 'screenTech', 'screenSize', 'refreshRate', 'brightness'].includes(key))
                                                .map(([key, _]) => (
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

                {/* Row 4: Battery & Charging */}
                <div className="grid grid-cols-4 gap-4 border rounded-lg">
                    <div className="col-span-4">
                        <Accordion multiple activeIndex={activeIndexes}>
                            <AccordionTab header="Pin & Sạc">
                                <div className="grid grid-cols-4">
                                    <div className="p-4">
                                        <ul className="list-none p-0 m-0">
                                            {Object.entries(products[0]?.specs || {})
                                                .filter(([key]) => ['battery', 'charging'].includes(key))
                                                .map(([key, _]) => (
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

                {/* Row 5: Purchase Actions */}
                <div className="grid grid-cols-4 gap-4 border rounded-lg">
                    <div className="col-span-1">
                        <h3 className="text-lg font-semibold p-4"></h3>
                    </div>
                    {products.map((product) => (
                        <div key={product.id} className="p-4 flex flex-col gap-2">
                            <Button 
                                label="Thêm vào giỏ hàng" 
                                // icon="pi pi-shopping-cart"
                                className="p-button-info w-full border p-2"
                                onClick={() => handleAddToCart(product)}
                            />
                            <Button 
                                label="Mua ngay" 
                                // icon="pi pi-credit-card"
                                className="p-button-success w-full border p-2"
                                onClick={() => handleBuyNow(product)}
                            />
                        </div>
                    ))}
                    <div className="p-4">
                        {/* Empty column for potential third product */}
                    </div>
                </div>

                <Dialog header="Thêm sản phẩm để so sánh" visible={showDialog} style={{ width: '50vw' }} onHide={() => setShowDialog(false)}>
                    <div className="p-inputgroup">
                      <InputText placeholder="Tìm kiếm sản phẩm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                      <Button icon="pi pi-search" />
                    </div>
                    <div className="mt-4">
                      {filteredProducts.map(product => (
                        <div key={product.id} className="p-2 border rounded-lg flex justify-between items-center mb-2">
                          <div className="flex items-center">
                            <img src={product.images[0]} alt={product.name} className="w-10 h-10 object-cover mr-2" />
                            <h3 className="text-sm font-bold">{product.name}</h3>
                          </div>
                          <Button
                                label={products.some(p => p.id === product.id) ? "Đã thêm" : "Thêm"}
                                className="p-button-success"
                                onClick={() => addProduct(product)}
                                disabled={products.some(p => p.id === product.id)}
                            />
                        </div>
                      ))}
                    </div>
                </Dialog>

        </div>
        </div>
    );
};

export default UserProductsCompare;