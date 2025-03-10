import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
// import { Helmet } from 'react-helmet';

    interface CartContextType {
        cartItems: CartItem[];
        setCartItems: (items: CartItem[]) => void; 
        cartCount: number;
        loading: boolean;
        error: string | null;
        addToCart: (productId: string, quantity: number, formattedName?: string) => Promise<void>;
        removeFromCart: (itemId: string) => Promise<void>;
        updateQuantity: (itemId: string, quantity: number) => Promise<void>;
        fetchCart: () => Promise<void>;
        total: number;
        appliedVoucher: any;
        discountAmount: number;
        finalAmount: number;
        applyVoucher: (code: string) => Promise<any>;
        removeVoucher: () => Promise<any>;
    }

    interface CartItem {
        _id: string;
        product_id: {
            images: any;
            _id: string;
            name: string;
            price: number;
        };
        quantity: number;
        price: number;
        subtotal: number;
    }

    const CartContext = createContext<CartContextType>({
        cartItems: [],
        cartCount: 0,
        loading: false,
        error: null,
        addToCart: async () => Promise.resolve(),
        removeFromCart: async () => Promise.resolve(),
        updateQuantity: async () => Promise.resolve(),
        fetchCart: async () => Promise.resolve(), // Changed from throwing error
        total: 0,
        appliedVoucher: null, // Changed from undefined to null
        discountAmount: 0,
        finalAmount: 0,
        applyVoucher: function (): Promise<any> {
            throw new Error('Function not implemented.');
        },
        removeVoucher: function (): Promise<any> {
            throw new Error('Function not implemented.');
        },
        setCartItems: function (): void {
            throw new Error('Function not implemented.');
        }
    });

    // const API_URL = 'http://localhost:3000/api';

    export const CartProvider = ({ children }: { children: React.ReactNode }) => {
        const [cartItems, setCartItems] = useState<CartItem[]>([]);
        const [cartCount, setCartCount] = useState(0);
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState<string | null>(null);
        const [total, setTotal] = useState(0);
        const [appliedVoucher, setAppliedVoucher] = useState(null);
        const [discountAmount, setDiscountAmount] = useState(0);
        const [finalAmount, setFinalAmount] = useState(0);

        const fetchCart = async () => {
            try {
                setLoading(true);
                setError(null);
                const token = localStorage.getItem('token');
                
                if (!token) {
                    throw new Error('Vui lòng đăng nhập để xem giỏ hàng');
                }
        
                const response = await axios.get(`/cart`, {
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (!response.data.success) {
                    throw new Error(response.data.message);
                }
        
                const { cart, items } = response.data.data;
                if (!items || !Array.isArray(items)) {
                    throw new Error('Invalid response format');
                }
        
                setCartItems(items);
                setCartCount(items.reduce((sum, item) => sum + item.quantity, 0));
                setTotal(cart.total_amount || 0);
                setAppliedVoucher(cart.applied_voucher || null);
                setDiscountAmount(cart.discount_amount || 0);
                setFinalAmount(cart.final_amount || 0);
            } catch (err: any) {
                setError(err.response?.data?.message || err.message);
                setCartItems([]);
                setCartCount(0);
                setTotal(0);
                setAppliedVoucher(null);
                setDiscountAmount(0);
                setFinalAmount(0);
            } finally {
                setLoading(false);
            }
        };
    
        const addToCart = async (productId: string, quantity: number, formattedName?: string) => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                
                if (!token) {
                    throw new Error('Vui lòng đăng nhập để thêm vào giỏ hàng');
                }
        
                const response = await axios.post(
                    `/cart/add`, 
                    { productId, quantity, formattedName },
                    { 
                        headers: { 
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
        
                if (response.data.success) {
                    await fetchCart(); // Refresh cart data after adding
                    return response.data;
                } else {
                    throw new Error(response.data.message);
                }
            } catch (error: any) {
                throw new Error(error.response?.data?.message || error.message);
            } finally {
                setLoading(false);
            }
        };
    
        const removeFromCart = async (itemId: string) => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                
                if (!token) {
                    throw new Error('Vui lòng đăng nhập');
                }
        
                const response = await axios.delete(`/cart/item/${itemId}`, {
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
        
                if (response.data.cartDeleted) {
                    // Reset cart state if cart was deleted
                    setCartItems([]);
                    setCartCount(0);
                    setTotal(0);
                    setAppliedVoucher(null);
                    setDiscountAmount(0);
                    setFinalAmount(0);
                } else {
                    // Refresh cart data if items remain
                    await fetchCart();
                }
                
                return response.data;
            } catch (err: any) {
                throw new Error(err.response?.data?.message || err.message);
            } finally {
                setLoading(false);
            }
        };
    
        const updateQuantity = async (itemId: string, quantity: number) => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                
                if (!token) {
                    throw new Error('Vui lòng đăng nhập');
                }
        
                if (quantity < 1) {
                    throw new Error('Số lượng phải lớn hơn 0');
                }
        
                const response = await axios.put(
                    `/cart/item/${itemId}`, 
                    { quantity },
                    { 
                        headers: { 
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
        
                if (response.data.success) {
                    await fetchCart(); // Refresh cart data after successful update
                    return response.data;
                } else {
                    throw new Error(response.data.message);
                }
            } catch (err: any) {
                throw new Error(err.response?.data?.message || err.message);
            } finally {
                setLoading(false);
            }
        };

        useEffect(() => {
            fetchCart();
        }, []);

        const applyVoucher = async (code: string) => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                
                if (!token) {
                    throw new Error('Vui lòng đăng nhập');
                }
    
                const response = await axios.post(
                    `/cart/apply-voucher`,
                    { code },
                    { 
                        headers: { 
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
    
                if (response.data.success) {
                    await fetchCart();
                    return response.data;
                } else {
                    throw new Error(response.data.message);
                }
            } catch (error: any) {
                throw new Error(error.response?.data?.message || error.message);
            } finally {
                setLoading(false);
            }
        };
    
        const removeVoucher = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                
                if (!token) {
                    throw new Error('Vui lòng đăng nhập');
                }
    
                const response = await axios.delete(
                    `/cart/voucher`,
                    { 
                        headers: { 
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
    
                if (response.data.success) {
                    await fetchCart();
                    return response.data;
                } else {
                    throw new Error(response.data.message);
                }
            } catch (error: any) {
                throw new Error(error.response?.data?.message || error.message);
            } finally {
                setLoading(false);
            }
        };

        return (
            <div>
                {/* <Helmet>
                    <title>Giỏ hàng</title>
                </Helmet> */}
                <CartContext.Provider value={{
                    cartItems,
                    setCartItems,
                    cartCount,
                    loading,
                    error,
                    addToCart,
                    removeFromCart,
                    updateQuantity,
                    fetchCart,
                    total,
                    appliedVoucher,
                    discountAmount,
                    finalAmount,
                    applyVoucher,
                    removeVoucher
                }}>
                    {children}
                </CartContext.Provider>
            </div>
            
        );
    };
    
    
    export const useCart = () => useContext(CartContext);