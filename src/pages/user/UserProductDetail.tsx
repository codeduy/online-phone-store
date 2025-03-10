import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { Toast } from 'primereact/toast';
import axios from 'axios';
import ComparisonBar from '../../components/user/ComparisonBar';
import { useCart } from './CartContext';
import { useComparison } from '../../components/user/ComparisonContext';
import { Product as ComparisonProduct, Product } from '../user/types/product';
import { Helmet } from 'react-helmet';

const API_URL = `${import.meta.env.VITE_API_URL}`;

interface Review {
    _id: string;
    product_id: string;
    user_id: {
        _id: string;
        name: string;      
    };
    rating: number;
    comment: string;
    images?: string[];
    parent_id: string;
    is_verified_purchase: boolean;
    status: string;    
    createdAt: string;
    updateAt: string;    
  }

interface ReviewResponse {
    success: boolean;
    data: {
      reviews: Review[];
      stats: {
        average: number;
        total: number;
        five: number;
        four: number;
        three: number;
        two: number;
        one: number;
      }
    }
  }

interface UserProfile {
    full_name: string;
    phone_number: string;
    address: string;
}

interface LocationOption {
    label: string;
    value: string;
    code: string;
}

interface ProductSpecs {
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
    link: any;
    shippingInfo: string;
    stock: number;
    id: string;
    name: string;
    baseProductName: string;
    // images: Array<{
    //     itemImageSrc: string;
    //     thumbnailImageSrc: string;
    //     alt: string;
    // }>;
    images: string[];
    rating: {
        average: number;
        count: number;
    };
    reviews: Array<{
        name: string;
        comment: string;
        rating: number;
        created_at: string;
    }>;
    specs: {
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
    memoryOptions: string[];
    ramOptions: Record<string, string> | null;
    colorOptions: string[];
    prices: Record<string, number>;
    originalPrice: number;
    discount: number;
    meta: string;
    needs: string[];
    special_features: string[];
    variant: {
        storage: string;
        ram: string;
    };
    trademark: string;
}

const UserProductDetail = () => {
    // 1. Router và Context Hooks
    const { link } = useParams();
    const navigate = useNavigate();
    const {  fetchCart } = useCart();
    // const { addProduct } = useComparison();

    // 2. Refs
    const toast = useRef<Toast>(null);
    const fileUploadRef = useRef<FileUpload>(null);

    // 3. Product States
    const [product, setProduct] = useState<ProductData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedMemory, setSelectedMemory] = useState<string>('');
    const [currentPrice, setCurrentPrice] = useState<number>(0);
    const [originalPrice, setOriginalPrice] = useState<number>(0);
    const [, setCurrentSpecs] = useState<ProductSpecs | null>(null);
    const [, setAvailableProducts] = useState<ComparisonProduct[]>([]);
    const [otherVersions, setOtherVersions] = useState<ProductData[]>([]);

    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [showImageDialog, setShowImageDialog] = useState(false);

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);

    const [reviewData, setReviewData] = useState<{
        reviews: Review[];
        stats: {
            average: number;
            total: number;
            five: number;
            four: number;
            three: number;
            two: number;
            one: number;
        }
    }>({
        reviews: [],
        stats: {
            average: 0,
            total: 0,
            five: 0,
            four: 0,
            three: 0,
            two: 0,
            one: 0
        }
    });
    const [canReview, setCanReview] = useState(false);
    const [reviewLoading, setReviewLoading] = useState(true);

    const { addProduct, getComparisonProducts } = useComparison();

    // 4. UI States
    const [visible, setVisible] = useState(false);
    const [showAddressDialog, setShowAddressDialog] = useState(false);
    const [activeTab, setActiveTab] = useState(0);

    // 5. Form States
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');
    // const [name, setName] = useState('');
    // const [phone, setPhone] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [uploadError, ] = useState('');
    const [showUploadError, ] = useState(false);

    // 6. Address States
    const [selectedProvince, setSelectedProvince] = useState<LocationOption | null>(null);
    const [selectedDistrict, setSelectedDistrict] = useState<LocationOption | null>(null);
    const [filteredDistricts, setFilteredDistricts] = useState<LocationOption[]>([]);
    const [selectedWard, setSelectedWard] = useState<LocationOption | null>(null);
    const [filteredWards, setFilteredWards] = useState<LocationOption[]>([]);
    const [streetAddress, setStreetAddress] = useState('');
    const [, setShippingAddress] = useState('');
    const [provinces, setProvinces] = useState<LocationOption[]>([]);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

    // 7. Constants
    const addressTabs = [
        { label: 'Tỉnh/TP', icon: 'pi pi-map-marker' },
        { label: 'Quận/Huyện', icon: 'pi pi-map' },
        { label: 'Phường/Xã', icon: 'pi pi-home' }
    ];

    const token = localStorage.getItem('token');
    console.log('Token:', token); // Debug log

    // 8. Effects
    useEffect(() => {
        const fetchProduct = async () => {
            if (!link) return;
            try {
                setLoading(true);
                const response = await axios.get(`${API_URL}/products/detail/${link}`);
                if (response.data.success) {
                    const productData = response.data.data;
                    console.log('Received product data:', productData); // Debug log
                    console.log('Image URLs:', productData.images); // Debug log
                    setProduct(productData);
                    if (productData.memoryOptions.length > 0) {
                        const firstMemoryOption = productData.memoryOptions[0];
                        setSelectedMemory(firstMemoryOption);
                        setCurrentPrice(productData.prices[firstMemoryOption]);
                        setOriginalPrice(productData.originalPrice);
                        setCurrentSpecs(productData.specs);
                    }
                    if (productData.userProfile) {
                        setUserProfile(productData.userProfile);
                    }
                }
            } catch (error) {
                console.error('Error fetching product:', error);
                setError('Could not load product details');
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Could not load product details'
                });
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [link]);

    useEffect(() => {
        const fetchAvailableProducts = async () => {
            try {
                const response = await axios.get(`${API_URL}/products/hot`);
                if (response.data.success) {
                    setAvailableProducts(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching available products:', error);
            }
        };
        fetchAvailableProducts();
    }, []);

    // Lấy danh sách tỉnh/thành phố từ backend
    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const response = await axios.get(`${API_URL}/provinces`);
                console.log('Raw API response:', response.data);
                
                if (response.data.success) {
                    // Không cần map lại vì API đã trả về đúng format
                    const provinceData = response.data.data;
                    console.log('Provinces data:', provinceData);
                    setProvinces(provinceData);
                }
            } catch (error) {
                console.error('Error fetching provinces:', error);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Không thể tải danh sách tỉnh/thành phố'
                });
            }
        };
        fetchProvinces();
    }, []);

    // Lấy danh sách quận/huyện dựa trên tỉnh/thành phố đã chọn
    useEffect(() => {
        if (selectedProvince?.code) {
            const fetchDistricts = async () => {
                try {
                    console.log('Fetching districts for province code:', selectedProvince.code);
                    const response = await axios.get(`${API_URL}/districts/${selectedProvince.code}`);
                    console.log('Districts API response:', response.data);
        
                    if (response.data.success) {
                        // Sử dụng trực tiếp data từ API
                        setFilteredDistricts(response.data.data);
                    }
                } catch (error) {
                    console.error('Error fetching districts:', error);
                    if (axios.isAxiosError(error)) {
                        console.error('Axios error details:', error.response?.data);
                    }
                }
            };
            fetchDistricts();
        } else {
            console.log('No province selected, clearing districts');
            setFilteredDistricts([]);
        }
    }, [selectedProvince]);

    // Lấy danh sách phường/xã dựa trên quận/huyện đã chọn
    useEffect(() => {
        if (selectedDistrict?.code) {
            const fetchWards = async () => {
                try {
                    const districtCode = selectedDistrict.code.toUpperCase();
                    console.log('Fetching wards for district:', {
                        code: districtCode,
                        name: selectedDistrict.label
                    });
                    
                    const response = await axios.get(`${API_URL}/wards/${districtCode}`);
                    console.log('Raw wards response:', response.data);
        
                    if (response.data.success) {
                        // Sử dụng trực tiếp data từ API
                        setFilteredWards(response.data.data);
                    } else {
                        console.error('Wards API error:', response.data.message);
                        toast.current?.show({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Không thể tải danh sách phường/xã'
                        });
                    }
                } catch (error) {
                    console.error('Error fetching wards:', error);
                    if (axios.isAxiosError(error)) {
                        console.error('API error response:', error.response?.data);
                    }
                    setFilteredWards([]);
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Không thể tải danh sách phường/xã'
                    });
                }
            };
            fetchWards();
        } else {
            setFilteredWards([]);
        }
    }, [selectedDistrict]);

    useEffect(() => {
        const fetchOtherVersions = async () => {
            if (!product) return;
            try {
                const response = await axios.get(`${API_URL}/products?name=${product.baseProductName}`);
                if (response.data.success) {
                    setOtherVersions(response.data.data);
                } else {
                    console.error('Failed to fetch other versions:', response.data.message);
                }
            } catch (error) {
                console.error('Error fetching other versions:', error);
            }
        };
        fetchOtherVersions();
    }, [product]);

    useEffect(() => {
        if (product?.id) {
            console.log('Fetching reviews for product ID:', product.id);
            console.log('Expected MongoDB ID: 65c4e8150d64b5348c063110');
            console.log('API URL built:', `${API_URL}/reviews/product/${product.id}`);
            fetchReviews();
            checkReviewPermission();
        }
    }, [product?.id]);

    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');
            
            if (!token || !userId) {
                console.log('No token or userId found');
                return;
            }
    
            console.log('Fetching profile for userId:', userId);
            const response = await axios.get(
                `${API_URL}/users/profile/${userId}`,
                {
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
    
            console.log('Profile response:', response.data);
            if (response.data.success) {
                setUserProfile(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Không thể tải thông tin người dùng'
            });
        }
    };

    useEffect(() => {
        fetchUserProfile();
    }, []);

    // Loading and error states
    if (loading) {
        return <div className="flex justify-center items-center h-screen">
            <i className="pi pi-spinner pi-spin" style={{ fontSize: '2rem' }}></i>
        </div>;
    }

    if (error || !product) {
        return <div className="flex justify-center items-center h-screen text-red-500">
            {error || 'Product not found'}
        </div>;
    }

    // 2. Define fetchReviews at parent level
    const fetchReviews = async () => {
        if (!product?.id) return;
        try {
            setReviewLoading(true);
            console.log('Fetching reviews for product:', product.id);
            
            const requestUrl = `${API_URL}/reviews/product/${product.id}`;
            console.log('Request URL:', requestUrl);
            
            const response = await axios.get<ReviewResponse>(requestUrl);
            
            console.log('Full API response:', response);
            console.log('Review data structure:', JSON.stringify(response.data, null, 2));
            
            if (response.data.success) {
                console.log('Setting review data with reviews length:', 
                    response.data.data.reviews?.length || 0);
                
                // Kiểm tra cấu trúc đúng không
                if (!response.data.data?.reviews) {
                    console.error('Error: Missing reviews array in response data');
                }
                
                setReviewData(response.data.data);
            } else {
                console.error('API returned success:false');
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
            if (axios.isAxiosError(error)) {
                console.error('API error details:', error.response?.data);
            }
            setReviewData({
                reviews: [],
                stats: {
                    average: 0,
                    total: 0,
                    five: 0,
                    four: 0,
                    three: 0,
                    two: 0,
                    one: 0
                }
            });
        } finally {
            setReviewLoading(false);
        }
    };

    const handleDeleteReview = async (reviewId: string) => {
        try {
            const token = localStorage.getItem('token');
            if (!token || !product?.id) {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Lỗi',
                    detail: 'Vui lòng đăng nhập để thực hiện chức năng này'
                });
                return;
            }
    
            console.log('Deleting review:', {
                reviewId,
                productId: product.id,
                token
            });
    
            const response = await axios.delete(
                `${API_URL}/reviews/product/${product.id}/review/${reviewId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
    
            if (response.data.success) {
                // Refresh reviews sau khi xóa thành công
                await fetchReviews();
                
                // Đóng dialog xác nhận
                setShowDeleteConfirm(false);
                
                // Reset state
                setReviewToDelete(null);
                
                // Hiển thị thông báo thành công
                toast.current?.show({
                    severity: 'success',
                    summary: 'Thành công',
                    detail: 'Đã xóa đánh giá'
                });

                window.location.reload();

            }
        } catch (error) {
            console.error('Error deleting review:', error);
            if (axios.isAxiosError(error)) {
                console.error('API error details:', {
                    status: error.response?.status,
                    data: error.response?.data
                });
            }
            
            toast.current?.show({
                severity: 'error',
                summary: 'Lỗi',
                detail: 'Không thể xóa đánh giá. Vui lòng thử lại sau.'
            });
        }
    };

    // 3. Define checkReviewPermission at parent level
    const checkReviewPermission = async () => {
        if (!product?.id) return;
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            console.log('Checking review permission for product:', product.id);
            
            const response = await axios.get(
                `${API_URL}/reviews/product/${product.id}/can-review`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            console.log('Review permission response:', response.data);
            setCanReview(response.data.canReview);
        } catch (error) {
            console.error('Error checking review permission:', error);
            setCanReview(false);
        }
    };

    // 4. Add useEffect to load reviews when product changes
    

    // Handlers
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
        if (!product) return '';
        if (product.baseProductName.toLowerCase().includes('iphone')) {
            return `${product.baseProductName} ${selectedMemory}`;
        } else if (product.ramOptions) {
            return `${product.baseProductName} ${product.ramOptions[selectedMemory]}/${selectedMemory}`;
        } else {
            return `${product.baseProductName} ${selectedMemory}`;
        }
    };

    const handleAddToCart = async (product: ProductData) => {
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
    
            const formattedName = getFormattedProductName();
            
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

    const handleBuyNow = async (product: ProductData) => {
        try {
            await handleAddToCart(product);
            navigate('/cart', { state: { scrollToTop: true } });
        } catch (error) {
            // Error is already handled in handleAddToCart
        }
    };

    const handleConfirmAddress = async () => {
        if (!selectedProvince || !selectedDistrict || !selectedWard || !streetAddress) {
            return;
        }
        
        try {
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');
            
            if (!token || !userId) {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Vui lòng đăng nhập để cập nhật địa chỉ'
                });
                return;
            }
    
            const newAddress = `${streetAddress}, ${selectedWard.label}, ${selectedDistrict.label}, ${selectedProvince.label}`;
            
            // Call API to update user profile address
            await axios.put(
                `${API_URL}/users/profile/${userId}/address`,
                { address: newAddress },
                {
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
    
            // Fetch updated profile
            await fetchUserProfile();
            
            setShippingAddress(newAddress);
            setShowAddressDialog(false);
            
            // Reset form
            setStreetAddress('');
            setSelectedWard(null);
            setSelectedDistrict(null);
            setSelectedProvince(null);
            setActiveTab(0);
    
            toast.current?.show({
                severity: 'success',
                summary: 'Success',
                detail: 'Đã cập nhật địa chỉ thành công'
            });
        } catch (error) {
            console.error('Error updating address:', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Không thể cập nhật địa chỉ'
            });
        }
    };

    const handleMemorySelect = (storage: string) => {
        const selectedVersion = otherVersions.find(version => version.variant.storage === storage);
        if (selectedVersion) {
            setSelectedMemory(storage);
            setCurrentPrice(selectedVersion.prices[storage]);
            setOriginalPrice(selectedVersion.originalPrice);
            setCurrentSpecs(selectedVersion.specs);
            navigate(`/products/detail/${selectedVersion.link}`);
        }
    };

    const handleSubmitReview = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Lỗi',
                    detail: 'Vui lòng đăng nhập để đánh giá'
                });
                return;
            }
    
            if (!rating || !review.trim()) {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Lỗi',
                    detail: 'Vui lòng chọn số sao và nhập nội dung đánh giá'
                });
                return;
            }
    
            // Create form data for multipart/form-data
            const formData = new FormData();
            formData.append('rating', rating.toString());
            formData.append('comment', review);
            
            // Append each file
            files.forEach(file => {
                formData.append('images', file);
            });
    
            try {
                console.log('Submitting review for product:', product?.id);
                
                // Submit review
                const response = await axios.post(
                    `${API_URL}/reviews/product/${product?.id}`,
                    formData,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                            // Don't set Content-Type here, it will be set automatically for FormData
                        }
                    }
                );
    
                if (response.data.success) {
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Thành công',
                        detail: 'Đã gửi đánh giá thành công'
                    });
                    
                    // Reset form
                    setRating(0);
                    setReview('');
                    setFiles([]);
                    if (fileUploadRef.current) {
                        fileUploadRef.current.clear();
                    }
                    
                    // Close dialog
                    setVisible(false);
                    
                    // Refresh reviews using the parent-level function
                    await fetchReviews();
                }
            } catch (error: any) {
                if (error.response?.status === 401) {
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Lỗi',
                        detail: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại'
                    });
                    return;
                }
                throw error; // Re-throw other errors
            }
    
        } catch (error: any) {
            console.error('Error submitting review:', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Lỗi',
                detail: error.response?.data?.message || 'Không thể gửi đánh giá'
            });
        }
    };

    const itemTemplate = (imageUrl: string) => {
        return (
            <div className="flex justify-center">
                <img 
                    src={`${API_URL.replace('/api', '')}${imageUrl}`} // Loại bỏ /api từ URL
                    alt={product?.name || 'Product image'} 
                    className="w-full max-w-[500px] object-contain"
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        console.error('Image load error:', imageUrl);
                        target.src = '/fallback-image.jpg';
                    }}
                />
            </div>
        );
    };

    const thumbnailTemplate = (imageUrl: string) => {
        return (
            <img 
                src={`${API_URL.replace('/api', '')}${imageUrl}`} // Loại bỏ /api từ URL
                alt={product?.name || 'Product thumbnail'} 
                className="w-20 h-20 object-cover"
                onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/fallback-image.jpg';
                }}
            />
        );
    };

    function convertToComparisonProduct(productData: ProductData): Product {
        // Debug log trước khi convert
        console.log('Converting product data:', {
            id: productData.id,
            name: productData.name,
            baseProductName: productData.baseProductName,
            trademark: productData.trademark,
            originalImages: productData.images
        });

        let formattedImages = productData.images;
        if (productData.trademark && productData.baseProductName) {
            formattedImages = productData.images.map(image => {
                if (image.startsWith('/images/phone/')) {
                    return image;
                }
                return `/images/phone/${productData.trademark.toUpperCase()}/${productData.baseProductName.replace(/\s+/g, '')}/${image}`;
            });
        }

        console.log('Formatted images:', formattedImages);
    
        // Format product data for comparison
        const convertedProduct = {
            id: productData.id,
            name: productData.name,
            baseProductName: productData.baseProductName,
            price: currentPrice,
            images: productData.images,
            trademark: productData.trademark,
            originalPrice: productData.originalPrice,
            discountPrice: currentPrice,
            discount: productData.discount,
            rating: {
                average: productData.rating?.average || 0,
                count: productData.rating?.count || 0
            },
            meta: productData.meta,
            link: productData.link,
            specs: productData.specs,
            variant: {
                storage: productData.variant.storage,
                ram: productData.variant.ram
            },
            needs: productData.needs,
            special_features: productData.special_features,
            color_options: productData.colorOptions
        };
    
        // Debug log sau khi convert
        console.log('Converted product:', {
            id: convertedProduct.id,
            name: convertedProduct.name,
            trademark: convertedProduct.trademark,
            images: convertedProduct.images
        });
    
        return convertedProduct;
    }

    // Calculate average rating
    // const averageRating = product.reviews.length
    //     ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
    //     : 0;

    // Calculate rating percentages
    // const totalReviews = product.reviews.length;
    // const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
    //     star,
    //     count: product.reviews.filter(review => review.rating === star).length,
    //     percentage: totalReviews ? (product.reviews.filter(review => review.rating === star).length / totalReviews) * 100 : 0,
    // }));

    const handleFileSelect = (e: { files: File[] }) => {
        const maxImages = 3;
        const currentFiles = e.files;
    
        if (currentFiles.length > maxImages) {
            // Show toast message
            toast.current?.show({
                severity: 'warn',
                summary: 'Giới hạn ảnh',
                detail: `Chỉ được phép tải lên tối đa ${maxImages} ảnh.`,
                life: 3000
            });
    
            // Keep only first 3 images
            const limitedFiles = currentFiles.slice(0, maxImages);
            if (fileUploadRef.current) {
                fileUploadRef.current.clear();
                // Re-add only the first 3 images
                // Reset the file upload reference
                if (fileUploadRef.current) {
                    fileUploadRef.current.clear();
                    // Set the files directly
                    setFiles(limitedFiles);
                }
            }
            setFiles(limitedFiles);
        } else {
            setFiles(currentFiles);
        }
    };

    const ReviewSection = () => {
        if (!product || reviewLoading) {
            return <div className="flex justify-center p-6">
                <i className="pi pi-spinner pi-spin" style={{ fontSize: '2rem' }}></i>
            </div>;
        }
    
        // Kiểm tra log để debug
        console.log('Review data in ReviewSection:', reviewData);
        console.log('Review count:', reviewData.reviews?.length || 0);

        // const userId = localStorage.getItem('userId');
    
        return (
            <div className="mt-8 bg-white p-6 rounded-lg shadow">
                <h3 className="text-2xl font-semibold mb-6">Đánh giá sản phẩm</h3>
                
                {/* Rating Overview */}
                <div className="flex items-start gap-8 mb-8 p-4 bg-gray-50 rounded-lg">
                    {/* Average Rating */}
                    <div className="text-center w-48">
                        <div className="text-4xl font-bold text-yellow-500">
                            {reviewData.stats.average ? reviewData.stats.average.toFixed(1) : '0.0'}
                        </div>
                        <Rating 
                            value={reviewData.stats.average} 
                            readOnly 
                            cancel={false}
                            className="my-2 justify-center"
                        />
                        <div className="text-gray-600">
                            {reviewData.stats.total} đánh giá
                        </div>
                    </div>
    
                    {/* Rating Distribution */}
                    <div className="flex-1">
                        {[5, 4, 3, 2, 1].map(star => (
                            <div key={star} className="flex items-center gap-2 mb-2">
                                <span className="w-12 text-sm">{star} sao</span>
                                <div className="flex-1 h-2 bg-gray-200 rounded overflow-hidden">
                                    <div 
                                        className="h-full bg-yellow-400"
                                        // style={{
                                        //     width: `${reviewData.stats.total ? (reviewData.stats[star as keyof typeof reviewData.stats.five]/reviewData.stats.total)*100 : 0}%`
                                        // }}
                                    />
                                </div>
                                {/* <span className="w-12 text-sm text-right">
                                    {reviewData.stats[star as keyof typeof reviewData.stats.five]}
                                </span> */}
                            </div>
                        ))}
                    </div>
    
                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 w-48">
                        {canReview && (
                        <Button
                            label="Viết đánh giá"
                            icon="pi pi-pencil"
                            className="p-button-primary"
                            onClick={() => setVisible(true)}
                        />
                        )}
                        <Button 
                            label="Xem tất cả" 
                            icon="pi pi-list" 
                            onClick={() => {
                                navigate(`/products/${product.id}/reviews`);
                                window.scrollTo(0, 0);
                            }}
                            className="p-button-secondary w-full"
                        />
                    </div>
                </div>
    
                {/* Latest Reviews */}
                <div className="space-y-4">
                    <h4 className="font-semibold text-lg mb-4">Đánh giá gần đây</h4>
                    {reviewData.reviews && reviewData.reviews.length > 0 ? (
                        (() => {
                            // Lấy userId từ localStorage
                            const userId = localStorage.getItem('userId');
                            
                            // 1. Tìm đánh giá của người dùng hiện tại
                            const currentUserReview = userId 
                                ? reviewData.reviews.find(review => review.user_id._id === userId)
                                : null;
                            
                            // 2. Lọc các đánh giá không phải của người dùng hiện tại
                            const otherReviews = reviewData.reviews.filter(review => !userId || review.user_id._id !== userId);
                            
                            // 3. Trộn ngẫu nhiên mảng các đánh giá khác
                            const shuffledReviews = [...otherReviews];
                            for (let i = shuffledReviews.length - 1; i > 0; i--) {
                                const j = Math.floor(Math.random() * (i + 1));
                                [shuffledReviews[i], shuffledReviews[j]] = [shuffledReviews[j], shuffledReviews[i]];
                            }
                            
                            // 4. Lấy 2 đánh giá ngẫu nhiên
                            const randomReviews = shuffledReviews.slice(0, 2);
                            
                            // 5. Kết hợp đánh giá người dùng hiện tại và đánh giá ngẫu nhiên
                            const reviewsToShow = currentUserReview 
                                ? [currentUserReview, ...randomReviews]
                                : randomReviews;
                            
                            return reviewsToShow.map((review) => (
                                <div 
                                    key={review._id} 
                                    className={`border-b pb-4 last:border-0 ${userId && review.user_id._id === userId 
                                        ? 'bg-blue-50 p-3 rounded-lg border border-blue-100 mb-3' 
                                        : ''}`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <div className="font-semibold">{review.user_id.name}</div>
                                                {userId && review.user_id._id === userId && (
                                                    <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                                                        Đánh giá của bạn
                                                    </span>

                                                    
                                                )}
                                                {review.is_verified_purchase && (
                                                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                                                        Đã mua hàng
                                                    </span>
                                                )}
                                                {userId && review.user_id._id === userId && (
                                                    <Button
                                                        icon="pi pi-trash"
                                                        className="p-button-danger p-button-text"
                                                        onClick={() => {
                                                            setReviewToDelete(review._id);
                                                            setShowDeleteConfirm(true);
                                                        }}
                                                        tooltip="Xóa đánh giá"
                                                    />
                                                )}
                                            </div>
                                            <Rating value={review.rating} readOnly cancel={false} />
                                        </div>
                                        <div className="text-gray-500 text-sm">
                                            {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                                        </div>
                                    </div>
                                    <p className="text-gray-700 mb-2">{review.comment}</p>
                                    {review.images && review.images.length > 0 && (
                                        <div className="flex gap-2 mt-2">
                                            {review.images.map((image, index) => (
                                                <img 
                                                    key={index}
                                                    src={`${API_URL.replace('/api', '')}${image}`}
                                                    alt={`Review image ${index}`}
                                                    className="w-16 h-16 object-cover rounded cursor-pointer"
                                                    onClick={() => {
                                                        setSelectedImage(image);
                                                        setShowImageDialog(true);
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ));
                        })()
                    ) : (
                        <p className="text-gray-500 text-center py-4">Chưa có đánh giá nào</p>
                    )}
                </div>
    
                {/* Show more button */}
                {reviewData.reviews.length > 2 && (
                    <div className="text-center mt-6">
                        <Button
                            label="Xem tất cả đánh giá"
                            icon="pi pi-arrow-right"
                            className="p-button-text"
                            onClick={() => {
                                navigate(`/products/${product.id}/reviews`);
                                window.scrollTo(0, 0);
                            }}
                        />
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="p-4 bg-gray-50 min-h-screen">
            <Helmet>
                <title>Chi tiết sản phẩm - {getFormattedProductName()}</title>
                <link rel="icon" href={`${import.meta.env.VITE_IMAGE_URL}/images/favicon/phone.ico`} />
            </Helmet>
            <Toast ref={toast} className="z-50"/>
            {/* Row 1 */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <h1 className="text-2xl font-semibold text-gray-800">{getFormattedProductName()}</h1>
                <Button 
                    label="So sánh" 
                    icon="pi pi-exchange" 
                    className="w-full sm:w-auto px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-colors duration-200" 
                    onClick={() => handleAddToComparison(convertToComparisonProduct(product))}
                />
                </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Column 1 */}
                <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 mb-6">
                <Galleria 
                    value={product.images} // Now directly using the images array
                    responsiveOptions={[
                        {
                            breakpoint: '1024px',
                            numVisible: 5
                        },
                        {
                            breakpoint: '768px',
                            numVisible: 3
                        },
                        {
                            breakpoint: '560px',
                            numVisible: 1
                        }
                    ]} 
                    numVisible={5} 
                    circular 
                    style={{ maxWidth: '100%' }}
                    // containerStyle={{ marginBottom: '0' }}
                    showItemNavigators
                    showThumbnails
                    showIndicators
                    item={itemTemplate} 
                    thumbnail={thumbnailTemplate}
                    className="custom-galleria" 
                    pt={{
                        content: { className: 'rounded-lg' },
                        previousItemButton: { 
                            className: 'bg-white/80 text-gray-700 hover:bg-white hover:text-gray-900 transition-colors duration-200' 
                        },
                        nextItemButton: { 
                            className: 'bg-white/80 text-gray-700 hover:bg-white hover:text-gray-900 transition-colors duration-200' 
                        }
                    }}
                />
                </div>
                <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Thông số kỹ thuật</h2>
                    <Accordion 
                        multiple 
                        activeIndex={[0, 1, 2]}
                        className="border-none"
                        // pt={{
                        //     root: { className: 'border-none' },
                        //     header: { className: 'bg-gray-50 hover:bg-gray-100 transition-colors duration-200' },
                        //     content: { className: 'bg-white' }
                        // }}
                    >
                        <AccordionTab header="Cấu hình & Bộ nhớ">
                            <ul>
                                <li className="mb-1 flex">
                                    <strong className="w-1/3">Hệ điều hành:</strong>
                                    <span className="ml-4">{product?.specs.os}</span>
                                </li>
                                <li className="mb-1 flex">
                                    <strong className="w-1/3">Chip xử lí (CPU):</strong>
                                    <span className="ml-4">{product?.specs.cpu}</span>
                                </li>
                                <li className="mb-1 flex">
                                    <strong className="w-1/3">Chip đồ họa (GPU):</strong>
                                    <span className="ml-4">{product?.specs.gpu}</span>
                                </li>
                                <li className="mb-1 flex">
                                    <strong className="w-1/3">RAM:</strong>
                                    <span className="ml-4">
                                        {product?.ramOptions 
                                            ? product.ramOptions[selectedMemory] 
                                            : product?.variant.ram 
                                                ? product.variant.ram 
                                                : 'Không có thông tin'
                                        }
                                    </span>
                                </li>
                                <li className="mb-1 flex">
                                    <strong className="w-1/3">Bộ nhớ:</strong>
                                    <span className="ml-4">{selectedMemory}</span>
                                </li>
                            </ul>
                        </AccordionTab>

                        <AccordionTab header="Camera & Màn hình">
                            <ul>
                                <li className="mb-1 flex">
                                <strong className="w-1/3">Độ phân giải camera sau:</strong>
                                <span className="ml-4">{product?.specs?.camera?.main || ''}</span>
                                </li>
                                <li className="mb-1 flex">
                                <strong className="w-1/3">Độ phân giải camera trước:</strong>
                                <span className="ml-4">{product?.specs?.camera?.front || ''}</span>
                                </li>
                                <li className="mb-1 flex">
                                <strong className="w-1/3">Công nghệ màn hình:</strong>
                                <span className="ml-4">{product?.specs?.display?.type || ''}</span>
                                </li>
                                <li className="mb-1 flex">
                                <strong className="w-1/3">Kích thước màn hình:</strong>
                                <span className="ml-4">{product?.specs?.display?.size || ''}</span>
                                </li>
                                <li className="mb-1 flex">
                                <strong className="w-1/3">Tần số quét màn hình:</strong>
                                <span className="ml-4">{product?.specs?.display?.refresh_rate || ''}</span>
                                </li>
                                <li className="mb-1 flex">
                                <strong className="w-1/3">Độ sáng tối đa:</strong>
                                <span className="ml-4">{product?.specs?.display?.brightness || ''}</span>
                                </li>
                            </ul>
                        </AccordionTab>

                        <AccordionTab header="Pin & Sạc">
                            <ul>
                                <li className="mb-1 flex">
                                <strong className="w-1/3">Dung lượng pin:</strong>
                                <span className="ml-4">{product?.specs?.battery?.capacity || ''}</span>
                                </li>
                                <li className="mb-1 flex">
                                <strong className="w-1/3">Hỗ trợ sạc tối đa:</strong>
                                <span className="ml-4">{product?.specs?.battery?.charging || ''}</span>
                                </li>
                            </ul>
                        </AccordionTab>
                    </Accordion>
                </div>

                {/* <div className="mt-4">
                    <h2 className="text-xl font-bold mb-2">Đánh giá</h2>
                    <div className="flex flex-col items-center">
                        <Rating value={product?.rating.average || 0} readOnly stars={5} cancel={false} />
                        <span className="mt-2">{product?.rating.average.toFixed(1)}/5</span>
                        <span className="mt-2">{product?.rating.count} khách hàng đã đánh giá</span>
                    </div>
                    <div className="mt-4">
                        {product?.reviews.map((review, index) => (
                        <div key={index} className="mb-4 pb-4 border-b border-gray-200">
                            <strong>{review.name}</strong>
                            <Rating value={review.rating} readOnly stars={5} cancel={false} className="ml-2" />
                            <p>{review.comment}</p>
                            <span className="text-sm text-gray-500">
                            {new Date(review.created_at).toLocaleDateString()}
                            </span>
                        </div>
                        ))}
                    </div>
                </div> */}

                    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
                        <ReviewSection />
                    </div>
                </div>

                {/* Column 2 */}
                <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 sticky top-4">
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Tùy chọn phiên bản</h2>
                    <div className="grid grid-cols-2 gap-3">
                        {otherVersions.map((version) => (
                            <Button 
                                key={version.id}
                                label={product.baseProductName.toLowerCase().includes('iphone') 
                                    ? version.variant.storage 
                                    : `${version.variant.ram}-${version.variant.storage}`
                                }
                                className={`p-button-outlined w-full bg-white border p-2 ${selectedMemory === version.variant.storage ? 'p-button-primary' : ''}`}
                                onClick={() => handleMemorySelect(version.variant.storage)}
                            />
                        ))}
                    </div>
                </div>
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Tùy chọn màu sắc</h2>
                    <div className="grid grid-cols-2 gap-3">
                    {product.colorOptions.map((color, index) => (
                        <Button 
                        key={index} 
                        label={color} 
                        className={`p-button-outlined w-full p-2 ${getColorStyle(color)}`}
                        />
                    ))}
                    </div>
                </div>
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Giá sản phẩm</h2>
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
                <div>
                    <p className={`mt-2 mb-4 ${product.stock > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {product.stock > 0 ? 'Còn hàng' : 'Hết hàng'}
                    </p>
                </div>
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-xl font-bold">Thông tin vận chuyển</h2>
                        <Button 
                            label={userProfile?.address ? "Thay đổi" : "Thêm địa chỉ"} 
                            className="p-button-text" 
                            onClick={() => {
                                if (!localStorage.getItem('token')) {
                                    toast.current?.show({
                                        severity: 'warn',
                                        summary: 'Warning',
                                        detail: 'Vui lòng đăng nhập để thêm địa chỉ'
                                    });
                                    return;
                                }
                                setShowAddressDialog(true);
                            }}
                        />
                    </div>
                    {userProfile ? (
                        <div className="p-2 border rounded bg-white">
                            <p className="font-semibold">{userProfile.full_name}</p>
                            <p className="text-gray-600">{userProfile.phone_number}</p>
                            <p className="text-gray-600">{userProfile.address}</p>
                        </div>
                    ) : (
                        <p className="text-gray-500">
                            {localStorage.getItem('token') 
                                ? "Đang tải thông tin..." 
                                : "Vui lòng đăng nhập để thêm địa chỉ nhận hàng"}
                        </p>
                    )}
                </div>           
                {product.stock > 0 && (
                    <div className="grid grid-cols-2 gap-3">
                        <Button 
                            label="Thêm vào giỏ hàng" 
                            className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-colors duration-200" 
                            onClick={() => handleAddToCart(product)} // Truyền product hiện tại
                        />
                        <Button 
                            label="Mua ngay" 
                            className="px-4 py-2 bg-blue-600 text-white border border-blue-600 rounded-lg hover:bg-blue-700 hover:border-blue-700 transition-colors duration-200" 
                            onClick={() => handleBuyNow(product)} 
                        />
                    </div>
                )}
                </div>
            </div>
            
            </div>

            {/* Review Dialog */}
            <Dialog 
                visible={visible} 
                onHide={() => setVisible(false)}
                header="Viết đánh giá"
                className="rounded-lg shadow-lg border border-gray-200"
                style={{ width: '90vw', maxWidth: '600px' }}
                pt={{
                    root: { className: 'border rounded-lg shadow-lg' },
                    header: { className: 'text-xl font-semibold text-gray-800 p-4 border-b bg-gray-50' },
                    content: { className: 'p-6' },
                    footer: { className: 'flex gap-2 justify-end p-4 bg-gray-50 border-t' }
                }}
            >
                <div className="flex flex-col gap-4">
                    <div className="text-center">
                        <h3 className="text-lg font-semibold mb-2">Đánh giá sản phẩm</h3>
                        <p className="text-sm text-gray-600 mb-4">{getFormattedProductName()}</p>
                        <Rating 
                            value={rating} 
                            onChange={(e) => setRating(e.value ?? 0)} 
                            stars={5} 
                            cancel={false} 
                            className="flex justify-center"
                            pt={{
                                onIcon: { className: 'text-yellow-400' },
                                offIcon: { className: 'text-gray-300' }
                            }}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="font-medium text-gray-700">Nhận xét của bạn</label>
                        <InputTextarea 
                            value={review} 
                            onChange={(e) => setReview(e.target.value)} 
                            rows={5} 
                            placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..." 
                            className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-400 focus:outline-none"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="font-medium text-gray-700">Hình ảnh thực tế (tối đa 3 ảnh)</label>
                        <FileUpload
                            ref={fileUploadRef}
                            mode="advanced"
                            multiple
                            accept="image/*"
                            maxFileSize={1000000}
                            customUpload
                            auto={false}
                            chooseLabel="Chọn ảnh"
                            cancelLabel="Hủy"
                            className="w-full border border-gray-300 rounded-lg overflow-hidden"
                            chooseOptions={{
                                className: "px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-colors duration-200"
                            }}
                            cancelOptions={{
                                className: "px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-colors duration-200"
                            }}
                            onSelect={handleFileSelect}
                            onClear={() => setFiles([])}
                            emptyTemplate={
                                <p className="text-center text-gray-500 py-8">
                                    Kéo thả hoặc click để chọn ảnh (tối đa 3 ảnh)
                                </p>
                            }
                            onError={(_e) => {
                                toast.current?.show({
                                    severity: 'error',
                                    summary: 'Lỗi',
                                    detail: 'Không thể tải ảnh. Vui lòng thử lại.'
                                });
                            }}
                        />
                        {showUploadError && (
                            <small className="text-red-500 mt-1">{uploadError}</small>
                        )}
                    </div>

                    <Button 
                        label="Gửi đánh giá" 
                        icon="pi pi-send"
                        iconPos="left"
                        disabled={!rating || !review.trim()}
                        onClick={handleSubmitReview}
                        className={`w-full px-4 py-2 mt-4 flex items-center justify-center gap-2 rounded-lg transition-colors duration-200 ${
                            !rating || !review.trim()
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 text-white border border-blue-600 hover:bg-blue-700 hover:border-blue-700'
                        }`}
                    />
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
                        <>
                            <Dropdown 
                                value={selectedProvince?.code}
                                options={provinces}
                                onChange={(e) => {
                                    console.log('Selected province code:', e.value);
                                    const selectedProv = provinces.find(p => p.code === e.value);
                                    console.log('Found province:', selectedProv);
                                    
                                    if (selectedProv) {
                                        setSelectedProvince(selectedProv); // Lưu trực tiếp object từ API
                                        setSelectedDistrict(null);
                                        setSelectedWard(null);
                                        setActiveTab(1);
                                    }
                                }}
                                optionLabel="label"
                                optionValue="code"
                                placeholder="Chọn Tỉnh/Thành phố"
                                className="w-full border"
                            />
                        </>
                    )}

                    {activeTab === 1 && (
                        <>
                            <Dropdown 
                                value={selectedDistrict?.code}
                                options={filteredDistricts}
                                onChange={(e) => {
                                    console.log('Selected district code:', e.value);
                                    const selectedDist = filteredDistricts.find(d => d.code === e.value);
                                    console.log('Found district object:', selectedDist);
                                    
                                    if (selectedDist) {
                                        setSelectedDistrict({
                                            ...selectedDist,
                                            code: selectedDist.code
                                        });
                                        setSelectedWard(null);
                                        setActiveTab(2);
                                    }
                                }}
                                optionLabel="label"
                                optionValue="code"
                                placeholder="Chọn Quận/Huyện"
                                className="w-full border"
                                disabled={!selectedProvince}
                            />
                        </>
                    )}

                    {activeTab === 2 && (
                        <>
                            <Dropdown 
                                value={selectedWard?.code}
                                options={filteredWards}
                                onChange={(e) => {
                                    console.log('Selected ward code:', e.value);
                                    const selectedW = filteredWards.find(w => w.code === e.value);
                                    console.log('Found ward object:', selectedW);
                                    
                                    if (selectedW) {
                                        setSelectedWard({
                                            label: selectedW.label,
                                            value: selectedW.code,
                                            code: selectedW.code
                                        });
                                    }
                                }}
                                optionLabel="label"
                                optionValue="code"
                                placeholder="Chọn Phường/Xã"
                                className="w-full border mb-2"
                                disabled={!selectedDistrict}
                            />
                            
                            {filteredWards.length === 0 && selectedDistrict && (
                                <div className="text-yellow-600 text-sm mb-2">
                                    Không tìm thấy dữ liệu phường/xã cho quận/huyện này
                                </div>
                            )}
                            
                            <InputText 
                                value={streetAddress}
                                onChange={(e) => setStreetAddress(e.target.value)}
                                placeholder="Nhập số nhà, tên đường"
                                className="w-full border p-2"
                            />
                        </>
                    )}
                    
                    <Button 
                        label="Xác nhận địa chỉ" 
                        className="p-button-primary border p-2" 
                        onClick={handleConfirmAddress}
                        disabled={!selectedWard || !streetAddress.trim()}
                    />
                </div>
            </Dialog>

            <Dialog
                visible={showImageDialog}
                onHide={() => {
                    setShowImageDialog(false);
                    setSelectedImage(null);
                }}
                style={{ width: '90vw', maxWidth: '1200px' }}
                header="Xem ảnh"
                className="image-preview-dialog"
            >
                {selectedImage && (
                    <div className="flex justify-center items-center">
                        <img
                            src={`${API_URL.replace('/api', '')}${selectedImage}`}
                            alt="Review image preview"
                            className="max-w-full max-h-[80vh] object-contain"
                        />
                    </div>
                )}
            </Dialog>

            <Dialog
                visible={showDeleteConfirm}
                onHide={() => setShowDeleteConfirm(false)}
                header="Xác nhận xóa"
                footer={(
                    <div>
                        <Button
                            label="Hủy"
                            icon="pi pi-times"
                            className="mr-2 p-button-text bg-white text-gray-700 border border-gray-300 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 rounded-md p-2"
                            onClick={() => setShowDeleteConfirm(false)}
                        />
                        <Button
                            label="Xóa"
                            icon="pi pi-trash"
                            className="p-button-danger text-red-500 border border-red-300 bg-white hover:bg-red-50 hover:text-red-600 transition-all duration-200 rounded-md p-2"
                            onClick={() => {
                                if (reviewToDelete) {
                                    handleDeleteReview(reviewToDelete);
                                    setShowDeleteConfirm(false);
                                }
                            }}
                        />
                    </div>
                )}
            >
                <p>Bạn có chắc chắn muốn xóa đánh giá này?</p>
            </Dialog>

            <div className="fixed bottom-0 left-0 right-0 z-50">
                <ComparisonBar />
            </div>
        </div>  
    );
};

export default UserProductDetail;

