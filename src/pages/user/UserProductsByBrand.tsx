import React, { useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Rating } from 'primereact/rating';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';

const UserProductsByBrand = () => {
  const { brand = '' } = useParams<{ brand: string }>();
  const navigate = useNavigate();
  const toast = useRef<Toast>(null);
  const [comparisonProducts, setComparisonProducts] = useState<Array<{ id: string; name: string; price: string; originalPrice?: string; image: string; discount?: string }>>([]);
  const [showComparisonBar, setShowComparisonBar] = useState(false);
  const [isComparisonBarMinimized, setIsComparisonBarMinimized] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [favoriteProducts, setFavoriteProducts] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<string | null>(null);

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
        {filteredProducts.map((product) => (
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
                <Rating value={product.rating} readOnly stars={5} cancel={false} className="mt-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

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

export default UserProductsByBrand;