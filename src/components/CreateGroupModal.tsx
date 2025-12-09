import { useState, FormEvent, memo } from "react";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CreateGroupModalProps } from "../types";

function CreateGroupModal({ onClose, onCreate }: CreateGroupModalProps) {
    const defaultDate = new Date().toISOString().split('T')[0] || '';
    const [name, setName] = useState<string>(defaultDate);
    const [loading, setLoading] = useState<boolean>(false);
    const { t } = useTranslation();

    const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setLoading(true);
        try {
            await onCreate(name);
            onClose();
        } catch (error) {
            console.error("Failed to create group", error);
            alert(t('errors.createGroupFailed'));
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

                <h3 style={{ marginBottom: "1.5rem" }}>{t('modal.createGroup')}</h3>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: "1.5rem" }}>
                        <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
                            {t('modal.groupName')}
                        </label>
                        <input
                            type="text"
                            className="input"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={t('modal.groupNamePlaceholder')}
                        />
                    </div>

                    <div className="flex-center" style={{ gap: "1rem" }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>
                            {t('common.cancel')}
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1 }}>
                            {loading ? t('common.loading') : t('modal.create')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default memo(CreateGroupModal);
