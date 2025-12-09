import { useAuth } from "../contexts/AuthContext";
import { LogOut, User } from "lucide-react";
import { Outlet } from "react-router-dom";

export default function Layout() {
    const { currentUser, logout } = useAuth();

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
                    <h2 className="text-gradient" style={{ fontSize: "1.25rem" }}>Expense Tracker</h2>

                    <div className="flex-center" style={{ gap: "1rem" }}>
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
                            <span style={{ fontSize: "0.9rem", display: "none", "@media (min-width: 640px)": { display: "block" } }}>
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
                            title="Sign Out"
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
