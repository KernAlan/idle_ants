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
        // Create toggle button first
        const toggleButton = document.createElement('button');
        toggleButton.id = 'challenges-toggle';
        toggleButton.className = 'challenges-toggle-btn';
        toggleButton.innerHTML = '🎯';
        toggleButton.title = 'Daily Challenges';
        document.body.appendChild(toggleButton);
        
        // Create notification badge as separate element
        const notificationBadge = document.createElement('div');
        notificationBadge.className = 'challenge-notification-badge';
        document.body.appendChild(notificationBadge);
        
        // Create challenge panel (initially hidden)
        const challengePanel = document.createElement('div');
        challengePanel.id = 'daily-challenges';
        challengePanel.className = 'daily-challenges-panel';
        challengePanel.style.display = 'none'; // Start hidden
        challengePanel.innerHTML = `
            <div class="challenge-header">
                <h3>🎯 Daily Challenges</h3>
                <button class="challenge-close-btn" onclick="document.getElementById('daily-challenges').style.display='none'">×</button>
            </div>
            <div class="challenge-timer" id="challenge-timer">Next: 00:00:00</div>
            <div class="challenge-list" id="challenge-list"></div>
        `;
        
        // Add to page
        document.body.appendChild(challengePanel);
        
        // Add toggle functionality
        toggleButton.addEventListener('click', () => {
            const panel = document.getElementById('daily-challenges');
            const isVisible = panel.style.display !== 'none';
            panel.style.display = isVisible ? 'none' : 'block';
            
            // Remove notification badge when opened
            const badge = document.querySelector('.challenge-notification-badge');
            if (badge && !isVisible) {
                badge.style.display = 'none';
            }
        });
        
        // Add CSS
        const style = document.createElement('style');
        style.textContent = `
            .challenges-toggle-btn {
                position: fixed;
                top: 20px;
                right: 80px;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                border: none;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                font-size: 20px;
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
                z-index: 101;
                transition: all 0.3s ease;
            }
            
            .challenges-toggle-btn:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
            }
            
            .challenge-notification-badge {
                position: fixed;
                top: 15px;
                right: 75px;
                width: 16px;
                height: 16px;
                background: #FF4444;
                border-radius: 50%;
                border: 2px solid white;
                display: none;
                z-index: 102;
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.2); }
            }
            
            .daily-challenges-panel {
                position: fixed;
                top: 80px;
                right: 20px;
                width: 240px;
                max-height: 300px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 12px;
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
                padding: 12px;
                z-index: 100;
                font-family: 'Comic Sans MS', sans-serif;
                color: white;
                border: 2px solid rgba(255, 255, 255, 0.2);
                overflow-y: auto;
            }
            
            .challenge-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
            }
            
            .challenge-header h3 {
                margin: 0;
                font-size: 14px;
            }
            
            .challenge-close-btn {
                background: none;
                border: none;
                color: white;
                font-size: 18px;
                cursor: pointer;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background 0.2s ease;
            }
            
            .challenge-close-btn:hover {
                background: rgba(255, 255, 255, 0.2);
            }
            
            .challenge-timer {
                font-size: 10px;
                opacity: 0.8;
                margin-bottom: 8px;
                text-align: center;
            }
            
            .challenge-item {
                background: rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                padding: 8px;
                margin-bottom: 6px;
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 11px;
            }
            
            .challenge-icon {
                font-size: 18px;
                flex-shrink: 0;
            }
            
            .challenge-content {
                flex: 1;
                min-width: 0;
            }
            
            .challenge-name {
                font-weight: bold;
                font-size: 11px;
                margin-bottom: 2px;
                line-height: 1.2;
            }
            
            .challenge-description {
                font-size: 9px;
                opacity: 0.9;
                margin-bottom: 4px;
                line-height: 1.2;
            }
            
            .challenge-progress {
                display: flex;
                align-items: center;
                gap: 4px;
            }
            
            .challenge-progress-bar {
                flex: 1;
                height: 6px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 3px;
                overflow: hidden;
            }
            
            .challenge-progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #4CAF50, #8BC34A);
                transition: width 0.3s ease;
            }
            
            .challenge-progress-text {
                font-size: 8px;
                font-weight: bold;
                min-width: 30px;
                text-align: right;
            }
            
            .challenge-claim-btn {
                background: linear-gradient(135deg, #FFD700, #FFA500);
                color: white;
                border: none;
                border-radius: 6px;
                padding: 4px 8px;
                font-size: 9px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
                white-space: nowrap;
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
                .challenges-toggle-btn {
                    top: 15px;
                    right: 15px;
                    width: 45px;
                    height: 45px;
                    font-size: 18px;
                }
                
                .challenge-notification-badge {
                    top: 10px;
                    right: 10px;
                    width: 14px;
                    height: 14px;
                }
                
                .daily-challenges-panel {
                    width: 220px;
                    right: 10px;
                    top: 70px;
                    max-height: 250px;
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
        
        // Don't automatically show/hide the panel - leave that to the toggle button
        // Just update the content regardless of visibility
        if (this.currentChallenges.length === 0) {
            // If no challenges, you could add some placeholder content or leave empty
            challengeList.innerHTML = '<div style="text-align: center; padding: 15px; opacity: 0.7;">No challenges available</div>';
            return;
        }
        
        // Check if all challenges are claimed to show a "completed" state
        const allClaimed = this.currentChallenges.every(challenge => challenge.claimed);
        
        if (allClaimed) {
            // Show a message that all challenges are completed
            const completedMessage = document.createElement('div');
            completedMessage.className = 'challenges-completed';
            completedMessage.innerHTML = `
                <div style="text-align: center; padding: 15px; color: #FFD700;">
                    <div style="font-size: 20px; margin-bottom: 5px;">🎉</div>
                    <div style="font-weight: bold;">All challenges completed!</div>
                    <div style="font-size: 11px; opacity: 0.8;">New challenges tomorrow</div>
                </div>
            `;
            challengeList.appendChild(completedMessage);
        } else {
            // Show active challenges
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
         
         // Update notification badge based on claimable challenges
         this.updateNotificationBadge();
    }
    
    updateNotificationBadge() {
        const badge = document.querySelector('.challenge-notification-badge');
        if (!badge) return;
        
        // Check if there are any claimable challenges (completed but not claimed)
        const hasClaimable = this.currentChallenges.some(challenge => challenge.completed && !challenge.claimed);
        
        // Show badge if there are claimable challenges
        badge.style.display = hasClaimable ? 'block' : 'none';
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