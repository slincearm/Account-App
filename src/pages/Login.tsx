import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher";

export default function Login() {
    const { login, currentUser } = useAuth();
    const { t } = useTranslation();

    if (currentUser) {
        return <Navigate to="/" />;
    }

    return (
        <div className="flex-center" style={{ minHeight: "100vh", padding: "1rem", position: "relative" }}>
            <div style={{ position: "absolute", top: "1rem", right: "1rem" }}>
                <LanguageSwitcher />
            </div>

            <div className="card" style={{ maxWidth: "400px", width: "100%", textAlign: "center" }}>
                <h1 className="text-gradient" style={{ marginBottom: "0.5rem" }}>{t('auth.loginTitle')}</h1>
                <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
                    {t('auth.loginDescription')}
                </p>

                <button className="btn btn-primary" onClick={login} style={{ width: "100%" }}>
                    <LogIn size={20} />
                    {t('auth.login')}
                </button>
            </div>
        </div>
    );
}
