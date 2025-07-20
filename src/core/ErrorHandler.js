/**
 * Global Error Handler - Centralized error management and logging system
 * Provides comprehensive error catching, logging, and recovery mechanisms
 */

// Ensure Core namespace exists
if (!IdleAnts.Core) {
    IdleAnts.Core = {};
}

IdleAnts.Core.ErrorHandler = class {
    constructor() {
        this.errors = [];
        this.maxErrorHistory = 100;
        this.errorCounts = new Map();
        this.isEnabled = true;
        this.logLevel = 'info'; // debug, info, warn, error, fatal
        this.listeners = [];
        
        // Error severity levels
        this.severity = {
            DEBUG: 0,
            INFO: 1,
            WARN: 2,
            ERROR: 3,
            FATAL: 4
        };
        
        this.setupGlobalHandlers();
    }

    /**
     * Set up global error handlers
     */
    setupGlobalHandlers() {
        // Catch all unhandled JavaScript errors
        window.addEventListener('error', (event) => {
            this.logError('UNHANDLED_ERROR', event.error || new Error(event.message), {
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error ? event.error.stack : null
            });
        });

        // Catch unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.logError('UNHANDLED_PROMISE_REJECTION', event.reason, {
                promise: event.promise,
                type: 'promise_rejection'
            });
        });

        // Catch PIXI.js errors if available
        if (typeof PIXI !== 'undefined' && PIXI.utils && PIXI.utils.EventEmitter) {
            const originalOn = PIXI.utils.EventEmitter.prototype.on;
            PIXI.utils.EventEmitter.prototype.on = function(event, fn, context) {
                if (event === 'error') {
                    const wrappedFn = (error) => {
                        IdleAnts.Core.ErrorHandler.getInstance().logError('PIXI_ERROR', error, {
                            context: context ? context.constructor.name : 'unknown'
                        });
                        return fn.call(this, error);
                    };
                    return originalOn.call(this, event, wrappedFn, context);
                }
                return originalOn.call(this, event, fn, context);
            };
        }
    }

    /**
     * Log an error with context and severity
     * @param {string} type - Error type/category
     * @param {Error|string} error - Error object or message
     * @param {object} context - Additional context information
     * @param {string} severity - Error severity level
     */
    logError(type, error, context = {}, severity = 'ERROR') {
        if (!this.isEnabled) return;

        const errorEntry = {
            id: this.generateErrorId(),
            timestamp: new Date().toISOString(),
            type: type,
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : null,
            context: context,
            severity: severity,
            url: window.location.href,
            userAgent: navigator.userAgent,
            gameState: this.getGameState()
        };

        // Add to error history
        this.errors.push(errorEntry);
        if (this.errors.length > this.maxErrorHistory) {
            this.errors.shift();
        }

        // Track error frequency
        const errorKey = `${type}:${errorEntry.message}`;
        this.errorCounts.set(errorKey, (this.errorCounts.get(errorKey) || 0) + 1);

        // Console logging based on severity
        this.consoleLog(errorEntry);

        // Notify listeners
        this.notifyListeners(errorEntry);

        // Handle critical errors
        if (severity === 'FATAL') {
            this.handleFatalError(errorEntry);
        }

        return errorEntry.id;
    }

    /**
     * Wrap a function with error handling
     * @param {function} fn - Function to wrap
     * @param {string} context - Context description
     * @param {object} options - Wrapping options
     * @returns {function} Wrapped function
     */
    wrapFunction(fn, context, options = {}) {
        const { 
            fallback = null, 
            rethrow = false, 
            logLevel = 'ERROR',
            maxRetries = 0 
        } = options;

        return (...args) => {
            let attempts = 0;
            const executeWithRetry = () => {
                try {
                    attempts++;
                    return fn.apply(this, args);
                } catch (error) {
                    this.logError('WRAPPED_FUNCTION_ERROR', error, {
                        context: context,
                        args: args.length,
                        attempt: attempts,
                        maxRetries: maxRetries
                    }, logLevel);

                    if (attempts <= maxRetries) {
                        console.warn(`Retrying ${context}, attempt ${attempts}/${maxRetries + 1}`);
                        return executeWithRetry();
                    }

                    if (fallback !== null) {
                        if (typeof fallback === 'function') {
                            try {
                                return fallback(...args);
                            } catch (fallbackError) {
                                this.logError('FALLBACK_ERROR', fallbackError, { context: context });
                            }
                        }
                        return fallback;
                    }

                    if (rethrow) {
                        throw error;
                    }

                    return undefined;
                }
            };

            return executeWithRetry();
        };
    }

    /**
     * Create a safe execution context
     * @param {function} fn - Function to execute safely
     * @param {string} context - Context description
     * @param {*} defaultValue - Default return value on error
     * @returns {*} Function result or default value
     */
    safeExecute(fn, context, defaultValue = null) {
        try {
            return fn();
        } catch (error) {
            this.logError('SAFE_EXECUTE_ERROR', error, { context: context });
            return defaultValue;
        }
    }

    /**
     * Create a safe async execution context
     * @param {function} fn - Async function to execute safely
     * @param {string} context - Context description
     * @param {*} defaultValue - Default return value on error
     * @returns {Promise} Promise resolving to result or default value
     */
    async safeExecuteAsync(fn, context, defaultValue = null) {
        try {
            return await fn();
        } catch (error) {
            this.logError('SAFE_EXECUTE_ASYNC_ERROR', error, { context: context });
            return defaultValue;
        }
    }

    /**
     * Assert a condition and log error if false
     * @param {boolean} condition - Condition to assert
     * @param {string} message - Error message if assertion fails
     * @param {object} context - Additional context
     * @returns {boolean} True if assertion passed
     */
    assert(condition, message, context = {}) {
        if (!condition) {
            this.logError('ASSERTION_FAILED', new Error(message), context, 'ERROR');
            return false;
        }
        return true;
    }

    /**
     * Validate object properties and log errors for missing/invalid ones
     * @param {object} obj - Object to validate
     * @param {object} schema - Validation schema
     * @param {string} context - Validation context
     * @returns {boolean} True if validation passed
     */
    validateObject(obj, schema, context = 'object_validation') {
        if (!obj || typeof obj !== 'object') {
            this.logError('VALIDATION_ERROR', new Error('Invalid object'), { context: context });
            return false;
        }

        let isValid = true;
        for (const [key, validator] of Object.entries(schema)) {
            if (typeof validator === 'function') {
                if (!validator(obj[key])) {
                    this.logError('VALIDATION_ERROR', new Error(`Invalid property: ${key}`), {
                        context: context,
                        property: key,
                        value: obj[key]
                    });
                    isValid = false;
                }
            } else if (validator.required && !(key in obj)) {
                this.logError('VALIDATION_ERROR', new Error(`Missing required property: ${key}`), {
                    context: context,
                    property: key
                });
                isValid = false;
            }
        }

        return isValid;
    }

    /**
     * Get current game state for error context
     * @returns {object} Game state information
     */
    getGameState() {
        try {
            if (typeof IdleAnts !== 'undefined' && IdleAnts.app) {
                const game = IdleAnts.app;
                return {
                    state: game.state || 'unknown',
                    frameCounter: game.frameCounter || 0,
                    resourcesFood: game.resourceManager ? game.resourceManager.resources.food : 'unknown',
                    antCount: game.entityManager ? game.entityManager.getAntCount() : 'unknown'
                };
            }
        } catch (error) {
            // Don't log errors while getting game state to avoid recursion
        }
        
        return { state: 'unavailable' };
    }

    /**
     * Generate unique error ID
     * @returns {string} Unique error identifier
     */
    generateErrorId() {
        return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Console logging based on severity
     * @param {object} errorEntry - Error entry to log
     */
    consoleLog(errorEntry) {
        const message = `[${errorEntry.severity}] ${errorEntry.type}: ${errorEntry.message}`;
        
        switch (errorEntry.severity) {
            case 'DEBUG':
                console.debug(message, errorEntry);
                break;
            case 'INFO':
                console.info(message, errorEntry);
                break;
            case 'WARN':
                console.warn(message, errorEntry);
                break;
            case 'ERROR':
                console.error(message, errorEntry);
                break;
            case 'FATAL':
                console.error(`🚨 FATAL ERROR: ${message}`, errorEntry);
                break;
            default:
                console.log(message, errorEntry);
        }
    }

    /**
     * Handle fatal errors with recovery attempts
     * @param {object} errorEntry - Fatal error entry
     */
    handleFatalError(errorEntry) {
        console.error('🚨 FATAL ERROR DETECTED - Attempting recovery...', errorEntry);
        
        // Attempt to save game state
        this.safeExecute(() => {
            if (typeof IdleAnts !== 'undefined' && IdleAnts.app && IdleAnts.app.saveGame) {
                IdleAnts.app.saveGame();
                console.log('✅ Game state saved successfully');
            }
        }, 'fatal_error_save_game');

        // Show user notification
        this.showFatalErrorUI(errorEntry);
    }

    /**
     * Show fatal error UI to user
     * @param {object} errorEntry - Error entry
     */
    showFatalErrorUI(errorEntry) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            font-family: monospace;
            padding: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        `;

        errorDiv.innerHTML = `
            <h2>🚨 Game Error Detected</h2>
            <p>A critical error has occurred, but your progress has been saved.</p>
            <p>Error ID: ${errorEntry.id}</p>
            <p>Time: ${errorEntry.timestamp}</p>
            <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; font-size: 16px;">
                Reload Game
            </button>
            <details style="margin-top: 20px; max-width: 80%; text-align: left;">
                <summary>Technical Details</summary>
                <pre style="background: #333; padding: 10px; margin-top: 10px; overflow: auto; max-height: 200px;">
${JSON.stringify(errorEntry, null, 2)}
                </pre>
            </details>
        `;

        document.body.appendChild(errorDiv);
    }

    /**
     * Add error listener
     * @param {function} listener - Error listener function
     */
    addListener(listener) {
        this.listeners.push(listener);
    }

    /**
     * Remove error listener
     * @param {function} listener - Error listener function to remove
     */
    removeListener(listener) {
        const index = this.listeners.indexOf(listener);
        if (index > -1) {
            this.listeners.splice(index, 1);
        }
    }

    /**
     * Notify all listeners of error
     * @param {object} errorEntry - Error entry
     */
    notifyListeners(errorEntry) {
        this.listeners.forEach(listener => {
            try {
                listener(errorEntry);
            } catch (error) {
                console.error('Error in error listener:', error);
            }
        });
    }

    /**
     * Get error statistics
     * @returns {object} Error statistics
     */
    getErrorStats() {
        const stats = {
            totalErrors: this.errors.length,
            errorsByType: {},
            errorsBySeverity: {},
            mostFrequentErrors: Array.from(this.errorCounts.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10),
            recentErrors: this.errors.slice(-10)
        };

        this.errors.forEach(error => {
            stats.errorsByType[error.type] = (stats.errorsByType[error.type] || 0) + 1;
            stats.errorsBySeverity[error.severity] = (stats.errorsBySeverity[error.severity] || 0) + 1;
        });

        return stats;
    }

    /**
     * Clear error history
     */
    clearErrors() {
        this.errors = [];
        this.errorCounts.clear();
    }

    /**
     * Export errors for debugging/reporting
     * @returns {string} JSON string of errors
     */
    exportErrors() {
        return JSON.stringify({
            errors: this.errors,
            stats: this.getErrorStats(),
            exportTime: new Date().toISOString()
        }, null, 2);
    }

    /**
     * Get singleton instance
     * @returns {IdleAnts.Core.ErrorHandler} Singleton instance
     */
    static getInstance() {
        if (!IdleAnts.Core.ErrorHandler._instance) {
            IdleAnts.Core.ErrorHandler._instance = new IdleAnts.Core.ErrorHandler();
        }
        return IdleAnts.Core.ErrorHandler._instance;
    }
};

// Initialize global error handler
if (typeof window !== 'undefined') {
    IdleAnts.Core.ErrorHandler.getInstance();
    
    // Add to global scope for easy access
    window.ErrorHandler = IdleAnts.Core.ErrorHandler.getInstance();
}