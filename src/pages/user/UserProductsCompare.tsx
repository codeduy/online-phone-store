import React, { useState, useRef } from 'react';
import { PanelMenu } from 'primereact/panelmenu';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { DataView } from 'primereact/dataview';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { useParams } from 'react-router-dom';

interface Product {
    id: string;
    name: string;
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

const UserProductsCompare = () => {
    const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
    const [showDialog, setShowDialog] = useState(false);
    const [activeSlot, setActiveSlot] = useState<number | null>(null);
    const { comparisonUrl } = useParams();
    const [activeIndexes] = useState([0]);

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

    const specMenuItems = [
        {
            label: 'Cấu hình & Bộ nhớ',
            items: [
                { label: 'Hệ điều hành' },
                { label: 'Chip xử lí (CPU)' },
                { label: 'Chip đồ họa (GPU)' },
                { label: 'RAM' },
                { label: 'Bộ nhớ' }
            ]
        },
        {
            label: 'Camera & Màn hình',
            items: [
                { label: 'Độ phân giải camera sau' },
                { label: 'Độ phân giải camera trước' },
                { label: 'Công nghệ màn hình' },
                { label: 'Kích thước màn hình' },
                { label: 'Tần số quét màn hình' },
                { label: 'Độ sáng tối đa' }
            ]
        },
        {
            label: 'Pin & Sạc',
            items: [
                { label: 'Dung lượng pin' },
                { label: 'Hỗ trợ sạc tối đa' }
            ]
        }
    ];

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

    return (
        <div className="p-4">
            <div className="flex flex-col gap-8">
                {/* Row 1: Title and Product Comparison Modules */}
                <div className="grid grid-cols-4 gap-4">
                    <div>
                        <h2 
                            className="text-xl font-bold"
                            dangerouslySetInnerHTML={{ 
                                __html: getProductNames() 
                            }}
                        />
                    </div>
                    {[0, 1, 2].map((slot) => (
                        <div key={slot}>
                            <ComparisonModule slot={slot} />
                        </div>
                    ))}
                </div>

                {/* Row 2: Configuration & Memory */}
                <div className="grid grid-cols-4 gap-4">
                    <div>
                        <Accordion multiple activeIndex={activeIndexes}>
                            <AccordionTab header="Cấu hình & Bộ nhớ">
                                <ul className="list-none p-0 m-0">
                                    <li className="mb-2 pb-2 border-b border-gray-200">Hệ điều hành</li>
                                    <li className="mb-2 pb-2 border-b border-gray-200">Chip xử lí (CPU)</li>
                                    <li className="mb-2 pb-2 border-b border-gray-200">Chip đồ họa (GPU)</li>
                                    <li className="mb-2 pb-2 border-b border-gray-200">RAM</li>
                                    <li className="mb-2">Bộ nhớ</li>
                                </ul>
                            </AccordionTab>
                        </Accordion>
                    </div>
                    {[0, 1, 2].map((slot) => (
                        selectedProducts[slot] && (
                            <div key={slot} className="flex flex-col gap-4">
                                <div>{selectedProducts[slot].specs.os}</div>
                                <div>{selectedProducts[slot].specs.cpu}</div>
                                <div>{selectedProducts[slot].specs.gpu}</div>
                                <div>{selectedProducts[slot].specs.ram}</div>
                                <div>{selectedProducts[slot].specs.storage}</div>
                            </div>
                        )
                    ))}
                </div>

                {/* Row 3: Camera & Display */}
                <div className="grid grid-cols-4 gap-4">
                    <div>
                    <Accordion multiple activeIndex={activeIndexes}>
                        <AccordionTab header="Camera & Màn hình">
                            <ul className="list-none p-0 m-0">
                                <li className="mb-2 pb-2 border-b border-gray-200">Độ phân giải camera sau</li>
                                <li className="mb-2 pb-2 border-b border-gray-200">Độ phân giải camera trước</li>
                                <li className="mb-2 pb-2 border-b border-gray-200">Công nghệ màn hình</li>
                                <li className="mb-2 pb-2 border-b border-gray-200">Kích thước màn hình</li>
                                <li className="mb-2 pb-2 border-b border-gray-200">Tần số quét màn hình</li>
                                <li className="mb-2">Độ sáng tối đa</li>
                            </ul>
                        </AccordionTab>
                    </Accordion>
                    </div>
                    {[0, 1, 2].map((slot) => (
                        selectedProducts[slot] && (
                            <div key={slot} className="flex flex-col gap-4">
                                <div>{selectedProducts[slot].specs.rearCamera}</div>
                                <div>{selectedProducts[slot].specs.frontCamera}</div>
                                <div>{selectedProducts[slot].specs.screenTech}</div>
                                <div>{selectedProducts[slot].specs.screenSize}</div>
                                <div>{selectedProducts[slot].specs.refreshRate}</div>
                                <div>{selectedProducts[slot].specs.brightness}</div>
                            </div>
                        )
                    ))}
                </div>

                {/* Row 4: Battery & Charging */}
                <div className="grid grid-cols-4 gap-4">
                    <div>
                        <Accordion multiple activeIndex={activeIndexes}>
                            <AccordionTab header="Pin & Sạc">
                                <ul className="list-none p-0 m-0">
                                    <li className="mb-2 pb-2 border-b border-gray-200">Dung lượng pin</li>
                                    <li className="mb-2">Hỗ trợ sạc tối đa</li>
                                </ul>
                            </AccordionTab>
                        </Accordion>
                    </div>
                    {[0, 1, 2].map((slot) => (
                        selectedProducts[slot] && (
                            <div key={slot} className="flex flex-col gap-4">
                                <div>{selectedProducts[slot].specs.battery}</div>
                                <div>{selectedProducts[slot].specs.charging}</div>
                            </div>
                        )
                    ))}
                </div>
            </div>

            {/* Product Selection Dialog */}
            <Dialog 
                header="Thêm sản phẩm để so sánh" 
                visible={showDialog} 
                onHide={() => setShowDialog(false)}
                style={{ width: '50vw' }}
            >
                {/* Product selection content */}
            </Dialog>
        </div>
    );
};

export default UserProductsCompare;