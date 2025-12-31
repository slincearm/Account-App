type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
    private isDev: boolean;

    constructor() {
        this.isDev = import.meta.env.DEV;
    }

    private formatMessage(level: LogLevel, message: string, ...args: any[]): void {
        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

        switch (level) {
            case 'debug':
                if (this.isDev) {
                    console.debug(prefix, message, ...args);
                }
                break;
            case 'info':
                console.info(prefix, message, ...args);
                break;
            case 'warn':
                console.warn(prefix, message, ...args);
                break;
            case 'error':
                console.error(prefix, message, ...args);
                break;
        }
    }

    debug(message: string, ...args: any[]): void {
        this.formatMessage('debug', message, ...args);
    }

    info(message: string, ...args: any[]): void {
        this.formatMessage('info', message, ...args);
    }

    warn(message: string, ...args: any[]): void {
        this.formatMessage('warn', message, ...args);
    }

    error(message: string, ...args: any[]): void {
        this.formatMessage('error', message, ...args);
    }
}

export const logger = new Logger();
