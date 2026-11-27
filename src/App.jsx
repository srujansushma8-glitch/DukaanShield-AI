import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages - Code-split with React.lazy
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));

// Layout & Dashboard Pages
import AppLayout from './components/layout/AppLayout';
const DashboardOverview = lazy(() => import('./pages/app/DashboardOverview'));
const AIShopManager = lazy(() => import('./pages/app/AIShopManager'));
const AttackLab = lazy(() => import('./pages/app/AttackLab'));
const SecurityFindings = lazy(() => import('./pages/app/SecurityFindings'));
const SecurityCentre = lazy(() => import('./pages/app/SecurityCentre'));
const AuditLogs = lazy(() => import('./pages/app/AuditLogs'));
const SalesPage = lazy(() => import('./pages/app/SalesPage'));
const InventoryPage = lazy(() => import('./pages/app/InventoryPage'));
const CustomersPage = lazy(() => import('./pages/app/CustomersPage'));
const SuppliersPage = lazy(() => import('./pages/app/SuppliersPage'));
const SettingsPage = lazy(() => import('./pages/app/SettingsPage'));

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
        <Suspense
          fallback={
            <div className="min-h-screen bg-[#F5EDE3] flex items-center justify-center">
              <div className="font-serif text-[18px] text-[#5A4A40] animate-pulse">
                Loading DukaanShield AI...
              </div>
            </div>
          }
        >
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
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
