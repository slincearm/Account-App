import { useAuth } from "../contexts/AuthContext";
import { LogOut, User } from "lucide-react";
import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Layout() {
    const { currentUser, logout } = useAuth();
    const { t } = useTranslation();

    return (
        <>
            <header style={{
                borderBottom: "1px solid var(--glass-border)",
                background: "rgba(15, 23, 42, 0.8)",
                backdropFilter: "blur(12px)",
                position: "sticky",
                top: 0,
                zIndex: 50
            }}>
                <div className="container flex-between" style={{ padding: "1rem" }}>
                    <h2 className="text-gradient" style={{ fontSize: "1.25rem" }}>{t('auth.loginTitle')}</h2>

                    <div className="flex-center" style={{ gap: "1rem" }}>
                        <LanguageSwitcher />

                        <div className="flex-center" style={{ gap: "0.5rem" }}>
                            {currentUser?.photoURL ? (
                                <img
                                    src={currentUser.photoURL}
                                    alt="Avatar"
                                    style={{ width: 32, height: 32, borderRadius: "50%" }}
                                />
                            ) : (
                                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--surface-dark)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <User size={18} />
                                </div>
                            )}
                            <span className="hide-mobile-block" style={{ fontSize: "0.9rem" }}>
                                {currentUser?.displayName}
                            </span>
                        </div>

                        <button
                            onClick={logout}
                            style={{
                                background: "transparent",
                                border: "none",
                                color: "var(--text-muted)",
                                padding: "0.5rem"
                            }}
                            title={t('common.signOut')}
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </header>

            <main className="container" style={{ padding: "2rem 1rem" }}>
                <Outlet />
            </main>
        </>
    );
}
