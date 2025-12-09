import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher";

export default function Pending() {
    const { logout, currentUser, isApproved } = useAuth();
    const { t } = useTranslation();

    if (isApproved) {
        return <Navigate to="/" />;
    }

    return (
        <div className="flex-center" style={{ minHeight: "100vh", padding: "1rem", position: "relative" }}>
            <div style={{ position: "absolute", top: "1rem", right: "1rem" }}>
                <LanguageSwitcher />
            </div>

            <div className="card" style={{ maxWidth: "500px", textAlign: "center" }}>
                <h2 style={{ marginBottom: "1rem", color: "hsl(var(--color-accent))" }}>{t('auth.pending')}</h2>
                <p style={{ marginBottom: "1rem", color: "var(--text-secondary)" }}>
                    {t('common.welcome')}, <strong>{currentUser?.displayName}</strong>.
                </p>
                <p style={{ marginBottom: "2rem", color: "var(--text-secondary)" }}>
                    {t('auth.pendingMessage')}
                </p>

                <button className="btn btn-secondary" onClick={logout}>
                    <LogOut size={18} />
                    {t('common.signOut')}
                </button>
            </div>
        </div>
    );
}
