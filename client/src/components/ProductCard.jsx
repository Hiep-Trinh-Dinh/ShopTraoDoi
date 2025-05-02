"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { useCart } from "../context/CartContext"
import { ShoppingCart, CheckCircle, Truck, Clock } from "lucide-react"
import { useAuth } from "../context/AuthContext"

const ProductCard = ({ product }) => {
    const { addToCart } = useCart()
    const { user } = useAuth()
    const [loading, setLoading] = useState(false)

    const handleAddToCart = async (e) => {
        e.preventDefault()
        if (!user) {
            alert('Vui lòng đăng nhập để thêm vào giỏ hàng')
            return
        }
        
        if (!product || !product._id) {
            alert('Sản phẩm không hợp lệ')
            return
        }
        
        setLoading(true)
        try {
            console.log('Adding product:', {
                id: product._id,
                name: product.name,
                quantity: 1
            })

            const result = await addToCart(product._id, 1)
            if (result.success) {
                alert('Thêm vào giỏ hàng thành công!')
            } else {
                alert(result.message || 'Không thể thêm vào giỏ hàng')
            }
        } catch (error) {
            console.error('Error adding to cart:', error)
            alert('Có lỗi xảy ra khi thêm vào giỏ hàng')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <Link to={`/products/${product._id}`}>
                <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-48 object-cover"
                />
            </Link>
            <div className="p-4">
                <Link to={`/products/${product._id}`}>
                    <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                </Link>
                <p className="text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between mb-2">
                    <p className="text-xl font-bold text-indigo-600">
                        {product.price.toLocaleString('vi-VN')}đ
                    </p>
                    <div className="flex items-center space-x-2">
                        {product.paymentStatus === 'paid' && (
                            <CheckCircle className="h-5 w-5 text-green-500" title="Đã thanh toán" />
                        )}
                        {product.paymentStatus === 'processing' && (
                            <Clock className="h-5 w-5 text-yellow-500" title="Đang xử lý thanh toán" />
                        )}
                        {product.deliveryStatus === 'shipping' && (
                            <Truck className="h-5 w-5 text-blue-500" title="Đang giao hàng" />
                        )}
                    </div>
                </div>
                <Link 
                    to={`/products/${product._id}`}
                    className="block w-full text-center bg-black text-white py-2 rounded-md hover:bg-gray-800 transition-colors"
                >
                    Chi tiết
                </Link>
            </div>
        </div>
    )
}

export default ProductCard

