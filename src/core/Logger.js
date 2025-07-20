/**
 * Logger Setup - Using loglevel library
 * Focuses on warnings, errors, and exception bubbling
 */

import log from 'loglevel';

// Configure log level based on debug mode
const logLevel = (IdleAnts.Config?.debug || window.location.hostname === 'localhost') ? 'debug' : 'warn';
log.setLevel(logLevel);

// Create component-specific loggers
const createLogger = (component) => {
    return {
        error: (message, ...args) => {
            log.error(`[${component}] ERROR: ${message}`, ...args);
            // Bubble errors to error handler if available
            if (args[0] instanceof Error && IdleAnts.ErrorHandler) {
                IdleAnts.ErrorHandler.handleError(args[0], component);
            }
        },
        
        warn: (message, ...args) => {
            log.warn(`[${component}] WARN: ${message}`, ...args);
        },
        
        info: (message, ...args) => {
            log.info(`[${component}] INFO: ${message}`, ...args);
        },
        
        debug: (message, ...args) => {
            log.debug(`[${component}] DEBUG: ${message}`, ...args);
        },
        
        // Convenience methods for common scenarios
        missingDependency: (dependency, fallback = 'using fallback') => {
            log.warn(`[${component}] WARN: ${dependency} not available - ${fallback}`);
        },
        
        initializationFailed: (what, error) => {
            log.error(`[${component}] ERROR: ${what} initialization failed`, error);
            if (error instanceof Error && IdleAnts.ErrorHandler) {
                IdleAnts.ErrorHandler.handleError(error, component);
            }
        },
        
        validationFailed: (what, expected, actual) => {
            log.warn(`[${component}] WARN: ${what} validation failed`, { expected, actual });
        }
    };
};

// Register to global namespace
IdleAnts.Logger = {
    create: createLogger,
    setLevel: log.setLevel.bind(log),
    getLevel: log.getLevel.bind(log)
};

// Export for ES6 module system
export { createLogger, log };
export default IdleAnts.Logger;