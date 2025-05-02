import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Overview = () => {
    const [dashboardData, setDashboardData] = useState({
        stats: {
            totalUsers: 0,
            totalProducts: 0,
            totalOrders: 0,
            totalRevenue: 0
        },
        orderStats: [],
        recentOrders: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/admin/stats', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });

                // Format data with default values
                const formattedData = {
                    stats: {
                        totalUsers: response.data.stats?.totalUsers || 0,
                        totalProducts: response.data.stats?.totalProducts || 0,
                        totalOrders: response.data.stats?.totalOrders || 0,
                        totalRevenue: response.data.stats?.totalRevenue || 0
                    },
                    orderStats: (response.data.orderStats || []).map(stat => ({
                        _id: stat._id || 'unknown',
                        count: stat.count || 0,
                        totalAmount: stat.totalAmount || 0
                    })),
                    recentOrders: (response.data.recentOrders || []).map(order => ({
                        _id: order._id || 'N/A',
                        orderNumber: order.orderNumber || order._id?.toString().slice(-6).toUpperCase() || 'N/A',
                        user: {
                            username: order.user?.username || 'N/A',
                            email: order.user?.email || 'N/A'
                        },
                        totalAmount: order.totalAmount || 0,
                        status: order.status || 'pending',
                        createdAt: order.createdAt || new Date()
                    }))
                };

                setDashboardData(formattedData);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                setError('Error fetching dashboard data');
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    const { stats, orderStats, recentOrders } = dashboardData;

    return (
        <div className="p-4">
            <h1 className="text-2xl font-semibold mb-4">Dashboard Overview</h1>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm">Total Users</h3>
                    <p className="text-2xl font-semibold">{stats.totalUsers}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm">Total Products</h3>
                    <p className="text-2xl font-semibold">{stats.totalProducts}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm">Total Orders</h3>
                    <p className="text-2xl font-semibold">{stats.totalOrders}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm">Total Revenue</h3>
                    <p className="text-2xl font-semibold">${Number(stats.totalRevenue).toFixed(2)}</p>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
                <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Order ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Customer
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {recentOrders.map((order) => (
                                <tr key={order._id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {order.orderNumber}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {order.user.username}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        ${Number(order.totalAmount).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                            order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                            'bg-gray-100 text-gray-800'}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Order Stats */}
            <div className="bg-white rounded-lg shadow p-4">
                <h2 className="text-xl font-semibold mb-4">Order Statistics</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {orderStats.map((stat) => (
                        <div key={stat._id} className="p-4 border rounded-lg">
                            <h3 className="text-gray-500 text-sm capitalize">{stat._id}</h3>
                            <p className="text-xl font-semibold">{stat.count} orders</p>
                            <p className="text-sm text-gray-600">${Number(stat.totalAmount).toFixed(2)}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Overview; 