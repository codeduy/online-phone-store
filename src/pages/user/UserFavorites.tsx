import React, { useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import { ConfirmPopup, confirmPopup } from 'primereact/confirmpopup';
import { useCart } from './CartContext';

interface Product {
    id: string;
    name: string;
    image: string;
    inStock: boolean;
    price: number;
}

const UserFavorites: React.FC = () => {
    const toast = useRef<Toast>(null);
    const { addToCart: addItemToCart } = useCart();
    const [searchQuery, setSearchQuery] = useState('');

    const confirmDelete = (event: React.MouseEvent, product: Product) => {
        confirmPopup({
            target: event.currentTarget as HTMLElement,
            message: 'Bạn có chắc chắn muốn xóa sản phẩm này khỏi danh sách yêu thích?',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Xóa',
            rejectLabel: 'Hủy',
            accept: () => {
                setFavorites(favorites.filter(f => f.id !== product.id));
                toast.current?.show({
                    severity: 'success',
                    summary: 'Đã xóa',
                    detail: 'Sản phẩm đã được xóa khỏi danh sách yêu thích',
                    life: 3000
                });
            },
            acceptClassName: 'p-button-danger p-button-sm',
            rejectClassName: 'p-button-outlined p-button-sm',
            className: 'custom-confirm-popup'
        });
    };

    const addToCart = (product: Product) => {
        const cartItem = {
            id: Number(product.id),
            name: product.name,
            price: product.price,
            quantity: 1
        };
        
        addItemToCart(cartItem);
        
        toast.current?.show({
            severity: 'success',
            summary: 'Thành công',
            detail: 'Đã thêm sản phẩm vào giỏ hàng',
            life: 3000
        });
    };

    const [favorites, setFavorites] = useState<Product[]>([
        {
            id: '1',
            name: 'Samsung Galaxy S21 8GB/128GB',
            image: '/src/assets/img/s21.png',
            inStock: true,
            price: 18990000
        },
        {
            id: '2',
            name: 'Samsung Galaxy Z Fold 3 12GB/256GB',
            image: '/images/products/zfold3.png',
            inStock: false,
            price: 34990000
        },
        {
            id: '3',
            name: 'Samsung Galaxy Note 20 8GB/256GB',
            image: '/images/products/note20.png',
            inStock: true,
            price: 19990000
        },
        {
            id: '4',
            name: 'Samsung Galaxy A52 6GB/128GB',
            image: '/images/products/a52.png',
            inStock: true,
            price: 8290000
        },
        {
            id: '5',
            name: 'Samsung Galaxy S21 Ultra 12GB/256GB',
            image: '/images/products/s21ultra.png',
            inStock: false,
            price: 25990000
        }
    ]);

    const filteredProducts = favorites.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const imageBodyTemplate = (product: Product) => {
        return (
            <img 
                src={product.image} 
                alt={product.name} 
                className="w-24 h-24 object-contain"
            />
        );
    };

    const stockStatusBodyTemplate = (product: Product) => {
        return (
            <Tag 
                severity={product.inStock ? "success" : "danger"}
                value={product.inStock ? "Còn hàng" : "Hết hàng"}
            />
        );
    };

    const actionsBodyTemplate = (product: Product) => {
        return (
            <div className="flex gap-2">
                <Button
                    icon="pi pi-shopping-cart"
                    className="p-button-rounded p-button-success"
                    disabled={!product.inStock}
                    tooltip="Thêm vào giỏ hàng"
                    onClick={() => addToCart(product)}
                />
                <Button
                    icon="pi pi-trash"
                    className="p-button-rounded p-button-danger"
                    tooltip="Xóa khỏi yêu thích"
                    onClick={(e) => confirmDelete(e, product)}
                />
            </div>
        );
    };

    return (
        <div className="p-4 space-y-4">
            <Toast ref={toast} />
            <ConfirmPopup />
            {/* Row 1: Search */}
            <div className="flex justify-start">
                <span className="p-input-icon-left w-full md:w-1/3">
                    <i className="pi pi-search ml-2" />
                    <InputText
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Tìm kiếm sản phẩm yêu thích..."
                        className="w-full pl-8"  
                    />
                </span>
            </div>

            {/* Row 2: Products Table */}
            <DataTable 
                value={filteredProducts}
                showGridlines
                stripedRows
                emptyMessage="Không tìm thấy sản phẩm yêu thích"
            >
                <Column 
                    header="Hình ảnh" 
                    body={imageBodyTemplate} 
                    style={{ width: '15%' }}
                />
                <Column 
                    field="name" 
                    header="Tên sản phẩm" 
                    style={{ width: '45%' }}
                />
                <Column 
                    header="Tình trạng" 
                    body={stockStatusBodyTemplate}
                    style={{ width: '20%' }}
                />
                <Column 
                    header="Thao tác" 
                    body={actionsBodyTemplate}
                    style={{ width: '20%' }}
                />
            </DataTable>
        </div>
    );
};

export default UserFavorites;