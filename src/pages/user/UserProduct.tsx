import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'primereact/button';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Slider } from 'primereact/slider';
import { Checkbox } from 'primereact/checkbox';
import { Carousel } from 'primereact/carousel';

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

  const brands = ['Samsung', 'iPhone', 'Xiaomi', 'Realme', 'Vivo', 'OnePlus', 'Techno'];
  const releaseYears = ['2019', '2020', '2021', '2022', '2023', '2024', '2025'];
  const memoryOptions = ['64GB', '128GB', '256GB', '512GB', '1TB'];
  const ramOptions = ['3GB', '4GB', '6GB', '8GB', '12GB'];
  const screenOptions = ['60Hz', '90Hz', '120Hz', '144Hz'];
  const needsOptions = ['Chơi game/Cấu hình cao', 'Pin khủng trên 5000mAh', 'Chụp ảnh, quay phim', 'Mỏng nhẹ'];
  const featuresOptions = ['Kháng nước, bụi', 'Hỗ trợ 5G', 'Bảo mật khuôn mặt 3D', 'Công nghệ NFC'];
  const productsByBrand: { [key: string]: Array<{ id: string; name: string; price: string; image: string }> } = {
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
    // Add more products for other brands
  };

  interface Product {
    id: string;
    name: string;
    price: string;
    image: string;
  }

  const productTemplate = (product: Product): JSX.Element => {
    const generateSlug = (name: string) => {
      return name.toLowerCase().replace(/ /g, '-');
    };

    return (
      <div className="p-4">
        <img src={product.image} alt={product.name} className="w-full h-40 object-cover mb-2" />
        <h3 className="text-lg font-bold">{product.name}</h3>
        <p className="text-gray-600">{product.price}</p>
        <Link to={`/product/${generateSlug(product.name)}`}>
          <Button label="Xem chi tiết" className="p-button-secondary mt-2" />
        </Link>
      </div>
    );
  };

  const handleFilter = () => {
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

  return (
    <div className="p-4">
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

      {/* Products Section */}
      {Object.keys(productsByBrand).map((brand) => (
        <div key={brand} className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Sản phẩm của {brand}</h2>
            <Link to={`/products/${brand.toLowerCase()}`} className="text-blue-500 hover:underline">Xem tất cả</Link>
          </div>
          <Carousel value={productsByBrand[brand]} itemTemplate={productTemplate} numVisible={4} numScroll={1} />
        </div>
      ))}
    </div>
  );
};

export default UserProduct;