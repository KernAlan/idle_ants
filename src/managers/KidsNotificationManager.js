// src/managers/KidsNotificationManager.js
IdleAnts.Managers.KidsNotificationManager = class {
    constructor(effectManager) {
        this.effectManager = effectManager;
        this.notifications = [];
        this.container = this.createNotificationContainer();
        this.setupStyles();
        this.encouragementMessages = [
            "You're doing amazing! 🌟",
            "Your ant colony is growing! 🐜",
            "Keep up the great work! 💪",
            "You're an ant master! 👑",
            "Fantastic job! 🎉",
            "Your ants are so happy! 😊",
            "You're building something awesome! 🏗️",
            "Super cool colony! ✨",
            "You're the best ant manager! 🏆",
            "Amazing progress! 🚀"
        ];
        
        this.milestoneMessages = {
            firstAnt: "Welcome to your first ant! 🐜✨",
            tenAnts: "Wow! 10 ants! You're building a real colony! 🏘️",
            fiftyAnts: "50 ants! That's incredible! 🎊",
            hundredAnts: "100 ants! You're an ant superstar! ⭐",
            thousandFood: "1000 food! Your ants are well-fed! 🍯",
            tenThousandFood: "10,000 food! That's a feast! 🎂",
            firstUpgrade: "First upgrade! Your colony is getting stronger! 💪",
            flyingAnts: "Flying ants unlocked! Sky's the limit! 🌈",
            superAnts: "Super ants! Your colony is legendary! 🦸‍♂️"
        };
        
        this.powerUpMessages = {
            'speed_boost': "Zoom zoom! Your ants are lightning fast! ⚡",
            'food_rain': "It's raining food! Yummy! 🌧️🍯",
            'double_ants': "Double ants everywhere! Amazing! 🐜🐜",
            'golden_touch': "Everything you touch turns to gold! ✨",
            'super_strength': "Your ants are super strong! 💪"
        };
    }
    
    createNotificationContainer() {
        const container = document.createElement('div');
        container.id = 'kids-notification-container';
        container.className = 'kids-notification-container';
        document.body.appendChild(container);
        return container;
    }
    
    setupStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .kids-notification-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 1000;
                pointer-events: none;
                font-family: 'Arial', sans-serif;
            }
            
            .kids-notification {
                background: linear-gradient(135deg, #FF6B6B, #4ECDC4, #45B7D1);
                border: 3px solid #FFD700;
                border-radius: 20px;
                padding: 15px 20px;
                margin-bottom: 10px;
                color: white;
                font-weight: bold;
                font-size: 16px;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
                box-shadow: 0 8px 20px rgba(0,0,0,0.3);
                animation: kidsBounceIn 0.8s ease-out;
                max-width: 300px;
                position: relative;
                overflow: hidden;
            }
            
            .kids-notification::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
                animation: kidsShine 2s ease-in-out infinite;
            }
            
            .kids-notification.achievement {
                background: linear-gradient(135deg, #FFD700, #FFA500, #FF6B6B);
                border-color: #FFD700;
                font-size: 18px;
                box-shadow: 0 12px 25px rgba(255,215,0,0.4);
            }
            
            .kids-notification.milestone {
                background: linear-gradient(135deg, #9C27B0, #E91E63, #FF5722);
                border-color: #E91E63;
                font-size: 17px;
                box-shadow: 0 10px 22px rgba(233,30,99,0.4);
            }
            
            .kids-notification.powerup {
                background: linear-gradient(135deg, #4CAF50, #8BC34A, #CDDC39);
                border-color: #4CAF50;
                font-size: 16px;
                box-shadow: 0 8px 18px rgba(76,175,80,0.4);
            }
            
            .kids-notification.encouragement {
                background: linear-gradient(135deg, #FF9800, #FF5722, #E91E63);
                border-color: #FF9800;
                font-size: 15px;
                box-shadow: 0 6px 15px rgba(255,152,0,0.4);
            }
            
            @keyframes kidsBounceIn {
                0% {
                    transform: translateX(100%) scale(0.3);
                    opacity: 0;
                }
                50% {
                    transform: translateX(-10px) scale(1.05);
                    opacity: 1;
                }
                70% {
                    transform: translateX(5px) scale(0.95);
                }
                100% {
                    transform: translateX(0) scale(1);
                    opacity: 1;
                }
            }
            
            @keyframes kidsShine {
                0% {
                    left: -100%;
                }
                100% {
                    left: 100%;
                }
            }
            
            @keyframes kidsFadeOut {
                0% {
                    opacity: 1;
                    transform: translateX(0) scale(1);
                }
                100% {
                    opacity: 0;
                    transform: translateX(100%) scale(0.8);
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    showNotification(message, type = 'default', duration = 4000) {
        const notification = document.createElement('div');
        notification.className = `kids-notification ${type}`;
        notification.textContent = message;
        
        this.container.appendChild(notification);
        
        // Add celebration effect for achievements
        if (type === 'achievement' || type === 'milestone') {
            this.addCelebrationEffect(notification);
        }
        
        // Remove notification after duration
        setTimeout(() => {
            notification.style.animation = 'kidsFadeOut 0.5s ease-in-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 500);
        }, duration);
        
        return notification;
    }
    
    addCelebrationEffect(notification) {
        // Add sparkles around the notification
        for (let i = 0; i < 6; i++) {
            const sparkle = document.createElement('div');
            sparkle.style.cssText = `
                position: absolute;
                width: 8px;
                height: 8px;
                background: #FFD700;
                border-radius: 50%;
                animation: sparkle 2s ease-out infinite;
                animation-delay: ${i * 0.2}s;
                top: ${Math.random() * 100}%;
                left: ${Math.random() * 100}%;
            `;
            notification.appendChild(sparkle);
        }
        
        // Add sparkle animation
        const sparkleStyle = document.createElement('style');
        sparkleStyle.textContent = `
            @keyframes sparkle {
                0% {
                    transform: scale(0) rotate(0deg);
                    opacity: 1;
                }
                50% {
                    transform: scale(1.2) rotate(180deg);
                    opacity: 0.8;
                }
                100% {
                    transform: scale(0) rotate(360deg);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(sparkleStyle);
    }
    
    showMilestone(milestoneType, extraData = {}) {
        const message = this.milestoneMessages[milestoneType] || "Amazing achievement! 🎉";
        this.showNotification(message, 'milestone', 6000);
        
        // Show celebration effect in game world
        if (this.effectManager) {
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            this.effectManager.addEffect('celebration', centerX, centerY, 'achievement');
        }
    }
    
    showPowerUp(powerUpType) {
        const message = this.powerUpMessages[powerUpType] || "Special power activated! ✨";
        this.showNotification(message, 'powerup', 5000);
    }
    
    showEncouragement() {
        const message = this.encouragementMessages[Math.floor(Math.random() * this.encouragementMessages.length)];
        this.showNotification(message, 'encouragement', 3000);
    }
    
    showAchievement(title, description) {
        const message = `🏆 ${title}: ${description}`;
        this.showNotification(message, 'achievement', 5000);
        
        // Show celebration effect
        if (this.effectManager) {
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            this.effectManager.addEffect('celebration', centerX, centerY, 'achievement');
        }
    }
    
    showRandomEncouragement() {
        // Show random encouragement every 30-60 seconds
        const delay = Math.random() * 30000 + 30000;
        setTimeout(() => {
            this.showEncouragement();
            this.showRandomEncouragement();
        }, delay);
    }
    
    checkMilestones(stats) {
        // Check for various milestones
        if (stats.ants === 1 && !this.milestoneReached?.firstAnt) {
            this.showMilestone('firstAnt');
            this.milestoneReached = { ...this.milestoneReached, firstAnt: true };
        }
        
        if (stats.ants >= 10 && !this.milestoneReached?.tenAnts) {
            this.showMilestone('tenAnts');
            this.milestoneReached = { ...this.milestoneReached, tenAnts: true };
        }
        
        if (stats.ants >= 50 && !this.milestoneReached?.fiftyAnts) {
            this.showMilestone('fiftyAnts');
            this.milestoneReached = { ...this.milestoneReached, fiftyAnts: true };
        }
        
        if (stats.ants >= 100 && !this.milestoneReached?.hundredAnts) {
            this.showMilestone('hundredAnts');
            this.milestoneReached = { ...this.milestoneReached, hundredAnts: true };
        }
        
        if (stats.food >= 1000 && !this.milestoneReached?.thousandFood) {
            this.showMilestone('thousandFood');
            this.milestoneReached = { ...this.milestoneReached, thousandFood: true };
        }
        
        if (stats.food >= 10000 && !this.milestoneReached?.tenThousandFood) {
            this.showMilestone('tenThousandFood');
            this.milestoneReached = { ...this.milestoneReached, tenThousandFood: true };
        }
        
        if (stats.flyingAntsUnlocked && !this.milestoneReached?.flyingAnts) {
            this.showMilestone('flyingAnts');
            this.milestoneReached = { ...this.milestoneReached, flyingAnts: true };
        }
        
        if ((stats.carAntsUnlocked || stats.fireAntsUnlocked) && !this.milestoneReached?.superAnts) {
            this.showMilestone('superAnts');
            this.milestoneReached = { ...this.milestoneReached, superAnts: true };
        }
    }
    
    init() {
        // Initialize milestone tracking
        this.milestoneReached = {};
        
        // Start random encouragement
        this.showRandomEncouragement();
        
        // Welcome message
        setTimeout(() => {
            this.showNotification("Welcome to your Ant Colony! Let's build something amazing! 🐜✨", 'milestone', 5000);
        }, 1000);
    }
}