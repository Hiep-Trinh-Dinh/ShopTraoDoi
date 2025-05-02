import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../utils/apiConfig';

const VerifyEmail = () => {
    const [verificationCode, setVerificationCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;

    if (!email) {
        navigate('/register');
        return null;
    }

    const handleVerification = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axios.post(`${API_BASE_URL}/auth/verify-email`, {
                email,
                verificationCode
            }, {
                withCredentials: true
            });

            if (response.data.success) {
                alert('Xác thực email thành công!');
                navigate('/login');
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Có lỗi xảy ra khi xác thực');
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await axios.post(`${API_BASE_URL}/auth/resend-verification`, {
                email
            }, {
                withCredentials: true
            });

            if (response.data.success) {
                alert('Mã xác thực mới đã được gửi đến email của bạn');
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Có lỗi xảy ra khi gửi lại mã');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Xác thực email
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Vui lòng nhập mã xác thực đã được gửi đến email {email}
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleVerification}>
                        <div>
                            <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700">
                                Mã xác thực
                            </label>
                            <div className="mt-1">
                                <input
                                    id="verificationCode"
                                    name="verificationCode"
                                    type="text"
                                    required
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="Nhập mã 6 số"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="text-red-600 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="flex items-center justify-between">
                            <button
                                type="button"
                                onClick={handleResendCode}
                                disabled={loading}
                                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                            >
                                Gửi lại mã
                            </button>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                {loading ? 'Đang xử lý...' : 'Xác thực'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail; 