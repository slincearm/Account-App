import { useAuth } from "../contexts/AuthContext";
import { LogOut, User, Shield } from "lucide-react";
import { Outlet, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeSwitcher from "./ThemeSwitcher";

export default function Layout() {
    const { currentUser, isAdmin, logout } = useAuth();
    const { t } = useTranslation();

    return (
        <>
            <header className="app-header" style={{
                borderBottom: "1px solid var(--glass-border)",
                background: "rgba(15, 23, 42, 0.8)",
                backdropFilter: "blur(12px)",
                position: "sticky",
                top: 0,
                zIndex: 50,
                width: "100%"
            }}>
                <div className="container flex-between" style={{ padding: "0.75rem 1rem", gap: "0.5rem" }}>
                    <h2 className="text-gradient" style={{ fontSize: "1.15rem", whiteSpace: "nowrap" }}>{t('auth.loginTitle')}</h2>

                    <div className="flex-center" style={{ gap: "0.4rem", flexShrink: 0 }}>
                        <ThemeSwitcher />
                        <LanguageSwitcher />

                        {isAdmin && (
                            <Link
                                to="/admin"
                                className="btn btn-secondary"
                                style={{ padding: "0.4rem 0.6rem" }}
                                title={t('admin.panel')}
                            >
                                <Shield size={16} />
                                <span className="hide-mobile">{t('admin.panel')}</span>
                            </Link>
                        )}

                        <div className="flex-center" style={{ gap: "0.35rem" }}>
                            {currentUser?.photoURL ? (
                                <img
                                    src={currentUser.photoURL}
                                    alt="Avatar"
                                    style={{ width: 28, height: 28, borderRadius: "50%" }}
                                />
                            ) : (
                                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--surface-dark)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <User size={16} />
                                </div>
                            )}
                            <span className="hide-mobile-block" style={{ fontSize: "0.85rem" }}>
                                {currentUser?.displayName}
                            </span>
                        </div>

                        <button
                            onClick={logout}
                            style={{
                                background: "transparent",
                                border: "none",
                                color: "var(--text-muted)",
                                padding: "0.35rem",
                                display: "flex",
                                alignItems: "center"
                            }}
                            title={t('common.signOut')}
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </header>

            <main className="container app-main">
                <Outlet />
            </main>
        </>
    );
}
