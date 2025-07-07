// src/managers/MiniGameManager.js
IdleAnts.Managers.MiniGameManager = class {
    constructor(game, kidsNotificationManager) {
        this.game = game;
        this.kidsNotificationManager = kidsNotificationManager;
        this.activeMiniGame = null;
        this.miniGameInterval = 180000; // 3 minutes between mini-games
        this.lastMiniGameTime = 0;
        this.createMiniGameUI();
        
        this.miniGames = {
            'click_rush': {
                name: 'Click Rush',
                description: 'Click as fast as you can to collect bonus food!',
                duration: 15000, // 15 seconds
                setup: this.setupClickRush.bind(this),
                cleanup: this.cleanupClickRush.bind(this)
            },
            'ant_count': {
                name: 'Ant Counting',
                description: 'Count the ants correctly to get rewards!',
                duration: 20000, // 20 seconds
                setup: this.setupAntCounting.bind(this),
                cleanup: this.cleanupAntCounting.bind(this)
            },
            'memory_food': {
                name: 'Memory Food',
                description: 'Remember the food pattern!',
                duration: 25000, // 25 seconds
                setup: this.setupMemoryFood.bind(this),
                cleanup: this.cleanupMemoryFood.bind(this)
            }
        };
    }
    
    createMiniGameUI() {
        // Create mini-game overlay
        this.overlay = document.createElement('div');
        this.overlay.id = 'mini-game-overlay';
        this.overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            font-family: 'Comic Sans MS', Arial, sans-serif;
        `;
        
        // Create mini-game container
        this.container = document.createElement('div');
        this.container.id = 'mini-game-container';
        this.container.style.cssText = `
            background: linear-gradient(135deg, #FF6B6B, #4ECDC4, #45B7D1);
            border: 5px solid #FFD700;
            border-radius: 20px;
            padding: 30px;
            text-align: center;
            color: white;
            max-width: 400px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            animation: miniGameBounce 0.5s ease-out;
        `;
        
        this.overlay.appendChild(this.container);
        document.body.appendChild(this.overlay);
        
        // Add mini-game styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes miniGameBounce {
                0% { transform: scale(0.3); opacity: 0; }
                50% { transform: scale(1.1); opacity: 1; }
                100% { transform: scale(1); opacity: 1; }
            }
            
            .mini-game-button {
                background: linear-gradient(135deg, #FFD700, #FFA500);
                border: 3px solid #FFD700;
                border-radius: 15px;
                padding: 15px 30px;
                font-size: 18px;
                font-weight: bold;
                color: #333;
                cursor: pointer;
                margin: 10px;
                transition: all 0.3s ease;
                box-shadow: 0 5px 15px rgba(255, 215, 0, 0.3);
            }
            
            .mini-game-button:hover {
                transform: translateY(-3px) scale(1.05);
                box-shadow: 0 8px 25px rgba(255, 215, 0, 0.5);
            }
            
            .mini-game-button:active {
                transform: translateY(0) scale(0.95);
            }
            
            .mini-game-counter {
                font-size: 48px;
                font-weight: bold;
                margin: 20px 0;
                text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.5);
                animation: pulse 1s ease-in-out infinite;
            }
            
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }
            
            .mini-game-timer {
                font-size: 24px;
                font-weight: bold;
                margin: 15px 0;
                color: #FFD700;
                text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
            }
        `;
        document.head.appendChild(style);
    }
    
    update(deltaTime) {
        const currentTime = Date.now();
        
        // Check if it's time for a new mini-game
        if (!this.activeMiniGame && currentTime - this.lastMiniGameTime > this.miniGameInterval) {
            this.startRandomMiniGame();
            this.lastMiniGameTime = currentTime;
        }
        
        // Update active mini-game
        if (this.activeMiniGame) {
            this.activeMiniGame.update(deltaTime);
        }
    }
    
    startRandomMiniGame() {
        const gameTypes = Object.keys(this.miniGames);
        const randomType = gameTypes[Math.floor(Math.random() * gameTypes.length)];
        this.startMiniGame(randomType);
    }
    
    startMiniGame(gameType) {
        const miniGame = this.miniGames[gameType];
        if (!miniGame) return;
        
        this.activeMiniGame = {
            type: gameType,
            config: miniGame,
            startTime: Date.now(),
            timeLeft: miniGame.duration,
            update: (deltaTime) => {
                this.activeMiniGame.timeLeft -= deltaTime;
                if (this.activeMiniGame.timeLeft <= 0) {
                    this.endMiniGame();
                } else {
                    this.updateMiniGameTimer();
                }
            }
        };
        
        // Show mini-game announcement
        if (this.kidsNotificationManager) {
            this.kidsNotificationManager.showNotification(`🎮 ${miniGame.name}! ${miniGame.description}`, 'powerup', 3000);
        }
        
        // Set up the mini-game
        miniGame.setup();
        
        // Show overlay
        this.overlay.style.display = 'flex';
    }
    
    endMiniGame() {
        if (!this.activeMiniGame) return;
        
        const miniGame = this.activeMiniGame;
        
        // Clean up
        miniGame.config.cleanup();
        
        // Hide overlay
        this.overlay.style.display = 'none';
        
        // Show completion message
        if (this.kidsNotificationManager) {
            this.kidsNotificationManager.showNotification(`🎉 Mini-game completed! Great job!`, 'achievement', 4000);
        }
        
        this.activeMiniGame = null;
        
        // Randomize next mini-game time (2-5 minutes)
        this.miniGameInterval = Math.random() * 180000 + 120000;
    }
    
    updateMiniGameTimer() {
        const timerElement = document.getElementById('mini-game-timer');
        if (timerElement && this.activeMiniGame) {
            const seconds = Math.ceil(this.activeMiniGame.timeLeft / 1000);
            timerElement.textContent = `Time: ${seconds}s`;
        }
    }
    
    setupClickRush() {
        this.clickRushData = {
            clicks: 0,
            targetClicks: 50,
            foodReward: 0
        };
        
        this.container.innerHTML = `
            <h2>🎯 Click Rush! 🎯</h2>
            <p>Click the button as fast as you can!</p>
            <div class="mini-game-counter" id="click-counter">0 / 50</div>
            <div class="mini-game-timer" id="mini-game-timer">Time: 15s</div>
            <button class="mini-game-button" id="click-rush-button">CLICK ME!</button>
        `;
        
        const button = document.getElementById('click-rush-button');
        button.addEventListener('click', () => {
            this.clickRushData.clicks++;
            this.clickRushData.foodReward += 10;
            
            // Add visual feedback
            button.style.transform = 'scale(0.9)';
            setTimeout(() => {
                button.style.transform = 'scale(1)';
            }, 100);
            
            // Update counter
            const counter = document.getElementById('click-counter');
            counter.textContent = `${this.clickRushData.clicks} / ${this.clickRushData.targetClicks}`;
            
            // Check if target reached
            if (this.clickRushData.clicks >= this.clickRushData.targetClicks) {
                this.completeClickRush();
            }
        });
    }
    
    completeClickRush() {
        // Award food
        this.game.resourceManager.addFood(this.clickRushData.foodReward);
        
        // Show success message
        this.container.innerHTML = `
            <h2>🎉 Amazing! 🎉</h2>
            <p>You clicked ${this.clickRushData.clicks} times!</p>
            <div class="mini-game-counter">+${this.clickRushData.foodReward} Food!</div>
            <p>Keep being awesome!</p>
        `;
        
        // Show celebration effect
        if (this.game.effectManager) {
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            this.game.effectManager.addEffect('celebration', centerX, centerY, 'achievement');
        }
        
        setTimeout(() => {
            this.endMiniGame();
        }, 3000);
    }
    
    cleanupClickRush() {
        this.clickRushData = null;
    }
    
    setupAntCounting() {
        const antCount = Math.floor(Math.random() * 10) + 5; // 5-15 ants
        this.antCountingData = {
            correctCount: antCount,
            userGuess: null,
            attempts: 0,
            maxAttempts: 3
        };
        
        this.container.innerHTML = `
            <h2>🐜 Count the Ants! 🐜</h2>
            <p>How many ants do you see?</p>
            <div id="ant-display" style="margin: 20px 0; font-size: 24px;">
                ${'🐜'.repeat(antCount)}
            </div>
            <div class="mini-game-timer" id="mini-game-timer">Time: 20s</div>
            <input type="number" id="ant-guess" placeholder="Enter your guess" style="
                padding: 10px;
                font-size: 18px;
                border: 3px solid #FFD700;
                border-radius: 10px;
                margin: 10px;
                text-align: center;
            ">
            <br>
            <button class="mini-game-button" id="submit-guess">Submit Guess</button>
        `;
        
        const submitButton = document.getElementById('submit-guess');
        const guessInput = document.getElementById('ant-guess');
        
        const submitGuess = () => {
            const guess = parseInt(guessInput.value);
            if (isNaN(guess)) return;
            
            this.antCountingData.attempts++;
            
            if (guess === this.antCountingData.correctCount) {
                this.completeAntCounting(true);
            } else if (this.antCountingData.attempts >= this.antCountingData.maxAttempts) {
                this.completeAntCounting(false);
            } else {
                const remaining = this.antCountingData.maxAttempts - this.antCountingData.attempts;
                guessInput.value = '';
                guessInput.placeholder = `Try again! ${remaining} attempts left`;
            }
        };
        
        submitButton.addEventListener('click', submitGuess);
        guessInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                submitGuess();
            }
        });
    }
    
    completeAntCounting(success) {
        if (success) {
            const reward = 200;
            this.game.resourceManager.addFood(reward);
            
            this.container.innerHTML = `
                <h2>🎉 Perfect! 🎉</h2>
                <p>You counted ${this.antCountingData.correctCount} ants correctly!</p>
                <div class="mini-game-counter">+${reward} Food!</div>
                <p>You're an ant expert!</p>
            `;
        } else {
            this.container.innerHTML = `
                <h2>🐜 Good Try! 🐜</h2>
                <p>The correct count was ${this.antCountingData.correctCount} ants.</p>
                <p>Keep practicing and you'll get better!</p>
            `;
        }
        
        setTimeout(() => {
            this.endMiniGame();
        }, 3000);
    }
    
    cleanupAntCounting() {
        this.antCountingData = null;
    }
    
    setupMemoryFood() {
        this.memoryFoodData = {
            sequence: [],
            userSequence: [],
            sequenceLength: 4,
            currentStep: 0,
            showingSequence: true
        };
        
        // Generate random sequence
        const foodEmojis = ['🍯', '🍎', '🥜', '🍇', '🍓', '🥕'];
        for (let i = 0; i < this.memoryFoodData.sequenceLength; i++) {
            this.memoryFoodData.sequence.push(foodEmojis[Math.floor(Math.random() * foodEmojis.length)]);
        }
        
        this.container.innerHTML = `
            <h2>🧠 Memory Food! 🧠</h2>
            <p>Remember the food sequence!</p>
            <div class="mini-game-counter" id="memory-display">Watch carefully...</div>
            <div class="mini-game-timer" id="mini-game-timer">Time: 25s</div>
            <div id="memory-buttons" style="display: none;">
                ${foodEmojis.map(emoji => `<button class="mini-game-button" data-food="${emoji}">${emoji}</button>`).join('')}
            </div>
        `;
        
        this.showMemorySequence();
    }
    
    showMemorySequence() {
        const display = document.getElementById('memory-display');
        let step = 0;
        
        const showNext = () => {
            if (step < this.memoryFoodData.sequence.length) {
                display.textContent = this.memoryFoodData.sequence[step];
                step++;
                setTimeout(showNext, 1000);
            } else {
                display.textContent = 'Now click the sequence!';
                document.getElementById('memory-buttons').style.display = 'block';
                
                // Add click listeners
                const buttons = document.querySelectorAll('#memory-buttons button');
                buttons.forEach(button => {
                    button.addEventListener('click', () => {
                        const food = button.dataset.food;
                        this.memoryFoodData.userSequence.push(food);
                        this.checkMemorySequence();
                    });
                });
            }
        };
        
        showNext();
    }
    
    checkMemorySequence() {
        const userSeq = this.memoryFoodData.userSequence;
        const correctSeq = this.memoryFoodData.sequence;
        
        if (userSeq.length <= correctSeq.length) {
            // Check if current sequence is correct so far
            const isCorrect = userSeq.every((food, index) => food === correctSeq[index]);
            
            if (!isCorrect) {
                this.completeMemoryFood(false);
            } else if (userSeq.length === correctSeq.length) {
                this.completeMemoryFood(true);
            }
        }
    }
    
    completeMemoryFood(success) {
        if (success) {
            const reward = 300;
            this.game.resourceManager.addFood(reward);
            
            this.container.innerHTML = `
                <h2>🧠 Brilliant! 🧠</h2>
                <p>You remembered the sequence perfectly!</p>
                <div class="mini-game-counter">+${reward} Food!</div>
                <p>Your memory is amazing!</p>
            `;
        } else {
            this.container.innerHTML = `
                <h2>🍯 Nice Try! 🍯</h2>
                <p>The sequence was: ${this.memoryFoodData.sequence.join(' ')}</p>
                <p>Keep practicing your memory skills!</p>
            `;
        }
        
        setTimeout(() => {
            this.endMiniGame();
        }, 3000);
    }
    
    cleanupMemoryFood() {
        this.memoryFoodData = null;
    }
    
    // Manual trigger for testing
    triggerMiniGame(gameType) {
        if (this.activeMiniGame) return; // Don't start if one is already active
        
        if (gameType && this.miniGames[gameType]) {
            this.startMiniGame(gameType);
        } else {
            this.startRandomMiniGame();
        }
    }
}