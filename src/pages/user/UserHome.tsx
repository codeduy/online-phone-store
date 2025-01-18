import React from 'react';
import { Link } from 'react-router-dom';
import { Carousel } from 'primereact/carousel';
import { Button } from 'primereact/button';

const UserHome = () => {
  interface HotProduct {
    id: string;
    name: string;
    price: string;
    image: string;
  }

  const hotProducts: HotProduct[] = [
    { id: '1', name: 'Samsung Galaxy S21', price: '$799', image: '/path/to/samsung1.jpg' },
    { id: '2', name: 'Samsung Galaxy Note 20', price: '$999', image: '/path/to/samsung2.jpg' },
    { id: '3', name: 'Samsung Galaxy A52', price: '$499', image: '/path/to/samsung3.jpg' },
    { id: '4', name: 'Samsung Galaxy Z Fold 3', price: '$1799', image: '/path/to/samsung4.jpg' }
  ];

  type Product = {
    id: string;
    name: string;
    price: string;
    image: string;
  };
  
  type BrandProducts = {
    [key: string]: Product[];
  };
  
  const bestSellingProductsByBrand: BrandProducts = {
      Samsung: [
        { id: '1', name: 'Samsung Galaxy S21', price: '$799', image: '/path/to/samsung1.jpg' },
        { id: '2', name: 'Samsung Galaxy Note 20', price: '$999', image: '/path/to/samsung2.jpg' },
        { id: '3', name: 'Samsung Galaxy A52', price: '$499', image: '/path/to/samsung3.jpg' },
        { id: '4', name: 'Samsung Galaxy Z Fold 3', price: '$1799', image: '/path/to/samsung4.jpg' }
      ],
      iPhone: [
        { id: '5', name: 'iPhone 13', price: '$799', image: '/path/to/iphone1.jpg' },
        { id: '6', name: 'iPhone 13 Pro', price: '$999', image: '/path/to/iphone2.jpg' },
        { id: '7', name: 'iPhone 12', price: '$699', image: '/path/to/iphone3.jpg' },
        { id: '8', name: 'iPhone SE', price: '$399', image: '/path/to/iphone4.jpg' }
      ]
    };

  interface ProductTemplateProps {
    id: string;
    name: string;
    price: string;
    image: string;
  }

  const productTemplate = (product: ProductTemplateProps): JSX.Element => {
    return (
      <div className="p-4">
        <img src={product.image} alt={product.name} className="w-full h-40 object-cover mb-2" />
        <h3 className="text-lg font-bold">{product.name}</h3>
        <p className="text-gray-600">{product.price}</p>
        <Button label="Xem chi tiết" className="p-button-secondary mt-2" />
      </div>
    );
  };

  return (
    <div className="p-4">
      {/* Banner Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="md:col-span-2 border">
          <Link to="/products">
            <img src="/path/to/banner1.jpg" alt="Banner 1" className="w-full h-64 object-cover" />
          </Link>
        </div>
        <div className="grid grid-rows-2 gap-4">
          <Link to="/products">
            <img src="/path/to/banner2.jpg" alt="Banner 2" className="w-full h-32 object-cover border" />
          </Link>
          <Link to="/products">
            <img src="/path/to/banner3.jpg" alt="Banner 3" className="w-full h-32 object-cover border" />
          </Link>
        </div>
      </div>

      {/* Hot Products Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Sản phẩm hot</h2>
        <Carousel value={hotProducts} itemTemplate={productTemplate} numVisible={4} numScroll={1} />
      </div>

      {/* Best Selling Products by Brand Section */}
      {Object.keys(bestSellingProductsByBrand).map((brand) => (
        <div key={brand} className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Bán chạy nhất của {brand}</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {bestSellingProductsByBrand[brand].map((product) => (
              <div key={product.id} className="p-4 border rounded shadow-md">
                <img src={product.image} alt={product.name} className="w-full h-40 object-cover mb-2" />
                <h3 className="text-lg font-bold">{product.name}</h3>
                <p className="text-gray-600">{product.price}</p>
                <Button label="Xem chi tiết" className="p-button-secondary mt-2" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserHome;