"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import axios from "axios"
import API_BASE_URL from '../utils/apiConfig'

const Login = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    })
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        console.log('Login attempt with:', formData) // Debug log

        try {
            const response = await axios.post(`${API_BASE_URL}/auth/login`, formData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            console.log('Server response:', response.data) // Debug log

            if (response.data.success) {
                localStorage.setItem('token', response.data.token)
                
                const userData = {
                    ...response.data.user,
                    token: response.data.token
                }
                
                const role = login(userData)
                
                // Redirect based on role
                if (role === 'admin') {
                    navigate("/admin")
                } else {
                    navigate("/")
                }
            }
        } catch (error) {
            console.error('Login error details:', error.response?.data) // Debug log
            
            if (error.response?.data?.message?.includes("chưa được xác thực")) {
                navigate("/verify-email", { state: { email: formData.email } })
            } else if (error.response?.status === 400) {
                setError(error.response.data.message || "Email hoặc mật khẩu không chính xác")
            } else {
                setError("Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại sau.")
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Đăng nhập
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Mật khẩu
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="text-red-600 text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                {loading ? "Đang xử lý..." : "Đăng nhập"}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">
                                    Chưa có tài khoản?{" "}
                                    <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                                        Đăng ký
                                    </Link>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login

