import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from 'primereact/button';

const UserProductsByBrand = () => {
  const { brand } = useParams<{ brand: string }>();
  const productsByBrand: { [key: string]: Array<{ id: string; name: string; price: string; image: string }> } = {
    samsung: [
      { id: '1', name: 'Samsung Galaxy S21', price: '$799', image: '/path/to/samsung1.jpg' },
      { id: '2', name: 'Samsung Galaxy Note 20', price: '$999', image: '/path/to/samsung2.jpg' },
      { id: '3', name: 'Samsung Galaxy A52', price: '$499', image: '/path/to/samsung3.jpg' },
      { id: '4', name: 'Samsung Galaxy Z Fold 3', price: '$1799', image: '/path/to/samsung4.jpg' }
    ],
    iphone: [
      { id: '5', name: 'iPhone 13', price: '$799', image: '/path/to/iphone1.jpg' },
      { id: '6', name: 'iPhone 13 Pro', price: '$999', image: '/path/to/iphone2.jpg' },
      { id: '7', name: 'iPhone 12', price: '$699', image: '/path/to/iphone3.jpg' },
      { id: '8', name: 'iPhone SE', price: '$399', image: '/path/to/iphone4.jpg' }
    ]
    // Add more products for other brands
  };

  const products = productsByBrand[brand.toLowerCase()] || [];

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/ /g, '-');
  };

  console.log('Brand:', brand);
  console.log('Products:', products);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Sản phẩm của {brand}</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {products.map((product) => (
          <div key={product.id} className="p-4 border rounded-lg flex flex-col items-center">
            <img src={product.image} alt={product.name} className="w-full h-40 object-cover mb-2" />
            <h3 className="text-lg font-bold">{product.name}</h3>
            <p className="text-gray-600">{product.price}</p>
            <Link to={`/product/${generateSlug(product.name)}`}>
              <Button label="Xem chi tiết" className="p-button-secondary mt-2" />
            </Link>
            <Button label="Yêu thích" icon="pi pi-heart" className="p-button-danger mt-2" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserProductsByBrand;