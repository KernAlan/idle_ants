/**
 * Logger - Proper logging system for Idle Ants
 * Focuses on warnings, errors, and exception bubbling
 * Only logs when there are actual issues to investigate
 */

class Logger {
    static LogLevel = {
        ERROR: 0,
        WARN: 1,
        INFO: 2,
        DEBUG: 3
    };

    constructor(component = 'Game') {
        this.component = component;
        this.logLevel = IdleAnts.Config?.debug ? Logger.LogLevel.DEBUG : Logger.LogLevel.WARN;
    }

    /**
     * Log an error - always shown
     * @param {string} message - Error message
     * @param {Error|any} error - Error object or additional data
     */
    error(message, error = null) {
        const prefix = `[${this.component}] ERROR:`;
        
        if (error instanceof Error) {
            console.error(prefix, message, error);
            // Bubble the exception to error handlers
            if (IdleAnts.ErrorHandler) {
                IdleAnts.ErrorHandler.handleError(error, this.component);
            }
        } else if (error) {
            console.error(prefix, message, error);
        } else {
            console.error(prefix, message);
        }
    }

    /**
     * Log a warning - shown when something is wrong but not fatal
     * @param {string} message - Warning message
     * @param {any} data - Additional data
     */
    warn(message, data = null) {
        if (this.logLevel >= Logger.LogLevel.WARN) {
            const prefix = `[${this.component}] WARN:`;
            if (data) {
                console.warn(prefix, message, data);
            } else {
                console.warn(prefix, message);
            }
        }
    }

    /**
     * Log info - only shown in debug mode
     * @param {string} message - Info message
     * @param {any} data - Additional data
     */
    info(message, data = null) {
        if (this.logLevel >= Logger.LogLevel.INFO) {
            const prefix = `[${this.component}] INFO:`;
            if (data) {
                console.info(prefix, message, data);
            } else {
                console.info(prefix, message);
            }
        }
    }

    /**
     * Log debug - only shown in debug mode
     * @param {string} message - Debug message
     * @param {any} data - Additional data
     */
    debug(message, data = null) {
        if (this.logLevel >= Logger.LogLevel.DEBUG) {
            const prefix = `[${this.component}] DEBUG:`;
            if (data) {
                console.log(prefix, message, data);
            } else {
                console.log(prefix, message);
            }
        }
    }

    /**
     * Assert a condition - throws error if condition is false
     * @param {boolean} condition - Condition to check
     * @param {string} message - Error message if assertion fails
     */
    assert(condition, message) {
        if (!condition) {
            const error = new Error(`Assertion failed: ${message}`);
            this.error('Assertion failed', error);
            throw error;
        }
    }

    /**
     * Log a missing dependency
     * @param {string} dependency - Name of missing dependency
     * @param {string} fallback - What fallback is being used
     */
    missingDependency(dependency, fallback = 'using fallback') {
        this.warn(`${dependency} not available - ${fallback}`);
    }

    /**
     * Log validation failure
     * @param {string} what - What failed validation
     * @param {any} expected - Expected value/type
     * @param {any} actual - Actual value/type
     */
    validationFailed(what, expected, actual) {
        this.warn(`${what} validation failed`, { expected, actual });
    }

    /**
     * Log initialization failure
     * @param {string} what - What failed to initialize
     * @param {Error} error - The error that occurred
     */
    initializationFailed(what, error) {
        this.error(`${what} initialization failed`, error);
    }

    /**
     * Create a child logger for a sub-component
     * @param {string} subComponent - Name of the sub-component
     * @returns {Logger} New logger instance
     */
    child(subComponent) {
        return new Logger(`${this.component}:${subComponent}`);
    }
}

// Register to global namespace
IdleAnts.Logger = Logger;

// Export for ES6 module system
export default Logger;