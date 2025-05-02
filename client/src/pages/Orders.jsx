import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../utils/apiConfig';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/orders`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setOrders(response.data.orders);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setError('Không thể tải danh sách đơn hàng');
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'processing':
                return 'bg-blue-100 text-blue-800';
            case 'shipped':
                return 'bg-purple-100 text-purple-800';
            case 'delivered':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) return <div className="p-8 text-center">Đang tải...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

    return (
        <div className="max-w-6xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Đơn hàng của tôi</h1>

            {orders.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">Bạn chưa có đơn hàng nào</p>
                    <Link to="/products" className="text-blue-600 hover:underline">
                        Tiếp tục mua sắm
                    </Link>
                </div>
            ) : (
                <div className="grid gap-6">
                    {orders.map((order) => (
                        <div key={order._id} className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold">
                                        Đơn hàng #{order.orderNumber}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        Đặt ngày {formatDate(order.createdAt)}
                                    </p>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-sm ${getStatusColor(order.status)}`}>
                                    {order.status === 'pending' && 'Chờ xử lý'}
                                    {order.status === 'processing' && 'Đang xử lý'}
                                    {order.status === 'shipped' && 'Đang giao'}
                                    {order.status === 'delivered' && 'Đã giao'}
                                    {order.status === 'cancelled' && 'Đã hủy'}
                                </div>
                            </div>

                            <div className="border-t border-b border-gray-200 py-4 mb-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Người nhận:</p>
                                        <p className="font-medium">{order.shippingInfo.fullName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Số điện thoại:</p>
                                        <p className="font-medium">{order.shippingInfo.phone}</p>
                                    </div>
                                </div>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-600">Địa chỉ:</p>
                                    <p className="font-medium">
                                        {`${order.shippingInfo.address}, ${order.shippingInfo.ward}, ${order.shippingInfo.district}, ${order.shippingInfo.city}`}
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-gray-600">Tổng tiền:</p>
                                    <p className="text-lg font-semibold">
                                        {order.totalAmount.toLocaleString('vi-VN')}đ
                                    </p>
                                </div>
                                <Link
                                    to={`/orders/${order._id}`}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                >
                                    Xem chi tiết
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Orders; 