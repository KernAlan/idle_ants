// src/managers/DailyChallengeManager.js
IdleAnts.Managers.DailyChallengeManager = class {
    constructor(resourceManager, achievementManager) {
        this.resourceManager = resourceManager;
        this.achievementManager = achievementManager;
        
        // Challenge templates - 12 progression milestones
        this.challengeTemplates = {
            // Early Game (1-3)
            firstColony: {
                id: 'firstColony',
                name: '🐜 First Colony',
                description: 'Build a colony of {target} ants',
                type: 'antCount',
                baseTarget: 10,
                multiplier: 1,
                reward: { type: 'food', amount: 500 },
                icon: '🐜',
                category: 'milestone'
            },
            firstMilestone: {
                id: 'firstMilestone',
                name: '🌱 First Harvest',
                description: 'Collect {target} total food',
                type: 'foodCollected',
                baseTarget: 1000,
                multiplier: 1,
                reward: { type: 'food', amount: 1000 },
                icon: '🌱',
                category: 'milestone'
            },
            firstUpgrade: {
                id: 'firstUpgrade',
                name: '⬆️ Power Up',
                description: 'Reach {target}x multiplier (speed or strength)',
                type: 'multiplier',
                baseTarget: 2,
                multiplier: 1,
                reward: { type: 'food', amount: 2000 },
                icon: '⬆️',
                category: 'milestone'
            },
            // Mid Game (4-8)
            mediumColony: {
                id: 'mediumColony',
                name: '🏘️ Growing Colony',
                description: 'Build a colony of {target} ants',
                type: 'antCount',
                baseTarget: 30,
                multiplier: 1,
                reward: { type: 'food', amount: 5000 },
                icon: '🏘️',
                category: 'milestone'
            },
            flyingAnts: {
                id: 'flyingAnts',
                name: '🚁 Take Flight',
                description: 'Unlock Flying Ants',
                type: 'unlock',
                baseTarget: 1,
                multiplier: 1,
                reward: { type: 'food', amount: 10000 },
                icon: '🚁',
                category: 'milestone'
            },
            spiderSlayer: {
                id: 'spiderSlayer',
                name: '🕷️ Spider Slayer',
                description: 'Defeat the Spider Boss',
                type: 'boss',
                baseTarget: 1,
                multiplier: 1,
                reward: { type: 'food', amount: 15000 },
                icon: '🕷️',
                category: 'milestone'
            },
            efficiency100: {
                id: 'efficiency100',
                name: '📈 Efficient Colony',
                description: 'Reach {target} food per second',
                type: 'foodPerSecond',
                baseTarget: 100,
                multiplier: 1,
                reward: { type: 'food', amount: 20000 },
                icon: '📈',
                category: 'milestone'
            },
            foodHoarder: {
                id: 'foodHoarder',
                name: '🍯 Food Hoarder',
                description: 'Collect {target} total food',
                type: 'foodCollected',
                baseTarget: 100000,
                multiplier: 1,
                reward: { type: 'food', amount: 25000 },
                icon: '🍯',
                category: 'milestone'
            },
            // Late Game (9-12)
            largeColony: {
                id: 'largeColony',
                name: '🏛️ Ant Empire',
                description: 'Build a colony of {target} ants',
                type: 'antCount',
                baseTarget: 50,
                multiplier: 1,
                reward: { type: 'food', amount: 30000 },
                icon: '🏛️',
                category: 'milestone'
            },
            allUnits: {
                id: 'allUnits',
                name: '🎖️ Full Arsenal',
                description: 'Unlock all special ant types',
                type: 'unlockAll',
                baseTarget: 1,
                multiplier: 1,
                reward: { type: 'food', amount: 35000 },
                icon: '🎖️',
                category: 'milestone'
            },
            tarantulaSlayer: {
                id: 'tarantulaSlayer',
                name: '🕸️ Tarantula Slayer',
                description: 'Defeat the Tarantula Boss',
                type: 'boss',
                baseTarget: 1,
                multiplier: 1,
                reward: { type: 'food', amount: 40000 },
                icon: '🕸️',
                category: 'milestone'
            },
            efficiency800: {
                id: 'efficiency800',
                name: '🚀 Ultimate Efficiency',
                description: 'Reach {target} food per second',
                type: 'foodPerSecond',
                baseTarget: 800,
                multiplier: 1,
                reward: { type: 'food', amount: 50000 },
                icon: '🚀',
                category: 'milestone'
            }
        };
        
        // Current challenges
        this.currentChallenges = [];
        
        // Progress tracking
        this.progress = {
            firstColony: 0,
            firstMilestone: 0,
            firstUpgrade: 0,
            mediumColony: 0,
            flyingAnts: 0,
            spiderSlayer: 0,
            efficiency100: 0,
            foodHoarder: 0,
            largeColony: 0,
            allUnits: 0,
            tarantulaSlayer: 0,
            efficiency800: 0
        };
        
        // Boss defeat tracking
        this.bossesDefeated = {
            spider: false,
            tarantula: false
        };
        
        // Golden ant tracking
        this.goldenAntSpawned = false;
        
        // Modal state
        this.isModalOpen = false;
        
        // Initialize challenges
        this.init();
    }
    
    init() {
        // Generate fresh challenges each time for now
        this.generateDailyChallenges();
        
        // Set up tracking
        this.setupTracking();
        
        // Create UI
        this.createChallengeUI();
        
        // No daily reset needed for permanent challenges
    }
    
    
    generateDailyChallenges() {
        // Clear current challenges
        this.currentChallenges = [];
        
        // Show all 12 challenges - they're permanent milestones
        const challengeTypes = Object.keys(this.challengeTemplates);
        
        // Generate all challenges in order
        challengeTypes.forEach(type => {
            const template = this.challengeTemplates[type];
            const challenge = this.createChallenge(template);
            this.currentChallenges.push(challenge);
        });
        
        // Update UI
        this.updateChallengeUI();
        
        // Show new challenges notification
        this.showNewChallengesNotification();
    }
    
    createChallenge(template) {
        // For milestone challenges, targets are fixed - no scaling
        const target = template.baseTarget;
        
        // Rewards are also fixed for milestones
        const rewardAmount = template.reward.amount;
        
        return {
            id: template.id,
            name: template.name,
            description: template.description.replace('{target}', target),
            type: template.type,
            target: target,
            progress: 0,
            completed: false,
            claimed: false,
            reward: {
                type: template.reward.type,
                amount: rewardAmount
            },
            icon: template.icon
        };
    }
    
    setupTracking() {
        // Track food collection
        const originalAddFood = this.resourceManager.addFood.bind(this.resourceManager);
        this.resourceManager.addFood = (amount, foodType) => {
            const result = originalAddFood(amount, foodType);
            this.trackFoodCollection(amount, foodType);
            return result;
        };
        
        // Periodically update all challenge progress (every 5 seconds)
        setInterval(() => {
            this.updateTracking();
        }, 5000);
    }
    
    // Called by game when specific actions occur
    trackAntPurchase() {
        // Check ant count milestones
        const antCount = this.resourceManager.stats.ants || 0;
        this.updateChallengeProgress('firstColony', antCount);
        this.updateChallengeProgress('mediumColony', antCount);
        this.updateChallengeProgress('largeColony', antCount);
    }
    
    trackUpgrade() {
        // Check multiplier milestone - count upgrades above base level (1.0x)
        const speedMultiplier = this.resourceManager.stats.speedMultiplier || 1;
        const strengthMultiplier = this.resourceManager.stats.strengthMultiplier || 1;
        const maxMultiplier = Math.max(speedMultiplier, strengthMultiplier);
        
        // Only count if we've actually upgraded (above 1.0x = base level)
        const upgradeLevel = maxMultiplier > 1 ? maxMultiplier : 0;
        this.updateChallengeProgress('firstUpgrade', upgradeLevel);
    }
    
    // Track special unit unlocks
    trackUnlock(unitType) {
        if (unitType === 'flyingAnts') {
            this.updateChallengeProgress('flyingAnts', 1);
        }
        
        // Check if all units are unlocked after any unlock
        this.checkAllUnitsUnlocked();
    }
    
    // Check if all special units are unlocked
    checkAllUnitsUnlocked() {
        const allUnlocked = this.resourceManager.stats.flyingAntsUnlocked && 
                          this.resourceManager.stats.carAntsUnlocked && 
                          this.resourceManager.stats.fireAntsUnlocked && 
                          this.resourceManager.stats.queenUnlocked;
        if (allUnlocked) {
            this.updateChallengeProgress('allUnits', 1);
        }
    }
    
    // Track boss defeats
    trackBossDefeat(bossType) {
        if (bossType === 'spider') {
            this.updateChallengeProgress('spiderSlayer', 1);
        } else if (bossType === 'tarantula') {
            this.updateChallengeProgress('tarantulaSlayer', 1);
        }
    }
    
    // Track food collection milestones
    trackFoodCollection(amount, foodType) {
        // Use achievement manager's tracked total
        const totalFoodCollected = this.achievementManager.progress.foodCollected || 0;
        this.updateChallengeProgress('firstMilestone', totalFoodCollected);
        this.updateChallengeProgress('foodHoarder', totalFoodCollected);
        
        // Track efficiency milestones using actual food rate (rounded to whole numbers)
        const actualFoodPerSecond = Math.floor(this.resourceManager.getActualFoodRate() || 0);
        this.updateChallengeProgress('efficiency100', actualFoodPerSecond);
        this.updateChallengeProgress('efficiency800', actualFoodPerSecond);
    }
    
    // Update tracking - simplified for milestone challenges
    updateTracking() {
        // Check ant count milestones
        const antCount = this.resourceManager.stats.ants || 0;
        this.updateChallengeProgress('firstColony', antCount);
        this.updateChallengeProgress('mediumColony', antCount);
        this.updateChallengeProgress('largeColony', antCount);
        
        // Check multiplier milestone - count upgrades above base level (1.0x)
        const speedMultiplier = this.resourceManager.stats.speedMultiplier || 1;
        const strengthMultiplier = this.resourceManager.stats.strengthMultiplier || 1;
        const maxMultiplier = Math.max(speedMultiplier, strengthMultiplier);
        
        // Only count if we've actually upgraded (above 1.0x = base level)
        const upgradeLevel = maxMultiplier > 1 ? maxMultiplier : 0;
        this.updateChallengeProgress('firstUpgrade', upgradeLevel);
        
        // Check food collection milestones
        const totalFoodCollected = this.achievementManager.progress.foodCollected || 0;
        this.updateChallengeProgress('firstMilestone', totalFoodCollected);
        this.updateChallengeProgress('foodHoarder', totalFoodCollected);
        
        // Check efficiency milestones using actual food rate (rounded to whole numbers)
        const actualFoodPerSecond = Math.floor(this.resourceManager.getActualFoodRate() || 0);
        this.updateChallengeProgress('efficiency100', actualFoodPerSecond);
        this.updateChallengeProgress('efficiency800', actualFoodPerSecond);
        
        // Check unlock status
        if (this.resourceManager.stats.flyingAntsUnlocked) {
            this.updateChallengeProgress('flyingAnts', 1);
        }
        
        // Check if all units are unlocked
        this.checkAllUnitsUnlocked();
        
        // Check boss defeats (these need to be tracked when bosses are defeated)
        if (this.bossesDefeated.spider) {
            this.updateChallengeProgress('spiderSlayer', 1);
        }
        if (this.bossesDefeated.tarantula) {
            this.updateChallengeProgress('tarantulaSlayer', 1);
        }
    }
    
    updateChallengeProgress(type, progress) {
        const challenge = this.currentChallenges.find(c => c.id === type);
        if (challenge && !challenge.completed) {
            challenge.progress = Math.min(progress, challenge.target);
            
            if (challenge.progress >= challenge.target) {
                challenge.completed = true;
                this.showChallengeCompletedNotification(challenge);
                
                // Check if all challenges are completed
                this.checkAllChallengesComplete();
            }
            
            this.updateChallengeUI();
            // this.saveData(); // Disabled for now
        }
    }
    
    checkAllChallengesComplete() {
        // Check if all challenges are completed
        const allCompleted = this.currentChallenges.length > 0 && 
                           this.currentChallenges.every(challenge => challenge.completed);
        
        if (allCompleted && !this.goldenAntSpawned) {
            this.spawnGoldenAnt();
        }
    }
    
    spawnGoldenAnt() {
        if (this.goldenAntSpawned) return;
        
        this.goldenAntSpawned = true;
        
        // Show epic notification
        this.showGoldenAntNotification();
        
        // Spawn the golden ant through the entity manager
        if (IdleAnts.game && IdleAnts.game.entityManager) {
            IdleAnts.game.entityManager.createGoldenAnt();
            
            // Update resource manager stats
            IdleAnts.game.resourceManager.stats.ants += 1;
            
        }
    }
    
    showGoldenAntNotification() {
        // Create epic golden ant notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #FFD700, #FFA500, #FFD700);
            color: #000;
            padding: 30px;
            border-radius: 20px;
            font-size: 24px;
            font-weight: bold;
            text-align: center;
            z-index: 20000;
            box-shadow: 0 0 50px rgba(255, 215, 0, 0.8);
            border: 3px solid #FFF;
            animation: goldenPulse 2s infinite alternate;
        `;
        
        notification.innerHTML = `
            <div style="font-size: 48px; margin-bottom: 10px;">👑</div>
            <div>ULTIMATE ACHIEVEMENT!</div>
            <div style="font-size: 18px; margin: 10px 0;">All Daily Challenges Complete</div>
            <div style="font-size: 32px; color: #FFD700; text-shadow: 2px 2px 4px #000;">🌟 GOLDEN ANT SPAWNED! 🌟</div>
            <div style="font-size: 14px; margin-top: 15px; opacity: 0.8;">The legendary ant with ultimate power!</div>
        `;
        
        document.body.appendChild(notification);
        
        // Add pulse animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes goldenPulse {
                0% { transform: translate(-50%, -50%) scale(1); }
                100% { transform: translate(-50%, -50%) scale(1.05); }
            }
        `;
        document.head.appendChild(style);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
            if (style.parentNode) {
                document.head.removeChild(style);
            }
        }, 5000);
        
        // Play special sound if audio manager exists
        if (IdleAnts.AudioManager) {
            // Create golden victory sound effect
            try {
                const audioContext = IdleAnts.AudioManager.audioContext;
                if (audioContext) {
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    
                    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
                    oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.2); // E5
                    oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.4); // G5
                    oscillator.frequency.setValueAtTime(1046.50, audioContext.currentTime + 0.6); // C6
                    
                    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
                    
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 1);
                }
            } catch (error) {
            }
        }
    }

    claimReward(challengeId) {
        const challenge = this.currentChallenges.find(c => c.id === challengeId);
        if (challenge && challenge.completed && !challenge.claimed) {
            challenge.claimed = true;
            
            // Award reward (use silent method to avoid affecting food per second tracking)
            if (challenge.reward.type === 'food') {
                this.resourceManager.addFoodSilent(challenge.reward.amount);
            }
            
            // Show reward notification
            this.showRewardClaimedNotification(challenge);
            
            // Update UI
            this.updateChallengeUI();
            // this.saveData(); // Disabled for now
            
            // Check if all challenges are now claimed (and completed)
            this.checkAllChallengesComplete();
        }
    }
    
    createChallengeUI() {
        // Floating trigger button removed - now only accessible via settings modal
        
        // Create modal backdrop
        const modalBackdrop = document.createElement('div');
        modalBackdrop.id = 'challenge-modal-backdrop';
        modalBackdrop.className = 'challenge-modal-backdrop';
        document.body.appendChild(modalBackdrop);
        
        // Create modal
        const modal = document.createElement('div');
        modal.id = 'challenge-modal';
        modal.className = 'challenge-modal';
        modal.innerHTML = `
            <div class="challenge-modal-header">
                <h3>🎯 Challenges</h3>
                <button class="challenge-close-btn" id="challenge-close-btn">×</button>
            </div>
            <div id="golden-ant-status" class="golden-ant-status" style="display: none;">
                <div class="golden-ant-status-icon">🌟🐜✨</div>
                <div class="golden-ant-status-text">
                    <div class="golden-ant-status-title">GOLDEN ANT UNLOCKED!</div>
                    <div class="golden-ant-status-subtitle">Ultimate Achievement Complete!</div>
                </div>
            </div>
            <div class="challenge-list-container">
                <div class="challenge-list" id="challenge-list"></div>
            </div>
        `;
        
        modalBackdrop.appendChild(modal);
        
        // Add event listeners
        modalBackdrop.addEventListener('click', (e) => {
            if (e.target === modalBackdrop) {
                this.closeModal();
            }
        });
        document.getElementById('challenge-close-btn').addEventListener('click', () => this.closeModal());
        
        // Add CSS
        const style = document.createElement('style');
        style.textContent = `
            .challenge-trigger {
                position: fixed;
                top: 20px;
                right: 20px;
                width: 50px;
                height: 50px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                cursor: pointer;
                z-index: 1000;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
                transition: all 0.3s ease;
                font-family: 'Comic Sans MS', sans-serif;
            }
            
            .challenge-trigger:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
            }
            
            .challenge-trigger.has-rewards {
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0% { box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3); }
                50% { box-shadow: 0 4px 15px rgba(255, 215, 0, 0.6); }
                100% { box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3); }
            }
            
            .challenge-modal-backdrop {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                z-index: 1001;
                display: none;
                align-items: center;
                justify-content: center;
            }
            
            .challenge-modal-backdrop.show {
                display: flex;
            }
            
            .challenge-modal {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 15px;
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
                padding: 0;
                max-width: 500px;
                width: 95%;
                max-height: 85vh;
                color: white;
                font-family: 'Comic Sans MS', sans-serif;
                position: relative;
                transform: scale(0.8);
                transition: transform 0.3s ease;
                display: flex;
                flex-direction: column;
                overflow: hidden;
            }
            
            .challenge-modal-backdrop.show .challenge-modal {
                transform: scale(1);
            }
            
            .challenge-modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .challenge-list-container {
                flex: 1;
                overflow-y: auto;
                padding: 0 20px 20px 20px;
                max-height: calc(85vh - 100px);
            }
            
            .challenge-list {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            
            .challenge-modal-header h3 {
                margin: 0;
                font-size: 18px;
            }
            
            .golden-ant-status {
                background: linear-gradient(135deg, rgba(255, 215, 0, 0.3) 0%, rgba(255, 193, 7, 0.2) 100%);
                border: 2px solid #FFD700;
                margin: 10px 20px;
                padding: 15px;
                border-radius: 10px;
                display: flex;
                align-items: center;
                gap: 15px;
                animation: golden-pulse 2s ease-in-out infinite;
                box-shadow: 0 0 15px rgba(255, 215, 0, 0.4);
            }
            
            .golden-ant-status-icon {
                font-size: 2.5em;
                animation: bounce-icon 1.5s ease-in-out infinite;
                filter: drop-shadow(0 0 8px #FFD700);
            }
            
            .golden-ant-status-text {
                flex: 1;
            }
            
            .golden-ant-status-title {
                font-size: 1.3em;
                font-weight: bold;
                color: #FFD700;
                text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
                margin-bottom: 3px;
            }
            
            .golden-ant-status-subtitle {
                font-size: 1em;
                color: #FFA500;
                font-weight: bold;
            }
            
            @keyframes golden-pulse {
                0% { 
                    background: linear-gradient(135deg, rgba(255, 215, 0, 0.3) 0%, rgba(255, 193, 7, 0.2) 100%);
                    box-shadow: 0 0 15px rgba(255, 215, 0, 0.4);
                }
                50% { 
                    background: linear-gradient(135deg, rgba(255, 215, 0, 0.4) 0%, rgba(255, 193, 7, 0.3) 100%);
                    box-shadow: 0 0 25px rgba(255, 215, 0, 0.6);
                }
                100% { 
                    background: linear-gradient(135deg, rgba(255, 215, 0, 0.3) 0%, rgba(255, 193, 7, 0.2) 100%);
                    box-shadow: 0 0 15px rgba(255, 215, 0, 0.4);
                }
            }
            
            @keyframes bounce-icon {
                0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                40% { transform: translateY(-8px); }
                60% { transform: translateY(-4px); }
            }
            
            .challenge-timer {
                font-size: 12px;
                opacity: 0.8;
                margin-left: auto;
                margin-right: 15px;
            }
            
            .challenge-close-btn {
                background: none;
                border: none;
                color: white;
                font-size: 24px;
                cursor: pointer;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: background 0.3s ease;
            }
            
            .challenge-close-btn:hover {
                background: rgba(255, 255, 255, 0.2);
            }
            
            .challenge-item {
                background: rgba(255, 255, 255, 0.1);
                border-radius: 10px;
                padding: 12px;
                display: flex;
                align-items: center;
                gap: 12px;
                transition: all 0.3s ease;
                border: 1px solid rgba(255, 255, 255, 0.05);
            }
            
            .challenge-item:hover {
                background: rgba(255, 255, 255, 0.15);
                border-color: rgba(255, 255, 255, 0.2);
            }
            
            .challenge-icon {
                font-size: 24px;
                flex-shrink: 0;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.1);
            }
            
            .challenge-item.category-collection .challenge-icon {
                background: rgba(76, 175, 80, 0.3);
            }
            
            .challenge-item.category-building .challenge-icon {
                background: rgba(255, 152, 0, 0.3);
            }
            
            .challenge-item.category-upgrade .challenge-icon {
                background: rgba(103, 58, 183, 0.3);
            }
            
            .challenge-item.category-time .challenge-icon {
                background: rgba(33, 150, 243, 0.3);
            }
            
            .challenge-item.category-action .challenge-icon {
                background: rgba(244, 67, 54, 0.3);
            }
            
            .challenge-item.category-challenge .challenge-icon {
                background: rgba(255, 193, 7, 0.3);
            }
            
            .challenge-item.category-milestone .challenge-icon {
                background: rgba(156, 39, 176, 0.3);
            }
            
            .challenge-item.category-efficiency .challenge-icon {
                background: rgba(0, 150, 136, 0.3);
            }
            
            .challenge-content {
                flex: 1;
            }
            
            .challenge-name {
                font-weight: bold;
                font-size: 14px;
                margin-bottom: 5px;
            }
            
            .challenge-description {
                font-size: 12px;
                opacity: 0.9;
                margin-bottom: 8px;
            }
            
            .challenge-progress {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .challenge-progress-bar {
                flex: 1;
                height: 10px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 5px;
                overflow: hidden;
            }
            
            .challenge-progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #4CAF50, #8BC34A);
                transition: width 0.3s ease;
            }
            
            .challenge-progress-text {
                font-size: 11px;
                font-weight: bold;
                min-width: 50px;
                text-align: right;
            }
            
            .challenge-claim-btn {
                background: linear-gradient(135deg, #FFD700, #FFA500);
                color: white;
                border: none;
                border-radius: 8px;
                padding: 8px 12px;
                font-size: 12px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
                margin-left: 10px;
            }
            
            .challenge-claim-btn:hover {
                transform: scale(1.05);
                box-shadow: 0 4px 15px rgba(255, 215, 0, 0.5);
            }
            
            .challenge-claim-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
                transform: none;
            }
            
            .challenge-completed {
                background: linear-gradient(135deg, #4CAF50, #8BC34A);
            }
            
            .challenge-claimed {
                opacity: 0.6;
            }
            
            .no-challenges {
                text-align: center;
                padding: 20px;
                opacity: 0.8;
                font-size: 14px;
            }
            
            @media (max-width: 768px) {
                .challenge-trigger {
                    top: 10px;
                    right: 10px;
                    width: 45px;
                    height: 45px;
                    font-size: 20px;
                }
                
                .challenge-modal {
                    width: 95%;
                    max-height: 85vh;
                }
                
                .challenge-modal-header {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 10px;
                }
                
                .challenge-timer {
                    margin: 0;
                }
                
                .challenge-close-btn {
                    position: absolute;
                    top: 15px;
                    right: 15px;
                }
            }
        `;
        document.head.appendChild(style);
        
        // Initial UI update
        this.updateChallengeUI();
    }
    
    openModal() {
        this.isModalOpen = true;
        const backdrop = document.getElementById('challenge-modal-backdrop');
        if (backdrop) {
            backdrop.classList.add('show');
        }
    }
    
    showModal() {
        try {
            this.isModalOpen = true;
            const backdrop = document.getElementById('challenge-modal-backdrop');
            if (backdrop) {
                backdrop.classList.add('show');
            } else {
                console.error('Challenge modal backdrop not found');
                return;
            }
            
            // Update the challenge list when modal opens
            this.updateChallengeUI();
        } catch (error) {
            console.error('Error in showModal:', error);
            alert('Failed to open challenges modal. Error: ' + error.message);
        }
    }
    
    closeModal() {
        this.isModalOpen = false;
        const backdrop = document.getElementById('challenge-modal-backdrop');
        if (backdrop) {
            backdrop.classList.remove('show');
        }
    }
    
    updateChallengeUI() {
        const challengeList = document.getElementById('challenge-list');
        if (!challengeList) return;
        
        // Update golden ant status visibility
        const goldenAntStatus = document.getElementById('golden-ant-status');
        if (goldenAntStatus) {
            if (this.goldenAntSpawned) {
                goldenAntStatus.style.display = 'flex';
            } else {
                goldenAntStatus.style.display = 'none';
            }
        }
        
        challengeList.innerHTML = '';
        
        // Show challenges if any exist
        if (this.currentChallenges.length === 0) {
            challengeList.innerHTML = '<div class="no-challenges">No challenges available.</div>';
            return;
        }
        
        this.currentChallenges.forEach(challenge => {
            const item = document.createElement('div');
            const template = this.challengeTemplates[challenge.id];
            const categoryClass = template ? `category-${template.category}` : '';
            item.className = `challenge-item ${categoryClass} ${challenge.completed ? 'challenge-completed' : ''} ${challenge.claimed ? 'challenge-claimed' : ''}`;
            
            const progressPercent = (challenge.progress / challenge.target) * 100;
            
            item.innerHTML = `
                <div class="challenge-icon">${challenge.icon}</div>
                <div class="challenge-content">
                    <div class="challenge-name">${challenge.name}</div>
                    <div class="challenge-description">${challenge.description}</div>
                    <div class="challenge-progress">
                        <div class="challenge-progress-bar">
                            <div class="challenge-progress-fill" style="width: ${progressPercent}%"></div>
                        </div>
                        <div class="challenge-progress-text">${challenge.progress}/${challenge.target}</div>
                    </div>
                </div>
                ${challenge.completed && !challenge.claimed ? `
                    <button class="challenge-claim-btn" onclick="IdleAnts.game.dailyChallengeManager.claimReward('${challenge.id}')">
                        Claim<br>+${challenge.reward.amount}
                    </button>
                ` : ''}
            `;
            
            challengeList.appendChild(item);
        });
    }
    
    
    showNewChallengesNotification() {
        const notification = document.createElement('div');
        notification.className = 'challenge-notification';
        notification.innerHTML = `
            <div class="notification-icon">🎯</div>
            <div class="notification-content">
                <div class="notification-title">New Challenges Available!</div>
                <div class="notification-text">Complete all challenges to unlock the Golden Ant!</div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 4000);
    }
    
    showChallengeCompletedNotification(challenge) {
        const notification = document.createElement('div');
        notification.className = 'challenge-notification';
        notification.innerHTML = `
            <div class="notification-icon">🎉</div>
            <div class="notification-content">
                <div class="notification-title">Challenge Complete!</div>
                <div class="notification-text">${challenge.name} - Open challenges to claim reward</div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 3000);
    }
    
    showRewardClaimedNotification(challenge) {
        const notification = document.createElement('div');
        notification.className = 'challenge-notification';
        notification.innerHTML = `
            <div class="notification-icon">✨</div>
            <div class="notification-content">
                <div class="notification-title">Reward Claimed!</div>
                <div class="notification-text">+${challenge.reward.amount} ${challenge.reward.type}</div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 2000);
    }
    
    saveData() {
        const data = {
            currentChallenges: this.currentChallenges,
            progress: this.progress,
            lastSave: new Date().toISOString()
        };
        
        localStorage.setItem('idleAnts_dailyChallenges', JSON.stringify(data));
    }
    
    loadData() {
        const data = localStorage.getItem('idleAnts_dailyChallenges');
        if (data) {
            try {
                const parsed = JSON.parse(data);
                this.currentChallenges = parsed.currentChallenges || [];
                this.progress = parsed.progress || this.progress;
            } catch (error) {
                console.error('Error loading challenge data:', error);
            }
        }
    }

    // Debug method to complete all challenges
    debugCompleteAllChallenges() {
        console.log('Debug: Completing all challenges');
        
        // Set all challenge progress to completed
        this.currentChallenges.forEach(challenge => {
            if (!challenge.completed) {
                challenge.progress = challenge.target;
                challenge.completed = true;
                console.log(`Debug: Completed challenge ${challenge.name}`);
            }
        });
        
        // Update the UI to reflect the changes
        this.updateChallengeUI();
        
        // Check if golden ant should spawn
        this.checkAllChallengesComplete();
        
        console.log('Debug: All challenges completed!');
        alert('Debug: All challenges completed! Golden Ant should spawn if all challenges are done.');
    }
};

// Add notification CSS
const notificationStyle = document.createElement('style');
notificationStyle.textContent = `
    .challenge-notification {
        position: fixed;
        top: 20px;
        left: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 15px 20px;
        border-radius: 15px;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        z-index: 1002;
        display: flex;
        align-items: center;
        gap: 15px;
        transform: translateX(-400px);
        transition: all 0.5s ease;
        max-width: 300px;
        font-family: 'Comic Sans MS', sans-serif;
    }
    
    .challenge-notification.show {
        transform: translateX(0);
    }
    
    .notification-icon {
        font-size: 30px;
        animation: bounce 1s infinite;
    }
    
    @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
    }
    
    .notification-title {
        font-weight: bold;
        font-size: 14px;
        margin-bottom: 5px;
    }
    
    .notification-text {
        font-size: 12px;
        opacity: 0.9;
    }
    
    @media (max-width: 768px) {
        .challenge-notification {
            left: 10px;
            max-width: 250px;
        }
    }
`;
document.head.appendChild(notificationStyle);