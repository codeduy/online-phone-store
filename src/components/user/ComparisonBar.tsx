import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { useNavigate } from 'react-router-dom';
import { Product } from '../../pages/user/types/product';
import { useComparison } from './ComparisonContext';

interface ComparisonBarProps {
  availableProducts: Product[];
}

const ComparisonBar: React.FC<ComparisonBarProps> = ({ availableProducts }) => {
  const { 
    comparisonProducts: products, 
    isMinimized,
    addProduct: onAddProduct,
    removeProduct: onRemoveProduct,
    clearProducts: onClearProducts,
    setMinimized
  } = useComparison();

  const [showDialog, setShowDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const toast = React.useRef<Toast>(null);

  const handleCompareNow = () => {
    if (products.length < 2) {
      toast.current?.show({ 
        severity: 'warn', 
        summary: 'Thông báo', 
        detail: 'Cần ít nhất 2 sản phẩm để so sánh' 
      });
      return;
    }
    const comparisonUrl = products
      .map(product => generateSlug(product.name))
      .join('-vs-');
    navigate(`/products/compare/${comparisonUrl}`);
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/ /g, '-');
  };

  const filteredProducts = availableProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Toast ref={toast} />
      
      {!isMinimized && products.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg p-4 flex justify-center items-center">
          <div className="flex justify-center items-center space-x-4 ml-auto">
            {products.map(product => (
              <div key={product.id} className="p-2 border rounded-lg flex flex-col items-center">
                <img src={product.image} alt={product.name} className="w-20 h-20 object-cover mb-2" />
                <h3 className="text-sm font-bold">{product.name}</h3>
                <Button 
                  icon="pi pi-times" 
                  className="p-button-rounded p-button-danger p-button-text"
                  onClick={() => onRemoveProduct(product.id)}
                />
              </div>
            ))}
            {products.length < 3 && (
              <Button 
                label="Thêm sản phẩm" 
                icon="pi pi-plus" 
                className="p-button-success" 
                onClick={() => setShowDialog(true)} 
              />
            )}
            <div className="p-2 flex flex-col items-center">
              <Button 
                label="So sánh ngay" 
                icon="pi pi-check" 
                className="p-button-primary mb-2 border p-2" 
                onClick={handleCompareNow} 
              />
              <Button 
                label="Xóa tất cả sản phẩm" 
                icon="pi pi-trash" 
                className="p-button-danger border p-2" 
                onClick={onClearProducts} 
              />
            </div>
          </div>
          <Button 
            label="Thu gọn" 
            icon="pi pi-chevron-down" 
            className="p-button-secondary ml-auto" 
            onClick={() => setMinimized(true)} 
          />
        </div>
      )}

      {isMinimized && products.length > 0 && (
        <Button 
          label="Hiện so sánh" 
          icon="pi pi-chevron-up" 
          className="p-button-secondary fixed bottom-0 left-6 m-4 bg-white p-4 border" // Changed right-0 to left-0
          onClick={() => setMinimized(false)} 
      />
      )}

      <Dialog 
        header="Thêm sản phẩm để so sánh" 
        visible={showDialog} 
        style={{ width: '50vw' }} 
        onHide={() => setShowDialog(false)}
      >
        <div className="p-inputgroup">
          <InputText 
            placeholder="Tìm kiếm sản phẩm" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
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
                label={products.some(p => p.id === product.id) ? "Đã thêm" : "Thêm"}
                className="p-button-success"
                onClick={() => onAddProduct(product)}
                disabled={products.some(p => p.id === product.id)}
              />
            </div>
          ))}
        </div>
      </Dialog>
    </>
  );
};

export default ComparisonBar; 