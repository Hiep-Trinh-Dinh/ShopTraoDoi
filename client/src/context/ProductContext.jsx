import { createContext, useContext, useState, useEffect } from "react";
import axios from 'axios';
import API_BASE_URL from '../utils/apiConfig';

const ProductContext = createContext();

export const useProduct = () => useContext(ProductContext);

export const ProductProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProducts = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/products`);
            if (response.data.success) {
                setProducts(response.data.products);
            } else {
                setError('Không thể tải dữ liệu sản phẩm');
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            setError('Lỗi khi tải dữ liệu sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    const addProduct = async (productData) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/products`, productData, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.data.success) {
                setProducts([...products, response.data.product]);
                return { success: true };
            }
        } catch (error) {
            console.error('Error adding product:', error);
            return { success: false, error: error.message };
        }
    };

    const updateProduct = async (id, productData) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/api/products/${id}`, productData, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.data.success) {
                setProducts(products.map(p => p._id === id ? response.data.product : p));
                return { success: true };
            }
        } catch (error) {
            console.error('Error updating product:', error);
            return { success: false, error: error.message };
        }
    };

    const deleteProduct = async (id) => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/api/products/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.data.success) {
                setProducts(products.filter(p => p._id !== id));
                return { success: true };
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            return { success: false, error: error.message };
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const value = {
        products,
        loading,
        error,
        fetchProducts,
        addProduct,
        updateProduct,
        deleteProduct
    };

    return (
        <ProductContext.Provider value={value}>
            {children}
        </ProductContext.Provider>
    );
}; 