import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ScrollToTop from './components/common/ScrollToTop';

// Layouts
import PublicLayout from './components/layouts/PublicLayout';
import AdminLayout from './components/admin/AdminLayout';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import Projects from './pages/Projects';
import Shop from './pages/Shop';
import Submit from './pages/Submit';
import Contact from './pages/Contact';
import Cart from './pages/Cart';
import Login from './pages/Login';
import NotFound from './pages/NotFound';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import Publications from './pages/admin/Publications';
import SetPublication from './pages/admin/SetPublication';
import ViewPublication from './pages/admin/ViewPublication';
import Submissions from './pages/admin/Submissions';
import Orders from './pages/admin/Orders';
import Messages from './pages/admin/Messages';
import Newsletter from './pages/admin/Newsletter';
import Profile from './pages/admin/Profile';

import './styles/index.css';


function App() {
  return (
    <Router>
      <CartProvider>
        <ScrollToTop />

        <Routes>
          {/* ===== Public Layout ===== */}
          <Route element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="projects" element={<Projects />} />
            <Route path="shop" element={<Shop />} />
            <Route path="submit" element={<Submit />} />
            <Route path="contact" element={<Contact />} />
            <Route path="cart" element={<Cart />} />
          </Route>

          {/* ===== Login ===== */}
          <Route path="/login" element={<Login />} />

          {/* ===== Admin (Protected) ===== */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="publications" element={<Publications />} />
            <Route path="publications/new" element={<SetPublication />} />
            <Route path="publications/edit/:id" element={<SetPublication />} />
            <Route path="publications/:slug" element={<ViewPublication />} />
            <Route path="submissions" element={<Submissions />} />
            <Route path="orders" element={<Orders />} />
            <Route path="messages" element={<Messages />} />
            <Route path="newsletter" element={<Newsletter />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* ===== 404 ===== */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </CartProvider>
    </Router>
  );
}

export default App;
