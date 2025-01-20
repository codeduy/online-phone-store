import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { Rating } from 'primereact/rating';

const UserProductsFilter = () => {
  const [sortOption, setSortOption] = useState<string | null>(null);

  interface Product {
    id: string;
    name: string;
    price: string;
    originalPrice?: string;
    image: string;
    rating: number;
    discount?: string;
  }

  const products: Product[] = [
    { id: '1', name: 'Samsung Galaxy S21', price: '$719', originalPrice: '$799', image: '/path/to/samsung1.jpg', rating: 4.5, discount: '10%' },
    { id: '2', name: 'Samsung Galaxy Note 20', price: '$849', originalPrice: '$999', image: '/path/to/samsung2.jpg', rating: 4.7, discount: '15%' },
    { id: '3', name: 'Samsung Galaxy A52', price: '$474', originalPrice: '$499', image: '/path/to/samsung3.jpg', rating: 4.3, discount: '5%' },
    { id: '4', name: 'Samsung Galaxy Z Fold 3', price: '$1439', originalPrice: '$1799', image: '/path/to/samsung4.jpg', rating: 4.8, discount: '20%' }
    // Add more products here
  ];

  const handleSortChange = (option: string) => {
    setSortOption(option);
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

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Lọc sản phẩm theo yêu cầu</h1>
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          <Button label="Giá thấp - cao" className={sortOption === 'priceAsc' ? 'p-button-primary' : 'p-button-secondary'} onClick={() => handleSortChange('priceAsc')} />
          <Button label="Giá cao - thấp" className={sortOption === 'priceDesc' ? 'p-button-primary' : 'p-button-secondary'} onClick={() => handleSortChange('priceDesc')} />
          <Button label="Khuyến mãi hot" className={sortOption === 'discountDesc' ? 'p-button-primary' : 'p-button-secondary'} onClick={() => handleSortChange('discountDesc')} />
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
            <Rating value={product.rating} readOnly stars={5} cancel={false} className="mt-2" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserProductsFilter;