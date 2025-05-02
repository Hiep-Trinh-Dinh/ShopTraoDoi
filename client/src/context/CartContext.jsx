"use client"

import { createContext, useContext, useState, useEffect } from "react"
import axios from "axios"
import { useAuth } from "./AuthContext"
import API_BASE_URL from '../utils/apiConfig';

const CartContext = createContext()

export const useCart = () => {
    const context = useContext(CartContext)
    if (!context) {
        throw new Error("useCart must be used within a CartProvider")
    }
    return context
}

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState({ items: [] })
    const [loading, setLoading] = useState(true)
    const { user } = useAuth()

    // Fetch cart when user logs in
    useEffect(() => {
        if (user) {
            fetchCart()
        } else {
            setCart({ items: [] })
            setLoading(false)
        }
    }, [user])

    const fetchCart = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/cart`, {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                }
            })
            setCart(response.data.cart)
        } catch (error) {
            console.error("Error fetching cart:", error)
        } finally {
            setLoading(false)
        }
    }

    const addToCart = async (productId, quantity = 1) => {
        try {
            if (!productId) {
                console.error('Invalid productId:', productId);
                return {
                    success: false,
                    message: 'Sản phẩm không hợp lệ'
                };
            }

            const parsedQuantity = parseInt(quantity);
            if (isNaN(parsedQuantity) || parsedQuantity < 1) {
                console.error('Invalid quantity:', quantity);
                return {
                    success: false,
                    message: 'Số lượng không hợp lệ'
                };
            }

            console.log('Sending request with:', {
                productId,
                quantity: parsedQuantity
            });

            const response = await axios.post(
                `${API_BASE_URL}/api/cart/add`,
                {
                    productId,
                    quantity: parsedQuantity
                },
                {
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("token")}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            console.log('Server response:', response.data);

            if (response.data.success) {
                setCart(response.data.cart);
                return { success: true };
            }
            return {
                success: false,
                message: response.data.message
            };
        } catch (error) {
            console.error("Error adding to cart:", error);
            console.error("Error response:", error.response?.data);
            return {
                success: false,
                message: error.response?.data?.message || "Lỗi khi thêm vào giỏ hàng"
            };
        }
    };

    const updateCartItem = async (productId, quantity) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/api/cart/update`,
                { productId, quantity },
                {
                    withCredentials: true,
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("token")}`
                    }
                }
            )
            setCart(response.data.cart)
            return { success: true }
        } catch (error) {
            console.error("Error updating cart:", error)
            return { 
                success: false, 
                message: error.response?.data?.message || "Error updating cart" 
            }
        }
    }

    const removeFromCart = async (productId) => {
        return updateCartItem(productId, 0)
    }

    const value = {
        cart,
        loading,
        addToCart,
        updateCartItem,
        removeFromCart,
        fetchCart
    }

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    )
}

