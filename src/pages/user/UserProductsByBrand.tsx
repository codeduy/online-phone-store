import React, { useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';

const UserProductsByBrand = () => {
  const { brand } = useParams<{ brand: string }>();
  const navigate = useNavigate();
  const toast = useRef<Toast>(null);
  const [comparisonProducts, setComparisonProducts] = useState<Array<{ id: string; name: string; price: string; image: string }>>([]);
  const [showComparisonBar, setShowComparisonBar] = useState(false);
  const [isComparisonBarMinimized, setIsComparisonBarMinimized] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredProducts = products.filter(product => product.name.toLowerCase().includes(searchTerm.toLowerCase()));

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
            <Button label="So sánh" icon="pi pi-exchange" className="p-button-info mt-2" onClick={() => addToComparison(product)} />
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