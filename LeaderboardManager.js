class LeaderboardManager {
    constructor() {
        this.githubLeaderboard = new GitHubLeaderboard();
    }

    // Calculate composite score based on game metrics (Balanced 25/25/25/25 approach)
    calculateScore(gameData) {
        const {
            resourceManager,
            achievementManager,
            dailyChallengeManager
        } = gameData;

        let score = 0;
        const BASE_SCORE = 10000; // Baseline score for completing the game

        // === RESOURCE MANAGEMENT (25% of total score) ===
        let resourceScore = 0;
        
        // Food collection with logarithmic scaling (no harsh cap)
        const foodCollected = achievementManager.progress.foodCollected || 0;
        const foodScore = Math.log10(Math.max(foodCollected, 1)) * 2000; // Scales well with growth
        
        // Peak concurrent ants (reward good colony management)
        const peakAnts = achievementManager.progress.peakConcurrentAnts || 0;
        const antScore = peakAnts * 150; // 150 points per peak concurrent ant
        
        // Average efficiency over lifetime
        const averageFoodPerSecond = this.calculateAverageFoodPerSecond(achievementManager);
        const efficiencyScore = Math.log10(Math.max(averageFoodPerSecond, 0.1)) * 1500;
        
        resourceScore = foodScore + antScore + efficiencyScore;

        // === PROGRESSION (25% of total score) ===  
        let progressionScore = 0;
        
        // Upgrades and tiers
        const upgradeScore = (achievementManager.progress.upgradesPurchased || 0) * 300;
        const tierScore = (resourceManager.stats.foodTier || 1) * 800;
        
        // Time played (no harsh cap, diminishing returns)
        const hoursPlayed = (achievementManager.progress.playTime || 0) / 3600;
        const timeScore = Math.log10(Math.max(hoursPlayed, 0.1)) * 3000;
        
        // Colony capacity expansions
        const maxAnts = resourceManager.stats.maxAnts || 10;
        const capacityScore = (maxAnts - 10) * 100; // Bonus for each expansion beyond base 10
        
        progressionScore = upgradeScore + tierScore + timeScore + capacityScore;

        // === ADVANCED CONTENT (25% of total score) ===
        let advancedScore = 0;
        
        // Balanced special unit scoring
        const flyingAnts = resourceManager.stats.flyingAnts || 0;
        const carAnts = resourceManager.stats.carAnts || 0;
        const fireAnts = resourceManager.stats.fireAnts || 0;
        const queenLevel = resourceManager.stats.queenUpgradeLevel || 0;
        
        advancedScore += flyingAnts * 200; // Balanced unit values
        advancedScore += carAnts * 300;    // Slightly higher but not overpowered
        advancedScore += fireAnts * 250;   // Between flying and car ants
        advancedScore += queenLevel * 600; // Queen upgrades valuable but not excessive
        
        // Feature unlocks
        if (resourceManager.stats.autofeederUnlocked) advancedScore += 2000;
        if (resourceManager.stats.flyingAntsUnlocked) advancedScore += 1000;
        if (resourceManager.stats.carAntsUnlocked) advancedScore += 1200;
        if (resourceManager.stats.fireAntsUnlocked) advancedScore += 1100;
        
        // Multiplier bonuses (reward long-term investment)
        const speedMultiplier = resourceManager.stats.speedMultiplier || 1;
        const strengthMultiplier = resourceManager.stats.strengthMultiplier || 1;
        advancedScore += (speedMultiplier - 1) * 500; // Bonus points above 1x
        advancedScore += (strengthMultiplier - 1) * 500;

        // === ACHIEVEMENTS & CHALLENGES (25% of total score) ===
        let achievementScore = 0;
        
        // Regular achievements
        const achievementCount = this.countUnlockedAchievements(achievementManager);
        achievementScore += achievementCount * 400; // Higher value per achievement
        
        // Daily challenges
        const challengesCompleted = this.countCompletedChallenges(dailyChallengeManager);
        achievementScore += challengesCompleted * 800; // Significant but not overwhelming
        
        // Golden Ant (still special but balanced)
        if (dailyChallengeManager.goldenAntSpawned) {
            achievementScore += 15000; // Significant bonus but not game-breaking
            // No additional multiplier - the bonus itself is the reward
        }

        // Combine all categories with equal weight
        score = BASE_SCORE + (resourceScore + progressionScore + advancedScore + achievementScore);

        return Math.round(score);
    }

    // Count unlocked achievements
    countUnlockedAchievements(achievementManager) {
        let count = 0;
        // The achievements object is a flat structure with achievement IDs as keys
        for (const achievementId in achievementManager.achievements) {
            const achievement = achievementManager.achievements[achievementId];
            if (achievement && achievement.unlocked) {
                count++;
            }
        }
        return count;
    }

    // Count completed daily challenges
    countCompletedChallenges(dailyChallengeManager) {
        let count = 0;
        // Daily challenges are stored in currentChallenges array
        if (dailyChallengeManager.currentChallenges && Array.isArray(dailyChallengeManager.currentChallenges)) {
            for (const challenge of dailyChallengeManager.currentChallenges) {
                if (challenge && challenge.completed) count++;
            }
        }
        return count;
    }

    // Calculate average food per second over lifetime
    calculateAverageFoodPerSecond(achievementManager) {
        const playTime = achievementManager.progress.playTime || 1; // Avoid division by zero
        const foodCollected = achievementManager.progress.foodCollected || 0;
        return foodCollected / Math.max(playTime, 1);
    }

    // Prepare leaderboard data from game state
    prepareLeaderboardData(playerName, gameData) {
        const { resourceManager, achievementManager, dailyChallengeManager } = gameData;
        
        return {
            player_name: playerName.substring(0, 50), // Limit to 50 chars
            total_score: this.calculateScore(gameData),
            food_collected: achievementManager.progress.foodCollected,
            play_time: achievementManager.progress.playTime,
            achievements_unlocked: this.countUnlockedAchievements(achievementManager),
            upgrades_purchased: achievementManager.progress.upgradesPurchased,
            highest_food_tier: resourceManager.stats.foodTier,
            max_ants_owned: achievementManager.progress.antsOwned,
            flying_ants_unlocked: resourceManager.stats.flyingAntsUnlocked || false,
            car_ants_unlocked: resourceManager.stats.carAntsUnlocked || false,
            fire_ants_unlocked: resourceManager.stats.fireAntsUnlocked || false,
            queen_unlocked: resourceManager.stats.queenUnlocked || false,
            autofeeder_unlocked: resourceManager.stats.autofeederUnlocked || false,
            food_per_second: this.calculateAverageFoodPerSecond(achievementManager),
            speed_multiplier: resourceManager.stats.speedMultiplier || 1,
            strength_multiplier: resourceManager.stats.strengthMultiplier || 1,
            daily_challenges_completed: this.countCompletedChallenges(dailyChallengeManager),
            golden_ant_spawned: dailyChallengeManager.goldenAntSpawned || false
        };
    }

    // Submit score to GitHub-based leaderboard
    async submitScore(playerName, gameData) {
        try {
            const leaderboardData = this.prepareLeaderboardData(playerName, gameData);
            const result = await this.githubLeaderboard.submitScore(leaderboardData);
            
            if (!result.success) {
                throw new Error(result.error || 'Failed to submit score');
            }
            
            return result;
        } catch (error) {
            console.error('Error submitting score:', error);
            throw error;
        }
    }

    // Get top scores from GitHub-based leaderboard
    async getTopScores(limit = 10) {
        try {
            const scores = await this.githubLeaderboard.getLeaderboard();
            return {
                success: true,
                leaderboard: scores.slice(0, limit).map((score, index) => ({
                    rank: index + 1,
                    ...score
                }))
            };
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            throw error;
        }
    }

    // Get estimated rank for a score
    async getEstimatedRank(score) {
        try {
            const scores = await this.githubLeaderboard.getLeaderboard();
            let rank = 1;
            for (const entry of scores) {
                if (score > entry.total_score) {
                    break;
                }
                rank++;
            }
            return rank;
        } catch (error) {
            console.error('Error getting estimated rank:', error);
            // Fallback to score-based estimation
            if (score > 50000) return Math.floor(Math.random() * 10) + 1;
            if (score > 30000) return Math.floor(Math.random() * 50) + 10;
            if (score > 15000) return Math.floor(Math.random() * 100) + 50;
            return Math.floor(Math.random() * 500) + 100;
        }
    }

    // Show the top leaderboard (called from UI button)
    async showTopLeaderboard() {
        try {
            const topScores = await this.getTopScores(20);
            this.displayLeaderboardModal(topScores.leaderboard);
        } catch (error) {
            console.error('Error showing leaderboard:', error);
            alert('Failed to load leaderboard. Please try again later.');
        }
    }

    // Display leaderboard in a modal
    displayLeaderboardModal(leaderboard) {
        // Remove existing modal if present
        const existing = document.getElementById('leaderboard-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'leaderboard-modal';
        modal.className = 'victory-screen-overlay';
        
        modal.innerHTML = `
            <div class="victory-screen-container leaderboard-screen">
                <div class="victory-header">
                    <h1 class="victory-title">🏆 TOP 20 LEADERBOARD 🏆</h1>
                </div>
                
                <div class="leaderboard-content">
                    <div class="leaderboard-list">
                        ${leaderboard.map((player, index) => `
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
                    <button id="close-leaderboard-modal" class="victory-btn secondary">
                        Close
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add click handler
        document.getElementById('close-leaderboard-modal').onclick = () => {
            modal.remove();
        };

        // Close on background click
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        };

        // Add CSS if not already added
        this.addLeaderboardCSS();
    }

    // Add CSS for leaderboard display
    addLeaderboardCSS() {
        if (document.getElementById('leaderboard-modal-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'leaderboard-modal-styles';
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
                margin: 0 0 30px 0;
                color: #FFD700;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
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
            
            .victory-btn.secondary {
                background: linear-gradient(135deg, #666 0%, #444 100%);
                color: white;
                border: 1px solid #999;
            }
            
            .victory-btn.secondary:hover {
                background: linear-gradient(135deg, #777 0%, #555 100%);
            }
        `;
        
        document.head.appendChild(style);
    }
}