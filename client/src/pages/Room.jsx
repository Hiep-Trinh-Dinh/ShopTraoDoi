// client/src/pages/Room.jsx
"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { Clock, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react"
import RoomService from "../services/roomService"
import RoomChat from '../components/RoomChat'
import API_BASE_URL from '../utils/apiConfig'
import socketConfig from '../utils/socketConfig'

const Room = () => {
    const { id } = useParams()
    const { user } = useAuth()
    const navigate = useNavigate()
    const [role, setRole] = useState(() => {
        const savedRole = localStorage.getItem(`room_${id}_role`)
        return savedRole || ""
    })
    const [productInfo, setProductInfo] = useState("")
    const [amount, setAmount] = useState("")
    const [status, setStatus] = useState("pending") // pending, deposited, completed, failed
    const [timer, setTimer] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [roomData, setRoomData] = useState(null)
    const [paymentReleased, setPaymentReleased] = useState(false)
    const [showConfirmation, setShowConfirmation] = useState(false)
    const [transactionCompleted, setTransactionCompleted] = useState(false)
    const [socket, setSocket] = useState(null)
    const [infoLoading, setInfoLoading] = useState(false)

    // Fetch room data
    useEffect(() => {
        const fetchRoomData = async () => {
            try {
                const response = await RoomService.findRoom(id)
                console.log("Room data received:", response.data) // Debug log
                if (response.success) {
                    const room = response.data;
                    setRoomData(room)
                    
                    // Kiểm tra trạng thái và role
                    if (role === 'seller' && room.status === 'buyer_verified') {
                        setShowConfirmation(true);
                        setStatus('buyer_verified');
                    } else if (room.status === 'completed' && !transactionCompleted) {
                        // Nếu chưa xác nhận thì vẫn hiện modal
                        if (role === 'seller' && !showConfirmation) {
                            setShowConfirmation(true);
                        } else {
                            setStatus(room.status);
                        }
                    } else {
                        setStatus(room.status);
                    }

                    setProductInfo(room.productInfo || "")
                    setAmount(room.price ? room.price.toString() : "")
                    setPaymentReleased(room.status === 'completed' || room.status === 'buyer_verified')

                    if (!role && room.status !== 'pending') {
                        const savedRole = localStorage.getItem(`room_${id}_role`)
                        if (savedRole) {
                            setRole(savedRole)
                        } else if (room.sellerId === user?.id) {
                            setRole('seller')
                            localStorage.setItem(`room_${id}_role`, 'seller')
                        } else if (room.buyerId === user?.id) {
                            setRole('buyer')
                            localStorage.setItem(`room_${id}_role`, 'buyer')
                        }
                    }
                } else {
                    navigate('/find-room')
                }
            } catch (err) {
                console.error("Error fetching room:", err)
                setError("Không tìm thấy phòng")
            } finally {
                setLoading(false)
            }
        }

        fetchRoomData()
    }, [id, role, user])

    useEffect(() => {
        // In a real app, fetch room data from API
        // For demo, we'll simulate a room
        const mockRoom = {
            id,
            status: "pending",
        }

        // Reset timer if it exists
        return () => {
            if (timer) clearTimeout(timer)
        }
    }, [id, timer])

    useEffect(() => {
        if (roomData && roomData.id) {
            // Tạo kết nối WebSocket
            const ws = new WebSocket(socketConfig.getSocket(`/ws/rooms/${roomData.id}`));
            
            ws.onopen = () => {
                console.log('WebSocket connected');
                // Tham gia phòng
                ws.send(JSON.stringify({ 
                    type: 'join_room', 
                    roomId: roomData.id 
                }));
            };
            
            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                
                // Xử lý sự kiện update_status
                if (data.type === 'update_status') {
                    console.log('Room status updated:', data);
                    // Reload dữ liệu phòng
                    fetchRoomData();
                }
                
                // Thêm xử lý khi nhận transaction_rejected
                if (data.type === 'transaction_rejected') {
                    console.log('Transaction rejected:', data);
                    setStatus('rejected'); // hoặc 'failed'
                    setRoomData(prev => ({...prev, status: 'rejected'}));
                }
            };
            
            setSocket(ws);
            
            return () => {
                if (ws) ws.close();
            };
        }
    }, [roomData]);

    const handleRoleSelect = async (selectedRole) => {
        try {
            // Cập nhật role trong database
            const response = await RoomService.updateRole(id, {
                role: selectedRole,
                userId: user?.id
            })

            if (response.success) {
                setRole(selectedRole)
                // Lưu role vào localStorage
                localStorage.setItem(`room_${id}_role`, selectedRole)
                // Cập nhật roomData
                setRoomData(response.data)
            }
        } catch (error) {
            console.error('Error updating role:', error)
        }
    }

    // Handle product info submission
    const handleProductInfoSubmit = async (e) => {
        e.preventDefault();
        setInfoLoading(true);
        
        try {
            // Kiểm tra lại URL và phương thức gọi API
            const response = await fetch(`${API_BASE_URL}/rooms/${id}/product-info`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ productInfo })
            });
            
            // Thêm kiểm tra kết quả
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            
            const data = await response.json();
            // Cập nhật trạng thái
            setStatus('info_provided');
            setRoomData({...roomData, productInfo, status: 'info_provided'});
        } catch (error) {
            console.error('Error providing product info:', error);
            setError('Cung cấp thông tin thất bại. Vui lòng thử lại.');
        } finally {
            setInfoLoading(false);
        }
    };

    const handleDepositSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Gọi API để cập nhật trạng thái trong database
            const response = await RoomService.updateRoomStatus(id, {
                status: "deposited",
                depositAmount: parseFloat(amount)
            });

            if (response.success) {
                setStatus("deposited");
                setRoomData(response.data);
                
                // Gửi thông báo WebSocket cho người bán
                if (socket && socket.readyState === WebSocket.OPEN) {
                    socket.send(JSON.stringify({
                        type: 'payment_completed',
                        roomId: id
                    }));
                }
            }
        } catch (error) {
            console.error("Error processing deposit:", error);
            setError("Đã xảy ra lỗi khi xử lý đặt cọc");
        } finally {
            setLoading(false);
        }
    }

    const handleVerificationSuccess = async () => {
        try {
            setLoading(true);
            const response = await RoomService.verifyProduct(id, {
                status: 'buyer_verified'
            });

            if (response.success) {
                setStatus('buyer_verified');
                setRoomData(response.data);
            }
        } catch (error) {
            console.error('Error during verification:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVerificationFailure = async () => {
        setLoading(true);
        try {
            const response = await RoomService.verifyProduct(id, {
                status: 'rejected'
            });
            
            if (response.success) {
                setStatus('rejected');
                setRoomData({...roomData, status: 'rejected'});
                
                // Gửi thông báo qua WebSocket
                if (socket && socket.readyState === WebSocket.OPEN) {
                    socket.send(JSON.stringify({
                        type: 'verify_product',
                        roomId: id,
                        status: 'rejected'
                    }));
                }
            }
        } catch (error) {
            console.error('Error during verification:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSellerConfirmation = async () => {
        try {
            setLoading(true);
            const response = await RoomService.confirmTransaction(id);
            if (response.success) {
                setTransactionCompleted(true);
                setShowConfirmation(false);
                setStatus('completed');
                setRoomData(response.data);
            }
        } catch (error) {
            console.error('Error during confirmation:', error);
        } finally {
            setLoading(false);
        }
    };

    // Xóa role khi giao dịch hoàn tất hoặc thất bại
    useEffect(() => {
        if (status === 'completed' || status === 'failed' || status === 'refunded') {
            localStorage.removeItem(`room_${id}_role`);
        }
    }, [status, id]);

    // Modal xác nhận cho người bán
    const ConfirmationModal = () => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold mb-4">Giao dịch thành công!</h2>
                    <p className="text-gray-600 mb-6">
                        Người mua đã xác nhận giao dịch thành công. 
                        Tiền đã được chuyển vào tài khoản của bạn.
                    </p>
                    <div className="space-y-4">
                        <button
                            onClick={handleSellerConfirmation}
                            disabled={loading}
                            className={`w-full px-4 py-2 rounded-md ${
                                loading 
                                    ? 'bg-gray-400 cursor-not-allowed' 
                                    : 'bg-green-600 hover:bg-green-700'
                            } text-white transition-colors duration-200`}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Đang xử lý...
                                </span>
                            ) : (
                                "Xác nhận và hoàn tất giao dịch"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    // Render completed transaction for seller
    const renderSellerCompleted = () => (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Giao dịch đã hoàn tất!</h2>
                <p className="text-gray-600">
                    Giao dịch đã được hoàn tất thành công. Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.
                </p>
            </div>
        </div>
    );

    // Sửa đổi logic hiển thị các bước
    const renderTransactionStage = () => {
        // Nếu là người mua
        if (role === 'buyer') {
            // Nếu chưa đặt cọc, luôn hiển thị form đặt cọc
            if (roomData.status === 'pending' || roomData.depositAmount <= 0) {
                return renderDepositSection();
            } 
            // Chỉ khi đã đặt cọc và có thông tin sản phẩm mới chuyển sang bước xác nhận
            else if (roomData.status === 'deposited' && roomData.productInfo) {
                return renderVerificationSection();
            }
        }
        
        // Logic cho người bán giữ nguyên...
    }

    // Tìm phần hiển thị status cho người bán
    const renderSellerView = () => {
        // Trường hợp giao dịch bị từ chối
        if (roomData.status === 'rejected') {
            return (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    <p className="font-bold">Giao dịch thất bại!</p>
                    <p>Người mua đã từ chối xác nhận và yêu cầu hoàn tiền.</p>
                </div>
            );
        }
        
        // Các trạng thái khác giữ nguyên
        // ...
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">
            <div className="text-xl">Đang tải...</div>
        </div>
    }

    if (error) {
        return <div className="text-red-500">{error}</div>
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <button onClick={() => navigate(-1)} className="inline-flex items-center text-black hover:underline mb-8">
                <ArrowLeft className="h-4 w-4 mr-1" /> Quay lại
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main content - 2 columns */}
                <div className="lg:col-span-2">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold">Exchange Room: {id}</h1>
                            {roomData && (
                                <div className="mt-2 text-gray-600">
                                    <p>Giá: ${roomData.price}</p>
                                    <p>Chi tiết sản phẩm: {roomData.productDetails}</p>
                                </div>
                            )}
                        </div>
                        <div className="bg-gray-100 px-4 py-2 rounded-full text-sm font-medium">
                            {status === "pending" && "Đang chờ xử lý"}
                            {status === "info_provided" && "Đã cung cấp thông tin"}
                            {status === "deposited" && "Đã đặt cọc"}
                            {status === "completed" && "Đã hoàn thành"}
                            {status === "rejected" && "Đã từ chối xác nhận"}
                            {status === "failed" && "Thất bại"}
                            {status === "refunded" && "Đã hoàn tiền"}
                        </div>
                    </div>

                    {!role && status === "pending" && (
                        <div className="bg-white rounded-lg shadow p-6 mb-8">
                            <h2 className="text-xl font-bold mb-4">Chọn vai trò của bạn</h2>
                            <p className="text-gray-600 mb-6">Vui lòng chọn vai trò của bạn để tiếp tục.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button
                                    onClick={() => handleRoleSelect("seller")}
                                    className="p-6 border border-gray-300 rounded-lg hover:border-black transition-colors"
                                >
                                    <h3 className="text-lg font-semibold mb-2">Tôi là người bán</h3>
                                    <p className="text-gray-600">
                                        Bạn sẽ cung cấp thông tin sản phẩm và nhận thanh toán sau khi xác minh.
                                    </p>
                                </button>
                                <button
                                    onClick={() => handleRoleSelect("buyer")}
                                    className="p-6 border border-gray-300 rounded-lg hover:border-black transition-colors"
                                >
                                    <h3 className="text-lg font-semibold mb-2">Tôi là người mua</h3>
                                    <p className="text-gray-600">
                                        Bạn sẽ đặt cọc và xác minh sản phẩm trước khi hoàn tất giao dịch.
                                    </p>
                                </button>
                            </div>
                        </div>
                    )}

                    {role === "seller" && (status === "pending" || status === "info_provided") && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-xl font-bold mb-4">Provide Product Information</h2>
                                <p className="text-gray-600 mb-6">
                                    Enter the details of the product you are selling. The buyer will use this information to verify the
                                    product.
                                </p>
                                <form onSubmit={handleProductInfoSubmit}>
                                    <div className="mb-4">
                                        <label htmlFor="productInfo" className="block text-sm font-medium text-gray-700 mb-1">
                                            Product Information
                                        </label>
                                        <textarea
                                            id="productInfo"
                                            rows={6}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                                            placeholder="Enter product details, credentials, or any information the buyer needs to verify..."
                                            value={productInfo}
                                            onChange={(e) => setProductInfo(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-primary w-full" disabled={status === "info_provided"}>
                                        {status === "info_provided" ? "Information Provided" : "Submit Information"}
                                    </button>
                                </form>
                            </div>

                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-xl font-bold mb-4">Trạng thái giao dịch</h2>
                                <div className="space-y-6">
                                    <div className="flex items-start">
                                        <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                                            status === "info_provided" || status === "deposited" || status === "buyer_verified" || status === "completed"
                                                ? "bg-green-100 text-green-600"
                                                : "bg-gray-100 text-gray-400"
                                        }`}>
                                            <CheckCircle className="h-5 w-5" />
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-lg font-medium">Cung cấp thông tin sản phẩm</h3>
                                            <p className="text-gray-600">
                                                {status === "info_provided" || status === "deposited" || status === "buyer_verified" || status === "completed"
                                                    ? "Bạn đã cung cấp thông tin sản phẩm."
                                                    : "Vui lòng cung cấp thông tin sản phẩm."}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                                            status === "deposited" || status === "buyer_verified" || status === "completed"
                                                ? "bg-green-100 text-green-600"
                                                : "bg-gray-100 text-gray-400"
                                        }`}>
                                            {status === "deposited" || status === "buyer_verified" || status === "completed" ? (
                                                <CheckCircle className="h-5 w-5" />
                                            ) : (
                                                <Clock className="h-5 w-5" />
                                            )}
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-lg font-medium">Người mua đặt cọc</h3>
                                            <p className="text-gray-600">
                                                {status === "deposited" || status === "buyer_verified" || status === "completed"
                                                    ? "Người mua đã đặt cọc thành công."
                                                    : "Đang chờ người mua đặt cọc."}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                                            status === "buyer_verified" || status === "completed"
                                                ? "bg-green-100 text-green-600"
                                                : "bg-gray-100 text-gray-400"
                                        }`}>
                                            {status === "buyer_verified" || status === "completed" ? (
                                                <CheckCircle className="h-5 w-5" />
                                            ) : (
                                                <Clock className="h-5 w-5" />
                                            )}
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-lg font-medium">Người mua xác nhận</h3>
                                            <p className="text-gray-600">
                                                {status === "buyer_verified" || status === "completed"
                                                    ? "Người mua đã xác nhận sản phẩm thành công."
                                                    : "Đang chờ người mua xác nhận sản phẩm."}
                                            </p>
                                        </div>
                                    </div>

                                    {(status === "buyer_verified" || status === "completed") && (
                                        <div className="mt-6 bg-green-50 border-l-4 border-green-400 p-4">
                                            <div className="flex">
                                                <div className="flex-shrink-0">
                                                    <CheckCircle className="h-5 w-5 text-green-400" />
                                                </div>
                                                <div className="ml-3">
                                                    <h3 className="text-sm font-medium text-green-800">
                                                        Thanh toán thành công!
                                                    </h3>
                                                    <div className="mt-2 text-sm text-green-700">
                                                        <p>
                                                            Giao dịch đã được xác nhận. Tiền đã được chuyển vào tài khoản của bạn.
                                                            {status === "buyer_verified" && " Vui lòng xác nhận để hoàn tất giao dịch."}
                                                        </p>
                                                    </div>
                                                    {status === "buyer_verified" && (
                                                        <div className="mt-4">
                                                            <button
                                                                onClick={handleSellerConfirmation}
                                                                disabled={loading}
                                                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                                            >
                                                                {loading ? "Đang xử lý..." : "Xác nhận hoàn tất giao dịch"}
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {role === "buyer" && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-white rounded-lg shadow p-6">
                                {(status === "pending" || status === "info_provided") && (
                                    <>
                                        <h2 className="text-xl font-bold mb-4">Deposit Payment</h2>
                                        <p className="text-gray-600 mb-6">
                                            Deposit the payment amount to proceed with the exchange. The payment will be held securely until you
                                            verify the product.
                                        </p>
                                        <form onSubmit={handleDepositSubmit}>
                                            <div className="mb-4">
                                                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Amount (USD)
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <span className="text-gray-500">$</span>
                                                    </div>
                                                    <input
                                                        type="number"
                                                        id="amount"
                                                        className="w-full pl-8 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                                                        placeholder="0.00"
                                                        min="0.01"
                                                        step="0.01"
                                                        value={amount}
                                                        onChange={(e) => setAmount(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <button type="submit" disabled={loading} className="btn btn-primary w-full">
                                                {loading ? "Processing..." : "Deposit Payment"}
                                            </button>
                                        </form>
                                    </>
                                )}

                                {status === "deposited" && roomData?.productInfo && (
                                    <div className="bg-white rounded-lg shadow p-6">
                                        <h2 className="text-xl font-bold mb-4">Xác nhận sản phẩm</h2>
                                        <div className="bg-gray-50 p-6 rounded-lg mb-6 space-y-6">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                    Thông tin ban đầu:
                                                </h3>
                                                <div className="bg-white p-4 rounded-md border border-gray-200">
                                                    <div className="space-y-3">
                                                        <div>
                                                            <span className="font-medium text-gray-700">Mô tả sản phẩm:</span>
                                                            <p className="mt-1 text-gray-600">
                                                                {roomData?.productDetails || "Không có thông tin"}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <span className="font-medium text-gray-700">Giá:</span>
                                                            <p className="mt-1 text-gray-600">
                                                                ${roomData?.price?.toFixed(2) || "0.00"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                    Thông tin chi tiết từ người bán:
                                                </h3>
                                                <div className="bg-white p-4 rounded-md border border-gray-200">
                                                    {roomData?.productInfo ? (
                                                        <div className="whitespace-pre-line text-gray-600">
                                                            {roomData.productInfo}
                                                        </div>
                                                    ) : (
                                                        <p className="text-gray-500 italic">
                                                            Người bán chưa cung cấp thông tin chi tiết
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="bg-blue-50 p-4 rounded-md">
                                                <div className="flex">
                                                    <div className="flex-shrink-0">
                                                        <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                    <div className="ml-3">
                                                        <h3 className="text-sm font-medium text-blue-800">
                                                            Hướng dẫn xác nhận
                                                        </h3>
                                                        <div className="mt-2 text-sm text-blue-700">
                                                            <p>
                                                                Vui lòng kiểm tra kỹ thông tin sản phẩm trước khi xác nhận. 
                                                                Sau khi xác nhận thành công, thanh toán sẽ được chuyển cho người bán.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <button
                                                onClick={handleVerificationSuccess}
                                                disabled={loading || !roomData?.productInfo}
                                                className={`btn ${
                                                    loading || !roomData?.productInfo
                                                        ? 'bg-gray-400 cursor-not-allowed'
                                                        : 'bg-green-600 hover:bg-green-700'
                                                } text-white px-4 py-3 rounded-md transition-colors duration-200`}
                                            >
                                                {loading ? (
                                                    <span className="flex items-center justify-center">
                                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Đang xử lý...
                                                    </span>
                                                ) : (
                                                    "Xác nhận thành công"
                                                )}
                                            </button>
                                            <button
                                                onClick={handleVerificationFailure}
                                                disabled={loading || !roomData?.productInfo}
                                                className={`btn ${
                                                    loading || !roomData?.productInfo
                                                        ? 'bg-gray-400 cursor-not-allowed'
                                                        : 'bg-red-600 hover:bg-red-700'
                                                } text-white px-4 py-3 rounded-md transition-colors duration-200`}
                                            >
                                                {loading ? "Đang xử lý..." : "Báo cáo vấn đề"}
                                            </button>
                                        </div>

                                        {!roomData?.productInfo && (
                                            <div className="mt-4 text-center text-sm text-gray-500">
                                                Không thể xác nhận khi chưa có thông tin chi tiết từ người bán
                                            </div>
                                        )}
                                    </div>
                                )}

                                {status === "completed" && (
                                    <div className="text-center py-8">
                                        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                                            <CheckCircle className="h-8 w-8 text-green-600" />
                                        </div>
                                        <h2 className="text-2xl font-bold mb-2">Exchange Completed!</h2>
                                        <p className="text-gray-600">
                                            You have successfully verified the product and the payment has been released to the seller.
                                        </p>
                                    </div>
                                )}

                                {status === "failed" && (
                                    <div className="text-center py-8">
                                        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                                            <AlertCircle className="h-8 w-8 text-red-600" />
                                        </div>
                                        <h2 className="text-2xl font-bold mb-2">Verification Failed</h2>
                                        <p className="text-gray-600 mb-4">
                                            You have reported an issue with the product. If the issue is not resolved, your payment will be
                                            automatically refunded in 24 hours.
                                        </p>
                                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                                            <div className="flex">
                                                <div className="flex-shrink-0">
                                                    <Clock className="h-5 w-5 text-yellow-400" />
                                                </div>
                                                <div className="ml-3">
                                                    <p className="text-sm text-yellow-700">Refund will be processed automatically in 24 hours.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {status === "refunded" && (
                                    <div className="text-center py-8">
                                        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                                            <CheckCircle className="h-8 w-8 text-green-600" />
                                        </div>
                                        <h2 className="text-2xl font-bold mb-2">Payment Refunded</h2>
                                        <p className="text-gray-600">Your payment has been refunded to your account.</p>
                                    </div>
                                )}

                                {status === "buyer_verified" && (
                                    <div className="bg-white rounded-lg shadow p-6 mb-8">
                                        <div className="text-center">
                                            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                                                <CheckCircle className="h-8 w-8 text-green-600" />
                                            </div>
                                            <h2 className="text-2xl font-bold mb-4">Người mua đã xác nhận giao dịch!</h2>
                                            <p className="text-gray-600 mb-6">
                                                Người mua đã xác nhận sản phẩm thành công. Vui lòng xác nhận để hoàn tất giao dịch.
                                            </p>
                                            <button
                                                onClick={handleSellerConfirmation}
                                                disabled={loading}
                                                className={`btn ${
                                                    loading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
                                                } text-white px-8 py-3 rounded-lg`}
                                            >
                                                {loading ? "Đang xử lý..." : "Xác nhận hoàn tất giao dịch"}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {status === "rejected" && (
                                    <div className="text-center py-8">
                                        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                                            <AlertCircle className="h-8 w-8 text-red-600" />
                                        </div>
                                        <h2 className="text-2xl font-bold mb-2">Xác nhận thất bại</h2>
                                        <p className="text-gray-600 mb-4">
                                            Bạn đã báo cáo vấn đề với sản phẩm. Tiền đặt cọc của bạn đã được hoàn trả.
                                        </p>
                                        <div className="bg-green-50 border-l-4 border-green-400 p-4">
                                            <div className="flex">
                                                <div className="flex-shrink-0">
                                                    <CheckCircle className="h-5 w-5 text-green-400" />
                                                </div>
                                                <div className="ml-3">
                                                    <p className="text-sm text-green-700">Tiền đặt cọc đã được hoàn trả vào tài khoản của bạn.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-xl font-bold mb-4">Exchange Status</h2>
                                <div className="space-y-6">
                                    <div className="flex items-start">
                                        <div
                                            className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${status === "info_provided" ||
                                                    status === "deposited" ||
                                                    status === "completed" ||
                                                    status === "failed" ||
                                                    status === "refunded"
                                                    ? "bg-green-100 text-green-600"
                                                    : "bg-gray-100 text-gray-400"
                                                }`}
                                        >
                                            {status === "info_provided" ||
                                                status === "deposited" ||
                                                status === "completed" ||
                                                status === "failed" ||
                                                status === "refunded" ? (
                                                <CheckCircle className="h-5 w-5" />
                                            ) : (
                                                <Clock className="h-5 w-5" />
                                            )}
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-lg font-medium">Seller Provides Information</h3>
                                            <p className="text-gray-600">
                                                {status === "info_provided" ||
                                                    status === "deposited" ||
                                                    status === "completed" ||
                                                    status === "failed" ||
                                                    status === "refunded"
                                                    ? "The seller has provided the product information."
                                                    : "Waiting for the seller to provide product information."}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <div
                                            className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${status === "deposited" || status === "completed" || status === "failed" || status === "refunded"
                                                    ? "bg-green-100 text-green-600"
                                                    : "bg-gray-100 text-gray-400"
                                                }`}
                                        >
                                            {status === "deposited" || status === "completed" || status === "failed" || status === "refunded" ? (
                                                <CheckCircle className="h-5 w-5" />
                                            ) : (
                                                <Clock className="h-5 w-5" />
                                            )}
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-lg font-medium">Deposit Payment</h3>
                                            <p className="text-gray-600">
                                                {status === "deposited" || status === "completed" || status === "failed" || status === "refunded"
                                                    ? "You have deposited the payment."
                                                    : "Deposit the payment to proceed with the exchange."}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <div
                                            className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${status === "completed"
                                                    ? "bg-green-100 text-green-600"
                                                    : status === "failed" || status === "refunded"
                                                        ? "bg-red-100 text-red-600"
                                                        : "bg-gray-100 text-gray-400"
                                                }`}
                                        >
                                            {status === "completed" ? (
                                                <CheckCircle className="h-5 w-5" />
                                            ) : status === "failed" || status === "refunded" ? (
                                                <AlertCircle className="h-5 w-5" />
                                            ) : (
                                                <Clock className="h-5 w-5" />
                                            )}
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-lg font-medium">Verify Product</h3>
                                            <p className="text-gray-600">
                                                {status === "completed"
                                                    ? "You have verified the product and the payment has been released to the seller."
                                                    : status === "failed"
                                                        ? "You have reported an issue with the product. Your payment will be refunded in 24 hours if not resolved."
                                                        : status === "refunded"
                                                            ? "Your payment has been refunded."
                                                            : "Verify the product to complete the exchange."}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Chat section - 1 column */}
                <div className="lg:col-span-1">
                    {role && <RoomChat roomId={id} role={role} />}
                </div>
            </div>

            {/* Hiển thị Modal xác nhận cho người bán khi chưa xác nhận */}
            {role === 'seller' && showConfirmation && <ConfirmationModal />}

            {/* Hiển thị trạng thái hoàn thành cho người bán sau khi đã xác nhận */}
            {role === 'seller' && status === 'completed' && transactionCompleted && renderSellerCompleted()}
        </div>
    )
}

export default Room

