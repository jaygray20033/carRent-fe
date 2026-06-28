import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import '@/styles/globals.css'
import UIKit from '@/pages/UIKit'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/dev/ui-kit" element={<UIKit />} />
        <Route path="*" element={<Navigate to="/dev/ui-kit" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
