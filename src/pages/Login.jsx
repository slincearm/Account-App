import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { LogIn } from "lucide-react";

export default function Login() {
    const { login, currentUser } = useAuth();

    if (currentUser) {
        return <Navigate to="/" />;
    }

    return (
        <div className="flex-center" style={{ minHeight: "100vh", padding: "1rem" }}>
            <div className="card" style={{ maxWidth: "400px", width: "100%", textAlign: "center" }}>
                <h1 className="text-gradient" style={{ marginBottom: "0.5rem" }}>Expense Tracker</h1>
                <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
                    Sign in to manage your shared expenses
                </p>

                <button className="btn btn-primary" onClick={login} style={{ width: "100%" }}>
                    <LogIn size={20} />
                    Sign in with Google
                </button>
            </div>
        </div>
    );
}
