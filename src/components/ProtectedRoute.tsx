import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "react-i18next";

export default function ProtectedRoute() {
    const { currentUser, isApproved, loading } = useAuth();
    const { t } = useTranslation();

    if (loading) {
        return (
            <div className="flex-center" style={{ minHeight: "100vh" }}>
                <div className="text-gradient" style={{ fontSize: "1.5rem" }}>{t('common.loading')}</div>
            </div>
        );
    }

    if (!currentUser) {
        return <Navigate to="/login" />;
    }

    if (!isApproved) {
        return <Navigate to="/pending" />;
    }

    return <Outlet />;
}
