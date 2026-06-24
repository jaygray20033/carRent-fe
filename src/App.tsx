import { Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import CheckoutPage from './pages/booking/CheckoutPage'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f5f7fa]">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/booking/checkout" element={<CheckoutPage />} />
          <Route path="*" element={<Navigate to="/booking/checkout" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
