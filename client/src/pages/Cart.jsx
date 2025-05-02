"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useCart } from "../context/CartContext"
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import API_BASE_URL from '../utils/apiConfig'

const Cart = () => {
    const { cart, updateCartItem, removeFromCart, getCartTotal } = useCart()
    const [loading, setLoading] = useState({})
    const { user } = useAuth()
    const navigate = useNavigate()

    const handleQuantityChange = async (productId, newQuantity) => {
        if (newQuantity < 1) return
        setLoading(prev => ({ ...prev, [productId]: true }))
        try {
            await updateCartItem(productId, newQuantity)
        } finally {
            setLoading(prev => ({ ...prev, [productId]: false }))
        }
    }

    const handleRemoveItem = async (productId) => {
        setLoading(prev => ({ ...prev, [productId]: true }))
        try {
            await removeFromCart(productId)
        } finally {
            setLoading(prev => ({ ...prev, [productId]: false }))
        }
    }

    const calculateTotal = () => {
        return cart.items.reduce((total, item) => {
            return total + (item.product?.price || 0) * item.quantity
        }, 0)
    }

    if (!user) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
                <h2 className="text-2xl font-bold mb-4">Please Login</h2>
                <p className="mb-4">You need to login to view your cart</p>
                <Link to="/login" className="btn btn-primary">
                    Login
                </Link>
            </div>
        )
    }

    if (cart.items.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
                <div className="flex flex-col items-center justify-center py-12">
                    <ShoppingBag className="h-16 w-16 text-gray-400 mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
                    <p className="text-gray-600 mb-6">Looks like you haven't added any products to your cart yet.</p>
                    <Link to="/products" className="btn btn-primary">
                        Browse Products
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Giỏ hàng</h1>
                <Link 
                    to="/orders" 
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
                >
                    <span>Đơn hàng của tôi</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-4">
                            {cart.items.map((item) => (
                                <li key={item.product._id} className="p-4 sm:p-6">
                                    <div className="flex flex-col sm:flex-row">
                                        <div className="flex-shrink-0 w-full sm:w-24 h-24 bg-gray-100 rounded-md overflow-hidden mb-4 sm:mb-0">
                                            <img
                                                src={item.product.image || "/placeholder.svg"}
                                                alt={item.product.name}
                                                className="w-full h-full object-center object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 sm:ml-6">
                                            <div className="flex justify-between">
                                                <div>
                                                    <h3 className="text-lg font-medium text-gray-900">
                                                        {item.product.name}
                                                    </h3>
                                                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                                                        {item.product.description}
                                                    </p>
                                                </div>
                                                <p className="text-lg font-medium text-gray-900">
                                                    {(item.product.price * item.quantity).toLocaleString('vi-VN')}đ
                                                </p>
                                            </div>
                                            <div className="mt-4 flex justify-between items-center">
                                                <div className="flex items-center border border-gray-300 rounded-md">
                                                    <button
                                                        type="button"
                                                        className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
                                                        onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                                                        disabled={loading[item.product._id]}
                                                    >
                                                        <Minus className="h-4 w-4" />
                                                    </button>
                                                    <span className="px-4 py-2">{item.quantity}</span>
                                                    <button
                                                        type="button"
                                                        className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
                                                        onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                                                        disabled={loading[item.product._id]}
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </button>
                                                </div>
                                                <button
                                                    type="button"
                                                    className="text-red-600 hover:text-red-800 disabled:opacity-50"
                                                    onClick={() => handleRemoveItem(item.product._id)}
                                                    disabled={loading[item.product._id]}
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <p className="text-gray-600">Subtotal</p>
                                <p className="font-medium">{calculateTotal().toLocaleString('vi-VN')}đ</p>
                            </div>
                            <div className="flex justify-between">
                                <p className="text-gray-600">Shipping</p>
                                <p className="font-medium">$0.00</p>
                            </div>
                            <div className="flex justify-between">
                                <p className="text-gray-600">Tax</p>
                                <p className="font-medium">${(calculateTotal() * 0.1).toFixed(2)}</p>
                            </div>
                            <div className="border-t border-gray-200 pt-4 flex justify-between">
                                <p className="text-lg font-medium">Total</p>
                                <p className="text-lg font-bold">{calculateTotal().toLocaleString('vi-VN')}đ</p>
                            </div>
                        </div>
                        <div className="mt-6">
                            <Link to="/checkout" className="btn btn-primary w-full">
                                Proceed to Checkout
                            </Link>
                            <Link to="/products" className="mt-4 block text-center text-sm text-black hover:underline">
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Cart

