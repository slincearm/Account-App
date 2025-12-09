import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { offlineQueue } from "../utils/offlineQueue";

interface NetworkContextType {
    isOnline: boolean;
    wasOffline: boolean;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export function useNetwork(): NetworkContextType {
    const context = useContext(NetworkContext);
    if (!context) {
        throw new Error("useNetwork must be used within a NetworkProvider");
    }
    return context;
}

interface NetworkProviderProps {
    children: ReactNode;
}

export function NetworkProvider({ children }: NetworkProviderProps) {
    const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
    const [wasOffline, setWasOffline] = useState<boolean>(false);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            if (wasOffline) {
                console.log('📶 Back online - syncing data...');
                // Process any queued operations
                offlineQueue.processQueue();
                setWasOffline(false);
            }
        };

        const handleOffline = () => {
            setIsOnline(false);
            setWasOffline(true);
            console.log('📵 Offline mode - using cached data');
        };

        // Add event listeners
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Cleanup
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [wasOffline]);

    const value = {
        isOnline,
        wasOffline
    };

    return (
        <NetworkContext.Provider value={value}>
            {children}
        </NetworkContext.Provider>
    );
}
