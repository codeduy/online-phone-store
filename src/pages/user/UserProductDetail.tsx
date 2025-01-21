import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Galleria } from 'primereact/galleria';
import { Button } from 'primereact/button';
import { Rating } from 'primereact/rating';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { FileUpload } from 'primereact/fileupload';
import { InputText } from 'primereact/inputtext';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { TabMenu } from 'primereact/tabmenu';
import { Dropdown } from 'primereact/dropdown';
import { useCart } from './CartContext';
import { useNavigate } from 'react-router-dom';
import { Toast } from 'primereact/toast';

const UserProductDetail = () => {
    const { slug } = useParams();
    const [visible, setVisible] = useState(false);
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [uploadError, setUploadError] = useState('');
    const [showUploadError, setShowUploadError] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [showAddressDialog, setShowAddressDialog] = useState(false);
    const [activeTab, setActiveTab] = useState(0);    
    const [selectedStorage, setSelectedStorage] = useState<string>('');
    const [selectedProvince, setSelectedProvince] = useState<LocationOption | null>(null);
    const [selectedDistrict, setSelectedDistrict] = useState<LocationOption | null>(null);
    const [selectedWard, setSelectedWard] = useState<LocationOption | null>(null);
    const [streetAddress, setStreetAddress] = useState('');
    const [shippingAddress, setShippingAddress] = useState('');
    const navigate = useNavigate();
    const toast = useRef<Toast>(null);
    const [comparisonProducts, setComparisonProducts] = useState<Array<{ id: string; name: string; price: string; originalPrice?: string; image: string; discount?: string }>>([]);
    const [showComparisonBar, setShowComparisonBar] = useState(false);
    const [isComparisonBarMinimized, setIsComparisonBarMinimized] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const getColorStyle = (color: string) => {
        switch (color.toLowerCase()) {
        case 'đen':
            return 'bg-black text-white border';
        case 'trắng':
            return 'bg-white text-black border';
        case 'xanh':
            return 'bg-blue-500 text-black border';
        default:
            return `bg-${color.toLowerCase()}-500 text-black border`;
        }
    };

    const getFormattedProductName = () => {
        if (product.ramOptions) {
            // Product has different RAM options
            return `Điện thoại ${product.name} ${product.ramOptions[selectedMemory]}/${selectedMemory}`;
        } else {
            // Product has only storage options
            return `Điện thoại ${product.name} ${selectedMemory}`;
        }
    };

    const generateSlug = (name: string) => {
        return name.toLowerCase().replace(/ /g, '-');
      };

    const addToComparison = (product: { id: string; name: string; price: string; image: string }) => {
    if (comparisonProducts.length >= 3) {
        toast.current?.show({ severity: 'warn', summary: 'Cảnh báo', detail: 'Chỉ được so sánh tối đa 3 sản phẩm', life: 3000 });
        return;
    }
    if (!comparisonProducts.some(p => p.id === product.id)) {
        setComparisonProducts([...comparisonProducts, product]);
        setShowComparisonBar(true);
    }
    };

    const removeFromComparison = (productId: string) => {
        setComparisonProducts(comparisonProducts.filter(product => product.id !== productId));
    };

    const clearComparison = () => {
        setComparisonProducts([]);
        setShowComparisonBar(false);
        setIsComparisonBarMinimized(false);
    };

    const openDialog = () => {
        setShowDialog(true);
      };

    const closeDialog = () => {
        setShowDialog(false);
        setSearchTerm('');
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const productsList = [
        { id: 'iphone-13', name: 'iPhone 13', price: '$999', discount: '20%', image: 'path_to_iphone_image' },
        { id: 'samsung-galaxy-s21', name: 'Samsung Galaxy S21', price: '$899', discount: '17%', image: 'path_to_samsung_image' },
    ];

    const [sortOption, setSortOption] = useState<string | null>(null);

    const sortedProducts = [...productsList].sort((a, b) => {
        if (sortOption === 'priceAsc') {
          return parseFloat(a.price.replace('$', '')) - parseFloat(b.price.replace('$', ''));
        } else if (sortOption === 'priceDesc') {
          return parseFloat(b.price.replace('$', '')) - parseFloat(a.price.replace('$', ''));
        } else if (sortOption === 'discountDesc') {
          const discountA = a.discount ? parseFloat(a.discount.replace('%', '')) : 0;
          const discountB = b.discount ? parseFloat(b.discount.replace('%', '')) : 0;
          return discountB - discountA;
        }
        return 0;
    });

    const filteredProducts = sortedProducts.filter(product => product.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleCompareNow = () => {
        if (comparisonProducts.length < 2) {
            toast.current?.show({ severity: 'warn', summary: 'Cảnh báo', detail: 'Cần ít nhất 2 sản phẩm để so sánh', life: 3000 });
            return;
    }
    const comparisonUrl = comparisonProducts.map(product => generateSlug(product.name)).join('-vs-');
        navigate(`/compare/${comparisonUrl}`);
    };

    const handleMinimizeComparisonBar = () => {
        setIsComparisonBarMinimized(true);
        setShowComparisonBar(false);
    };
    
    const handleShowComparisonBar = () => {
        setIsComparisonBarMinimized(false);
        setShowComparisonBar(true);
    };

    interface LocationOption {
        label: string;
        value: string;
    }
    
    // Mock provinces data
    const provinces = [
        { label: 'Hồ Chí Minh', value: 'hcm' },
        { label: 'Hà Nội', value: 'hn' },
        { label: 'Đà Nẵng', value: 'dn' }
    ];
    
    // Mock districts data
    const districts = [
        { label: 'Quận 1', value: 'q1' },
        { label: 'Quận 2', value: 'q2' },
        { label: 'Quận 3', value: 'q3' }
    ];

    // Mock wards data
    const wards = [
        { label: 'Phường 1', value: 'p1' },
        { label: 'Phường 2', value: 'p2' },
        { label: 'Phường 3', value: 'p3' }
    ];
    
    
    const addressTabs = [
        { label: 'Tỉnh/TP', icon: 'pi pi-map-marker' },
        { label: 'Quận/Huyện', icon: 'pi pi-map' },
        { label: 'Phường/Xã', icon: 'pi pi-home' }
    ];

    useEffect(() => {
        if (selectedProvince) {
            setActiveTab(1); // Move to district tab
        }
    }, [selectedProvince]);

    useEffect(() => {
        if (selectedDistrict) {
            setActiveTab(2); // Move to ward tab
        }
    }, [selectedDistrict]);

    

    // const handleImageUpload = (event) => {
    //     if (event.files.length > 3) {
    //         // Show error
    //         setUploadError('Chỉ được upload tối đa 3 ảnh');
    //         setShowUploadError(true);
            
    //         // Clear all files
    //         event.options.clear();
            
    //         // Hide error after 3 seconds
    //         setTimeout(() => {
    //             setShowUploadError(false);
    //             setUploadError('');
    //         }, 3000);
    //     }
    // };

    const handleBuyNow = () => {
        handleAddToCart();
        navigate('/cart');
    };

    const { addToCart } = useCart();
  
    const handleAddToCart = () => {
        const formattedName = product.ramOptions 
            ? `Điện thoại ${product.name} ${product.ramOptions[selectedMemory]}/${selectedMemory}`
            : `Điện thoại ${product.name} ${selectedMemory}`;
      
        const cartItem = {
            id: Date.now(),
            name: formattedName,
            price: product.prices[selectedMemory],
            quantity: 1,
            memory: selectedMemory,
            ram: product.ramOptions ? product.ramOptions[selectedMemory] : undefined
        };
        addToCart(cartItem);
    };

    const handleConfirmAddress = () => {
        // Check if all address components are selected
        if (!selectedProvince || !selectedDistrict || !selectedWard || !streetAddress) {
            return;
        }
    
        // Format new address only if all components are valid
        const newAddress = `Giao đến: ${streetAddress}, ${selectedWard}, ${selectedDistrict}, ${selectedProvince}`;
        setShippingAddress(newAddress);
        setShowAddressDialog(false);
        
        // Reset form
        setStreetAddress('');
        setSelectedWard(null);
        setSelectedDistrict(null);
        setSelectedProvince(null);
        setActiveTab(0);
    };

    // Utility function to format the product name from slug
    const formatProductName = (slug: string | undefined) => {
        return (slug || '')
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };

  const productName = formatProductName(slug);

  // Mock product data based on slug
  const products = {
    'iphone-13': {
        name: 'iPhone 13',
        images: [
            { itemImageSrc: 'https://via.placeholder.com/600x400?text=Main+Image', thumbnailImageSrc: 'https://via.placeholder.com/150x100?text=Main+Image', alt: 'Main Image' },
            { itemImageSrc: 'https://via.placeholder.com/600x400?text=Sub+Image+1', thumbnailImageSrc: 'https://via.placeholder.com/150x100?text=Sub+Image+1', alt: 'Sub Image 1' },
            { itemImageSrc: 'https://via.placeholder.com/600x400?text=Sub+Image+2', thumbnailImageSrc: 'https://via.placeholder.com/150x100?text=Sub+Image+2', alt: 'Sub Image 2' },
            // Add more images here
        ],
        specs: {
            os: 'iOS',
            cpu: 'A15 Bionic',
            gpu: 'Apple GPU',
            ram: '4GB',
            storage: '128GB',
            rearCamera: '12MP',
            frontCamera: '12MP',
            screenTech: 'OLED',
            screenSize: '6.1 inches',
            refreshRate: '60Hz',
            brightness: '800 nits',
            battery: '3240mAh',
            charging: '20W',
        },
        rating: 4.5,
        reviews: [
            { name: 'Nguyễn Văn A', comment: 'Sản phẩm rất tốt!', rating: 5 },
            { name: 'Trần Thị B', comment: 'Giá cả hợp lý.', rating: 4 },
            // Add more reviews here
        ],
        memoryOptions: ['128GB', '256GB'],
        ramOptions: null,
        colorOptions: ['Đen', 'Trắng', 'Xanh'],
        prices: {
            '128GB': 20000000,
            '256GB': 25000000
    },
        originalPrice: 25000000,
        discount: 20,
        shippingInfo: 'Giao đến: xx, phường xxx, quận 123 ....',
    },
    'samsung-galaxy-s21': {
        name: 'Samsung Galaxy S21',
        images: [
            { itemImageSrc: 'https://via.placeholder.com/600x400?text=Main+Image', thumbnailImageSrc: 'https://via.placeholder.com/150x100?text=Main+Image', alt: 'Main Image' },
            { itemImageSrc: 'https://via.placeholder.com/600x400?text=Sub+Image+1', thumbnailImageSrc: 'https://via.placeholder.com/150x100?text=Sub+Image+1', alt: 'Sub Image 1' },
            { itemImageSrc: 'https://via.placeholder.com/600x400?text=Sub+Image+2', thumbnailImageSrc: 'https://via.placeholder.com/150x100?text=Sub+Image+2', alt: 'Sub Image 2' },
            // Add more images here
        ],
        specs: {
            os: 'Android',
            cpu: 'Exynos 2100',
            gpu: 'Mali-G78 MP14',
            ram: '8GB',
            storage: '128GB',
            rearCamera: '64MP',
            frontCamera: '10MP',
            screenTech: 'Dynamic AMOLED 2X',
            screenSize: '6.2 inches',
            refreshRate: '120Hz',
            brightness: '1300 nits',
            battery: '4000mAh',
            charging: '25W',
        },
        rating: 4.7,
        reviews: [
            { name: 'Nguyễn Văn C', comment: 'Thiết kế đẹp!', rating: 5 },
            { name: 'Trần Thị D', comment: 'Hiệu năng mạnh mẽ.', rating: 4 },
            // Add more reviews here
        ],
        memoryOptions: ['128GB', '256GB'],
        ramOptions: {
            '128GB': '8GB',
            '256GB': '12GB'
        },
        colorOptions: ['Đen', 'Trắng', 'Xanh'],
        prices: {
            '128GB': 25000000,
            '256GB': 30000000
        },
        originalPrice: 30000000,
        discount: 17,
        shippingInfo: 'Giao đến: xx, phường xxx, quận 123 ....',
    },
    // Add more products here
  };

    interface ProductSpecs {
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
    }

    interface Product {
        name: string;
        images: Array<{ itemImageSrc: string; thumbnailImageSrc: string; alt: string; }>;
        specs: ProductSpecs;
        rating: number;
        reviews: Array<{ name: string; comment: string; rating: number; }>;
        memoryOptions: string[];
        ramOptions: Record<string, string> | null;
        colorOptions: string[];
        prices: Record<string, number>;
        originalPrice: number;
        discount: number;
        shippingInfo: string;
    }

    const product: Product = (slug && products[slug as keyof typeof products]) || {
        name: productName,
        images: [],
        specs: {} as ProductSpecs,
        rating: 0,
        reviews: [],
        memoryOptions: [],
        ramOptions: null,
        colorOptions: [],
        prices: {},
        originalPrice: 0,
        discount: 0,
        shippingInfo: '',
    };

    const [selectedMemory, setSelectedMemory] = useState<string>(product.memoryOptions[0]);
    const [currentSpecs, setCurrentSpecs] = useState<ProductSpecs>(product.specs);
    const [currentPrice, setCurrentPrice] = useState<number>(product.prices[selectedMemory]);
    const [originalPrice, setOriginalPrice] = useState<number>(product.originalPrice);

    const handleMemorySelect = (option: string) => {
        setSelectedMemory(option);
        
        // Update specs
        const newSpecs = { ...currentSpecs };
        if (product.ramOptions) {
            newSpecs.ram = product.ramOptions[option];
        }
        newSpecs.storage = option;
        setCurrentSpecs(newSpecs);
        
        // Update prices
        setCurrentPrice(product.prices[option]);
        setOriginalPrice(product.originalPrice);
    };

    const fileUploadRef = useRef<FileUpload>(null);
    const handleSubmitReview = () => {
        if (files.length > 3) {
            setUploadError('Chỉ được upload tối đa 3 ảnh');
            setShowUploadError(true);
            if (fileUploadRef.current) {
                fileUploadRef.current.clear(); // Clear all files
            }
            return;
        }
        // Submit review logic
        setVisible(false);
    };

    interface FileUploadEvent {
        files: File[];
    }

    const handleFileSelect = (e: FileUploadEvent) => {
        setFiles(e.files);
    };

    interface GalleriaItem {
        itemImageSrc: string;
        alt: string;
    }

    const itemTemplate = (item: GalleriaItem) => {
        return <img src={item.itemImageSrc} alt={item.alt} style={{ width: '100%' }} />;
    };

    interface GalleriaThumbnailItem {
        thumbnailImageSrc: string;
        alt: string;
    }

    const thumbnailTemplate = (item: GalleriaThumbnailItem) => {
        return <img src={item.thumbnailImageSrc} alt={item.alt} style={{ width: '100%' }} />;
    };

    // Calculate average rating
    const averageRating = product.reviews.length
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
        : 0;

    // Calculate rating percentages
    const totalReviews = product.reviews.length;
    const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
        star,
        count: product.reviews.filter(review => review.rating === star).length,
        percentage: totalReviews ? (product.reviews.filter(review => review.rating === star).length / totalReviews) * 100 : 0,
    }));

    return (
        <div className="p-4">
            <Toast ref={toast} />
            {/* Row 1 */}
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                <h1 className="text-2xl font-bold">{getFormattedProductName()}</h1>
                <Button 
                    label="So sánh" 
                    icon="pi pi-exchange" 
                    className="p-button-info ml-4 border p-1 bg-white" 
                    onClick={() => addToComparison({
                    id: slug || '',
                    name: product.name,
                    price: currentPrice.toString(),
                    image: product.images[0]?.itemImageSrc || ''
                    })} 
                />
                </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-3 gap-4">
                {/* Column 1 */}
                <div className="col-span-2">
                <Galleria 
                    value={product.images} 
                    responsiveOptions={[{ breakpoint: '1024px', numVisible: 5 }]} 
                    numVisible={5} 
                    circular 
                    fullScreen 
                    showItemNavigators 
                    showThumbnails 
                    item={itemTemplate} 
                    thumbnail={thumbnailTemplate} 
                />
                <div className="mt-4">
                    <h2 className="text-xl font-bold mb-2">Thông số kỹ thuật</h2>
                    <Accordion multiple>
                    <AccordionTab header="Cấu hình & Bộ nhớ">
                        <ul>
                        <li className="mb-1 flex">
                            <strong className="w-1/3">Hệ điều hành:</strong>
                            <span className="ml-4">{slug === 'iphone-13' || slug === 'samsung-galaxy-s21' ? product.specs.os : ''}</span>
                        </li>
                        <li className="mb-1 flex">
                            <strong className="w-1/3">Chip xử lí (CPU):</strong>
                            <span className="ml-4">{slug === 'iphone-13' || slug === 'samsung-galaxy-s21' ? product.specs.cpu : ''}</span>
                        </li>
                        <li className="mb-1 flex">
                            <strong className="w-1/3">Chip đồ họa (GPU):</strong>
                            <span className="ml-4">{slug === 'iphone-13' || slug === 'samsung-galaxy-s21' ? product.specs.gpu : ''}</span>
                        </li>
                        <li className="mb-1 flex">
                                <strong className="w-1/3">RAM:</strong>
                                <span className="ml-4">{currentSpecs.ram}</span>
                            </li>
                            <li className="mb-1 flex">
                                <strong className="w-1/3">Bộ nhớ:</strong>
                                <span className="ml-4">{currentSpecs.storage}</span>
                            </li>
                        </ul>
                    </AccordionTab>
                    <AccordionTab header="Camera & Màn hình">
                        <ul>
                        <li className="mb-1 flex">
                            <strong className="w-1/3">Độ phân giải camera sau:</strong>
                            <span className="ml-4">{slug === 'iphone-13' || slug === 'samsung-galaxy-s21' ? product.specs.rearCamera : ''}</span>
                        </li>
                        <li className="mb-1 flex">
                            <strong className="w-1/3">Độ phân giải camera trước:</strong>
                            <span className="ml-4">{slug === 'iphone-13' || slug === 'samsung-galaxy-s21' ? product.specs.frontCamera : ''}</span>
                        </li>
                        <li className="mb-1 flex">
                            <strong className="w-1/3">Công nghệ màn hình:</strong>
                            <span className="ml-4">{slug === 'iphone-13' || slug === 'samsung-galaxy-s21' ? product.specs.screenTech : ''}</span>
                        </li>
                        <li className="mb-1 flex">
                            <strong className="w-1/3">Kích thước màn hình:</strong>
                            <span className="ml-4">{slug === 'iphone-13' || slug === 'samsung-galaxy-s21' ? product.specs.screenSize : ''}</span>
                        </li>
                        <li className="mb-1 flex">
                            <strong className="w-1/3">Tần số quét màn hình:</strong>
                            <span className="ml-4">{slug === 'iphone-13' || slug === 'samsung-galaxy-s21' ? product.specs.refreshRate : ''}</span>
                        </li>
                        <li className="mb-1 flex">
                            <strong className="w-1/3">Độ sáng tối đa:</strong>
                            <span className="ml-4">{slug === 'iphone-13' || slug === 'samsung-galaxy-s21' ? product.specs.brightness : ''}</span>
                        </li>
                        </ul>
                    </AccordionTab>
                    <AccordionTab header="Pin & Sạc">
                        <ul>
                        <li className="mb-1 flex">
                            <strong className="w-1/3">Dung lượng pin:</strong>
                            <span className="ml-4">{slug === 'iphone-13' || slug === 'samsung-galaxy-s21' ? product.specs.battery : ''}</span>
                        </li>
                        <li className="mb-1 flex">
                            <strong className="w-1/3">Hỗ trợ sạc tối đa:</strong>
                            <span className="ml-4">{slug === 'iphone-13' || slug === 'samsung-galaxy-s21' ? product.specs.charging : ''}</span>
                        </li>
                        </ul>
                    </AccordionTab>
                    </Accordion>
                </div>
                <div className="mt-4 bg-white p-4 border rounded-lg">
                    <h2 className="text-xl font-bold mb-2">Đánh giá</h2>
                    <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-200">
                        <div className="flex flex-col items-center">
                            <Rating value={averageRating} readOnly stars={5} cancel={false} />
                            <span className="mt-2">{averageRating.toFixed(1)}/5</span>
                            <span className="mt-2">{totalReviews} người dùng đã đánh giá</span>
                        </div>
                        <div>
                            {ratingCounts.map(({ star, percentage }) => (
                                <div key={star} className="flex items-center mb-1">
                                    <Rating value={star} readOnly stars={5} cancel={false} className="mr-2" />
                                    <span>{percentage.toFixed(1)}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="mt-4">
                        {product.reviews.slice(0, 2).map((review, index) => (
                            <div key={index} className="mb-4 pb-4 border-b border-gray-200">
                                <strong>{review.name}</strong>
                                <Rating value={review.rating} readOnly stars={5} cancel={false} className="ml-2" />
                                <p>{review.comment}</p>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2 mt-4">
                        <Button label="Xem tất cả đánh giá" className="p-button-secondary bg-gray-200 border p-2" onClick={() => navigate(`/product/${slug}/review`)}/>
                        <Button label="Viết đánh giá" className="p-button-primary bg-gray-200 border p-2" onClick={() => setVisible(true)} />
                    </div>
                </div>
                </div>

                {/* Column 2 */}
                <div className="col-span-1 border bg-white p-4 rounded-lg">
                <div className="mb-4">
                    <h2 className="text-xl font-bold mb-2">Tùy chọn phiên bản</h2>
                    <div className="flex gap-2">
                        {product.memoryOptions.map((option) => (
                            <Button 
                                key={option}
                                label={product.ramOptions 
                                    ? `${product.ramOptions[option]}-${option}`
                                    : option
                                }
                                className={`p-button-outlined w-full bg-white border p-2 ${selectedMemory === option ? 'p-button-primary' : ''}`}
                                onClick={() => handleMemorySelect(option)}
                            />
                        ))}
                    </div>
                </div>
                <div className="mb-4">
                <h2 className="text-xl font-bold mb-2">Tùy chọn màu sắc</h2>
                    <div className="flex gap-2">
                    {product.colorOptions.map((color, index) => (
                        <Button 
                        key={index} 
                        label={color} 
                        className={`p-button-outlined w-full p-2 ${getColorStyle(color)}`}
                        />
                    ))}
                    </div>
                </div>
                <div className="mb-4">
                    <h2 className="text-xl font-bold mb-2">Giá sản phẩm</h2>
                    <div className="flex gap-2 items-center">
                        <div className="text-red-500 font-bold text-2xl">
                            {currentPrice.toLocaleString()} VND
                        </div>
                        <div className="text-gray-500 line-through">
                            {originalPrice.toLocaleString()} VND
                        </div>
                        <div className="text-green-500">
                            {Math.round(((originalPrice - currentPrice) / originalPrice) * 100)}% OFF
                        </div>
                    </div>
                </div>
                <div className="mb-4 border p-2 bg-gray-100 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-xl font-bold">Thông tin vận chuyển</h2>
                        <Button 
                            label="Thay đổi" 
                            className="p-button-text" 
                            onClick={() => setShowAddressDialog(true)}
                        />
                    </div>
                    <p>{shippingAddress || product.shippingInfo}</p>
                </div>
                <div className="flex gap-2">
                    <Button label="Thêm vào giỏ hàng" className="p-button-secondary w-full border p-2" onClick={handleAddToCart} />
                    <Button label="Mua ngay" className="p-button-primary w-full border p-2" onClick={handleBuyNow} />
                </div>
                </div>
            </div>

            {/* Review Dialog */}
            <Dialog header="Viết đánh giá" visible={visible} style={{ width: '50vw' }} onHide={() => setVisible(false)}>
                <div className="flex flex-col gap-4">
                    <Rating value={rating} onChange={(e) => setRating(e.value ?? 0)} stars={5} cancel={false} className='justify-center'/>
                    <InputTextarea 
                        value={review} 
                        onChange={(e) => setReview(e.target.value)} 
                        rows={5} 
                        placeholder="Chia sẻ cảm nhận của bạn..." 
                        className='border'
                    />
                    
                    {showUploadError && (
                        <div className="p-3 bg-red-100 text-red-700 rounded">
                            {uploadError}
                        </div>
                    )}
                    
                    <label className="font-bold mb-2">Gửi ảnh thực tế (Tối đa 3 ảnh)</label>
                    <FileUpload
                        ref={fileUploadRef}
                        mode="advanced"
                        name="demo[]" 
                        url="./upload"
                        accept="image/*"
                        maxFileSize={1000000}
                        multiple
                        auto={false}
                        customUpload
                        chooseLabel="Chọn ảnh"
                        cancelLabel="Hủy"
                        onSelect={handleFileSelect}
                        uploadHandler={handleSubmitReview}
                        uploadOptions={{ style: { display: 'none' } }}
                    />
                    <InputText value={name} onChange={(e) => setName(e.target.value)} placeholder="Họ và tên" required className='border p-2'/>
                    <InputText 
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value.replace(/\D/, ''))} 
                        placeholder="Số điện thoại" 
                        required 
                        type="tel" 
                        pattern="[0-9]*" 
                        inputMode="numeric"
                        className='border p-2'
                    />
                    <Button label="Gửi đánh giá" className="p-button-primary border p-2" onClick={handleSubmitReview} disabled={!name || !phone || !rating} />
                </div>
            </Dialog>

            {/* Address Dialog */}
            <Dialog 
                header="Chọn địa chỉ nhận hàng" 
                visible={showAddressDialog} 
                style={{ width: '50vw' }} 
                onHide={() => setShowAddressDialog(false)}
                >
                <div className="flex flex-col gap-4">
                    <TabMenu 
                        model={addressTabs} 
                        activeIndex={activeTab} 
                        onTabChange={(e) => setActiveTab(e.index)} 
                        className=''
                    />
                    
                    {activeTab === 0 && (
                        <Dropdown 
                            value={selectedProvince}
                            options={provinces}
                            onChange={(e) => {
                                setSelectedProvince(e.value);
                                setSelectedDistrict(null); // Reset district when province changes
                                setSelectedWard(null); // Reset ward when province changes
                            }}
                            placeholder="Chọn Tỉnh/Thành phố"
                            className="w-full border"
                        />
                    )}
                    
                    {activeTab === 1 && (
                        <Dropdown 
                            value={selectedDistrict}
                            options={districts}
                            onChange={(e) => {
                                setSelectedDistrict(e.value);
                                setSelectedWard(null); // Reset ward when district changes
                            }}
                            placeholder="Chọn Quận/Huyện"
                            className="w-ful border"
                            disabled={!selectedProvince}
                        />
                    )}
                    
                    {activeTab === 2 && (
                        <Dropdown 
                            value={selectedWard}
                            options={wards} // Add your wards data
                            onChange={(e) => setSelectedWard(e.value)}
                            placeholder="Chọn Phường/Xã"
                            className="w-full border"
                            disabled={!selectedDistrict}
                        />
                    )}
                    
                    {selectedWard && (
                        <InputText 
                            value={streetAddress}
                            onChange={(e) => setStreetAddress(e.target.value)}
                            placeholder="Số nhà, tên đường"
                            className="w-full border p-2"
                        />
                    )}
                    
                    <Button 
                        label="Xác nhận địa chỉ" 
                        className="p-button-primary border p-2" 
                        onClick={handleConfirmAddress}
                        disabled={!selectedWard || !streetAddress}
                    />
                </div>
            </Dialog>

            {showComparisonBar && (
                <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg p-4 flex justify-center items-center">
                <div className="flex justify-center items-center space-x-4 ml-auto">
                    {comparisonProducts.map(product => (
                    <div key={product.id} className="p-2 border rounded-lg flex flex-col items-center">
                        <img src={product.image} alt={product.name} className="w-20 h-20 object-cover mb-2" />
                        <h3 className="text-sm font-bold">{product.name}</h3>
                        <Button label="X" className="p-button-danger mt-2" onClick={() => removeFromComparison(product.id)} />
                    </div>
                    ))}
                    {comparisonProducts.length < 3 && (
                    <Button label="Thêm sản phẩm" icon="pi pi-plus" className="p-button-success" onClick={openDialog} />
                    )}
                    <div className="p-2 flex flex-col items-center">
                    <Button label="So sánh ngay" icon="pi pi-check" className="p-button-primary mb-2 border p-2" onClick={handleCompareNow} />
                    <Button label="Xóa tất cả sản phẩm" icon="pi pi-trash" className="p-button-danger border p-2" onClick={clearComparison} />
                    </div>
                </div>
                <Button label="Thu gọn" icon="pi pi-chevron-down" className="p-button-secondary ml-auto" onClick={handleMinimizeComparisonBar} />
                </div>
            )}
            
            {isComparisonBarMinimized && comparisonProducts.length > 0 && (
                <Button label="Hiện so sánh" icon="pi pi-chevron-up" className="p-button-secondary fixed bottom-0 right-0 m-4 bg-white p-4 border" onClick={handleShowComparisonBar} />
            )}
            
            <Dialog header="Thêm sản phẩm để so sánh" visible={showDialog} style={{ width: '50vw' }} onHide={closeDialog}>
                <div className="p-inputgroup">
                <InputText placeholder="Tìm kiếm sản phẩm" value={searchTerm} onChange={handleSearch} />
                <Button icon="pi pi-search" />
                </div>
                <div className="mt-4">
                {filteredProducts.map(product => (
                    <div key={product.id} className="p-2 border rounded-lg flex justify-between items-center mb-2">
                    <div className="flex items-center">
                        <img src={product.image} alt={product.name} className="w-10 h-10 object-cover mr-2" />
                        <h3 className="text-sm font-bold">{product.name}</h3>
                    </div>
                    <Button
                        label={comparisonProducts.some(p => p.id === product.id) ? "Đã thêm" : "Thêm"}
                        className="p-button-success"
                        onClick={() => addToComparison(product)}
                        disabled={comparisonProducts.some(p => p.id === product.id)}
                    />
                    </div>
                ))}
                </div>
            </Dialog>
        </div>  
    );
};

export default UserProductDetail;