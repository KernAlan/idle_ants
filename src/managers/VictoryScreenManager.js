class VictoryScreenManager {
    constructor(game) {
        this.game = game;
        this.leaderboardManager = new LeaderboardManager();
        this.currentScreen = 'overview';
        this.finalScore = 0;
        this.playerRank = null;
        this.victoryStartTime = null;
    }

    // Main victory sequence - called when boss is defeated
    async showVictorySequence() {
        this.victoryStartTime = Date.now();
        
        // Calculate final score
        const gameData = this.getGameData();
        this.finalScore = this.leaderboardManager.calculateScore(gameData);
        
        // Show overview screen first
        this.showOverviewScreen(gameData);
    }

    // Phase 1: Overview screen (Age of Empires style)
    showOverviewScreen(gameData) {
        const overlay = document.createElement('div');
        overlay.id = 'victory-overlay';
        overlay.className = 'victory-screen-overlay';
        
        // Calculate time played - use a session-based approach instead of lifetime
        const sessionStartTime = gameData.game?.sessionStartTime || Date.now();
        const currentTime = Date.now();
        const sessionTime = Math.floor((currentTime - sessionStartTime) / 1000);
        const playTimeHours = Math.floor(sessionTime / 3600);
        const playTimeMinutes = Math.floor((sessionTime % 3600) / 60);
        
        overlay.innerHTML = `
            <div class="victory-screen-container overview-screen">
                <div class="victory-header">
                    <h1 class="victory-title">🏆 VICTORY! 🏆</h1>
                    <h2 class="victory-subtitle">The Anteater has been defeated!</h2>
                </div>
                
                <div class="victory-stats-grid">
                    <div class="stat-category">
                        <h3>🍯 Colony Statistics</h3>
                        <div class="stat-row">
                            <span>Total Food Collected:</span>
                            <span class="stat-value">${(gameData.achievementManager.progress.foodCollected || 0).toLocaleString()}</span>
                        </div>
                        <div class="stat-row">
                            <span>Peak Ant Population:</span>
                            <span class="stat-value">${(gameData.achievementManager.progress.peakConcurrentAnts || 0).toLocaleString()}</span>
                        </div>
                        <div class="stat-row">
                            <span>Final Food Per Second:</span>
                            <span class="stat-value">${(gameData.resourceManager.getActualFoodRate() || gameData.resourceManager.stats.foodPerSecond || 0).toFixed(1)}</span>
                        </div>
                        <div class="stat-row">
                            <span>Highest Food Tier:</span>
                            <span class="stat-value">Tier ${gameData.resourceManager.stats.foodTier || 1}</span>
                        </div>
                    </div>
                    
                    <div class="stat-category">
                        <h3>⚡ Progression</h3>
                        <div class="stat-row">
                            <span>Total Play Time:</span>
                            <span class="stat-value">${playTimeHours}h ${playTimeMinutes}m</span>
                        </div>
                        <div class="stat-row">
                            <span>Speed Multiplier:</span>
                            <span class="stat-value">${(gameData.resourceManager.stats.speedMultiplier || 1).toFixed(1)}x</span>
                        </div>
                        <div class="stat-row">
                            <span>Strength Multiplier:</span>
                            <span class="stat-value">${(gameData.resourceManager.stats.strengthMultiplier || 1).toFixed(1)}x</span>
                        </div>
                        <div class="stat-row">
                            <span>Daily Challenges Completed:</span>
                            <span class="stat-value">${this.leaderboardManager.countCompletedChallenges(gameData.dailyChallengeManager)}</span>
                        </div>
                    </div>
                    
                    <div class="stat-category">
                        <h3>🐜 Advanced Units</h3>
                        <div class="stat-row">
                            <span>Flying Ants:</span>
                            <span class="stat-value">
                                ${gameData.resourceManager.stats.flyingAnts || 0} / ${gameData.resourceManager.stats.maxFlyingAnts || 0}
                            </span>
                        </div>
                        <div class="stat-row">
                            <span>Car Ants:</span>
                            <span class="stat-value">
                                ${gameData.resourceManager.stats.carAnts || 0} / ${gameData.resourceManager.stats.maxCarAnts || 0}
                            </span>
                        </div>
                        <div class="stat-row">
                            <span>Fire Ants:</span>
                            <span class="stat-value">
                                ${gameData.resourceManager.stats.fireAnts || 0} / ${gameData.resourceManager.stats.maxFireAnts || 0}
                            </span>
                        </div>
                        <div class="stat-row">
                            <span>Queen Ant:</span>
                            <span class="stat-value">
                                Level ${gameData.resourceManager.stats.queenUpgradeLevel || 0}/${gameData.resourceManager.stats.maxQueenUpgradeLevel || 5}
                            </span>
                        </div>
                    </div>
                    
                    ${gameData.dailyChallengeManager.goldenAntSpawned ? `
                    <div class="stat-category golden-ant-section">
                        <h3>🌟 ULTIMATE ACHIEVEMENT 🌟</h3>
                        <div class="golden-ant-display">
                            <div class="golden-ant-icon">🐜✨</div>
                            <div class="golden-ant-text">
                                <div class="golden-ant-title">GOLDEN ANT UNLOCKED!</div>
                                <div class="golden-ant-description">All challenges completed!</div>
                                <div class="golden-ant-bonus">MASSIVE SCORE BONUS APPLIED</div>
                            </div>
                        </div>
                    </div>
                    ` : ''}
                </div>
                
                <div class="victory-score-section">
                    <div class="final-score">
                        <h2>Final Score</h2>
                        <div class="score-value">${this.finalScore.toLocaleString()}</div>
                    </div>
                </div>
                
                <div class="victory-buttons">
                    <button id="continue-to-ranking" class="victory-btn primary">
                        View Your Ranking →
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Add click handler
        document.getElementById('continue-to-ranking').onclick = () => {
            this.showRankingScreen();
        };
        
        // Add CSS if not already added
        this.addVictoryScreenCSS();
    }

    // Phase 2: Ranking screen
    async showRankingScreen() {
        try {
            // Get estimated rank from GitHub leaderboard
            const estimatedRank = await this.leaderboardManager.getEstimatedRank(this.finalScore);
            this.playerRank = estimatedRank;
            
            const overlay = document.getElementById('victory-overlay');
            overlay.innerHTML = `
                <div class="victory-screen-container ranking-screen">
                    <div class="victory-header">
                        <h1 class="victory-title">📊 YOUR RANKING 📊</h1>
                    </div>
                    
                    <div class="ranking-display">
                        <div class="rank-circle">
                            <div class="rank-number">${estimatedRank}</div>
                            <div class="rank-suffix">${this.getRankSuffix(estimatedRank)}</div>
                        </div>
                        
                        <div class="rank-description">
                            <h2>You ranked ${estimatedRank}${this.getRankSuffix(estimatedRank)} place!</h2>
                            <p class="score-display">Score: <strong>${this.finalScore.toLocaleString()}</strong></p>
                            
                            <div class="rank-feedback">
                                ${this.getRankFeedback(estimatedRank)}
                            </div>
                        </div>
                    </div>
                    
                    <div class="victory-buttons">
                        <button id="submit-to-leaderboard" class="victory-btn primary">
                            📝 Submit to Leaderboard
                        </button>
                        <button id="skip-leaderboard" class="victory-btn secondary">
                            Skip Submission
                        </button>
                    </div>
                </div>
            `;
            
            // Add click handlers
            document.getElementById('submit-to-leaderboard').onclick = () => {
                this.showLeaderboardSubmission();
            };
            
            document.getElementById('skip-leaderboard').onclick = () => {
                this.showLeaderboard(false);
            };
            
        } catch (error) {
            console.error('Error showing ranking screen:', error);
            // Fallback to submission screen
            this.showLeaderboardSubmission();
        }
    }

    // Phase 3: Leaderboard submission
    showLeaderboardSubmission() {
        const overlay = document.getElementById('victory-overlay');
        overlay.innerHTML = `
            <div class="victory-screen-container submission-screen">
                <div class="victory-header">
                    <h1 class="victory-title">📝 SUBMIT YOUR SCORE 📝</h1>
                </div>
                
                <div class="submission-content">
                    <div class="score-highlight">
                        <p>Your Final Score</p>
                        <div class="score-value">${this.finalScore.toLocaleString()}</div>
                        ${this.playerRank ? `<p class="rank-text">Estimated Rank: ${this.playerRank}${this.getRankSuffix(this.playerRank)}</p>` : ''}
                    </div>
                    
                    <div class="name-input-section">
                        <label for="player-name">Enter your name or initials:</label>
                        <input type="text" id="player-name" maxlength="20" placeholder="Your name" />
                        <p class="input-help">Max 20 characters</p>
                    </div>
                </div>
                
                <div class="victory-buttons">
                    <button id="submit-score" class="victory-btn primary">
                        🏆 Submit Score
                    </button>
                    <button id="cancel-submission" class="victory-btn secondary">
                        Cancel
                    </button>
                </div>
            </div>
        `;
        
        // Focus the input
        setTimeout(() => {
            document.getElementById('player-name').focus();
        }, 100);
        
        // Add click handlers
        document.getElementById('submit-score').onclick = async () => {
            const playerName = document.getElementById('player-name').value.trim();
            if (!playerName) {
                alert('Please enter your name!');
                return;
            }
            
            await this.submitScore(playerName);
        };
        
        document.getElementById('cancel-submission').onclick = () => {
            this.showLeaderboard(false);
        };
        
        // Allow Enter key to submit
        document.getElementById('player-name').onkeypress = (e) => {
            if (e.key === 'Enter') {
                document.getElementById('submit-score').click();
            }
        };
    }

    // Phase 4: Submit score and show leaderboard
    async submitScore(playerName) {
        try {
            // Show loading state
            document.getElementById('submit-score').textContent = 'Submitting...';
            document.getElementById('submit-score').disabled = true;
            
            const gameData = this.getGameData();
            await this.leaderboardManager.submitScore(playerName, gameData);
            
            // Show success and move to leaderboard
            this.showLeaderboard(true);
            
        } catch (error) {
            console.error('Error submitting score:', error);
            alert('Failed to submit score. Please try again.');
            
            // Re-enable button
            document.getElementById('submit-score').textContent = '🏆 Submit Score';
            document.getElementById('submit-score').disabled = false;
        }
    }

    // Phase 5: Show leaderboard
    async showLeaderboard(justSubmitted = false) {
        try {
            const topScores = await this.leaderboardManager.getTopScores(20);
            
            const overlay = document.getElementById('victory-overlay');
            overlay.innerHTML = `
                <div class="victory-screen-container leaderboard-screen">
                    <div class="victory-header">
                        <h1 class="victory-title">🏆 LEADERBOARD 🏆</h1>
                        ${justSubmitted ? '<p class="success-message">✓ Score submitted successfully!</p>' : ''}
                    </div>
                    
                    <div class="leaderboard-content">
                        <div class="leaderboard-list">
                            ${topScores.leaderboard.map((player, index) => `
                                <div class="leaderboard-entry ${index < 3 ? 'top-three' : ''} ${index < 1 ? 'first-place' : ''}">
                                    <div class="rank">${player.rank}</div>
                                    <div class="player-name">${player.player_name}</div>
                                    <div class="score">${player.total_score.toLocaleString()}</div>
                                    <div class="stats">
                                        ${player.food_collected ? `${(player.food_collected / 1000000).toFixed(1)}M food` : ''}
                                        ${player.achievements_unlocked ? ` • ${player.achievements_unlocked} achievements` : ''}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="victory-buttons">
                        <button id="play-again" class="victory-btn primary">
                            🔄 Play Again
                        </button>
                        <button id="close-victory" class="victory-btn secondary">
                            Close
                        </button>
                    </div>
                </div>
            `;
            
            // Add click handlers
            document.getElementById('play-again').onclick = () => {
                this.restartGame();
            };
            
            document.getElementById('close-victory').onclick = () => {
                this.closeVictoryScreen();
            };
            
        } catch (error) {
            console.error('Error showing leaderboard:', error);
            // Fallback to simple completion screen
            this.showCompletionScreen();
        }
    }

    // Helper methods
    getGameData() {
        return {
            resourceManager: this.game.resourceManager,
            achievementManager: this.game.achievementManager,
            dailyChallengeManager: this.game.dailyChallengeManager,
            game: this.game // Include game instance for session time
        };
    }



    getRankSuffix(rank) {
        const lastDigit = rank % 10;
        const lastTwoDigits = rank % 100;
        
        if (lastTwoDigits >= 11 && lastTwoDigits <= 13) return 'th';
        if (lastDigit === 1) return 'st';
        if (lastDigit === 2) return 'nd';
        if (lastDigit === 3) return 'rd';
        return 'th';
    }

    getRankFeedback(rank) {
        if (rank === 1) return '<p class="gold">🥇 Incredible! You\'re the top player!</p>';
        if (rank <= 3) return '<p class="silver">🥈 Amazing! You\'re in the top 3!</p>';
        if (rank <= 10) return '<p class="bronze">🥉 Excellent! You\'re in the top 10!</p>';
        if (rank <= 50) return '<p class="good">Great job! You\'re in the top 50!</p>';
        if (rank <= 100) return '<p class="decent">Nice work! You\'re in the top 100!</p>';
        return '<p class="encouraging">Good effort! Keep playing to improve your rank!</p>';
    }

    showCompletionScreen() {
        const overlay = document.getElementById('victory-overlay');
        overlay.innerHTML = `
            <div class="victory-screen-container completion-screen">
                <div class="victory-header">
                    <h1 class="victory-title">🏆 GAME COMPLETE! 🏆</h1>
                </div>
                
                <div class="completion-content">
                    <p>Congratulations on defeating the final boss!</p>
                    <div class="score-display">
                        Final Score: <strong>${this.finalScore.toLocaleString()}</strong>
                    </div>
                </div>
                
                <div class="victory-buttons">
                    <button id="play-again" class="victory-btn primary">
                        🔄 Play Again
                    </button>
                </div>
            </div>
        `;
        
        document.getElementById('play-again').onclick = () => {
            this.restartGame();
        };
    }

    restartGame() {
        this.closeVictoryScreen();
        this.game.restartGame();
    }

    closeVictoryScreen() {
        const overlay = document.getElementById('victory-overlay');
        if (overlay) {
            overlay.remove();
        }
    }

    addVictoryScreenCSS() {
        if (document.getElementById('victory-screen-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'victory-screen-styles';
        style.textContent = `
            .victory-screen-overlay {
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
            }
            
            .victory-screen-container {
                background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
                border: 3px solid #FFD700;
                border-radius: 15px;
                padding: 30px;
                max-width: 90vw;
                max-height: 90vh;
                overflow-y: auto;
                color: white;
                text-align: center;
                box-shadow: 0 0 30px rgba(255, 215, 0, 0.3);
            }
            
            .victory-title {
                font-size: 2.5em;
                margin: 0 0 10px 0;
                color: #FFD700;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
            }
            
            .victory-subtitle {
                font-size: 1.2em;
                margin: 0 0 30px 0;
                color: #FFA500;
            }
            
            .victory-stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 25px;
                margin: 30px 0;
                text-align: left;
            }
            
            .stat-category {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 215, 0, 0.3);
                border-radius: 10px;
                padding: 20px;
            }
            
            .stat-category h3 {
                color: #FFD700;
                margin: 0 0 15px 0;
                font-size: 1.1em;
                border-bottom: 1px solid rgba(255, 215, 0, 0.3);
                padding-bottom: 5px;
            }
            
            .stat-row {
                display: flex;
                justify-content: space-between;
                margin: 8px 0;
                padding: 5px 0;
            }
            
            .stat-value {
                font-weight: bold;
                color: #FFA500;
            }
            
            .stat-value.unlocked {
                color: #90EE90;
            }
            
            .stat-value.locked {
                color: #FF6B6B;
            }
            
            .golden-ant-section {
                background: linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 193, 7, 0.1) 100%);
                border: 3px solid #FFD700 !important;
                box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
                animation: golden-glow 2s ease-in-out infinite alternate;
            }
            
            .golden-ant-section h3 {
                color: #FFD700 !important;
                font-size: 1.3em !important;
                text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
                animation: pulse-gold 1.5s ease-in-out infinite;
            }
            
            .golden-ant-display {
                display: flex;
                align-items: center;
                gap: 20px;
                padding: 15px 0;
            }
            
            .golden-ant-icon {
                font-size: 4em;
                animation: bounce-gold 2s ease-in-out infinite;
                filter: drop-shadow(0 0 10px #FFD700);
            }
            
            .golden-ant-text {
                flex: 1;
            }
            
            .golden-ant-title {
                font-size: 1.4em;
                font-weight: bold;
                color: #FFD700;
                text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
                margin-bottom: 5px;
            }
            
            .golden-ant-description {
                font-size: 1.1em;
                color: #FFA500;
                margin-bottom: 8px;
            }
            
            .golden-ant-bonus {
                font-size: 1em;
                color: #90EE90;
                font-weight: bold;
                text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
            }
            
            @keyframes golden-glow {
                0% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.5); }
                100% { box-shadow: 0 0 30px rgba(255, 215, 0, 0.8); }
            }
            
            @keyframes pulse-gold {
                0% { color: #FFD700; }
                50% { color: #FFA500; }
                100% { color: #FFD700; }
            }
            
            @keyframes bounce-gold {
                0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                40% { transform: translateY(-10px); }
                60% { transform: translateY(-5px); }
            }
            
            .victory-score-section {
                margin: 30px 0;
                padding: 20px;
                background: rgba(255, 215, 0, 0.1);
                border: 2px solid #FFD700;
                border-radius: 10px;
            }
            
            .final-score h2 {
                margin: 0 0 10px 0;
                color: #FFD700;
            }
            
            .score-value {
                font-size: 2.5em;
                font-weight: bold;
                color: #FFD700;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
            }
            
            .ranking-display {
                margin: 30px 0;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 40px;
                flex-wrap: wrap;
            }
            
            .rank-circle {
                width: 150px;
                height: 150px;
                border: 5px solid #FFD700;
                border-radius: 50%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                background: radial-gradient(circle, rgba(255,215,0,0.2) 0%, rgba(255,215,0,0.05) 100%);
            }
            
            .rank-number {
                font-size: 3em;
                font-weight: bold;
                color: #FFD700;
                line-height: 1;
            }
            
            .rank-suffix {
                font-size: 1.2em;
                color: #FFA500;
                margin-top: -5px;
            }
            
            .rank-description h2 {
                color: #FFD700;
                margin-bottom: 15px;
            }
            
            .score-display {
                font-size: 1.2em;
                margin: 15px 0;
            }
            
            .rank-feedback {
                margin-top: 20px;
                font-size: 1.1em;
            }
            
            .rank-feedback .gold { color: #FFD700; }
            .rank-feedback .silver { color: #C0C0C0; }
            .rank-feedback .bronze { color: #CD7F32; }
            .rank-feedback .good { color: #90EE90; }
            .rank-feedback .decent { color: #87CEEB; }
            .rank-feedback .encouraging { color: #DDA0DD; }
            
            .submission-content {
                margin: 30px 0;
            }
            
            .score-highlight {
                background: rgba(255, 215, 0, 0.1);
                border: 2px solid #FFD700;
                border-radius: 10px;
                padding: 20px;
                margin-bottom: 30px;
            }
            
            .name-input-section {
                margin: 20px 0;
            }
            
            .name-input-section label {
                display: block;
                margin-bottom: 10px;
                color: #FFD700;
                font-weight: bold;
            }
            
            .name-input-section input {
                width: 300px;
                max-width: 100%;
                padding: 12px;
                font-size: 1.1em;
                border: 2px solid #FFD700;
                border-radius: 5px;
                background: rgba(255, 255, 255, 0.1);
                color: white;
                text-align: center;
            }
            
            .input-help {
                font-size: 0.9em;
                color: #CCC;
                margin-top: 5px;
            }
            
            .leaderboard-content {
                margin: 30px 0;
                max-height: 400px;
                overflow-y: auto;
            }
            
            .leaderboard-list {
                text-align: left;
            }
            
            .leaderboard-entry {
                display: grid;
                grid-template-columns: 50px 1fr 120px;
                gap: 15px;
                padding: 12px;
                margin: 5px 0;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 8px;
                align-items: center;
            }
            
            .leaderboard-entry.top-three {
                background: rgba(255, 215, 0, 0.1);
                border: 1px solid rgba(255, 215, 0, 0.3);
            }
            
            .leaderboard-entry.first-place {
                background: rgba(255, 215, 0, 0.2);
                border: 2px solid #FFD700;
            }
            
            .leaderboard-entry .rank {
                font-weight: bold;
                font-size: 1.2em;
                color: #FFD700;
                text-align: center;
            }
            
            .leaderboard-entry .player-name {
                font-weight: bold;
                color: white;
            }
            
            .leaderboard-entry .score {
                font-weight: bold;
                color: #FFA500;
                text-align: right;
            }
            
            .leaderboard-entry .stats {
                grid-column: 2 / 4;
                font-size: 0.9em;
                color: #CCC;
                margin-top: 5px;
            }
            
            .victory-buttons {
                margin-top: 30px;
                display: flex;
                gap: 15px;
                justify-content: center;
                flex-wrap: wrap;
            }
            
            .victory-btn {
                padding: 12px 25px;
                font-size: 1.1em;
                font-weight: bold;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
                min-width: 150px;
            }
            
            .victory-btn.primary {
                background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
                color: #000;
                box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
            }
            
            .victory-btn.primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(255, 215, 0, 0.4);
            }
            
            .victory-btn.secondary {
                background: linear-gradient(135deg, #666 0%, #444 100%);
                color: white;
                border: 1px solid #999;
            }
            
            .victory-btn.secondary:hover {
                background: linear-gradient(135deg, #777 0%, #555 100%);
            }
            
            .victory-btn:disabled {
                opacity: 0.6;
                cursor: not-allowed;
                transform: none !important;
            }
            
            .success-message {
                color: #90EE90;
                font-weight: bold;
                margin: 10px 0;
            }
            
            .rank-text {
                color: #FFA500;
                font-weight: bold;
                margin-top: 10px;
            }
            
            @media (max-width: 768px) {
                .victory-screen-overlay {
                    padding: 10px;
                }
                
                .victory-screen-container {
                    padding: 20px;
                    margin: 0;
                    max-width: none;
                    width: 100%;
                    max-height: calc(100vh - 20px);
                    overflow-y: auto;
                    border-radius: 20px;
                }
                
                .victory-title {
                    font-size: 1.8em;
                    margin-bottom: 15px;
                }
                
                .victory-subtitle {
                    font-size: 1em;
                    margin-bottom: 20px;
                }
                
                .victory-stats-grid {
                    grid-template-columns: 1fr;
                    gap: 15px;
                    margin: 20px 0;
                }
                
                .stat-category {
                    padding: 15px;
                    border-radius: 15px;
                }
                
                .stat-category h3 {
                    font-size: 1.1em;
                    margin-bottom: 12px;
                }
                
                .stat-row {
                    flex-direction: column;
                    text-align: center;
                    gap: 5px;
                    margin: 10px 0;
                    padding: 8px 0;
                }
                
                .stat-value {
                    font-size: 1.2em;
                    font-weight: bold;
                }
                
                .victory-score-section {
                    margin: 20px 0;
                    padding: 15px;
                    border-radius: 15px;
                }
                
                .score-value {
                    font-size: 2em;
                }
                
                .ranking-display {
                    flex-direction: column;
                    gap: 20px;
                    margin: 20px 0;
                }
                
                .rank-circle {
                    width: 120px;
                    height: 120px;
                }
                
                .rank-number {
                    font-size: 2.5em;
                }
                
                .rank-description h2 {
                    font-size: 1.3em;
                    margin-bottom: 10px;
                }
                
                .submission-content {
                    margin: 20px 0;
                }
                
                .score-highlight {
                    padding: 15px;
                    margin-bottom: 20px;
                    border-radius: 15px;
                }
                
                .name-input-section input {
                    width: 100%;
                    max-width: 300px;
                    padding: 15px;
                    font-size: 16px; /* Prevents zoom on iOS */
                    border-radius: 10px;
                }
                
                .leaderboard-content {
                    margin: 20px 0;
                    max-height: 300px;
                }
                
                .leaderboard-entry {
                    grid-template-columns: 40px 1fr 100px;
                    gap: 10px;
                    padding: 12px;
                    margin: 8px 0;
                    border-radius: 10px;
                }
                
                .leaderboard-entry .rank {
                    font-size: 1.1em;
                }
                
                .leaderboard-entry .player-name {
                    font-size: 1em;
                }
                
                .leaderboard-entry .score {
                    font-size: 0.9em;
                }
                
                .victory-buttons {
                    flex-direction: column;
                    align-items: center;
                    gap: 12px;
                    margin-top: 20px;
                }
                
                .victory-btn {
                    width: 100%;
                    max-width: 280px;
                    padding: 15px 20px;
                    font-size: 16px;
                    min-height: 50px;
                    border-radius: 12px;
                }
                
                .golden-ant-display {
                    flex-direction: column;
                    text-align: center;
                    gap: 15px;
                }
                
                .golden-ant-icon {
                    font-size: 3em;
                }
                
                .golden-ant-title {
                    font-size: 1.2em;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
}