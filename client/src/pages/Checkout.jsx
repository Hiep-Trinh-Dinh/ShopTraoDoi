"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useCart } from "../context/CartContext"
import { useAuth } from "../context/AuthContext"
import { CreditCard, MapPin, Phone, Mail } from "lucide-react"
import API_BASE_URL from '../utils/apiConfig'

const Checkout = () => {
    const { cart, getCartTotal } = useCart()
    const { user } = useAuth()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        fullName: user?.name || "",
        email: user?.email || "",
        phone: "",
        address: "",
        city: "",
        district: "",
        ward: "",
        paymentMethod: "cod"
    })

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const response = await fetch(`${API_BASE_URL}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    shippingInfo: {
                        fullName: formData.fullName,
                        email: formData.email,
                        phone: formData.phone,
                        address: formData.address,
                        city: formData.city,
                        district: formData.district,
                        ward: formData.ward
                    },
                    paymentMethod: formData.paymentMethod
                })
            })

            const data = await response.json()
            if (data.success) {
                const orderDetails = `
                    Đặt hàng thành công!
                    
                    Mã đơn hàng: ${data.order.orderNumber}
                    Tổng tiền: ${data.order.totalAmount.toLocaleString('vi-VN')}đ
                    Phương thức thanh toán: ${formData.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản ngân hàng'}
                    
                    Thời gian giao hàng dự kiến: 3-5 ngày làm việc
                    
                    Bạn có thể theo dõi trạng thái đơn hàng trong trang giỏ hàng.
                `
                if (window.confirm(orderDetails + "\n\nBạn có muốn xem chi tiết đơn hàng không?")) {
                    navigate(`/orders/${data.order._id}`)
                } else {
                    navigate("/cart")
                }
            } else {
                throw new Error(data.message || "Có lỗi xảy ra khi đặt hàng")
            }
        } catch (error) {
            console.error("Error processing order:", error)
            alert(error.message || "Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.")
        } finally {
            setLoading(false)
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
                <h2 className="text-2xl font-bold mb-4">Vui lòng đăng nhập</h2>
                <p className="mb-4">Bạn cần đăng nhập để tiến hành thanh toán</p>
                <button onClick={() => navigate("/login")} className="btn bg-black text-white hover:bg-gray-800">
                    Đăng nhập
                </button>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold mb-8">Thanh toán</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-semibold mb-4">Thông tin giao hàng</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Họ và tên</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Địa chỉ</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Tỉnh/Thành phố</label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            required
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Quận/Huyện</label>
                                        <input
                                            type="text"
                                            name="district"
                                            value={formData.district}
                                            onChange={handleInputChange}
                                            required
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Phường/Xã</label>
                                        <input
                                            type="text"
                                            name="ward"
                                            value={formData.ward}
                                            onChange={handleInputChange}
                                            required
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-semibold mb-4">Phương thức thanh toán</h2>
                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="cod"
                                        checked={formData.paymentMethod === "cod"}
                                        onChange={handleInputChange}
                                        className="h-4 w-4 text-black focus:ring-black border-gray-300"
                                    />
                                    <label className="ml-3 block text-sm font-medium text-gray-700">
                                        Thanh toán khi nhận hàng (COD)
                                    </label>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="bank"
                                        checked={formData.paymentMethod === "bank"}
                                        onChange={handleInputChange}
                                        className="h-4 w-4 text-black focus:ring-black border-gray-300"
                                    />
                                    <label className="ml-3 block text-sm font-medium text-gray-700">
                                        Chuyển khoản ngân hàng
                                    </label>
                                </div>
                                {formData.paymentMethod === "bank" && (
                                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                        <h3 className="text-sm font-medium text-gray-900 mb-3">Thông tin chuyển khoản</h3>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Ngân hàng:</span>
                                                <span className="text-sm font-medium">Vietcombank</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Số tài khoản:</span>
                                                <span className="text-sm font-medium">1234567890</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Chủ tài khoản:</span>
                                                <span className="text-sm font-medium">NGUYEN VAN A</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Nội dung chuyển khoản:</span>
                                                <span className="text-sm font-medium">
                                                    {user?.name?.replace(/\s+/g, '')}{user?.email?.split('@')[0]}
                                                </span>
                                            </div>
                                            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                                                <p className="text-sm text-yellow-800">
                                                    Vui lòng chuyển khoản đúng số tiền và nội dung để đơn hàng được xử lý nhanh chóng.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn bg-black text-white hover:bg-gray-800 disabled:opacity-50"
                        >
                            {loading ? "Đang xử lý..." : "Xác nhận đặt hàng"}
                        </button>
                    </form>
                </div>

                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Tóm tắt đơn hàng</h2>
                        <div className="space-y-4">
                            {cart.items.map((item) => (
                                <div key={item.product._id} className="flex justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{item.product.name}</p>
                                        <p className="text-sm text-gray-500">x{item.quantity}</p>
                                    </div>
                                    <p className="text-sm font-medium text-gray-900">
                                        {(item.product.price * item.quantity).toLocaleString('vi-VN')}đ
                                    </p>
                                </div>
                            ))}
                            <div className="border-t border-gray-200 pt-4">
                                <div className="flex justify-between">
                                    <p className="text-base font-medium text-gray-900">Tổng tiền</p>
                                    <p className="text-base font-medium text-gray-900">
                                        {calculateTotal().toLocaleString('vi-VN')}đ
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Checkout

