"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import { useCart } from "../context/CartContext"
import { useAuth } from "../context/AuthContext"
import ProductCard from "../components/ProductCard"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"
import { useProduct } from "../context/ProductContext"

const Products = () => {
    const { products, loading, error } = useProduct();
    const [filteredProducts, setFilteredProducts] = useState([])
    const [searchTerm, setSearchTerm] = useState("")
    const { addToCart } = useCart()
    const { user } = useAuth()

    // Thêm state cho phân trang
    const [currentPage, setCurrentPage] = useState(1)
    const [productsPerPage] = useState(6)

    useEffect(() => {
        if (products && products.length > 0) {
            if (searchTerm) {
                const filtered = products.filter(
                    (product) =>
                        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        product.category.toLowerCase().includes(searchTerm.toLowerCase())
                );
                setFilteredProducts(filtered);
            } else {
                setFilteredProducts(products);
            }
            setCurrentPage(1);
        }
    }, [searchTerm, products]);

    // Tính toán sản phẩm cho trang hiện tại
    const indexOfLastProduct = currentPage * productsPerPage
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct)

    // Tính tổng số trang
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage)

    // Hàm thay đổi trang
    const paginate = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber)
            // Cuộn lên đầu trang
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }

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

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
        </div>
    );

    if (error) return (
        <div className="text-center py-12">
            <p className="text-red-500">Error: {error}</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold mb-8">Sản phẩm</h1>

            {/* Thanh tìm kiếm */}
            <div className="mb-8 relative">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Tìm kiếm sản phẩm..."
                        className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                </div>
            </div>

            {/* Hiển thị kết quả tìm kiếm */}
            {searchTerm && (
                <p className="mb-4 text-gray-600">
                    Tìm thấy {filteredProducts.length} sản phẩm cho "{searchTerm}"
                </p>
            )}

            {/* Grid sản phẩm */}
            {filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">Không tìm thấy sản phẩm phù hợp.</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {currentProducts.map((product) => (
                            <ProductCard 
                                key={product._id} 
                                product={product}
                                onAddToCart={() => handleAddToCart(product._id)}
                            />
                        ))}
                    </div>

                    {/* Phân trang */}
                    {totalPages > 1 && (
                        <div className="mt-8 flex justify-center items-center space-x-4">
                            <button
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent"
                            >
                                <ChevronLeft className="h-6 w-6" />
                            </button>
                            
                            <div className="flex items-center space-x-2">
                                {[...Array(totalPages)].map((_, index) => (
                                    <button
                                        key={index + 1}
                                        onClick={() => paginate(index + 1)}
                                        className={`px-4 py-2 rounded-md ${
                                            currentPage === index + 1
                                                ? 'bg-black text-white'
                                                : 'hover:bg-gray-100'
                                        }`}
                                    >
                                        {index + 1}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent"
                            >
                                <ChevronRight className="h-6 w-6" />
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default Products

