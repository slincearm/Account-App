import { useNetwork } from "../contexts/NetworkContext";
import { WifiOff, Wifi } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEffect, useState, memo } from "react";

function NetworkStatus() {
    const { isOnline, wasOffline } = useNetwork();
    const { t } = useTranslation();
    const [showOnlineNotification, setShowOnlineNotification] = useState(false);

    useEffect(() => {
        if (isOnline && wasOffline) {
            // Show "back online" notification for 3 seconds
            setShowOnlineNotification(true);
            const timer = setTimeout(() => {
                setShowOnlineNotification(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isOnline, wasOffline]);

    // Don't show anything if online and wasn't offline
    if (isOnline && !showOnlineNotification) {
        return null;
    }

    return (
        <div
            style={{
                position: "fixed",
                top: "70px",
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 1000,
                animation: "slideDown 0.3s ease-out"
            }}
        >
            <div
                className="card flex-center"
                style={{
                    padding: "0.75rem 1.5rem",
                    gap: "0.75rem",
                    background: isOnline
                        ? "rgba(34, 197, 94, 0.9)"
                        : "rgba(239, 68, 68, 0.9)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)"
                }}
            >
                {isOnline ? (
                    <>
                        <Wifi size={20} style={{ color: "white" }} />
                        <span style={{ color: "white", fontWeight: 500 }}>
                            {t('network.online')}
                        </span>
                    </>
                ) : (
                    <>
                        <WifiOff size={20} style={{ color: "white" }} />
                        <span style={{ color: "white", fontWeight: 500 }}>
                            {t('network.offline')}
                        </span>
                    </>
                )}
            </div>
        </div>
    );
}

export default memo(NetworkStatus);
