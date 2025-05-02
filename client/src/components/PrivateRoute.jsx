import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    // Kiểm tra quyền admin
    if (user?.role !== 'admin') {
        return <Navigate to="/" />;
    }

    return children;
};

export default PrivateRoute; 