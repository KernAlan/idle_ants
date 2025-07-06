// src/managers/DailyChallengeManager.js
IdleAnts.Managers.DailyChallengeManager = class {
    constructor(resourceManager, achievementManager) {
        this.resourceManager = resourceManager;
        this.achievementManager = achievementManager;
        
        // Challenge templates
        this.challengeTemplates = {
            collectFood: {
                id: 'collectFood',
                name: '🍎 Food Hunter',
                description: 'Collect {target} food',
                type: 'collect',
                baseTarget: 50,
                multiplier: 1.5,
                reward: { type: 'food', amount: 25 },
                icon: '🍎'
            },
            buyAnts: {
                id: 'buyAnts',
                name: '🐜 Ant Recruiter',
                description: 'Buy {target} ants',
                type: 'buy',
                baseTarget: 3,
                multiplier: 1.2,
                reward: { type: 'food', amount: 50 },
                icon: '🐜'
            },
            upgradeSpeed: {
                id: 'upgradeSpeed',
                name: '⚡ Speed Booster',
                description: 'Upgrade speed {target} times',
                type: 'upgrade',
                baseTarget: 2,
                multiplier: 1.1,
                reward: { type: 'food', amount: 75 },
                icon: '⚡'
            },
            activeTime: {
                id: 'activeTime',
                name: '⏰ Busy Bee',
                description: 'Play for {target} minutes',
                type: 'time',
                baseTarget: 10,
                multiplier: 1.3,
                reward: { type: 'food', amount: 5000 },
                icon: '⏰'
            },
            clickFood: {
                id: 'clickFood',
                name: '👆 Clicker Champion',
                description: 'Click to collect food {target} times',
                type: 'click',
                baseTarget: 20,
                multiplier: 1.4,
                reward: { type: 'food', amount: 30 },
                icon: '👆'
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
            clickFood: 0
        };
        
        // Initialize challenges
        this.init();
    }
    
    init() {
        // Load saved data
        this.loadData();
        
        // Check if we need new challenges
        this.checkForNewChallenges();
        
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
        this.progress = {
            collectFood: 0,
            buyAnts: 0,
            upgradeSpeed: 0,
            activeTime: 0,
            clickFood: 0
        };
        
        // Calculate player level based on total food collected
        const playerLevel = Math.floor(this.resourceManager.resources.food / 100) + 1;
        
        // Select 3 random challenge types
        const challengeTypes = Object.keys(this.challengeTemplates);
        const selectedTypes = [];
        
        while (selectedTypes.length < 3 && challengeTypes.length > 0) {
            const randomIndex = Math.floor(Math.random() * challengeTypes.length);
            const type = challengeTypes[randomIndex];
            selectedTypes.push(type);
            challengeTypes.splice(randomIndex, 1);
        }
        
        // Generate challenges
        selectedTypes.forEach(type => {
            const template = this.challengeTemplates[type];
            const challenge = this.createChallenge(template, playerLevel);
            this.currentChallenges.push(challenge);
        });
        
        // Save data
        this.saveData();
        
        // Update UI
        this.updateChallengeUI();
        
        // Show new challenges notification
        this.showNewChallengesNotification();
    }
    
    createChallenge(template, playerLevel) {
        // Calculate target based on player level
        const target = Math.ceil(template.baseTarget * Math.pow(template.multiplier, playerLevel - 1));
        
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
        this.resourceManager.addFood = (amount) => {
            const result = originalAddFood(amount);
            this.progress.collectFood += amount;
            this.updateChallengeProgress('collectFood', this.progress.collectFood);
            return result;
        };
        
        // Track active time
        setInterval(() => {
            if (document.visibilityState === 'visible') {
                this.progress.activeTime += 1 / 60; // Convert seconds to minutes
                this.updateChallengeProgress('activeTime', Math.floor(this.progress.activeTime));
            }
        }, 1000);
    }
    
    // Called by game when specific actions occur
    trackAntPurchase() {
        this.progress.buyAnts += 1;
        this.updateChallengeProgress('buyAnts', this.progress.buyAnts);
    }
    
    trackSpeedUpgrade() {
        this.progress.upgradeSpeed += 1;
        this.updateChallengeProgress('upgradeSpeed', this.progress.upgradeSpeed);
    }
    
    trackFoodClick() {
        this.progress.clickFood += 1;
        this.updateChallengeProgress('clickFood', this.progress.clickFood);
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
            this.saveData();
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
            this.saveData();
        }
    }
    
    createChallengeUI() {
        // Create challenge panel
        const challengePanel = document.createElement('div');
        challengePanel.id = 'daily-challenges';
        challengePanel.className = 'daily-challenges-panel';
        challengePanel.innerHTML = `
            <div class="challenge-header">
                <h3>🎯 Daily Challenges</h3>
                <div class="challenge-timer" id="challenge-timer">Next: 00:00:00</div>
            </div>
            <div class="challenge-list" id="challenge-list"></div>
        `;
        
        // Add to page
        document.body.appendChild(challengePanel);
        
        // Add CSS
        const style = document.createElement('style');
        style.textContent = `
            .daily-challenges-panel {
                position: fixed;
                top: 80px;
                left: 20px;
                width: 280px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 15px;
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
                padding: 15px;
                z-index: 100;
                font-family: 'Comic Sans MS', sans-serif;
                color: white;
            }
            
            .challenge-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
            }
            
            .challenge-header h3 {
                margin: 0;
                font-size: 16px;
            }
            
            .challenge-timer {
                font-size: 11px;
                opacity: 0.8;
            }
            
            .challenge-item {
                background: rgba(255, 255, 255, 0.1);
                border-radius: 10px;
                padding: 10px;
                margin-bottom: 8px;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .challenge-icon {
                font-size: 24px;
                flex-shrink: 0;
            }
            
            .challenge-content {
                flex: 1;
            }
            
            .challenge-name {
                font-weight: bold;
                font-size: 12px;
                margin-bottom: 3px;
            }
            
            .challenge-description {
                font-size: 10px;
                opacity: 0.9;
                margin-bottom: 5px;
            }
            
            .challenge-progress {
                display: flex;
                align-items: center;
                gap: 5px;
            }
            
            .challenge-progress-bar {
                flex: 1;
                height: 8px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 4px;
                overflow: hidden;
            }
            
            .challenge-progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #4CAF50, #8BC34A);
                transition: width 0.3s ease;
            }
            
            .challenge-progress-text {
                font-size: 10px;
                font-weight: bold;
                min-width: 40px;
                text-align: right;
            }
            
            .challenge-claim-btn {
                background: linear-gradient(135deg, #FFD700, #FFA500);
                color: white;
                border: none;
                border-radius: 8px;
                padding: 5px 10px;
                font-size: 10px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .challenge-claim-btn:hover {
                transform: scale(1.1);
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
            
            @media (max-width: 768px) {
                .daily-challenges-panel {
                    width: 250px;
                    left: 10px;
                    top: 60px;
                }
            }
        `;
        document.head.appendChild(style);
        
        // Update timer
        this.updateTimer();
        setInterval(() => this.updateTimer(), 1000);
    }
    
    updateChallengeUI() {
        const challengeList = document.getElementById('challenge-list');
        const challengePanel = document.getElementById('daily-challenges');
        if (!challengeList || !challengePanel) return;
        
        challengeList.innerHTML = '';
        
        // Check if there are any active challenges (not all claimed)
        const hasActiveChallenges = this.currentChallenges.some(challenge => !challenge.claimed);
        
        // Hide the panel if there are no active challenges
        if (!hasActiveChallenges || this.currentChallenges.length === 0) {
            challengePanel.style.display = 'none';
            return;
        }
        
        // Show the panel if there are active challenges
        challengePanel.style.display = 'block';
        
        this.currentChallenges.forEach(challenge => {
            const item = document.createElement('div');
            item.className = `challenge-item ${challenge.completed ? 'challenge-completed' : ''} ${challenge.claimed ? 'challenge-claimed' : ''}`;
            
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
                        Claim +${challenge.reward.amount}
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
                <div class="notification-text">Check your challenge panel for today's tasks</div>
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
                <div class="notification-text">${challenge.name} - Click to claim reward</div>
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
        z-index: 1001;
        display: flex;
        align-items: center;
        gap: 15px;
        transform: translateX(-400px);
        transition: all 0.5s ease;
        max-width: 280px;
        font-family: 'Comic Sans MS', sans-serif;
    }
    
    .challenge-notification.show {
        transform: translateX(0);
    }
    
    .notification-icon {
        font-size: 30px;
        animation: bounce 1s infinite;
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
`;
document.head.appendChild(notificationStyle);