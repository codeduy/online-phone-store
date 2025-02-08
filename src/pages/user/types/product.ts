export interface Product {
    id: string;
    name: string;
    price: string;
    originalPrice?: string;
    image: string;
    rating: number;
    discount?: string;
}