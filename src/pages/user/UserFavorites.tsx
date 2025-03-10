import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { ConfirmPopup, confirmPopup } from 'primereact/confirmpopup';
import { useCart } from './CartContext';
import axios from 'axios';
import { Helmet } from 'react-helmet';

interface Product {
    _id: string;
    name: string;
    images: string[];
    image_url?: string; 
    price: number;
    stock: number;
    ram: string;
    storage: string;
    trademark?: string;
    baseProductName?: string;
}

// interface CartItem {
//     id: string;
//     name: string;
//     price: number;
//     quantity: number;
//     images?: string[];
//     variant?: {
//         ram?: string;
//         storage?: string;
//     };
//     baseProductName?: string;
// }

// const API_URL = 'http://localhost:3000/api';

const UserFavorites: React.FC = () => {
    const toast = useRef<Toast>(null);
    const { addToCart } = useCart();
    const [searchQuery, setSearchQuery] = useState('');
    const [favorites, setFavorites] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFavorites();
    }, []);

    const fetchFavorites = async () => {
        try {
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');
    
            if (!token || !userId) {
                toast.current?.show({
                    severity: 'warn',
                    summary: 'Chưa đăng nhập',
                    detail: 'Vui lòng đăng nhập để xem danh sách ưa thích',
                    life: 3000
                });
                setFavorites([]);
                return;
            }
    
            const response = await axios.get(`/favorites/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
    
            if (response.data.success) {
                setFavorites(response.data.data);
            }
        } 
        catch (error) {
            console.error('Error fetching favorites:', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Lỗi',
                detail: 'Không thể tải danh sách sản phẩm ưa thích',
                life: 3000
            });
        } 
        finally {
            setLoading(false);
        }
    };

    const formatProductName = (product: Product) => {
        if (!product.ram && !product.storage) {
            return product.name;
        }
        
        if (product.name.toLowerCase().includes('iphone')) {
            return product.storage ? `${product.name} ${product.storage}` : product.name;
        }
        
        const specs = [];
        if (product.ram) {
            specs.push(product.ram);
        }
        if (product.storage) {
            specs.push(product.storage);
        }
    
        return specs.length > 0 ? `${product.name} ${specs.join('/')}` : product.name;
    };

    const handleRemoveFavorite = async (productId: string) => {
        try {
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');

            if (!token || !userId) {
                toast.current?.show({
                    severity: 'warn',
                    summary: 'Chưa đăng nhập',
                    detail: 'Vui lòng đăng nhập để thực hiện thao tác này',
                    life: 3000
                });
                return;
            }

            await axios.post('http://localhost:3000/api/favorites/toggle', 
                { userId, productId },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setFavorites(prev => prev.filter(item => item._id !== productId));
            
            toast.current?.show({
                severity: 'success',
                summary: 'Success',
                detail: 'Product removed from favorites',
                life: 3000
            });
        } catch (error) {
            console.error('Error removing favorite:', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Lỗi',
                detail: 'Không thể xóa sản phẩm khỏi danh sách ưa thích',
                life: 3000
            });
        }
    };

    const confirmDelete = (event: React.MouseEvent, productId: string) => {
        confirmPopup({
            target: event.currentTarget as HTMLElement,
            message: 'Bạn có chắc chắn muốn xóa sản phẩm này khỏi danh sách yêu thích?',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Xóa',
            rejectLabel: 'Hủy',
            accept: () => handleRemoveFavorite(productId),
            className: 'bg-white rounded-lg shadow-lg border border-gray-200',
            acceptClassName: 'px-4 py-2 bg-white text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors duration-200',
            rejectClassName: 'px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200',
            pt: {
                root: { className: 'p-6' },
                message: { className: 'text-gray-600 mb-4' },
                icon: { className: 'text-yellow-500 mr-2' },
                content: { className: 'flex items-start' },
                footer: { className: 'flex justify-end gap-6 mt-6' } // Changed gap-4 to gap-6
            }
        });
    };

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
    
            // Format tên sản phẩm trước khi thêm vào giỏ hàng
            const formattedName = formatProductName(product);
    
            // Chỉ gọi addToCart từ context (không gọi API trực tiếp)
            await addToCart(product._id, 1, formattedName);
    
            toast.current?.show({
                severity: 'success',
                summary: 'Thành công',
                detail: 'Đã thêm sản phẩm vào giỏ hàng',
                life: 3000
            });
    
        } catch (error: any) {
            console.error('Error adding to cart:', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Lỗi',
                detail: error.response?.data?.message || 'Không thể thêm vào giỏ hàng'
            });
        }
    };

    const filteredProducts = favorites.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getImageUrl = (product: Product): string => {
        if (!product.images?.[0]) {
            console.warn('No image found for product:', product.name);
            return '/fallback-image.jpg';
        }
    
        const imagePath = product.images[0];
        const baseUrl = `${import.meta.env.VITE_IMAGE_URL}`;
    
        // If image path is already complete
        if (imagePath.startsWith('/images/')) {
            return `${baseUrl}${imagePath}`;
        }
    
        // Otherwise construct the full path
        const trademark = product.name.toLowerCase().includes('iphone') ? 'APPLE' : 
                         product.name.toLowerCase().includes('samsung') ? 'SAMSUNG' : 'UNKNOWN';
        const productName = product.name.replace(/\s+/g, '');
        return `${baseUrl}/images/phone/${trademark}/${productName}/${imagePath}`;
    };

    const imageBodyTemplate = (product: Product) => {
        return (
            <div className="flex justify-center">
                <div className="w-24 h-24 relative">
                    <img 
                        src={getImageUrl(product)}
                        alt={product.name} 
                        className="absolute inset-0 w-full h-full object-contain rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                        onError={(e) => {
                            console.error('Image load error:', {
                                product: product.name,
                                src: (e.target as HTMLImageElement).src
                            });
                            const target = e.target as HTMLImageElement;
                            target.onerror = null; // Prevent infinite loop
                            target.src = '/fallback-image.jpg';
                        }}
                        loading="lazy"
                    />
                </div>
            </div>
        );
    };

    const nameBodyTemplate = (product: Product) => {
        return (
            <div className="text-gray-800 font-medium hover:text-blue-600 transition-colors duration-200">
                {formatProductName(product)}
            </div>
        );
    };

    const stockStatusBodyTemplate = (product: Product) => {
        return (
            <Tag 
                severity={product.stock > 0 ? "success" : "danger"}
                value={product.stock > 0 ? "Còn hàng" : "Hết hàng"}
                className="px-3 py-1.5 text-sm font-medium rounded-full"
            />
        );
    };

    const actionsBodyTemplate = (product: Product) => {
        return (
            <div className="flex gap-2 justify-center">
                <Button
                    icon="pi pi-shopping-cart"
                    className="p-button-rounded p-button-success shadow-md hover:text-blue-600 hover:bg-blue-50"
                    disabled={product.stock === 0}  
                    tooltip="Thêm vào giỏ hàng"
                    tooltipOptions={{ position: 'top' }}
                    onClick={() => handleAddToCart(product)}
                />
                <Button
                    icon="pi pi-trash"
                    className="p-button-rounded p-button-danger shadow-md hover:text-red-600 hover:bg-red-50 text-red-500"
                    tooltip="Xóa khỏi yêu thích"
                    tooltipOptions={{ position: 'top' }}
                    onClick={(e) => confirmDelete(e, product._id)}
                />
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 bg-gray-50 min-h-screen">
            <Helmet>
                <title>Ưa thích</title>
                <link rel="icon" href="../../src/assets/img/phone.ico" />
            </Helmet>
            <Toast ref={toast} />
            <ConfirmPopup />

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                    Sản phẩm yêu thích
                </h1>
                <div className="flex justify-center">
                    <div className="relative w-full md:w-1/2">
                        <span className="p-input-icon-left w-full">
                            <i className="pi pi-search absolute left-3 top-8 transform -translate-y-1/2 text-gray-400" />
                            <InputText
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Tìm kiếm sản phẩm yêu thích..."
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                            />
                        </span>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <DataTable 
                    value={filteredProducts}
                    showGridlines
                    stripedRows
                    loading={loading}
                    emptyMessage={
                        <div className="text-center py-8">
                            <i className="pi pi-heart text-4xl text-gray-300 mb-4"></i>
                            <p className="text-gray-500">Không tìm thấy sản phẩm yêu thích</p>
                        </div>
                    }
                    className="border-none"
                >
                    <Column 
                        header="Hình ảnh" 
                        body={imageBodyTemplate} 
                        style={{ width: '15%' }}
                        className="text-center"
                    />
                    <Column 
                        header="Tên sản phẩm" 
                        body={nameBodyTemplate}
                        style={{ width: '45%' }}
                        className="text-left"
                    />
                    <Column 
                        header="Tình trạng" 
                        body={stockStatusBodyTemplate}
                        style={{ width: '20%' }}
                        className="text-center"
                    />
                    <Column 
                        header="Thao tác" 
                        body={actionsBodyTemplate}
                        style={{ width: '20%' }}
                        className="text-center"
                    />
                </DataTable>
            </div>
        </div>
    );
};

export default UserFavorites;