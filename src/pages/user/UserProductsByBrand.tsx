import React, { useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Rating } from 'primereact/rating';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import ComparisonBar from '../../components/user/ComparisonBar';
import { Product } from './types/product';
import { useComparison } from '../../components/user/ComparisonContext';

const UserProductsByBrand = () => {
  const { brand = '' } = useParams<{ brand: string }>();
  const navigate = useNavigate();
  const toast = useRef<Toast>(null);
  // const [comparisonProducts, setComparisonProducts] = useState<Product[]>([]);
  const [favoriteProducts, setFavoriteProducts] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<string | null>(null);
  const { addProduct } = useComparison();

  const handleAddToComparison = (product: Product) => {
    addProduct(product);
  };

  const productsByBrand: { [key: string]: Array<{ id: string; name: string; price: string; originalPrice?: string; image: string; rating: number; discount?: string }> } = {
    samsung: [
      { id: '1', name: 'Samsung Galaxy S21', price: '$719', originalPrice: '$799', image: '/path/to/samsung1.jpg', rating: 4.5, discount: '10%' },
      { id: '2', name: 'Samsung Galaxy Note 20', price: '$849', originalPrice: '$999', image: '/path/to/samsung2.jpg', rating: 4.7, discount: '15%' },
      { id: '3', name: 'Samsung Galaxy A52', price: '$474', originalPrice: '$499', image: '/path/to/samsung3.jpg', rating: 4.3, discount: '5%' },
      { id: '4', name: 'Samsung Galaxy Z Fold 3', price: '$1439', originalPrice: '$1799', image: '/path/to/samsung4.jpg', rating: 4.8, discount: '20%' }
    ],
    iphone: [
      { id: '5', name: 'iPhone 13', price: '$719', originalPrice: '$799', image: '/path/to/iphone1.jpg', rating: 4.6, discount: '10%' },
      { id: '6', name: 'iPhone 13 Pro', price: '$849', originalPrice: '$999', image: '/path/to/iphone2.jpg', rating: 4.8, discount: '15%' },
      { id: '7', name: 'iPhone 12', price: '$664', originalPrice: '$699', image: '/path/to/iphone3.jpg', rating: 4.4, discount: '5%' },
      { id: '8', name: 'iPhone SE', price: '$319', originalPrice: '$399', image: '/path/to/iphone4.jpg', rating: 4.2, discount: '20%' }
    ]
    // Add more products for other brands
  };

  const products = productsByBrand[brand.toLowerCase()] || [];

  // const sortOptions = [
  //   { label: 'Giá cao - thấp', value: 'priceDesc' },
  //   { label: 'Giá thấp - cao', value: 'priceAsc' },
  //   { label: 'Khuyến mãi hot', value: 'discountDesc' }
  // ];

  const handleSortChange = (value: string) => {
    setSortOption(value);
  };

  const sortedProducts = [...products].sort((a, b) => {
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

  const toggleFavorite = (productId: string) => {
    if (favoriteProducts.includes(productId)) {
      setFavoriteProducts(favoriteProducts.filter(id => id !== productId));
      toast.current?.show({ severity: 'info', summary: 'Thông báo', detail: 'Đã loại khỏi danh sách yêu thích', life: 3000 });
    } else {
      setFavoriteProducts([...favoriteProducts, productId]);
      toast.current?.show({ severity: 'success', summary: 'Thông báo', detail: 'Đã thêm vào danh sách yêu thích', life: 3000 });
    }
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/ /g, '-');
  };

  return (
    <div className="p-4">
      <Toast ref={toast} />
      <h1 className="text-2xl font-bold mb-4">Sản phẩm của {brand}</h1>
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          <Button label="Giá cao - thấp" className={sortOption === 'priceDesc' ? 'p-button-primary border p-3' : 'p-button-secondary border p-0'} onClick={() => handleSortChange('priceDesc')} />
          <Button label="Giá thấp - cao" className={sortOption === 'priceAsc' ? 'p-button-primary border p-3' : 'p-button-secondary border p-0'} onClick={() => handleSortChange('priceAsc')} />
          <Button label="Khuyến mãi hot" className={sortOption === 'discountDesc' ? 'p-button-primary border p-3' : 'p-button-secondary border p-0'} onClick={() => handleSortChange('discountDesc')} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {sortedProducts.map((product) => (
          <div key={product.id} className="p-4 border rounded-lg flex flex-col items-center relative">
            {product.discount && (
              <div className="absolute top-0 left-0 bg-red-500 text-white text-xs font-bold px-2 py-1">
                {product.discount} OFF
              </div>
            )}
            <img src={product.image} alt={product.name} className="w-full h-40 object-cover mb-2" />
            <h3 className="text-lg font-bold text-center">{product.name}</h3>
            <div className="flex items-center space-x-2">
              <span className="text-red-500 font-bold">{product.price}</span>
              {product.originalPrice && (
                <span className="text-gray-500 line-through">{product.originalPrice}</span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col">
                <Link to={`/product/${generateSlug(product.name)}`}>
                  <Button label="Xem chi tiết" className="p-button-secondary mt-2 w-full border p-2" />
                </Link>
                <Button 
                  label="So sánh" 
                  icon="pi pi-exchange" 
                  className="p-button-info mt-2 border p-2" 
                  onClick={() => handleAddToComparison(product)} 
                />
              </div>
              <div className="flex flex-col items-end">
                <Button 
                  label='Yêu thích'
                  icon={`pi ${favoriteProducts.includes(product.id) ? 'pi-heart-fill' : 'pi-heart'}`} 
                  className={`p-button-rounded p-button-text ${favoriteProducts.includes(product.id) ? 'text-red-500' : 'text-gray-500'} mt-5`}  
                  onClick={() => toggleFavorite(product.id)}
                />
                <Rating value={product.rating} readOnly stars={5} cancel={false} className="mt-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <ComparisonBar
        availableProducts={sortedProducts}
      />
    </div>
  );
};

export default UserProductsByBrand;