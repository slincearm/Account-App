/**
 * Offline Queue Utility
 * Handles queuing operations when offline and retrying when back online
 */
import { logger } from "./logger";

interface QueuedOperation {
    id: string;
    operation: () => Promise<void>;
    timestamp: number;
    retries: number;
}

class OfflineQueue {
    private queue: QueuedOperation[] = [];
    private processing = false;
    private readonly MAX_RETRIES = 3;

    /**
     * Add an operation to the queue
     */
    add(operation: () => Promise<void>): string {
        const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        this.queue.push({
            id,
            operation,
            timestamp: Date.now(),
            retries: 0
        });
        logger.debug(`📝 Operation queued: ${id}`);
        return id;
    }

    /**
     * Process all queued operations
     */
    async processQueue(): Promise<void> {
        if (this.processing || this.queue.length === 0) {
            return;
        }

        this.processing = true;
        logger.info(`🔄 Processing ${this.queue.length} queued operations...`);

        const operations = [...this.queue];
        this.queue = [];

        for (const op of operations) {
            try {
                await op.operation();
                logger.debug(`✅ Operation completed: ${op.id}`);
            } catch (error) {
                logger.error(`❌ Operation failed: ${op.id}`, error);

                // Retry if under max retries
                if (op.retries < this.MAX_RETRIES) {
                    op.retries++;
                    this.queue.push(op);
                    logger.warn(`🔁 Retrying operation: ${op.id} (Attempt ${op.retries}/${this.MAX_RETRIES})`);
                } else {
                    logger.error(`❌ Operation failed after ${this.MAX_RETRIES} retries: ${op.id}`);
                }
            }
        }

        this.processing = false;

        // Process remaining items if any were re-queued
        if (this.queue.length > 0) {
            setTimeout(() => this.processQueue(), 1000);
        }
    }

    /**
     * Get queue status
     */
    getStatus(): { pending: number; processing: boolean } {
        return {
            pending: this.queue.length,
            processing: this.processing
        };
    }

    /**
     * Clear all queued operations
     */
    clear(): void {
        this.queue = [];
        logger.info('🗑️  Queue cleared');
    }
}

export const offlineQueue = new OfflineQueue();

/**
 * Wrap a Firestore operation to handle offline scenarios
 */
export async function withOfflineSupport<T>(
    operation: () => Promise<T>,
    onError?: (error: any) => void
): Promise<T | null> {
    try {
        return await operation();
    } catch (error: any) {
        // Check if it's a network error
        if (error.code === 'unavailable' || !navigator.onLine) {
            logger.warn('⚠️  Operation failed due to offline status, queuing for later...');
            offlineQueue.add(operation as () => Promise<void>);

            if (onError) {
                onError(error);
            }

            return null;
        }

        // Re-throw other errors
        throw error;
    }
}
