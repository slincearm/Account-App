import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { NetworkProvider } from "./contexts/NetworkContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import NetworkStatus from "./components/NetworkStatus";
import Login from "./pages/Login";
import Pending from "./pages/Pending";
import Dashboard from "./pages/Dashboard";
import GroupDetail from "./pages/GroupDetail";
import History from "./pages/History";
import HistoryDetail from "./pages/HistoryDetail";
import Settlement from "./pages/Settlement";
import AdminPanel from "./pages/AdminPanel";

export default function App() {
  return (
    <NetworkProvider>
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            <NetworkStatus />
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
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </NetworkProvider>
  );
}
