// src/managers/DailyChallengeManager.js
IdleAnts.Managers.DailyChallengeManager = class {
    constructor(resourceManager, achievementManager) {
        this.resourceManager = resourceManager;
        this.achievementManager = achievementManager;
        
        // Challenge templates - expanded to 20 diverse challenges
        this.challengeTemplates = {
            collectFood: {
                id: 'collectFood',
                name: '🍎 Food Hunter',
                description: 'Collect {target} food automatically',
                type: 'collect',
                baseTarget: 50,
                multiplier: 1.5,
                reward: { type: 'food', amount: 25 },
                icon: '🍎',
                category: 'collection'
            },
            buyAnts: {
                id: 'buyAnts',
                name: '🐜 Ant Recruiter',
                description: 'Buy {target} ants',
                type: 'buy',
                baseTarget: 3,
                multiplier: 1.2,
                reward: { type: 'food', amount: 50 },
                icon: '🐜',
                category: 'building'
            },
            upgradeSpeed: {
                id: 'upgradeSpeed',
                name: '⚡ Speed Booster',
                description: 'Upgrade speed {target} times',
                type: 'upgrade',
                baseTarget: 2,
                multiplier: 1.1,
                reward: { type: 'food', amount: 75 },
                icon: '⚡',
                category: 'upgrade'
            },
            activeTime: {
                id: 'activeTime',
                name: '⏰ Busy Bee',
                description: 'Play for {target} minutes',
                type: 'time',
                baseTarget: 10,
                multiplier: 1.3,
                reward: { type: 'food', amount: 5000 },
                icon: '⏰',
                category: 'time'
            },
            placeFood: {
                id: 'placeFood',
                name: '👆 Food Placer',
                description: 'Place food by clicking {target} times',
                type: 'click',
                baseTarget: 20,
                multiplier: 1.4,
                reward: { type: 'food', amount: 30 },
                icon: '👆',
                category: 'action'
            },
            massAntPurchase: {
                id: 'massAntPurchase',
                name: '🏭 Mass Recruiter',
                description: 'Buy {target} ants in a single session',
                type: 'buySession',
                baseTarget: 10,
                multiplier: 1.3,
                reward: { type: 'food', amount: 200 },
                icon: '🏭',
                category: 'building'
            },
            foodMilestone: {
                id: 'foodMilestone',
                name: '🎯 Food Milestone',
                description: 'Reach {target} total food',
                type: 'milestone',
                baseTarget: 1000,
                multiplier: 2.0,
                reward: { type: 'food', amount: 500 },
                icon: '🎯',
                category: 'milestone'
            },
            speedDemon: {
                id: 'speedDemon',
                name: '🚀 Speed Demon',
                description: 'Reach {target} ant speed level',
                type: 'speedLevel',
                baseTarget: 5,
                multiplier: 1.2,
                reward: { type: 'food', amount: 150 },
                icon: '🚀',
                category: 'milestone'
            },
            clickFrenzy: {
                id: 'clickFrenzy',
                name: '🔥 Click Frenzy',
                description: 'Click {target} times in 60 seconds',
                type: 'clickFrenzy',
                baseTarget: 30,
                multiplier: 1.5,
                reward: { type: 'food', amount: 100 },
                icon: '🔥',
                category: 'action'
            },
            antArmy: {
                id: 'antArmy',
                name: '⚔️ Ant Army',
                description: 'Have {target} ants active at once',
                type: 'antCount',
                baseTarget: 15,
                multiplier: 1.4,
                reward: { type: 'food', amount: 300 },
                icon: '⚔️',
                category: 'building'
            },
            efficiencyExpert: {
                id: 'efficiencyExpert',
                name: '📊 Efficiency Expert',
                description: 'Collect {target} food per second',
                type: 'foodPerSecond',
                baseTarget: 10,
                multiplier: 1.6,
                reward: { type: 'food', amount: 400 },
                icon: '📊',
                category: 'efficiency'
            },
            marathonPlayer: {
                id: 'marathonPlayer',
                name: '🏃 Marathon Player',
                description: 'Play for {target} minutes straight',
                type: 'continuousTime',
                baseTarget: 30,
                multiplier: 1.2,
                reward: { type: 'food', amount: 1000 },
                icon: '🏃',
                category: 'time'
            },
            upgradeSpree: {
                id: 'upgradeSpree',
                name: '🔧 Upgrade Spree',
                description: 'Perform {target} upgrades of any type',
                type: 'upgradeAny',
                baseTarget: 5,
                multiplier: 1.3,
                reward: { type: 'food', amount: 250 },
                icon: '🔧',
                category: 'upgrade'
            },
            foodVariety: {
                id: 'foodVariety',
                name: '🌈 Food Variety',
                description: 'Collect {target} different food types',
                type: 'foodTypes',
                baseTarget: 3,
                multiplier: 1.1,
                reward: { type: 'food', amount: 200 },
                icon: '🌈',
                category: 'collection'
            },
            quickStart: {
                id: 'quickStart',
                name: '⚡ Quick Start',
                description: 'Buy first ant within {target} seconds',
                type: 'quickBuy',
                baseTarget: 30,
                multiplier: 0.9,
                reward: { type: 'food', amount: 100 },
                icon: '⚡',
                category: 'challenge'
            },
            saveSpree: {
                id: 'saveSpree',
                name: '💰 Save Spree',
                description: 'Save up {target} food without spending',
                type: 'saveFood',
                baseTarget: 500,
                multiplier: 1.8,
                reward: { type: 'food', amount: 1000 },
                icon: '💰',
                category: 'challenge'
            },
            perfectTiming: {
                id: 'perfectTiming',
                name: '🎯 Perfect Timing',
                description: 'Complete {target} precise actions',
                type: 'precision',
                baseTarget: 10,
                multiplier: 1.2,
                reward: { type: 'food', amount: 300 },
                icon: '🎯',
                category: 'challenge'
            },
            colonyBuilder: {
                id: 'colonyBuilder',
                name: '🏗️ Colony Builder',
                description: 'Expand your colony to {target} total capacity',
                type: 'totalCapacity',
                baseTarget: 50,
                multiplier: 1.5,
                reward: { type: 'food', amount: 400 },
                icon: '🏗️',
                category: 'building'
            },
            nightOwl: {
                id: 'nightOwl',
                name: '🦉 Night Owl',
                description: 'Play during late hours for {target} minutes',
                type: 'nightTime',
                baseTarget: 15,
                multiplier: 1.3,
                reward: { type: 'food', amount: 500 },
                icon: '🦉',
                category: 'time'
            },
            comeback: {
                id: 'comeback',
                name: '🔄 Comeback',
                description: 'Return after {target} hours away',
                type: 'returnAfter',
                baseTarget: 4,
                multiplier: 1.1,
                reward: { type: 'food', amount: 800 },
                icon: '🔄',
                category: 'time'
            }
        };
        
        // Current challenges
        this.currentChallenges = [];
        
        // Progress tracking
        this.progress = {
            collectFood: 0,
            buyAnts: 0,
            upgradeSpeed: 0,
            activeTime: 0,
            placeFood: 0,
            massAntPurchase: 0,
            foodMilestone: 0,
            speedDemon: 0,
            clickFrenzy: 0,
            antArmy: 0,
            efficiencyExpert: 0,
            marathonPlayer: 0,
            upgradeSpree: 0,
            foodVariety: 0,
            quickStart: 0,
            saveSpree: 0,
            perfectTiming: 0,
            colonyBuilder: 0,
            nightOwl: 0,
            comeback: 0
        };
        
        // Additional tracking variables
        this.sessionAntPurchases = 0;
        this.sessionStartTime = Date.now();
        this.continuousPlayTime = 0;
        this.lastActiveTime = Date.now();
        this.clickFrenzyStartTime = null;
        this.clickFrenzyCount = 0;
        this.collectedFoodTypes = new Set();
        this.maxSavedFood = 0;
        this.precisionActions = 0;
        
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
        
        // Start daily reset check
        this.startDailyResetCheck();
    }
    
    checkForNewChallenges() {
        const today = new Date().toDateString();
        const lastChallengeDate = localStorage.getItem('idleAnts_lastChallengeDate');
        
        if (lastChallengeDate !== today) {
            this.generateDailyChallenges();
            localStorage.setItem('idleAnts_lastChallengeDate', today);
        }
    }
    
    generateDailyChallenges() {
        // Clear current challenges
        this.currentChallenges = [];
        
        // Reset progress
        this.progress = Object.keys(this.challengeTemplates).reduce((acc, key) => {
            acc[key] = 0;
            return acc;
        }, {});
        
        // Reset session tracking
        this.sessionAntPurchases = 0;
        this.sessionStartTime = Date.now();
        this.continuousPlayTime = 0;
        this.lastActiveTime = Date.now();
        this.clickFrenzyStartTime = null;
        this.clickFrenzyCount = 0;
        this.collectedFoodTypes = new Set();
        this.maxSavedFood = 0;
        this.precisionActions = 0;
        
        // Calculate player level based on total food collected
        const currentFood = this.resourceManager?.resources?.food || 0;
        const playerLevel = Math.max(1, Math.min(10, Math.floor(currentFood / 100) + 1)); // Cap at level 10
        console.log(`[DailyChallenge] Current food: ${currentFood}, Player level: ${playerLevel}`);
        
        // Select 5 challenges from different categories to ensure variety
        const challengeTypes = Object.keys(this.challengeTemplates);
        const categories = [...new Set(Object.values(this.challengeTemplates).map(t => t.category))];
        const selectedTypes = [];
        
        // Try to get at least one challenge from each category
        categories.forEach(category => {
            const categoryTypes = challengeTypes.filter(type => 
                this.challengeTemplates[type].category === category && 
                !selectedTypes.includes(type)
            );
            if (categoryTypes.length > 0 && selectedTypes.length < 5) {
                const randomType = categoryTypes[Math.floor(Math.random() * categoryTypes.length)];
                selectedTypes.push(randomType);
            }
        });
        
        // Fill remaining slots with random challenges
        while (selectedTypes.length < 5 && challengeTypes.length > selectedTypes.length) {
            const remainingTypes = challengeTypes.filter(type => !selectedTypes.includes(type));
            if (remainingTypes.length > 0) {
                const randomType = remainingTypes[Math.floor(Math.random() * remainingTypes.length)];
                selectedTypes.push(randomType);
            }
        }
        
        // Generate challenges
        selectedTypes.forEach(type => {
            const template = this.challengeTemplates[type];
            const challenge = this.createChallenge(template, playerLevel);
            this.currentChallenges.push(challenge);
        });
        
        // Save data
        // this.saveData(); // Disabled for now
        
        // Update UI
        this.updateChallengeUI();
        
        // Show new challenges notification
        this.showNewChallengesNotification();
    }
    
    createChallenge(template, playerLevel) {
        // Calculate target based on player level with safeguards
        const multiplier = Math.min(template.multiplier, 2.0); // Cap multiplier at 2.0
        const levelFactor = Math.min(playerLevel - 1, 9); // Cap level factor at 9
        const target = Math.ceil(template.baseTarget * Math.pow(multiplier, levelFactor));
        console.log(`[DailyChallenge] Creating ${template.id}: baseTarget=${template.baseTarget}, multiplier=${multiplier}, levelFactor=${levelFactor}, target=${target}`);
        
        // Calculate reward based on player level
        const rewardAmount = Math.ceil(template.reward.amount * (1 + (playerLevel - 1) * 0.2));
        
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
        
        // Track active time with enhanced tracking
        setInterval(() => {
            this.updateActiveTime();
        }, 1000);
    }
    
    // Called by game when specific actions occur
    trackAntPurchase() {
        this.progress.buyAnts += 1;
        this.sessionAntPurchases += 1;
        this.updateChallengeProgress('buyAnts', this.progress.buyAnts);
        this.updateChallengeProgress('massAntPurchase', this.sessionAntPurchases);
        
        // Check ant army challenge
        if (IdleAnts.game && IdleAnts.game.entities && IdleAnts.game.entities.ants) {
            const antCount = IdleAnts.game.entities.ants.length;
            this.updateChallengeProgress('antArmy', antCount);
        }
    }
    
    trackSpeedUpgrade() {
        this.progress.upgradeSpeed += 1;
        this.progress.upgradeSpree += 1;
        this.updateChallengeProgress('upgradeSpeed', this.progress.upgradeSpeed);
        this.updateChallengeProgress('upgradeSpree', this.progress.upgradeSpree);
    }
    
    trackFoodClick() {
        this.progress.placeFood += 1;
        this.updateChallengeProgress('placeFood', this.progress.placeFood);
        
        // Track click frenzy
        const now = Date.now();
        if (!this.clickFrenzyStartTime || now - this.clickFrenzyStartTime > 60000) {
            this.clickFrenzyStartTime = now;
            this.clickFrenzyCount = 1;
        } else {
            this.clickFrenzyCount += 1;
        }
        this.updateChallengeProgress('clickFrenzy', this.clickFrenzyCount);
    }
    
    // New tracking methods for additional challenges
    trackFoodCollection(amount, foodType) {
        this.progress.collectFood += amount;
        this.updateChallengeProgress('collectFood', this.progress.collectFood);
        
        // Track food milestone
        const totalFood = this.resourceManager.resources.food;
        this.updateChallengeProgress('foodMilestone', totalFood);
        
        // Track food variety
        if (foodType) {
            this.collectedFoodTypes.add(foodType);
            this.updateChallengeProgress('foodVariety', this.collectedFoodTypes.size);
        }
        
        // Track save spree (max food saved)
        this.maxSavedFood = Math.max(this.maxSavedFood, totalFood);
        this.updateChallengeProgress('saveSpree', this.maxSavedFood);
    }
    
    trackPrecisionAction() {
        this.precisionActions += 1;
        this.updateChallengeProgress('perfectTiming', this.precisionActions);
    }
    
    // Update active time tracking with more granular checks
    updateActiveTime() {
        const now = Date.now();
        if (document.visibilityState === 'visible') {
            const timeDiff = now - this.lastActiveTime;
            if (timeDiff < 2000) { // Only count if less than 2 seconds gap (continuous play)
                this.continuousPlayTime += timeDiff / 1000 / 60; // Convert to minutes
                this.updateChallengeProgress('marathonPlayer', Math.floor(this.continuousPlayTime));
            }
            
            this.progress.activeTime += 1 / 60; // Convert seconds to minutes
            this.updateChallengeProgress('activeTime', Math.floor(this.progress.activeTime));
            
            // Check if it's night time (10 PM to 6 AM)
            const hour = new Date().getHours();
            if (hour >= 22 || hour <= 6) {
                this.progress.nightOwl += 1 / 60;
                this.updateChallengeProgress('nightOwl', Math.floor(this.progress.nightOwl));
            }
        } else {
            this.continuousPlayTime = 0; // Reset continuous play time when not visible
        }
        this.lastActiveTime = now;
    }
    
    updateChallengeProgress(type, progress) {
        const challenge = this.currentChallenges.find(c => c.id === type);
        if (challenge && !challenge.completed) {
            challenge.progress = Math.min(progress, challenge.target);
            
            if (challenge.progress >= challenge.target) {
                challenge.completed = true;
                this.showChallengeCompletedNotification(challenge);
            }
            
            this.updateChallengeUI();
            // this.saveData(); // Disabled for now
        }
    }
    
    claimReward(challengeId) {
        const challenge = this.currentChallenges.find(c => c.id === challengeId);
        if (challenge && challenge.completed && !challenge.claimed) {
            challenge.claimed = true;
            
            // Award reward
            if (challenge.reward.type === 'food') {
                this.resourceManager.addFood(challenge.reward.amount);
            }
            
            // Show reward notification
            this.showRewardClaimedNotification(challenge);
            
            // Update UI
            this.updateChallengeUI();
            // this.saveData(); // Disabled for now
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
                <h3>🎯 Daily Challenges</h3>
                <div class="challenge-timer" id="challenge-timer">Next: 00:00:00</div>
                <button class="challenge-close-btn" id="challenge-close-btn">×</button>
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
                padding: 20px 20px 15px 20px;
                flex-wrap: wrap;
                flex-shrink: 0;
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
        
        // Update timer
        this.updateTimer();
        setInterval(() => this.updateTimer(), 1000);
        
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
        this.isModalOpen = true;
        const backdrop = document.getElementById('challenge-modal-backdrop');
        if (backdrop) {
            backdrop.classList.add('show');
        }
        
        // Update the challenge list when modal opens
        this.updateChallengeUI();
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
        
        challengeList.innerHTML = '';
        
        // Show challenges if any exist
        if (this.currentChallenges.length === 0) {
            challengeList.innerHTML = '<div class="no-challenges">No challenges available today.<br>Check back tomorrow!</div>';
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
    
    updateTimer() {
        const now = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        const timeLeft = tomorrow - now;
        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        
        const timerElement = document.getElementById('challenge-timer');
        if (timerElement) {
            timerElement.textContent = `Next: ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }
    
    startDailyResetCheck() {
        setInterval(() => {
            this.checkForNewChallenges();
        }, 60000); // Check every minute
    }
    
    showNewChallengesNotification() {
        const notification = document.createElement('div');
        notification.className = 'challenge-notification';
        notification.innerHTML = `
            <div class="notification-icon">🎯</div>
            <div class="notification-content">
                <div class="notification-title">New Daily Challenges!</div>
                <div class="notification-text">Click the challenge button to view tasks</div>
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