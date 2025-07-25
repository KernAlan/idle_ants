// Integration file to connect leaderboard system with the existing game
class GameLeaderboardIntegration {
    constructor(game) {
        this.game = game;
        this.leaderboardManager = null;
        this.victoryScreenManager = null;
        this.initialized = false;
    }

    // Initialize the leaderboard system
    async initialize() {
        if (this.initialized) return;

        try {
            // Check if required classes are available
            if (typeof LeaderboardManager === 'undefined') {
                throw new Error('LeaderboardManager class not found - check script loading order');
            }
            if (typeof VictoryScreenManager === 'undefined') {
                throw new Error('VictoryScreenManager class not found - check script loading order');
            }
            if (typeof GitHubLeaderboard === 'undefined') {
                throw new Error('GitHubLeaderboard class not found - check script loading order');
            }

            // Create instances
            this.leaderboardManager = new LeaderboardManager();
            this.victoryScreenManager = new VictoryScreenManager(this.game);
            
            // Make them available globally for UI buttons
            this.game.leaderboardManager = this.leaderboardManager;
            this.game.victoryScreenManager = this.victoryScreenManager;
            
            this.initialized = true;
            console.log('Leaderboard system initialized successfully');
        } catch (error) {
            console.error('Failed to initialize leaderboard system:', error);
            console.log('Available classes:', {
                LeaderboardManager: typeof LeaderboardManager,
                VictoryScreenManager: typeof VictoryScreenManager,
                GitHubLeaderboard: typeof GitHubLeaderboard
            });
        }
    }

    // Modified victory handler to include leaderboard flow
    async handleVictory() {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            // Show the victory sequence with leaderboard integration
            await this.victoryScreenManager.showVictorySequence();
        } catch (error) {
            console.error('Error in victory sequence:', error);
            // Fallback to simple victory message
            this.showSimpleVictoryMessage();
        }
    }

    // Fallback victory message if leaderboard fails
    showSimpleVictoryMessage() {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: Arial, sans-serif;
        `;
        
        overlay.innerHTML = `
            <div style="
                background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
                border: 3px solid #FFD700;
                border-radius: 15px;
                padding: 40px;
                text-align: center;
                color: white;
                max-width: 500px;
            ">
                <h1 style="color: #FFD700; font-size: 2.5em; margin: 0 0 20px 0;">
                    🏆 VICTORY! 🏆
                </h1>
                <p style="font-size: 1.2em; margin: 20px 0;">
                    The Anteater has been defeated!<br>
                    Your colony has survived the ultimate test!
                </p>
                <button onclick="this.parentElement.parentElement.remove(); IdleAnts.game.restartGame();" style="
                    padding: 15px 30px;
                    font-size: 1.2em;
                    background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
                    color: black;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: bold;
                    margin-top: 20px;
                ">
                    Play Again
                </button>
            </div>
        `;
        
        document.body.appendChild(overlay);
    }

    // Show leaderboard from UI button
    async showLeaderboard() {
        try {
            if (!this.initialized) {
                await this.initialize();
            }

            if (this.leaderboardManager) {
                await this.leaderboardManager.showTopLeaderboard();
            } else {
                console.warn('Leaderboard system not initialized properly');
                this.showFallbackMessage('Leaderboard system is not available right now. Please try again later.');
            }
        } catch (error) {
            console.error('Error showing leaderboard:', error);
            this.showFallbackMessage('Failed to load leaderboard. Please check your internet connection and try again.');
        }
    }

    // Show a fallback message when leaderboard fails
    showFallbackMessage(message) {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: Arial, sans-serif;
        `;
        
        overlay.innerHTML = `
            <div style="
                background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
                border: 2px solid #FFD700;
                border-radius: 15px;
                padding: 30px;
                text-align: center;
                color: white;
                max-width: 400px;
            ">
                <h2 style="color: #FFD700; margin: 0 0 15px 0;">
                    ⚠️ Leaderboard Unavailable
                </h2>
                <p style="margin: 15px 0; line-height: 1.4;">
                    ${message}
                </p>
                <button onclick="this.parentElement.parentElement.remove();" style="
                    padding: 12px 25px;
                    font-size: 1.1em;
                    background: linear-gradient(135deg, #666 0%, #444 100%);
                    color: white;
                    border: 1px solid #999;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: bold;
                    margin-top: 15px;
                ">
                    OK
                </button>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (overlay.parentElement) {
                overlay.remove();
            }
        }, 5000);
    }
}