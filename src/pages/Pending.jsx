import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { LogOut } from "lucide-react";

export default function Pending() {
    const { logout, currentUser, isApproved } = useAuth();

    if (isApproved) {
        return <Navigate to="/" />;
    }

    return (
        <div className="flex-center" style={{ minHeight: "100vh", padding: "1rem" }}>
            <div className="card" style={{ maxWidth: "500px", textAlign: "center" }}>
                <h2 style={{ marginBottom: "1rem", color: "hsl(var(--color-accent))" }}>Access Pending</h2>
                <p style={{ marginBottom: "2rem", color: "var(--text-secondary)" }}>
                    Hello <strong>{currentUser?.displayName}</strong>. Your account is waiting for administrator approval.
                    Please contact the admin to grant you access.
                </p>

                <button className="btn btn-secondary" onClick={logout}>
                    <LogOut size={18} />
                    Sign Out
                </button>
            </div>
        </div>
    );
}
