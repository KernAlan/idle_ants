class LeaderboardManager {
    constructor() {
        this.githubLeaderboard = new GitHubLeaderboard();
    }

    // Calculate composite score based on game metrics with TIME PENALTY for optimization
    calculateScore(gameData) {
        const {
            resourceManager,
            achievementManager,
            dailyChallengeManager,
            game
        } = gameData;

        // Calculate session time (for optimization runs)
        // If session hasn't started yet (on title screen), use 0
        const sessionStartTime = game?.sessionStartTime;
        const sessionTimeSeconds = sessionStartTime ? Math.floor((Date.now() - sessionStartTime) / 1000) : 0;
        const sessionMinutes = sessionTimeSeconds / 60;

        // === BASE SCORE CALCULATION (without time penalty) ===
        let baseScore = 0;
        const BASELINE_SCORE = 10000; // Starting score

        // === RESOURCE MANAGEMENT (30% of total score) ===
        let resourceScore = 0;

        // Food collection with logarithmic scaling
        const foodCollected = achievementManager.progress.foodCollected || 0;
        const foodScore = Math.log10(Math.max(foodCollected, 1)) * 2500;

        // Peak concurrent ants (reward good colony management)
        const peakAnts = achievementManager.progress.peakConcurrentAnts || 0;
        const antScore = peakAnts * 200;

        // Average efficiency
        const averageFoodPerSecond = this.calculateAverageFoodPerSecond(achievementManager);
        const efficiencyScore = Math.log10(Math.max(averageFoodPerSecond, 0.1)) * 2000;

        resourceScore = foodScore + antScore + efficiencyScore;

        // === PROGRESSION (30% of total score) ===
        let progressionScore = 0;

        // Upgrades and tiers
        const upgradeScore = (achievementManager.progress.upgradesPurchased || 0) * 400;
        const tierScore = (resourceManager.stats.foodTier || 1) * 1000;

        // Colony capacity expansions
        const maxAnts = resourceManager.stats.maxAnts || 10;
        const capacityScore = (maxAnts - 10) * 150;

        progressionScore = upgradeScore + tierScore + capacityScore;

        // === ADVANCED CONTENT (25% of total score) ===
        let advancedScore = 0;
        
        // Balanced special unit scoring - All special ant types
        const flyingAnts = resourceManager.stats.flyingAnts || 0;
        const carAnts = resourceManager.stats.carAnts || 0;
        const fireAnts = resourceManager.stats.fireAnts || 0;
        const fatAnts = resourceManager.stats.fatAnts || 0;
        const gasAnts = resourceManager.stats.gasAnts || 0;
        const acidAnts = resourceManager.stats.acidAnts || 0;
        const rainbowAnts = resourceManager.stats.rainbowAnts || 0;
        const smokeAnts = resourceManager.stats.smokeAnts || 0;
        const electricAnts = resourceManager.stats.electricAnts || 0;
        const leafCutterAnts = resourceManager.stats.leafCutterAnts || 0;
        const doorAnts = resourceManager.stats.doorAnts || 0;
        const bananaThrowingAnts = resourceManager.stats.bananaThrowingAnts || 0;
        const juiceAnts = resourceManager.stats.juiceAnts || 0;
        const crabAnts = resourceManager.stats.crabAnts || 0;
        const upsideDownAnts = resourceManager.stats.upsideDownAnts || 0;
        const dpsAnts = resourceManager.stats.dpsAnts || 0;
        const spiderAnts = resourceManager.stats.spiderAnts || 0;
        const queenLevel = resourceManager.stats.queenUpgradeLevel || 0;
        
        // Original special ants
        advancedScore += flyingAnts * 200; // Balanced unit values
        advancedScore += carAnts * 300;    // Slightly higher but not overpowered
        advancedScore += fireAnts * 250;   // Between flying and car ants
        
        // New special ant types - Balanced scoring
        advancedScore += fatAnts * 180;         // Basic combat
        advancedScore += gasAnts * 160;         // Basic combat
        advancedScore += acidAnts * 200;        // Exploding
        advancedScore += rainbowAnts * 210;     // Special effects
        advancedScore += smokeAnts * 190;       // Exploding
        advancedScore += electricAnts * 220;    // High-tier exploding
        advancedScore += leafCutterAnts * 240;  // Advanced exploding
        advancedScore += doorAnts * 250;        // Advanced exploding
        advancedScore += bananaThrowingAnts * 280; // Throwing
        advancedScore += juiceAnts * 270;       // Throwing
        advancedScore += crabAnts * 260;        // Throwing
        advancedScore += upsideDownAnts * 150;  // Special utility
        advancedScore += dpsAnts * 300;         // High DPS special
        advancedScore += spiderAnts * 320;      // Elite special
        
        advancedScore += queenLevel * 600; // Queen upgrades valuable but not excessive
        
        // Feature unlocks - Original special ants
        if (resourceManager.stats.autofeederUnlocked) advancedScore += 2000;
        if (resourceManager.stats.flyingAntsUnlocked) advancedScore += 1000;
        if (resourceManager.stats.carAntsUnlocked) advancedScore += 1200;
        if (resourceManager.stats.fireAntsUnlocked) advancedScore += 1100;
        
        // New special ant unlock bonuses
        if (resourceManager.stats.fatAntsUnlocked) advancedScore += 500;
        if (resourceManager.stats.gasAntsUnlocked) advancedScore += 400;
        if (resourceManager.stats.acidAntsUnlocked) advancedScore += 600;
        if (resourceManager.stats.rainbowAntsUnlocked) advancedScore += 650;
        if (resourceManager.stats.smokeAntsUnlocked) advancedScore += 550;
        if (resourceManager.stats.electricAntsUnlocked) advancedScore += 700;
        if (resourceManager.stats.leafCutterAntsUnlocked) advancedScore += 750;
        if (resourceManager.stats.doorAntsUnlocked) advancedScore += 800;
        if (resourceManager.stats.bananaThrowingAntsUnlocked) advancedScore += 900;
        if (resourceManager.stats.juiceAntsUnlocked) advancedScore += 850;
        if (resourceManager.stats.crabAntsUnlocked) advancedScore += 850;
        if (resourceManager.stats.upsideDownAntsUnlocked) advancedScore += 300;
        if (resourceManager.stats.dpsAntsUnlocked) advancedScore += 1000;
        if (resourceManager.stats.spiderAntsUnlocked) advancedScore += 1200;
        
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

        // === CALCULATE BASE SCORE ===
        baseScore = BASELINE_SCORE + resourceScore + progressionScore + advancedScore + achievementScore;

        // === TIME MULTIPLIER (Optimization Scoring) ===
        // TARGET_TIME = 10 minutes (600 seconds)
        // Formula: multiplier = max(0.25, 2.0 - (minutes / 10))
        //
        // Time Curve:
        //  2 mins:  1.8x (aggressive speedrun)
        //  5 mins:  1.5x (fast and efficient)
        // 10 mins:  1.0x (baseline - sweet spot)
        // 15 mins:  0.5x (slow but acceptable)
        // 20 mins:  0.25x (floor - very slow)
        // 30+ mins: 0.25x (minimum multiplier)
        const TARGET_MINUTES = 10;
        const timeMultiplier = Math.max(0.25, 2.0 - (sessionMinutes / TARGET_MINUTES));

        // Apply time multiplier to final score
        const finalScore = Math.round(baseScore * timeMultiplier);

        // Store breakdown for display (attach to result)
        const scoreBreakdown = {
            baseScore: Math.round(baseScore),
            resourceScore: Math.round(resourceScore),
            progressionScore: Math.round(progressionScore),
            advancedScore: Math.round(advancedScore),
            achievementScore: Math.round(achievementScore),
            sessionMinutes: Math.round(sessionMinutes * 10) / 10, // 1 decimal place
            timeMultiplier: Math.round(timeMultiplier * 100) / 100, // 2 decimal places
            finalScore: finalScore
        };

        // Store breakdown for later access
        this.lastScoreBreakdown = scoreBreakdown;

        return finalScore;
    }

    // Get the last score breakdown (for display purposes)
    getLastScoreBreakdown() {
        return this.lastScoreBreakdown || null;
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
        const { resourceManager, achievementManager, dailyChallengeManager, game } = gameData;

        // Calculate session time
        // If session hasn't started yet, use 0
        const sessionStartTime = game?.sessionStartTime;
        const sessionTimeSeconds = sessionStartTime ? Math.floor((Date.now() - sessionStartTime) / 1000) : 0;

        return {
            player_name: playerName.substring(0, 50), // Limit to 50 chars
            total_score: this.calculateScore(gameData),
            food_collected: achievementManager.progress.foodCollected,
            play_time: sessionTimeSeconds, // Use session time instead of lifetime playTime
            session_minutes: Math.round((sessionTimeSeconds / 60) * 10) / 10,
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
                                    ${player.play_time ? ` • ${Math.floor(player.play_time / 3600)}h ${Math.floor((player.play_time % 3600) / 60)}m` : ''}
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
                padding: 10px;
            }
            
            .victory-screen-container {
                background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
                border: 3px solid #FFD700;
                border-radius: 20px;
                padding: 30px;
                max-width: 90vw;
                max-height: 90vh;
                overflow-y: auto;
                color: white;
                text-align: center;
                box-shadow: 0 0 30px rgba(255, 215, 0, 0.3);
                width: 100%;
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
                padding: 15px;
                margin: 8px 0;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 12px;
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
                padding: 15px 25px;
                font-size: 1.1em;
                font-weight: bold;
                border: none;
                border-radius: 12px;
                cursor: pointer;
                transition: all 0.3s ease;
                min-width: 150px;
                min-height: 50px;
            }
            
            .victory-btn.secondary {
                background: linear-gradient(135deg, #666 0%, #444 100%);
                color: white;
                border: 1px solid #999;
            }
            
            .victory-btn.secondary:hover {
                background: linear-gradient(135deg, #777 0%, #555 100%);
            }
            
            @media (max-width: 768px) {
                .victory-screen-overlay {
                    padding: 10px;
                    align-items: flex-start;
                    padding-top: 20px;
                }
                
                .victory-screen-container {
                    padding: 20px;
                    margin: 0;
                    max-width: none;
                    width: 100%;
                    max-height: calc(100vh - 40px);
                    border-radius: 20px;
                }
                
                .victory-title {
                    font-size: 1.8em;
                    margin-bottom: 20px;
                }
                
                .leaderboard-content {
                    margin: 20px 0;
                    max-height: calc(100vh - 200px);
                }
                
                .leaderboard-entry {
                    grid-template-columns: 40px 1fr 100px;
                    gap: 10px;
                    padding: 12px;
                    margin: 6px 0;
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
                
                .leaderboard-entry .stats {
                    font-size: 0.8em;
                    margin-top: 3px;
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
            }
        `;
        
        document.head.appendChild(style);
    }
}