import { useState } from "react";
import { X } from "lucide-react";

export default function CreateGroupModal({ onClose, onCreate }) {
    const [name, setName] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onCreate(name);
            onClose();
        } catch (error) {
            console.error("Failed to create group", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100
        }}>
            <div className="card" style={{ width: "90%", maxWidth: "400px", position: "relative" }}>
                <button
                    onClick={onClose}
                    style={{
                        position: "absolute",
                        top: "1rem",
                        right: "1rem",
                        background: "none",
                        border: "none",
                        color: "var(--text-muted)"
                    }}
                >
                    <X size={20} />
                </button>

                <h3 style={{ marginBottom: "1.5rem" }}>Create New Group</h3>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: "1.5rem" }}>
                        <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
                            Group Name
                        </label>
                        <input
                            type="text"
                            className="input"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. 2024-12-08"
                        />
                    </div>

                    <div className="flex-center" style={{ gap: "1rem" }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1 }}>
                            {loading ? "Creating..." : "Create"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
