import React, { useState, useRef } from 'react';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Rating } from 'primereact/rating';
import { Link, useNavigate } from 'react-router-dom';
import { Carousel } from 'primereact/carousel';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import ComparisonBar from '../../components/user/ComparisonBar';
import { useComparison } from '../../components/user/ComparisonContext';

interface Product {
  id: string;
  name: string;
  price: string;
  image: string;
  rating: number;
}

interface BrandProducts {
  [key: string]: Product[];
}

const bestSellingProductsByBrand: BrandProducts = {
  Samsung: [
    { id: '1', name: 'Samsung Galaxy S21', price: '$799', image: '/path/to/samsung1.jpg', rating: 4.5 },
    { id: '2', name: 'Samsung Galaxy Note 20', price: '$999', image: '/path/to/samsung2.jpg', rating: 4.5 },
    { id: '3', name: 'Samsung Galaxy A52', price: '$499', image: '/path/to/samsung3.jpg', rating: 4.5 },
    { id: '4', name: 'Samsung Galaxy Z Fold 3', price: '$1799', image: '/path/to/samsung4.jpg', rating: 4.5 }
  ],
  iPhone: [
    { id: '5', name: 'iPhone 13', price: '$799', image: '/path/to/iphone1.jpg', rating: 4.5 },
    { id: '6', name: 'iPhone 13 Pro', price: '$999', image: '/path/to/iphone2.jpg', rating: 4.5 },
    { id: '7', name: 'iPhone 12', price: '$699', image: '/path/to/iphone3.jpg', rating: 4.5 },
    { id: '8', name: 'iPhone SE', price: '$399', image: '/path/to/iphone4.jpg', rating: 4.5 }
  ]
  // Add more products for other brands
};

const hotProducts: Product[] = [
  { id: '9', name: 'Hot Product 1', price: '$299', image: '/path/to/hotproduct1.jpg', rating: 4.5 },
  { id: '10', name: 'Hot Product 2', price: '$399', image: '/path/to/hotproduct2.jpg', rating: 4.5 },
  { id: '11', name: 'Hot Product 3', price: '$499', image: '/path/to/hotproduct3.jpg', rating: 4.5 },
  { id: '12', name: 'Hot Product 4', price: '$599', image: '/path/to/hotproduct4.jpg', rating: 4.5 }   
];

const UserHome = () => {
  const [favoriteProducts, setFavoriteProducts] = useState<string[]>([]);
  // const [comparisonProducts, setComparisonProducts] = useState<Product[]>([]);
  const toast = useRef<Toast>(null);
  const navigate = useNavigate();
  const { addProduct } = useComparison();

  const handleAddToComparison = (product: Product) => {
    addProduct(product);
  };
  
  const toggleFavorite = (productId: string) => {
    if (favoriteProducts.includes(productId)) {
      setFavoriteProducts(favoriteProducts.filter(id => id !== productId));
      toast.current?.show({ severity: 'info', summary: 'Thông báo', detail: 'Đã loại khỏi danh sách yêu thích', life: 3000 });
    } else {
      setFavoriteProducts([...favoriteProducts, productId]);
      toast.current?.show({ severity: 'success', summary: 'Thông báo', detail: 'Đã thêm vào danh sách yêu thích', life: 3000 });
    }
  };

  const productTemplate = (product: Product): JSX.Element => {
    return (
      <div className="p-2 border rounded shadow-md mr-3">
        <img src={product.image} alt={product.name} className="w-full h-40 object-cover mb-2" />
        <h3 className="text-lg font-bold">{product.name}</h3>
        <p className="text-gray-600">{product.price}</p>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col">
            <Link to={`/product/${generateSlug(product.name)}`}>
              <Button label="Xem chi tiết" className="p-button-secondary mt-2 w-full border p-2" />
            </Link>
            <Button 
              label="So sánh" 
              icon="pi pi-exchange" 
              className="p-button-info mt-2 w-full border p-2" 
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
            <Rating value={product.rating} readOnly stars={5} cancel={false} className="mt-5" />
          </div>
        </div>
      </div>
    );
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/ /g, '-');
  };

  return (     
    <div className="p-4">
      <Toast ref={toast} />

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
      {/* End Banner Section */}
    
      {/* Hot Product Sections */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Sản phẩm hot</h2>
        <Carousel value={hotProducts} itemTemplate={productTemplate} numVisible={4} numScroll={1} />
      </div>
      {/* End Hot Product Sections */}

      {/* Best selling Product Sections */}
      {Object.keys(bestSellingProductsByBrand).map((brand) => (
        <div key={brand} className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Bán chạy nhất của {brand}</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {bestSellingProductsByBrand[brand].map((product) => (
              <div key={product.id} className="p-4 border rounded shadow-md">
                <img src={product.image} alt={product.name} className="w-full h-40 object-cover mb-2" />
                <h3 className="text-lg font-bold">{product.name}</h3>
                <p className="text-gray-600">{product.price}</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col">
                    <Link to={`/product/${generateSlug(product.name)}`}>
                      <Button label="Xem chi tiết" className="p-button-secondary mt-2 w-full border p-2" />
                    </Link>
                    <Button 
                      label="So sánh" 
                      icon="pi pi-exchange" 
                      className="p-button-info mt-2 w-full border p-2" 
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
                    <Rating value={product.rating} readOnly stars={5} cancel={false} className="mt-5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      {/* End Best selling Product Sections */}

      <ComparisonBar
        availableProducts={[...Object.values(bestSellingProductsByBrand).flat(), ...hotProducts]}
      />
    </div>
  );
};

export default UserHome;