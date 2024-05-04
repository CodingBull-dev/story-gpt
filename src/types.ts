/**
 * Tool used for logging. The default `console` works as an implementation
 */
export interface ILogger {
    log(...message: unknown[]): void;
    error(...args: unknown[]): void;
    warn(...args: unknown[]): void;
}
