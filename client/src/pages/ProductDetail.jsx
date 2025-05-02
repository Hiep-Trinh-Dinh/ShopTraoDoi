"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { useCart } from "../context/CartContext"
import { ShoppingCart, ArrowLeft } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import API_BASE_URL from '../utils/apiConfig'

const ProductDetail = () => {
    const { id } = useParams()
    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [quantity, setQuantity] = useState(1)
    const { addToCart } = useCart()
    const { user } = useAuth()

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                console.log("Fetching product with ID:", id); // Debug log
                const response = await fetch(`${API_BASE_URL}/products/${id}`);
                const data = await response.json();
                console.log("Response data:", data); // Debug log

                if (data.success) {
                    setProduct(data.product);
                } else {
                    setError(data.message || 'Failed to fetch product');
                }
            } catch (error) {
                console.error("Error fetching product:", error); // Debug log
                setError('Failed to fetch product details');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProduct();
        }
    }, [id]);

    const handleAddToCart = async () => {
        if (!user) {
            alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng")
            return
        }

        const result = await addToCart(id, quantity)
        if (result.success) {
            alert("Thêm sản phẩm vào giỏ hàng thành công!")
        } else {
            alert(result.message || "Có lỗi xảy ra khi thêm vào giỏ hàng")
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
            </div>
        )
    }

    if (error || !product) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
                <h1 className="text-3xl font-bold mb-4">Error</h1>
                <p className="mb-6">{error || 'Product not found'}</p>
                <Link to="/products" className="btn btn-primary">
                    Back to Products
                </Link>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Link to="/products" className="inline-flex items-center text-black hover:underline mb-8">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back to Products
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-100 rounded-lg overflow-hidden">
                    <img 
                        src={product.image || "/placeholder.svg"} 
                        alt={product.name} 
                        className="w-full h-full object-cover" 
                    />
                </div>

                <div>
                    <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                    <div className="text-2xl font-bold mb-4">${product.price?.toFixed(2)}</div>
                    <p className="text-gray-700 mb-6">{product.description}</p>

                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-2">Category:</h3>
                        <p className="text-gray-700">{product.category}</p>
                    </div>

                    <div className="flex items-center mb-6">
                        <label className="mr-2">Số lượng:</label>
                        <input 
                            type="number" 
                            min="1" 
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-20 px-3 py-2 border rounded-md"
                        />
                    </div>

                    <div className="flex space-x-4">
                        <button 
                            onClick={handleAddToCart} 
                            className="btn bg-black text-white hover:bg-gray-800 flex items-center"
                        >
                            <ShoppingCart className="h-5 w-5 mr-2" />
                            Add to Cart
                        </button>
                        <Link to="/create-room" className="btn btn-outline">
                            Create Exchange Room
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProductDetail

