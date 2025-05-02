"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import { useCart } from "../context/CartContext"
import { useAuth } from "../context/AuthContext"
import { ArrowRight } from "lucide-react"

const Home = () => {
    const [featuredProducts, setFeaturedProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const { addToCart } = useCart()
    const { user } = useAuth()

    useEffect(() => {
        const fetchFeaturedProducts = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/products")
                if (response.data.success) {
                    // Lấy 4 sản phẩm đầu tiên làm featured
                    setFeaturedProducts(response.data.products.slice(0, 4))
                }
            } catch (error) {
                console.error("Error fetching featured products:", error)
                setError("Failed to load featured products")
            } finally {
                setLoading(false)
            }
        }

        fetchFeaturedProducts()
    }, [])

    const handleAddToCart = async (productId) => {
        if (!user) {
            alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng")
            return
        }

        const result = await addToCart(productId)
        if (result.success) {
            alert("Thêm sản phẩm vào giỏ hàng thành công!")
        } else {
            alert(result.message || "Có lỗi xảy ra khi thêm vào giỏ hàng")
        }
    }

    return (
        <div>
            {/* Hero Section */}
            <section className="bg-black text-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl font-bold mb-6 sm:text-5xl">Secure Digital Product Exchange</h1>
                        <p className="text-xl mb-8">Buy, sell, and exchange digital products with confidence</p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link to="/products" className="btn bg-white text-black hover:bg-gray-100">
                                Browse Products
                            </Link>
                            <Link to="/create-room" className="btn border border-white hover:bg-white hover:text-black">
                                Create Exchange Room
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center p-6">
                            <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                                1
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Create or Join a Room</h3>
                            <p className="text-gray-600">Create a secure exchange room or join an existing one with a room ID</p>
                        </div>
                        <div className="text-center p-6">
                            <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                                2
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Secure Transaction</h3>
                            <p className="text-gray-600">
                                Buyer deposits funds, seller provides product details in a secure environment
                            </p>
                        </div>
                        <div className="text-center p-6">
                            <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                                3
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Verification & Completion</h3>
                            <p className="text-gray-600">Buyer verifies the product and releases payment or requests a refund</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-3xl font-bold">Featured Products</h2>
                        <Link to="/products" className="flex items-center text-black hover:underline">
                            View all <ArrowRight className="ml-1 h-4 w-4" />
                        </Link>
                    </div>
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <p className="text-red-500">{error}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {featuredProducts.map((product) => (
                                <div key={product._id} className="border rounded-lg overflow-hidden shadow-lg">
                                    <img 
                                        src={product.image} 
                                        alt={product.name} 
                                        className="w-full h-48 object-cover"
                                    />
                                    <div className="p-4">
                                        <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
                                        <p className="text-gray-600 mb-2">{product.description}</p>
                                        <p className="text-xl font-bold text-indigo-600 mb-4">
                                            {product.price.toLocaleString('vi-VN')}đ
                                        </p>
                                        <div className="flex justify-between items-center">
                                            <Link 
                                                to={`/products/${product._id}`}
                                                className="text-indigo-600 hover:text-indigo-800"
                                            >
                                                Chi tiết
                                            </Link>
                                            <button
                                                onClick={() => handleAddToCart(product._id)}
                                                className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
                                            >
                                                Thêm vào giỏ
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-center mb-12">What Our Users Say</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white p-6 rounded-lg shadow">
                            <p className="text-gray-600 mb-4">
                                "The exchange process was smooth and secure. I was able to verify the game account before finalizing the
                                payment."
                            </p>
                            <div className="font-semibold">John D.</div>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow">
                            <p className="text-gray-600 mb-4">
                                "As a seller, I appreciate how the platform holds the funds until the buyer verifies the product. It
                                creates trust on both sides."
                            </p>
                            <div className="font-semibold">Sarah M.</div>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow">
                            <p className="text-gray-600 mb-4">
                                "The room creation feature makes it easy to conduct private transactions. The interface is intuitive and
                                straightforward."
                            </p>
                            <div className="font-semibold">Michael K.</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 bg-black text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold mb-6">Ready to Start?</h2>
                    <p className="text-xl mb-8 max-w-2xl mx-auto">
                        Join our platform today and experience secure digital product exchanges
                    </p>
                    <Link to="/register" className="btn bg-white text-black hover:bg-gray-100">
                        Create an Account
                    </Link>
                </div>
            </section>
        </div>
    )
}

export default Home

