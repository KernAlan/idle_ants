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
        
        // Modal state
        this.isModalOpen = false;
        
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
        // Create trigger button
        const triggerButton = document.createElement('div');
        triggerButton.id = 'challenge-trigger';
        triggerButton.className = 'challenge-trigger';
        triggerButton.innerHTML = '🎯';
        triggerButton.title = 'Daily Challenges';
        
        // Position button in top-right corner
        document.body.appendChild(triggerButton);
        
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
            <div class="challenge-list" id="challenge-list"></div>
        `;
        
        modalBackdrop.appendChild(modal);
        
        // Add event listeners
        triggerButton.addEventListener('click', () => this.openModal());
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
                padding: 20px;
                max-width: 400px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                color: white;
                font-family: 'Comic Sans MS', sans-serif;
                position: relative;
                transform: scale(0.8);
                transition: transform 0.3s ease;
            }
            
            .challenge-modal-backdrop.show .challenge-modal {
                transform: scale(1);
            }
            
            .challenge-modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
                flex-wrap: wrap;
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
                padding: 15px;
                margin-bottom: 10px;
                display: flex;
                align-items: center;
                gap: 15px;
            }
            
            .challenge-icon {
                font-size: 28px;
                flex-shrink: 0;
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
    
    closeModal() {
        this.isModalOpen = false;
        const backdrop = document.getElementById('challenge-modal-backdrop');
        if (backdrop) {
            backdrop.classList.remove('show');
        }
    }
    
    updateChallengeUI() {
        const challengeList = document.getElementById('challenge-list');
        const triggerButton = document.getElementById('challenge-trigger');
        if (!challengeList || !triggerButton) return;
        
        challengeList.innerHTML = '';
        
        // Update trigger button appearance
        const hasCompletedChallenges = this.currentChallenges.some(challenge => challenge.completed && !challenge.claimed);
        if (hasCompletedChallenges) {
            triggerButton.classList.add('has-rewards');
        } else {
            triggerButton.classList.remove('has-rewards');
        }
        
        // Show challenges if any exist
        if (this.currentChallenges.length === 0) {
            challengeList.innerHTML = '<div class="no-challenges">No challenges available today.<br>Check back tomorrow!</div>';
            return;
        }
        
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