import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Slider } from 'primereact/slider';
import { Checkbox } from 'primereact/checkbox';
import { Carousel } from 'primereact/carousel';
import { Toast } from 'primereact/toast';
import { Rating } from 'primereact/rating';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';

const UserProduct = () => {
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000000]);
  const [selectedMemory, setSelectedMemory] = useState<string[]>([]);
  const [selectedRam, setSelectedRam] = useState<string[]>([]);
  const [selectedScreen, setSelectedScreen] = useState<string[]>([]);
  const [selectedNeeds, setSelectedNeeds] = useState<string[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const brandOverlayRef = useRef<OverlayPanel>(null);
  const priceOverlayRef = useRef<OverlayPanel>(null);
  const yearOverlayRef = useRef<OverlayPanel>(null);
  const memoryOverlayRef = useRef<OverlayPanel>(null);
  const ramOverlayRef = useRef<OverlayPanel>(null);
  const screenOverlayRef = useRef<OverlayPanel>(null);
  const needsOverlayRef = useRef<OverlayPanel>(null);
  const featuresOverlayRef = useRef<OverlayPanel>(null);
  const [favoriteProducts, setFavoriteProducts] = useState<string[]>([]);
  const [comparisonProducts, setComparisonProducts] = useState<Product[]>([]);
  const [showComparisonBar, setShowComparisonBar] = useState(false);
  const [isComparisonBarMinimized, setIsComparisonBarMinimized] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const toast = useRef<Toast>(null);
  const navigate = useNavigate();

  const brands = ['Samsung', 'iPhone', 'Xiaomi', 'Realme', 'Vivo', 'OnePlus', 'Techno'];
  const releaseYears = ['2019', '2020', '2021', '2022', '2023', '2024', '2025'];
  const memoryOptions = ['64GB', '128GB', '256GB', '512GB', '1TB'];
  const ramOptions = ['3GB', '4GB', '6GB', '8GB', '12GB'];
  const screenOptions = ['60Hz', '90Hz', '120Hz', '144Hz'];
  const needsOptions = ['Chơi game/Cấu hình cao', 'Pin khủng trên 5000mAh', 'Chụp ảnh, quay phim', 'Mỏng nhẹ'];
  const featuresOptions = ['Kháng nước, bụi', 'Hỗ trợ 5G', 'Bảo mật khuôn mặt 3D', 'Công nghệ NFC'];
  // const products: Array<{ id: string; name: string; price: string; image: string; rating: number }> = [
  //   { id: '1', name: 'Samsung Galaxy S21', price: '$799', image: '/path/to/samsung1.jpg', rating: 4.5 },
  //   { id: '2', name: 'Samsung Galaxy Note 20', price: '$999', image: '/path/to/samsung2.jpg', rating: 4.7 },
  //   { id: '3', name: 'Samsung Galaxy A52', price: '$499', image: '/path/to/samsung3.jpg', rating: 4.3 },
  //   { id: '4', name: 'Samsung Galaxy Z Fold 3', price: '$1799', image: '/path/to/samsung4.jpg', rating: 4.8 },
  //   { id: '5', name: 'iPhone 13', price: '$799', image: '/path/to/iphone1.jpg', rating: 4.6 },
  //   { id: '6', name: 'iPhone 13 Pro', price: '$999', image: '/path/to/iphone2.jpg', rating: 4.8 },
  //   { id: '7', name: 'iPhone 12', price: '$699', image: '/path/to/iphone3.jpg', rating: 4.4 },
  //   { id: '8', name: 'iPhone SE', price: '$399', image: '/path/to/iphone4.jpg', rating: 4.2 }
  // ];

  interface Product {
      id: string;
      name: string;
      price: string;
      originalPrice?: string;
      image: string;
      rating: number;
      discount?: string;
  }

  const productsByBrand: { [key: string]: Array<{ id: string; name: string; price: string; originalPrice?: string; image: string; rating: number; discount?: string}> } = {
    Samsung: [
      { id: '1', name: 'Samsung Galaxy S21', price: '$719', originalPrice: '$799', image: '/path/to/samsung1.jpg', rating: 4.5, discount: '10%' },
      { id: '2', name: 'Samsung Galaxy Note 20', price: '$849', originalPrice: '$999', image: '/path/to/samsung2.jpg', rating: 4.7, discount: '15%' },
      { id: '3', name: 'Samsung Galaxy A52', price: '$474', originalPrice: '$499', image: '/path/to/samsung3.jpg', rating: 4.3, discount: '5%' },
      { id: '4', name: 'Samsung Galaxy Z Fold 3', price: '$1439', originalPrice: '$1799', image: '/path/to/samsung4.jpg', rating: 4.8, discount: '20%' },
      { id: '5', name: 'Samsung Galaxy Z Fold 3', price: '$1799', originalPrice: '$1799', image: '/path/to/samsung4.jpg', rating: 4.8,  discount: '20%' }
    ],
    iPhone: [
      { id: '5', name: 'iPhone 13', price: '$719', originalPrice: '$799', image: '/path/to/iphone1.jpg', rating: 4.6, discount: '10%' },
      { id: '6', name: 'iPhone 13 Pro', price: '$849', originalPrice: '$999', image: '/path/to/iphone2.jpg', rating: 4.8, discount: '15%' },
      { id: '7', name: 'iPhone 12', price: '$474', originalPrice: '$499', image: '/path/to/iphone3.jpg', rating: 4.4, discount: '5%' },
      { id: '8', name: 'iPhone SE', price: '$1439', originalPrice: '$1799', image: '/path/to/iphone4.jpg', rating: 4.2, discount: '20%' },
      { id: '9', name: 'iPhone SE', price: '$1799', originalPrice: '$1799', image: '/path/to/iphone4.jpg', rating: 4.2,  discount: '20%' }
    ]
    // Add more products for other brands
  };

  // interface BrandProducts {
  //   [key: string]: Product[];
  // }

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
      <div className="p-2 border rounded shadow-md mr-3 relative">
        {product.discount && (
          <div className="absolute top-0 left-0 bg-red-500 text-white text-xs font-bold px-2 py-1">
            {product.discount} OFF
          </div>
        )}
        <img src={product.image} alt={product.name} className="w-full h-40 object-cover mb-2" />
        <div className="flex flex-col items-center">
        <h3 className="text-lg font-bold text-center">{product.name}</h3>
        <div className="flex items-center space-x-2">
          <span className="text-red-500 font-bold">{product.price}</span>
          {product.originalPrice && (
            <span className="text-gray-500 line-through">{product.originalPrice}</span>
          )}
        </div>
      </div>
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

  const handleFilter = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Implement filtering logic here
    console.log('Filtering products...');
  };

  const handleCheckboxChange = (selectedItems: string[], setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {
    if (selectedItems.includes(value)) {
      setSelectedItems(selectedItems.filter(item => item !== value));
    } else {
      setSelectedItems([...selectedItems, value]);
    }
  };

  const filteredProducts = Object.values(productsByBrand).flat().filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4">
      <Toast ref={toast} />

      {/* Filter Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Button label="Hãng" className="p-button-secondary border p-2" onClick={(e) => brandOverlayRef.current?.toggle(e)} />
            <OverlayPanel ref={brandOverlayRef} className="w-64">
              {brands.map((brand) => (
                <div key={brand} className="p-field-checkbox p-2 cursor-pointer">
                  <Checkbox className='border' inputId={brand} value={brand} onChange={(e) => handleCheckboxChange(selectedBrands, setSelectedBrands, brand)} checked={selectedBrands.includes(brand)} />
                  <label htmlFor={brand} className="ml-2 cursor-pointer">{brand}</label>
                </div>
              ))}
            </OverlayPanel>
          </div>
          <div>
            <Button label="Giá" className="p-button-secondary border p-2" onClick={(e) => priceOverlayRef.current?.toggle(e)} />
            <OverlayPanel ref={priceOverlayRef} className="w-64">
              <Slider value={priceRange} onChange={(e) => setPriceRange(e.value as [number, number])} range min={0} max={50000000} />
              <p>Giá: {priceRange[0].toLocaleString()}đ - {priceRange[1].toLocaleString()}đ</p>
            </OverlayPanel>
          </div>
          <div>
            <Button label="Năm ra mắt" className="p-button-secondary border p-2" onClick={(e) => yearOverlayRef.current?.toggle(e)} />
            <OverlayPanel ref={yearOverlayRef} className="w-64">
              {releaseYears.map((year) => (
                <div key={year} className="p-field-checkbox p-2 cursor-pointer">
                  <Checkbox className='border' inputId={year} value={year} onChange={(e) => handleCheckboxChange(selectedYears, setSelectedYears, year)} checked={selectedYears.includes(year)} />
                  <label htmlFor={year} className="ml-2 cursor-pointer">{year}</label>
                </div>
              ))}
            </OverlayPanel>
          </div>
          <div>
            <Button label="Bộ nhớ trong" className="p-button-secondary border p-2" onClick={(e) => memoryOverlayRef.current?.toggle(e)} />
            <OverlayPanel ref={memoryOverlayRef} className="w-64">
              {memoryOptions.map((memory) => (
                <div key={memory} className="p-field-checkbox p-2 cursor-pointer">
                  <Checkbox className='border' inputId={memory} value={memory} onChange={(e) => handleCheckboxChange(selectedMemory, setSelectedMemory, memory)} checked={selectedMemory.includes(memory)} />
                  <label htmlFor={memory} className="ml-2 cursor-pointer">{memory}</label>
                </div>
              ))}
            </OverlayPanel>
          </div>
          <div>
            <Button label="Dung lượng ram" className="p-button-secondary border p-2" onClick={(e) => ramOverlayRef.current?.toggle(e)} />
            <OverlayPanel ref={ramOverlayRef} className="w-64">
              {ramOptions.map((ram) => (
                <div key={ram} className="p-field-checkbox p-2 cursor-pointer">
                  <Checkbox className='border' inputId={ram} value={ram} onChange={(e) => handleCheckboxChange(selectedRam, setSelectedRam, ram)} checked={selectedRam.includes(ram)} />
                  <label htmlFor={ram} className="ml-2 cursor-pointer">{ram}</label>
                </div>
              ))}
            </OverlayPanel>
          </div>
          <div>
            <Button label="Màn hình" className="p-button-secondary border p-2" onClick={(e) => screenOverlayRef.current?.toggle(e)} />
            <OverlayPanel ref={screenOverlayRef} className="w-64">
              {screenOptions.map((screen) => (
                <div key={screen} className="p-field-checkbox p-2 cursor-pointer">
                  <Checkbox className='border' inputId={screen} value={screen} onChange={(e) => handleCheckboxChange(selectedScreen, setSelectedScreen, screen)} checked={selectedScreen.includes(screen)} />
                  <label htmlFor={screen} className="ml-2 cursor-pointer">{screen}</label>
                </div>
              ))}
            </OverlayPanel>
          </div>
          <div>
            <Button label="Nhu cầu" className="p-button-secondary border p-2" onClick={(e) => needsOverlayRef.current?.toggle(e)} />
            <OverlayPanel ref={needsOverlayRef} className="w-64">
              {needsOptions.map((need) => (
                <div key={need} className="p-field-checkbox p-2 cursor-pointer">
                  <Checkbox className='border' inputId={need} value={need} onChange={(e) => handleCheckboxChange(selectedNeeds, setSelectedNeeds, need)} checked={selectedNeeds.includes(need)} />
                  <label htmlFor={need} className="ml-2 cursor-pointer">{need}</label>
                </div>
              ))}
            </OverlayPanel>
          </div>
          <div>
            <Button label="Tính năng đặc biệt" className="p-button-secondary border p-2" onClick={(e) => featuresOverlayRef.current?.toggle(e)} />
            <OverlayPanel ref={featuresOverlayRef} className="w-64">
              {featuresOptions.map((feature) => (
                <div key={feature} className="p-field-checkbox p-2 cursor-pointer">
                  <Checkbox className='border' inputId={feature} value={feature} onChange={(e) => handleCheckboxChange(selectedFeatures, setSelectedFeatures, feature)} checked={selectedFeatures.includes(feature)} />
                  <label htmlFor={feature} className="ml-2 cursor-pointer">{feature}</label>
                </div>
              ))}
            </OverlayPanel>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <Button label="Lọc" icon="pi pi-filter" className="p-button-primary border p-2" onClick={handleFilter} />
        </div>
      </div>
      {/* End Filter Section */}        

      {/* <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Sản phẩm</h2>
        <Carousel value={products} itemTemplate={productTemplate} numVisible={4} numScroll={1} />
      </div> */}

      {/* Products Section */}   
      {Object.keys(productsByBrand).map((brand) => (
        <div key={brand} className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Sản phẩm của {brand}</h2>
            <Link to={`/products/${brand.toLowerCase()}`}>
              <Button label="Xem tất cả" icon="pi pi-angle-right" iconPos="right" className="p-button-secondary" />
            </Link>
          </div>
          <Carousel value={productsByBrand[brand]} itemTemplate={productTemplate} numVisible={4} numScroll={1} />
        </div>
      ))}
      {/* End Products Section */}   

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

export default UserProduct;