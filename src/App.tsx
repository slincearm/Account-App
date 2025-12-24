import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { AuthProvider } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { NetworkProvider } from "./contexts/NetworkContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import NetworkStatus from "./components/NetworkStatus";

// 使用 lazy loading 進行代碼分割
const Login = lazy(() => import("./pages/Login"));
const Pending = lazy(() => import("./pages/Pending"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const GroupDetail = lazy(() => import("./pages/GroupDetail"));
const History = lazy(() => import("./pages/History"));
const HistoryDetail = lazy(() => import("./pages/HistoryDetail"));
const Settlement = lazy(() => import("./pages/Settlement"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));

// Suspense fallback component with i18n support
function LoadingFallback() {
  const { t } = useTranslation();
  return (
    <div className="container text-center mt-10" style={{ color: "var(--text-secondary)" }}>
      {t('common.loading')}
    </div>
  );
}

export default function App() {
  return (
    <NetworkProvider>
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            <NetworkStatus />
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/pending" element={<Pending />} />

                <Route element={<ProtectedRoute />}>
                  <Route element={<Layout />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/group/:groupId" element={<GroupDetail />} />
                    <Route path="/settle/:groupId" element={<Settlement />} />
                    <Route path="/history" element={<History />} />
                    <Route path="/history/:groupId" element={<HistoryDetail />} />
                    <Route path="/admin" element={<AdminPanel />} />
                  </Route>
                </Route>

                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </NetworkProvider>
  );
}
