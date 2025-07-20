// src/managers/AchievementManager.js
IdleAnts.Managers.AchievementManager = class {
    constructor(resourceManager, effectManager) {
        this.resourceManager = resourceManager;
        this.effectManager = effectManager;
        
        // Achievement data
        this.achievements = {
            // Collection Achievements
            firstFood: {
                id: 'firstFood',
                name: '🍎 First Bite',
                description: 'Collect your first food!',
                unlocked: false,
                category: 'collection',
                reward: { type: 'food', amount: 10 }
            },
            hundredFood: {
                id: 'hundredFood',
                name: '🍯 Sweet Success',
                description: 'Collect 100 food',
                unlocked: false,
                category: 'collection',
                reward: { type: 'food', amount: 25 }
            },
            thousandFood: {
                id: 'thousandFood',
                name: '🏆 Food Master',
                description: 'Collect 1,000 food',
                unlocked: false,
                category: 'collection',
                reward: { type: 'food', amount: 100 }
            },
            
            // Ant Achievements
            firstAnt: {
                id: 'firstAnt',
                name: '🐜 Ant Squad',
                description: 'Buy your first ant!',
                unlocked: false,
                category: 'ants',
                reward: { type: 'food', amount: 15 }
            },
            tenAnts: {
                id: 'tenAnts',
                name: '🐜🐜 Ant Army',
                description: 'Have 10 ants working',
                unlocked: false,
                category: 'ants',
                reward: { type: 'food', amount: 50 }
            },
            flyingAnt: {
                id: 'flyingAnt',
                name: '🦋 Sky Walker',
                description: 'Unlock flying ants!',
                unlocked: false,
                category: 'ants',
                reward: { type: 'food', amount: 100 }
            },
            
            // Discovery Achievements
            firstUpgrade: {
                id: 'firstUpgrade',
                name: '⚡ Power Up',
                description: 'Buy your first upgrade!',
                unlocked: false,
                category: 'discovery',
                reward: { type: 'food', amount: 20 }
            },
            expandColony: {
                id: 'expandColony',
                name: '🏠 Home Sweet Home',
                description: 'Expand your colony!',
                unlocked: false,
                category: 'discovery',
                reward: { type: 'food', amount: 75 }
            },
            
            // Time Achievements
            playOneDay: {
                id: 'playOneDay',
                name: '📅 Dedicated Helper',
                description: 'Play for 1 day',
                unlocked: false,
                category: 'time',
                reward: { type: 'food', amount: 50 }
            },
            playWeek: {
                id: 'playWeek',
                name: '🌟 Colony Champion',
                description: 'Play for 7 days',
                unlocked: false,
                category: 'time',
                reward: { type: 'food', amount: 200 }
            },
            
            // Fun Achievements
            speedDemon: {
                id: 'speedDemon',
                name: '💨 Speed Demon',
                description: 'Upgrade speed 5 times',
                unlocked: false,
                category: 'fun',
                reward: { type: 'food', amount: 100 }
            },
            strongAnts: {
                id: 'strongAnts',
                name: '💪 Mighty Ants',
                description: 'Upgrade strength 3 times',
                unlocked: false,
                category: 'fun',
                reward: { type: 'food', amount: 75 }
            }
        };
        
        // Track progress
        this.progress = {
            foodCollected: 0,
            antsOwned: 0,
            upgradesPurchased: 0,
            daysPlayed: 0,
            speedUpgrades: 0,
            strengthUpgrades: 0,
            playTime: 0
        };
        
        // Load saved data
        this.loadProgress();
        
        // Set up tracking
        this.setupTracking();
        
        // Create achievement notification system
        this.createNotificationSystem();
    }
    
    setupTracking() {
        // Track food collection - with safety checks
        if (this.resourceManager && this.resourceManager.addFood) {
            const originalAddFood = this.resourceManager.addFood.bind(this.resourceManager);
            this.resourceManager.addFood = (amount) => {
                const result = originalAddFood(amount);
                this.progress.foodCollected += amount;
                this.checkAchievements();
                return result;
            };
        } else {
            console.warn('[AchievementManager] ResourceManager.addFood not available for tracking');
        }
        
        // Track ant purchases
        const originalStats = this.resourceManager.stats;
        Object.defineProperty(this.resourceManager, 'stats', {
            get: () => originalStats,
            set: (value) => {
                if (value.ants > this.progress.antsOwned) {
                    this.progress.antsOwned = value.ants;
                    this.checkAchievements();
                }
                originalStats = value;
            }
        });
        
        // Track play time
        setInterval(() => {
            this.progress.playTime += 1;
            this.saveProgress();
        }, 1000);
    }
    
    checkAchievements() {
        const achievements = Object.values(this.achievements);
        
        achievements.forEach(achievement => {
            if (!achievement.unlocked && this.checkAchievementCondition(achievement)) {
                this.unlockAchievement(achievement);
            }
        });
    }
    
    checkAchievementCondition(achievement) {
        switch (achievement.id) {
            case 'firstFood':
                return this.progress.foodCollected >= 1;
            case 'hundredFood':
                return this.progress.foodCollected >= 100;
            case 'thousandFood':
                return this.progress.foodCollected >= 1000;
            case 'firstAnt':
                return this.resourceManager.stats.ants >= 2; // Including the starter ant
            case 'tenAnts':
                return this.resourceManager.stats.ants >= 10;
            case 'flyingAnt':
                return this.resourceManager.stats.flyingAntsUnlocked;
            case 'firstUpgrade':
                return this.progress.upgradesPurchased >= 1;
            case 'expandColony':
                return this.resourceManager.stats.maxAnts > 10;
            case 'playOneDay':
                return this.progress.playTime >= 86400; // 24 hours in seconds
            case 'playWeek':
                return this.progress.playTime >= 604800; // 7 days in seconds
            case 'speedDemon':
                return this.progress.speedUpgrades >= 5;
            case 'strongAnts':
                return this.progress.strengthUpgrades >= 3;
            default:
                return false;
        }
    }
    
    unlockAchievement(achievement) {
        achievement.unlocked = true;
        
        // Award reward
        if (achievement.reward) {
            if (achievement.reward.type === 'food') {
                this.resourceManager.addFood(achievement.reward.amount);
            }
        }
        
        // Show notification
        this.showAchievementNotification(achievement);
        
        // Save progress
        this.saveProgress();
        
        // Trigger celebration effect
        this.triggerCelebration();
    }
    
    showAchievementNotification(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-icon">🏆</div>
            <div class="achievement-content">
                <div class="achievement-title">${achievement.name}</div>
                <div class="achievement-description">${achievement.description}</div>
                ${achievement.reward ? `<div class="achievement-reward">+${achievement.reward.amount} ${achievement.reward.type}</div>` : ''}
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Remove after delay
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 3000);
    }
    
    triggerCelebration() {
        // Create celebration particles
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                this.createCelebrationParticle();
            }, i * 100);
        }
    }
    
    createCelebrationParticle() {
        const particle = document.createElement('div');
        particle.className = 'celebration-particle';
        particle.innerHTML = ['🎉', '⭐', '🌟', '✨', '🎈'][Math.floor(Math.random() * 5)];
        particle.style.left = Math.random() * window.innerWidth + 'px';
        particle.style.top = Math.random() * window.innerHeight + 'px';
        
        document.body.appendChild(particle);
        
        setTimeout(() => {
            document.body.removeChild(particle);
        }, 2000);
    }
    
    createNotificationSystem() {
        // Add CSS for achievement notifications
        const style = document.createElement('style');
        style.textContent = `
            .achievement-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #FFD700, #FFA500);
                color: white;
                padding: 15px 20px;
                border-radius: 15px;
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
                z-index: 1000;
                display: flex;
                align-items: center;
                gap: 15px;
                transform: translateX(400px);
                transition: all 0.5s ease;
                max-width: 300px;
                font-family: 'Comic Sans MS', sans-serif;
            }
            
            .achievement-notification.show {
                transform: translateX(0);
            }
            
            .achievement-icon {
                font-size: 30px;
                animation: bounce 1s infinite;
            }
            
            .achievement-title {
                font-weight: bold;
                font-size: 14px;
                margin-bottom: 5px;
            }
            
            .achievement-description {
                font-size: 12px;
                opacity: 0.9;
            }
            
            .achievement-reward {
                font-size: 11px;
                color: #90EE90;
                font-weight: bold;
                margin-top: 5px;
            }
            
            .celebration-particle {
                position: fixed;
                font-size: 20px;
                animation: celebration 2s ease-out forwards;
                pointer-events: none;
                z-index: 999;
            }
            
            @keyframes celebration {
                0% {
                    transform: translateY(0) scale(1) rotate(0deg);
                    opacity: 1;
                }
                100% {
                    transform: translateY(-100px) scale(1.5) rotate(360deg);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Track specific actions
    trackUpgrade() {
        this.progress.upgradesPurchased++;
        this.checkAchievements();
    }
    
    trackSpeedUpgrade() {
        this.progress.speedUpgrades++;
        this.checkAchievements();
    }
    
    trackStrengthUpgrade() {
        this.progress.strengthUpgrades++;
        this.checkAchievements();
    }
    
    // Save/Load system
    saveProgress() {
        const saveData = {
            achievements: this.achievements,
            progress: this.progress
        };
        localStorage.setItem('idleAnts_achievements', JSON.stringify(saveData));
    }
    
    loadProgress() {
        const saveData = localStorage.getItem('idleAnts_achievements');
        if (saveData) {
            try {
                const data = JSON.parse(saveData);
                
                // Merge achievements (in case new ones were added)
                Object.keys(data.achievements || {}).forEach(key => {
                    if (this.achievements[key]) {
                        this.achievements[key].unlocked = data.achievements[key].unlocked;
                    }
                });
                
                // Load progress
                this.progress = { ...this.progress, ...data.progress };
            } catch (error) {
                console.error('Error loading achievement data:', error);
            }
        }
    }
    
    // Get achievement stats for UI
    getAchievementStats() {
        const total = Object.keys(this.achievements).length;
        const unlocked = Object.values(this.achievements).filter(a => a.unlocked).length;
        return { unlocked, total };
    }
    
    // Get achievements by category
    getAchievementsByCategory(category) {
        return Object.values(this.achievements).filter(a => a.category === category);
    }
    
    // Check if achievement is unlocked
    isAchievementUnlocked(id) {
        return this.achievements[id] && this.achievements[id].unlocked;
    }
};