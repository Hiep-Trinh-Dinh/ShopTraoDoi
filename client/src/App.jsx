import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Cart from "./pages/Cart"
import Products from "./pages/Products"
import Checkout from "./pages/Checkout"
import ProductDetail from "./pages/ProductDetail"
import CreateRoom from "./pages/CreateRoom"
import Room from "./pages/Room"
import FindRoom from "./pages/FindRoom"
import VerifyEmail from "./pages/VerifyEmail"
import ChatBox from "./components/ChatBox"
import { AuthProvider } from "./context/AuthContext"
import { CartProvider } from "./context/CartContext"
import { ProductProvider } from "./context/ProductContext"
import ProtectedRoute from "./components/ProtectedRoute"
import Dashboard from './pages/admin/Dashboard'
import Overview from './pages/admin/Overview'
import PrivateRoute from './components/PrivateRoute'
import ProductManagement from './pages/admin/ProductManagement'
import OrderManagement from './pages/admin/OrderManagement'
import UserManagement from './pages/admin/UserManagement'
import Orders from './pages/Orders'
import OrderDetail from './pages/OrderDetail'

function App() {
  return (
    <AuthProvider>
      <ProductProvider>
        <CartProvider>
          <Router>
            <div className="flex flex-col min-h-screen bg-white">
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/verify-email" element={<VerifyEmail />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/products/:id" element={<ProductDetail />} />
                  <Route
                    path="/cart"
                    element={
                      <ProtectedRoute>
                        <Cart />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/checkout"
                    element={
                      <ProtectedRoute>
                        <Checkout />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/create-room"
                    element={
                      <ProtectedRoute>
                        <CreateRoom />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/find-room"
                    element={
                      <ProtectedRoute>
                        <FindRoom />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/room/:id"
                    element={
                      <ProtectedRoute>
                        <Room />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/orders" element={
                    <ProtectedRoute>
                      <Orders />
                    </ProtectedRoute>
                  } />
                  <Route path="/orders/:id" element={
                    <ProtectedRoute>
                      <OrderDetail />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin" element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  }>
                    <Route index element={<Overview />} />
                    <Route path="products" element={<ProductManagement />} />
                    <Route path="orders" element={<OrderManagement />} />
                    <Route path="users" element={<UserManagement />} />
                  </Route>
                </Routes>
              </main>
              <Footer />
              <ChatBox />
            </div>
          </Router>
        </CartProvider>
      </ProductProvider>
    </AuthProvider>
  )
}

export default App

