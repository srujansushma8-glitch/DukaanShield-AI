import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Layout & Dashboard Pages
import AppLayout from './components/layout/AppLayout';
import DashboardOverview from './pages/app/DashboardOverview';
import AIShopManager from './pages/app/AIShopManager';
import AttackLab from './pages/app/AttackLab';
import SecurityFindings from './pages/app/SecurityFindings';
import SecurityCentre from './pages/app/SecurityCentre';
import AuditLogs from './pages/app/AuditLogs';
import SalesPage from './pages/app/SalesPage';
import InventoryPage from './pages/app/InventoryPage';
import CustomersPage from './pages/app/CustomersPage';
import SuppliersPage from './pages/app/SuppliersPage';
import SettingsPage from './pages/app/SettingsPage';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5EDE3] flex items-center justify-center">
        <div className="font-serif text-[18px] text-[#5A4A40] animate-pulse">
          Verifying AgntID session...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Authentication Pages */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Protected Shop Management & Security Application */}
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardOverview />} />
            <Route path="agent" element={<AIShopManager />} />
            <Route path="attack-lab" element={<AttackLab />} />
            <Route path="findings" element={<SecurityFindings />} />
            <Route path="security" element={<SecurityCentre />} />
            <Route path="audit-logs" element={<AuditLogs />} />
            <Route path="sales" element={<SalesPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="suppliers" element={<SuppliersPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
