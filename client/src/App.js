import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import CustomerPage from './pages/CustomerPage';
import ProductPage from './pages/ProductPage';
import StocksPage from './pages/StocksPage';
import SupplierPage from './pages/SupplierPage';
import EntryPage from './pages/EntryPage';
import LoginPage from './pages/LoginPage';
import Header from './components/Header';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import ReportPage from './pages/ReportPage';
import ReportPrintView from './pages/ReportPrintView';
import DebitCreditPage from './pages/DebitCreditPage';
import SettingsPage from './pages/SettingsPage';
import UserManagementPage from './pages/UserManagementPage';

import '@fortawesome/fontawesome-svg-core/styles.css';

function AppContent() {
  const location = useLocation();
  const isPrint = location.pathname === '/print-report';

  return (
    <>
      {!isPrint && <Header />}
      {!isPrint && <Navbar />}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/print-report" element={<ReportPrintView />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/customers" element={<CustomerPage />} />
        <Route path="/products" element={<ProductPage />} />
        <Route path="/stocks" element={<StocksPage />} />
        <Route path="/suppliers" element={<SupplierPage />} />
        <Route path="/entries" element={<EntryPage />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/debit-credit" element={<DebitCreditPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/users" element={<UserManagementPage />} />
      </Routes>
      {!isPrint && <Footer />}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
