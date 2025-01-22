import React, { useState, useEffect } from 'react';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { useParams } from 'react-router-dom';

interface Product {
    id: string;
    name: string;
    images: string[];
    specs: {
        os: string;
        cpu: string;
        gpu: string;
        ram: string;
        storage: string;
        rearCamera: string;
        frontCamera: string;
        screenTech: string;
        screenSize: string;
        refreshRate: string;
        brightness: string;
        battery: string;
        charging: string;
    };
}

interface ProductData {
    [key: string]: Product;
}

const UserProductsCompare = () => {
    const [selectedProducts, setSelectedProducts] = useState<(Product | null)[]>([]);
    const [showDialog, setShowDialog] = useState(false);
    const [activeSlot, setActiveSlot] = useState<number | null>(null);
    const { comparisonUrl } = useParams();
    const [activeIndexes] = useState([0]);
    const [products, setProducts] = useState<Product[]>([]);

    

    const productDatabase: ProductData = {
        'samsung-galaxy-s21': {
            id: '1',
            name: 'Samsung Galaxy S21',
            images: ['/images/products/s21.png'],
            specs: {
                os: 'Android 11',
                cpu: 'Exynos 2100',
                gpu: 'Mali-G78 MP14',
                ram: '8GB',
                storage: '128GB',
                rearCamera: '12MP + 12MP + 64MP',
                frontCamera: '10MP',
                screenTech: 'Dynamic AMOLED 2X',
                screenSize: '6.2 inches',
                refreshRate: '120Hz',
                brightness: '1300 nits',
                battery: '4000mAh',
                charging: '25W'
            }
        },
        'samsung-galaxy-note-20': {
            id: '2',
            name: 'Samsung Galaxy Note 20',
            images: ['/images/products/note20.png'],
            specs: {
                os: 'Android 10',
                cpu: 'Exynos 990',
                gpu: 'Mali-G77 MP11',
                ram: '8GB',
                storage: '256GB',
                rearCamera: '12MP + 64MP + 12MP',
                frontCamera: '10MP',
                screenTech: 'Super AMOLED Plus',
                screenSize: '6.7 inches',
                refreshRate: '60Hz',
                brightness: '1200 nits',
                battery: '4300mAh',
                charging: '25W'
            }
        },
        'samsung-galaxy-a52': {
            id: '3',
            name: 'Samsung Galaxy A52',
            images: ['/images/products/a52.png'],
            specs: {
                os: 'Android 11',
                cpu: 'Snapdragon 720G',
                gpu: 'Adreno 618',
                ram: '6GB',
                storage: '128GB',
                rearCamera: '64MP + 12MP + 5MP + 5MP',
                frontCamera: '32MP',
                screenTech: 'Super AMOLED',
                screenSize: '6.5 inches',
                refreshRate: '90Hz',
                brightness: '800 nits',
                battery: '4500mAh',
                charging: '25W'
            }
        },
        'samsung-galaxy-z-fold-3': {
            id: '4',
            name: 'Samsung Galaxy Z Fold 3',
            images: ['/images/products/zfold3.png'],
            specs: {
                os: 'Android 11',
                cpu: 'Snapdragon 888',
                gpu: 'Adreno 660',
                ram: '12GB',
                storage: '256GB',
                rearCamera: '12MP + 12MP + 12MP',
                frontCamera: '4MP + 10MP',
                screenTech: 'Dynamic AMOLED 2X',
                screenSize: '7.6 inches',
                refreshRate: '120Hz',
                brightness: '1200 nits',
                battery: '4400mAh',
                charging: '25W'
            }
        }
    };

    useEffect(() => {
        if (comparisonUrl) {
            const productSlugs = comparisonUrl.split('-vs-');
            console.log('Product slugs:', productSlugs);
    
            const selectedProducts = productSlugs
                .map(slug => {
                    const product = productDatabase[slug];
                    console.log(`Found product for slug ${slug}:`, product);
                    return product;
                })
                .filter(Boolean);
    
            console.log('Selected products:', selectedProducts);
            setProducts(selectedProducts);
        }
    }, [comparisonUrl]);

    const formatProductName = (name: string) => {
        return name
            .split('-')
            .join(' ')
            .toUpperCase();
    };

    const getProductNames = () => {
        if (!comparisonUrl) return '';
        const products = comparisonUrl.split('-vs-');
        return `So sánh sản phẩm<br/>
                ${products.map(formatProductName).join('<br/>&<br/>')}`;
    };

    const ComparisonModule = ({ slot }: { slot: number }) => {
        const product = selectedProducts[slot];
        
        return (
            <div className="border p-4 rounded-lg min-h-[200px]">
                {product ? (
                    <div className="relative">
                        <Button 
                            icon="pi pi-times" 
                            className="absolute top-0 right-0 p-button-rounded p-button-text"
                            onClick={() => removeProduct(slot)}
                        />
                        <h3>{product.name}</h3>
                        {/* Product details */}
                    </div>
                ) : (
                    <Button 
                        label="Thêm sản phẩm" 
                        icon="pi pi-plus"
                        className="p-button-outlined w-full h-full"
                        onClick={() => {
                            setActiveSlot(slot);
                            setShowDialog(true);
                        }}
                    />
                )}
            </div>
        );
    };

    const removeProduct = (slot: number) => {
        const newProducts = [...selectedProducts];
        newProducts[slot] = null;
        setSelectedProducts(newProducts);
    };

    const addProduct = (product: Product) => {
        if (activeSlot !== null) {
            const newProducts = [...selectedProducts];
            newProducts[activeSlot] = product;
            setSelectedProducts(newProducts);
            setShowDialog(false);
            setActiveSlot(null);
        }
    };

    const renderProductCards = () => {
        console.log('Rendering product cards with products:', products);
        return (
            <div className="grid grid-cols-4 gap-4">
                <div>
                    <h2 
                        className="text-xl font-bold"
                        dangerouslySetInnerHTML={{ 
                            __html: getProductNames() 
                        }}
                    />
                </div>
                {products.map((product) => (
                    <div key={product.id} className="p-4 border rounded-lg shadow">
                        <div className="relative">
                            <img 
                                src={product.images[0]} 
                                alt={product.name}
                                className="w-full h-48 object-cover mb-4"
                            />
                            <h3 className="text-lg font-semibold text-center">
                                {product.name}
                            </h3>
                        </div>
                    </div>
                ))}
                {products.length < 3 && (
                    <div className="p-4 border rounded-lg">
                        <Button 
                            label="Thêm sản phẩm" 
                            icon="pi pi-plus"
                            iconPos="left"
                            className="p-button-outlined w-full h-full flex justify-center items-center gap-1"
                            onClick={() => {
                                setActiveSlot(products.length);
                                setShowDialog(true);
                            }}
                        />
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="p-4">
            <div className="flex flex-col gap-8">
                {renderProductCards()}
                {/* Row 1: Title and Product Cards */}
                {/* <div className="grid grid-cols-4 gap-4">
                    <div>
                        <h2 
                            className="text-xl font-bold"
                            dangerouslySetInnerHTML={{ 
                                __html: getProductNames() 
                            }}
                        />
                    </div>
                    {products.map((product, index) => (
                        <div key={product.id} className="p-4 border rounded-lg shadow">
                            <div className="relative">
                                <img 
                                    src={product.images[0]} 
                                    alt={product.name}
                                    className="w-full h-48 object-cover mb-4"
                                />
                                <h3 className="text-lg font-semibold text-center">{product.name}</h3>
                            </div>
                        </div>
                    ))}
                    {products.length < 3 && (
                        <div className="p-4 border rounded-lg">
                            <Button 
                                label="Thêm sản phẩm" 
                                icon="pi pi-plus"
                                iconPos="left"
                                className="p-button-outlined w-full h-full flex justify-center items-center gap-1"
                                onClick={() => {
                                    setActiveSlot(products.length);
                                    setShowDialog(true);
                                }}
                            />
                        </div>
                    )}
                </div> */}

                {/* Row 2: Configuration & Memory */}
                <div className="grid grid-cols-4 gap-4 border rounded-lg">
                    <div className="col-span-4">
                        <Accordion multiple activeIndex={activeIndexes}>
                            <AccordionTab header="Cấu hình & Bộ nhớ">
                                <div className="grid grid-cols-4">
                                    <div className="p-4">
                                        <ul className="list-none p-0 m-0">
                                            <li className="mb-6 pb-2 border-b border-gray-200">Hệ điều hành</li>
                                            <li className="mb-6 pb-2 border-b border-gray-200">Chip xử lí (CPU)</li>
                                            <li className="mb-6 pb-2 border-b border-gray-200">Chip đồ họa (GPU)</li>
                                            <li className="mb-6 pb-2 border-b border-gray-200">RAM</li>
                                            <li className="mb-6">Bộ nhớ</li>
                                        </ul>
                                    </div>
                                    {products.map((product) => (
                                        <div key={product.id} className="flex flex-col gap-4 p-4">
                                            <div className="mb-2 pb-2 border-b border-gray-200">{product.specs.os}</div>
                                            <div className="mb-2 pb-2 border-b border-gray-200">{product.specs.cpu}</div>
                                            <div className="mb-2 pb-2 border-b border-gray-200">{product.specs.gpu}</div>
                                            <div className="mb-2 pb-2 border-b border-gray-200">{product.specs.ram}</div>
                                            <div className="mb-2">{product.specs.storage}</div>
                                        </div>
                                    ))}
                                    <div className="flex flex-col gap-4 p-4">
                                        {/* Empty column for potential third product */}
                                    </div>
                                </div>
                            </AccordionTab>
                        </Accordion>
                    </div>
                </div>

                {/* Row 3: Camera & Display */}
                <div className="grid grid-cols-4 gap-4 border rounded-lg">
                    <div className="col-span-4">
                        <Accordion multiple activeIndex={activeIndexes}>
                            <AccordionTab header="Camera & Màn hình">
                                <div className="grid grid-cols-4">
                                    <div className="p-4">
                                        <ul className="list-none p-0 m-0">
                                            <li className="mb-2 pb-2 border-b border-gray-200">Độ phân giải camera sau</li>
                                            <li className="mb-2 pb-2 border-b border-gray-200">Độ phân giải camera trước</li>
                                            <li className="mb-2 pb-2 border-b border-gray-200">Công nghệ màn hình</li>
                                            <li className="mb-2 pb-2 border-b border-gray-200">Kích thước màn hình</li>
                                            <li className="mb-2 pb-2 border-b border-gray-200">Tần số quét màn hình</li>
                                            <li className="mb-2">Độ sáng tối đa</li>
                                        </ul>
                                    </div>
                                    {products.map((product) => (
                                        <div key={product.id} className="flex flex-col gap-4 p-4">
                                            <div className="mb-2 pb-2 border-b border-gray-200">{product.specs.rearCamera}</div>
                                            <div className="mb-2 pb-2 border-b border-gray-200">{product.specs.frontCamera}</div>
                                            <div className="mb-2 pb-2 border-b border-gray-200">{product.specs.screenTech}</div>
                                            <div className="mb-2 pb-2 border-b border-gray-200">{product.specs.screenSize}</div>
                                            <div className="mb-2 pb-2 border-b border-gray-200">{product.specs.refreshRate}</div>
                                            <div className="mb-2">{product.specs.brightness}</div>
                                        </div>
                                    ))}
                                    <div className="flex flex-col gap-4 p-4">
                                        {/* Empty column for potential third product */}
                                    </div>
                                </div>
                            </AccordionTab>
                        </Accordion>
                    </div>
                </div>

                {/* Row 4: Battery & Charging */}
                <div className="grid grid-cols-4 gap-4 border rounded-lg">
                    <div className="col-span-4">
                        <Accordion multiple activeIndex={activeIndexes}>
                            <AccordionTab header="Pin & Sạc">
                                <div className="grid grid-cols-4">
                                    <div className="p-4">
                                        <ul className="list-none p-0 m-0">
                                            <li className="mb-2 pb-2 border-b border-gray-200">Dung lượng pin</li>
                                            <li className="mb-2">Hỗ trợ sạc tối đa</li>
                                        </ul>
                                    </div>
                                    {products.map((product) => (
                                        <div key={product.id} className="flex flex-col gap-4 p-4">
                                            <div className="mb-2 pb-2 border-b border-gray-200">{product.specs.battery}</div>
                                            <div className="mb-2">{product.specs.charging}</div>
                                        </div>
                                    ))}
                                    <div className="flex flex-col gap-4 p-4">
                                        {/* Empty column for potential third product */}
                                    </div>
                                </div>
                            </AccordionTab>
                        </Accordion>
                    </div>
                </div>

            <Dialog 
                header="Thêm sản phẩm để so sánh" 
                visible={showDialog} 
                onHide={() => setShowDialog(false)}
                style={{ width: '50vw' }}
            >
                {/* Product selection content */}
            </Dialog>
        </div>
        </div>
    );
};

export default UserProductsCompare;