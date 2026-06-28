import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import LandingPage from './pages/landing/LandingPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import DashboardLayout from './components/layout/DashboardLayout'
import Overview from './pages/dashboard/Overview'
import Banking from './pages/dashboard/Banking'
import Trading from './pages/dashboard/Trading'
import MutualFunds from './pages/dashboard/MutualFunds'
import Insurance from './pages/dashboard/Insurance'
import Shop from './pages/dashboard/Shop'
import CartPage from './pages/dashboard/CartPage'
import Checkout from './pages/dashboard/Checkout'
import Orders from './pages/dashboard/Orders'
import TestLab from './pages/dashboard/TestLab'
import ProtectedRoute from './components/layout/ProtectedRoute'
import './index.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<Overview />} />
            <Route path="banking" element={<Banking />} />
            <Route path="trading" element={<Trading />} />
            <Route path="mutual-funds" element={<MutualFunds />} />
            <Route path="insurance" element={<Insurance />} />
            <Route path="shop" element={<Shop />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="orders" element={<Orders />} />
          <Route path="test-lab" element={<TestLab />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
