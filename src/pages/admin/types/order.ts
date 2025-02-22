export interface Order {
    id: string;
    products: Array<{
        name: string;
        quantity: number;
        price: number;
        image: string;
        color: string;
    }>;
    totalAmount: number;
    orderDate: string;
    status: 'pending' | 'paid' | 'shipping' | 'delivered' | 'cancelled';
    paymentMethod: 'cod' | 'bank' | 'pending';
    paymentStatus: 'pending' | 'paid' | 'failed';
    customerInfo: {
        fullName: string;
        phone: string;
        address: string;
    };
}