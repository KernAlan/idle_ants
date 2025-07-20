/**
 * GameStateManager - Handles game state transitions and state-specific logic
 * Extracted from Game.js to improve maintainability
 */

// Ensure Game namespace exists
if (!IdleAnts.Game) {
    IdleAnts.Game = {};
}

IdleAnts.Game.StateManager = class {
    // Define game state constants
    static States = {
        INITIALIZING: 'initializing', // Loading assets and setup
        PLAYING: 'playing',           // Main gameplay
        PAUSED: 'paused',             // Game paused
        UPGRADING: 'upgrading',       // Player is viewing/selecting upgrades
        BOSS_INTRO: 'boss_intro',     // Cinematic intro sequence
        BOSS_FIGHT: 'boss_fight',     // Active boss combat
        WIN: 'win',                   // Player defeated the boss
        LOSE: 'lose'                  // Colony wiped out
    };

    constructor(game) {
        this.game = game;
        this.currentState = IdleAnts.Game.StateManager.States.INITIALIZING;
        this.previousState = null;
        this.stateChangeListeners = [];
    }

    /**
     * Get the current game state
     * @returns {string} Current state
     */
    getState() {
        return this.currentState;
    }

    /**
     * Get the previous game state
     * @returns {string|null} Previous state
     */
    getPreviousState() {
        return this.previousState;
    }

    /**
     * Check if the game is in a specific state
     * @param {string} state - State to check
     * @returns {boolean} True if in specified state
     */
    isInState(state) {
        return this.currentState === state;
    }

    /**
     * Check if the game is in any of the provided states
     * @param {string[]} states - Array of states to check
     * @returns {boolean} True if in any of the specified states
     */
    isInAnyState(states) {
        return states.includes(this.currentState);
    }

    /**
     * Set the game state with proper transition handling
     * @param {string} newState - New state to transition to
     */
    setState(newState) {
        if (this.currentState === newState) {
            return; // No change needed
        }

        const oldState = this.currentState;
        this.previousState = oldState;
        this.currentState = newState;

        console.log(`Game state changed: ${oldState} -> ${newState}`);

        // Handle state-specific transitions
        this.handleStateTransition(newState, oldState);

        // Notify listeners
        this.notifyStateChange(newState, oldState);
    }

    /**
     * Add a state change listener
     * @param {function} callback - Function to call on state change
     */
    addStateChangeListener(callback) {
        this.stateChangeListeners.push(callback);
    }

    /**
     * Remove a state change listener
     * @param {function} callback - Function to remove
     */
    removeStateChangeListener(callback) {
        const index = this.stateChangeListeners.indexOf(callback);
        if (index > -1) {
            this.stateChangeListeners.splice(index, 1);
        }
    }

    /**
     * Notify all listeners of state change
     * @param {string} newState - New state
     * @param {string} oldState - Previous state
     */
    notifyStateChange(newState, oldState) {
        this.stateChangeListeners.forEach(listener => {
            try {
                listener(newState, oldState);
            } catch (error) {
                console.error('Error in state change listener:', error);
            }
        });
    }

    /**
     * Handle state-specific transition logic
     * @param {string} newState - State being transitioned to
     * @param {string} oldState - State being transitioned from
     */
    handleStateTransition(newState, oldState) {
        const States = IdleAnts.Game.StateManager.States;

        switch(newState) {
            case States.PLAYING:
                this.handlePlayingState();
                break;
                
            case States.PAUSED:
                this.handlePausedState();
                break;
                
            case States.UPGRADING:
                this.handleUpgradingState();
                break;
                
            case States.BOSS_INTRO:
            case States.BOSS_FIGHT:
                this.handleBossState();
                break;

            case States.WIN:
                this.handleWinState();
                break;

            case States.LOSE:
                this.handleLoseState();
                break;
        }
    }

    /**
     * Handle transition to PLAYING state
     */
    handlePlayingState() {
        if (this.game.uiManager) {
            this.game.uiManager.updateUI();
            this.game.uiManager.hidePauseOverlay();
            this.game.uiManager.hideUpgradeMenu();
        }
    }

    /**
     * Handle transition to PAUSED state
     */
    handlePausedState() {
        if (this.game.uiManager) {
            this.game.uiManager.showPauseOverlay();
        }
    }

    /**
     * Handle transition to UPGRADING state
     */
    handleUpgradingState() {
        if (this.game.uiManager) {
            this.game.uiManager.showUpgradeMenu();
        }
    }

    /**
     * Handle transition to boss states (BOSS_INTRO or BOSS_FIGHT)
     */
    handleBossState() {
        // Ensure all overlays are closed during boss sequences
        if (this.game.dailyChallengeManager && this.game.dailyChallengeManager.closeModal) {
            this.game.dailyChallengeManager.closeModal();
        }
        
        // Hide any other potential overlays
        const overlays = document.querySelectorAll('.challenge-modal-backdrop, #win-screen, #lose-screen');
        overlays.forEach(overlay => {
            if (overlay.style) {
                overlay.style.display = 'none';
            }
            overlay.classList.remove('show');
        });
    }

    /**
     * Handle transition to WIN state
     */
    handleWinState() {
        if (this.game.uiManager) {
            this.game.uiManager.showWinScreen();
        }
    }

    /**
     * Handle transition to LOSE state
     */
    handleLoseState() {
        if (this.game.uiManager) {
            this.game.uiManager.showLoseScreen();
        }
    }

    /**
     * Get available state transitions from current state
     * @returns {string[]} Array of valid next states
     */
    getValidTransitions() {
        const States = IdleAnts.Game.StateManager.States;
        
        switch(this.currentState) {
            case States.INITIALIZING:
                return [States.PLAYING];
                
            case States.PLAYING:
                return [States.PAUSED, States.UPGRADING, States.BOSS_INTRO, States.LOSE];
                
            case States.PAUSED:
                return [States.PLAYING, States.UPGRADING];
                
            case States.UPGRADING:
                return [States.PLAYING, States.PAUSED];
                
            case States.BOSS_INTRO:
                return [States.BOSS_FIGHT, States.PLAYING];
                
            case States.BOSS_FIGHT:
                return [States.WIN, States.LOSE, States.PLAYING];
                
            case States.WIN:
            case States.LOSE:
                return [States.PLAYING];
                
            default:
                return [];
        }
    }

    /**
     * Check if a state transition is valid
     * @param {string} targetState - State to transition to
     * @returns {boolean} True if transition is valid
     */
    canTransitionTo(targetState) {
        return this.getValidTransitions().includes(targetState);
    }

    /**
     * Force a state transition (bypasses validation)
     * @param {string} newState - State to force
     */
    forceState(newState) {
        console.warn(`Forcing state transition to: ${newState}`);
        this.setState(newState);
    }
};

