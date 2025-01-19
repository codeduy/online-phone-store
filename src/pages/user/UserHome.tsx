import React, { useState, useRef } from 'react';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Rating } from 'primereact/rating';
import { Link, useNavigate } from 'react-router-dom';
import { Carousel } from 'primereact/carousel';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';

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
  const [comparisonProducts, setComparisonProducts] = useState<Product[]>([]);
  const [showComparisonBar, setShowComparisonBar] = useState(false);
  const [isComparisonBarMinimized, setIsComparisonBarMinimized] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const toast = useRef<Toast>(null);
  const navigate = useNavigate();

  const toggleFavorite = (productId: string) => {
    if (favoriteProducts.includes(productId)) {
      setFavoriteProducts(favoriteProducts.filter(id => id !== productId));
      toast.current?.show({ severity: 'info', summary: 'Thông báo', detail: 'Đã loại khỏi danh sách yêu thích', life: 3000 });
    } else {
      setFavoriteProducts([...favoriteProducts, productId]);
      toast.current?.show({ severity: 'success', summary: 'Thông báo', detail: 'Đã thêm vào danh sách yêu thích', life: 3000 });
    }
  };

  const addToComparison = (product: Product) => {
    if (!comparisonProducts.some(p => p.id === product.id)) {
      if (comparisonProducts.length >= 3) {
        toast.current?.show({ 
          severity: 'warn', 
          summary: 'Thông báo', 
          detail: 'Chỉ có thể so sánh tối đa 3 sản phẩm', 
          life: 3000 
        });
        return;
      }
      setComparisonProducts([...comparisonProducts, product]);
      setShowComparisonBar(true);
      setIsComparisonBarMinimized(false);
      // toast.current?.show({ 
      //   severity: 'success', 
      //   summary: 'Thông báo', 
      //   detail: 'Đã thêm vào danh sách so sánh', 
      //   life: 3000 
      // });
    } else {
      toast.current?.show({ 
        severity: 'info', 
        summary: 'Thông báo', 
        detail: 'Sản phẩm đã có trong danh sách so sánh', 
        life: 3000 
      });
    }
  };

  const handleCompareNow = () => {
    if (comparisonProducts.length < 2) {
      toast.current?.show({ 
        severity: 'warn', 
        summary: 'Thông báo', 
        detail: 'Cần ít nhất 2 sản phẩm để so sánh', 
        life: 3000 
      });
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

  const clearComparison = () => {
    setComparisonProducts([]);
    setShowComparisonBar(false);
    setIsComparisonBarMinimized(false);
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
              onClick={() => addToComparison(product)} 
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

  const filteredProducts = Object.values(bestSellingProductsByBrand).flat().filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                      onClick={() => addToComparison(product)} 
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

      {showComparisonBar && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg p-4 flex justify-center items-center">
          <div className="flex justify-center items-center space-x-4 ml-auto">
            {comparisonProducts.map(product => (
              <div key={product.id} className="p-2 border rounded-lg flex flex-col items-center">
                <img src={product.image} alt={product.name} className="w-20 h-20 object-cover mb-2" />
                <h3 className="text-sm font-bold">{product.name}</h3>
                <Button label="X" className="p-button-danger mt-2" onClick={() => setComparisonProducts(comparisonProducts.filter(p => p.id !== product.id))} />
              </div>
            ))}
            {comparisonProducts.length < 3 && (
              <Button label="Thêm sản phẩm" icon="pi pi-plus" className="p-button-success" onClick={() => setShowDialog(true)} />
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

      <Dialog header="Thêm sản phẩm để so sánh" visible={showDialog} style={{ width: '50vw' }} onHide={() => setShowDialog(false)}>
        <div className="p-inputgroup">
          <InputText placeholder="Tìm kiếm sản phẩm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
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

export default UserHome;