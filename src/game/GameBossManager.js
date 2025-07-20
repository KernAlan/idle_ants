/**
 * GameBossManager - Handles boss fight mechanics and boss-related functionality
 * Extracted from Game.js to maintain Single Responsibility Principle
 */

// Ensure Game namespace exists
if (!IdleAnts.Game) {
    IdleAnts.Game = {};
}

IdleAnts.Game.GameBossManager = class {
    constructor(game) {
        this.game = game;
        this.currentBoss = null;
        this.bossNameDisplay = null;
        this.warningText = null;
        this.triggerBoss = false;
    }

    /**
     * Start boss fight sequence
     */
    startBossFight() {
        console.log('[BOSS] Starting boss fight...');
        
        if (this.game.state !== IdleAnts.Game.States.PLAYING) {
            console.log('[BOSS] Cannot start boss fight - not in PLAYING state');
            return;
        }

        // Close any open modals/overlays
        this.game.transitionToState(IdleAnts.Game.States.BOSS_INTRO);
        
        // Pan camera to a good position for the boss fight
        if (this.game.cameraManager) {
            const nestPos = this.game.entityManager.getNestPosition();
            if (nestPos) {
                const bossX = nestPos.x + 400;
                const bossY = nestPos.y - 200;
                
                this.game.cameraManager.panTo(bossX, bossY, 2000, () => {
                    this.spawnBossAfterCameraPan();
                });
            } else {
                this.spawnBossAfterCameraPan();
            }
        } else {
            this.spawnBossAfterCameraPan();
        }
    }

    /**
     * Spawn boss after camera has panned to position
     */
    spawnBossAfterCameraPan() {
        // Close any remaining UI overlays
        if (this.game.dailyChallengeManager && this.game.dailyChallengeManager.closeModal) {
            this.game.dailyChallengeManager.closeModal();
        }

        console.log('[BOSS] Camera pan complete, spawning boss...');
        
        // Get nest position for boss spawn
        const nestPos = this.game.entityManager.getNestPosition();
        const bossX = nestPos ? nestPos.x + 400 : 1500;
        const bossY = nestPos ? nestPos.y - 200 : 800;
        
        // Create and spawn the boss
        this.currentBoss = this.game.entityManager.createBoss(bossX, bossY);
        
        if (this.currentBoss) {
            this.playBossIntroCinematic(this.currentBoss);
        }
    }

    /**
     * Trigger boss spawning from external systems
     */
    triggerBoss() {
        if (this.game.entityManager) {
            this.triggerBoss = true;
        }
    }

    /**
     * Handle boss defeated event
     */
    onBossDefeated() {
        if (this.game.uiManager) {
            this.game.uiManager.hideBossHealthBar();
        }
        
        if (this.game.entityManager) {
            this.game.entityManager.entities.enemies = [];
        }
        
        this.game.transitionToState(IdleAnts.Game.States.WIN);
        
        // Play victory music
        if (this.game.gameAudioManager) {
            this.game.gameAudioManager.playVictoryMusic();
        }
    }

    /**
     * Handle colony wiped event
     */
    onColonyWiped() {
        if (this.game.uiManager) {
            this.game.uiManager.hideBossHealthBar();
        }
        
        this.game.transitionToState(IdleAnts.Game.States.LOSE);
    }

    /**
     * Play boss intro cinematic
     * @param {Object} boss - The boss entity
     */
    playBossIntroCinematic(boss) {
        console.log('[CINEMATIC] Starting epic boss intro sequence...');
        
        // Transition to boss intro state
        this.game.transitionToState(IdleAnts.Game.States.BOSS_INTRO);
        
        // Play boss music
        if (this.game.gameAudioManager) {
            this.game.gameAudioManager.playBossMusic();
        }

        // Start with dramatic text warnings
        this.showEpicWarningText("⚠️ MASSIVE THREAT DETECTED ⚠️");
        
        setTimeout(() => {
            this.showEpicWarningText("🌋 THE GROUND TREMBLES 🌋");
        }, 1500);
        
        setTimeout(() => {
            this.showEpicWarningText("💀 ANCIENT EVIL AWAKENS 💀");
        }, 3000);
        
        setTimeout(() => {
            this.showEpicWarningText("🔥 PREPARE FOR ANNIHILATION 🔥");
        }, 4500);

        // Create epic falling effects
        if (this.game.effectManager) {
            // Debris falling from sky
            for (let i = 0; i < 12; i++) {
                setTimeout(() => {
                    this.game.effectManager.createDebrisEffect(
                        Math.random() * this.game.app.screen.width,
                        -50,
                        Math.random() * 360
                    );
                }, i * 200);
            }
        }

        // Start the epic invasion after warnings
        setTimeout(() => {
            this.handleEpicBossInvasion(boss, boss.x, boss.y);
        }, 6000);
    }

    /**
     * Handle epic boss invasion sequence
     * @param {Object} boss - The boss entity
     * @param {number} landingX - Boss landing X coordinate
     * @param {number} landingY - Boss landing Y coordinate
     */
    handleEpicBossInvasion(boss, landingX, landingY) {
        console.log('[CINEMATIC] EPIC BOSS INVASION COMMENCING!');
        
        // Camera shake for dramatic effect
        if (this.game.cameraManager) {
            this.game.cameraManager.shake(15, 4000);
        }

        // Create massive explosion effects
        if (this.game.effectManager) {
            // Initial impact explosions
            for (let i = 0; i < 30; i++) {
                setTimeout(() => {
                    this.game.effectManager.createExplosionEffect(
                        landingX + (Math.random() - 0.5) * 400,
                        landingY + (Math.random() - 0.5) * 300,
                        Math.random() * 360,
                        'boss_explosion'
                    );
                }, i * 50);
            }

            // Shockwave effects
            for (let wave = 0; wave < 3; wave++) {
                setTimeout(() => {
                    for (let i = 0; i < 8; i++) {
                        const angle = (i / 8) * Math.PI * 2;
                        const distance = 200 + (wave * 100);
                        this.game.effectManager.createShockwaveEffect(
                            landingX + Math.cos(angle) * distance,
                            landingY + Math.sin(angle) * distance,
                            angle * (180 / Math.PI)
                        );
                    }
                }, wave * 800);
            }
        }

        // Show boss reveal after dramatic pause
        setTimeout(() => {
            this.showFinalBossReveal();
        }, 2000);

        // Play boss theme music
        setTimeout(() => {
            if (this.game.gameAudioManager) {
                this.game.gameAudioManager.playBossMusic();
            }
        }, 2500);

        // Animate boss appearance with epic entrance
        boss.alpha = 0;
        boss.scale.set(3.0);
        boss.rotation = Math.PI;

        setTimeout(() => {
            this.animateBossEntrance(boss, landingX, landingY);
        }, 3000);
    }

    /**
     * Animate boss entrance with dramatic effects
     * @param {Object} boss - The boss entity
     * @param {number} landingX - Target X coordinate
     * @param {number} landingY - Target Y coordinate
     */
    animateBossEntrance(boss, landingX, landingY) {
        const startTime = Date.now();
        const duration = 4000;

        const animateEntrance = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Epic entrance animation
            if (progress < 0.15) {
                // Dramatic emergence
                boss.alpha = progress / 0.15;
                if (this.game.effectManager) {
                    // Continuous emergence effects
                    if (Math.random() < 0.3) {
                        this.game.effectManager.createEmergenceEffect(
                            boss.x + (Math.random() - 0.5) * 200,
                            boss.y + (Math.random() - 0.5) * 150
                        );
                    }
                }
            }

            // Boss becomes fully visible
            if (boss.alpha === 0) {
                boss.alpha = Math.min(progress * 2, 1);
            }

            // Falling and rotating animation
            const fallProgress = Math.min(progress / 0.8, 1);
            if (fallProgress < 0.8) {
                const easeOut = 1 - Math.pow(1 - fallProgress, 3);
                boss.y = landingY - (1 - easeOut) * 800;
                boss.rotation = Math.PI * (1 - easeOut);
                boss.scale.set(3.0 - (easeOut * 2.0));

                // Add falling effects
                if (Math.random() < 0.2) {
                    if (this.game.effectManager) {
                        this.game.effectManager.createTrailEffect(
                            boss.x + (Math.random() - 0.5) * 100,
                            boss.y + (Math.random() - 0.5) * 100,
                            Math.random() * 360
                        );
                    }
                }
            } else {
                // Landing impact
                boss.y = landingY;
                boss.rotation = 0;
                boss.scale.set(1.0);

                if (progress < 0.85) {
                    // Ground impact effects
                    if (this.game.effectManager) {
                        // Ground crack effects
                        for (let i = 0; i < 3; i++) {
                            this.game.effectManager.createGroundCrackEffect(
                                landingX + (Math.random() - 0.5) * 300,
                                landingY + 50 + (Math.random() * 100),
                                Math.random() * 360
                            );
                        }
                    }
                }

                // Final dramatic effects
                if (progress >= 0.95) {
                    if (this.game.effectManager) {
                        // Final explosion burst
                        for (let i = 0; i < 40; i++) {
                            setTimeout(() => {
                                this.game.effectManager.createFinalBurstEffect(
                                    landingX + (Math.random() - 0.5) * 400,
                                    landingY + (Math.random() - 0.5) * 300,
                                    Math.random() * 360
                                );
                            }, i * 20);
                        }

                        // Create concentric ring effects
                        for (let ring = 0; ring < 3; ring++) {
                            setTimeout(() => {
                                for (let i = 0; i < 12; i++) {
                                    const angle = (i / 12) * Math.PI * 2;
                                    const radius = 150 + (ring * 100);
                                    this.game.effectManager.createRingEffect(
                                        landingX + Math.cos(angle) * radius,
                                        landingY + Math.sin(angle) * radius,
                                        angle * (180 / Math.PI)
                                    );
                                }
                            }, ring * 300);
                        }
                    }
                }
            }

            if (progress < 1) {
                requestAnimationFrame(animateEntrance);
            } else {
                // Animation complete - end cinematic
                setTimeout(() => {
                    this.endEpicCinematic();
                }, 1000);
            }
        };

        animateEntrance();
    }

    /**
     * Show epic warning text with dramatic styling
     * @param {string} text - Warning text to display
     * @param {boolean} isBossName - Whether this is the boss name reveal
     */
    showEpicWarningText(text, isBossName = false) {
        this.hideWarningText();
        
        this.warningText = document.createElement('div');
        this.warningText.style.cssText = `
            position: fixed;
            top: ${isBossName ? '40%' : '20%'};
            left: 50%;
            transform: translateX(-50%);
            font-family: 'Courier New', monospace;
            font-size: ${isBossName ? '48px' : '36px'};
            font-weight: bold;
            color: ${isBossName ? '#FFD700' : '#FF0000'};
            text-shadow: 4px 4px 8px rgba(0, 0, 0, 1), 0 0 20px ${isBossName ? '#FFD700' : '#FF0000'};
            z-index: 9999;
            text-align: center;
            letter-spacing: 4px;
            animation: ${isBossName ? 'bossNamePulse' : 'warningPulse'} 1s ease-in-out infinite alternate;
            pointer-events: none;
            white-space: nowrap;
        `;
        this.warningText.textContent = text;
        document.body.appendChild(this.warningText);
    }

    /**
     * Hide warning text
     */
    hideWarningText() {
        if (this.warningText) {
            this.warningText.style.opacity = '0';
            this.warningText.style.transform = 'translateX(-50%) scale(0.8)';
            this.warningText.style.transition = 'all 0.3s ease';
            setTimeout(() => {
                if (this.warningText && this.warningText.parentNode) {
                    this.warningText.parentNode.removeChild(this.warningText);
                }
                this.warningText = null;
            }, 300);
        }
    }

    /**
     * Show final boss reveal with ultimate dramatic effect
     */
    showFinalBossReveal() {
        this.showEpicWarningText("THE GREAT ANTEATER", true);
        
        // Create the dramatic boss name display
        this.bossNameDisplay = document.createElement('div');
        this.bossNameDisplay.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(2.5) rotateY(180deg);
            font-family: 'Courier New', monospace;
            font-size: 32px;
            font-weight: bold;
            color: #FFD700;
            text-shadow: 6px 6px 12px rgba(0, 0, 0, 1), 0 0 30px #FFD700;
            z-index: 10000;
            text-align: center;
            opacity: 0;
            animation: ultimateBossReveal 2s ease-out forwards;
            pointer-events: none;
        `;
        this.bossNameDisplay.innerHTML = `
            <div style="font-size: 28px; color: #FFD700; margin-bottom: 8px; text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.9);">◆ FINAL BOSS ◆</div>
            <div style="letter-spacing: 3px;">THE GREAT ANTEATER</div>
            <div style="font-size: 20px; color: #FFA500; margin-top: 8px; text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);">Destroyer of Colonies</div>
        `;
        document.body.appendChild(this.bossNameDisplay);
        
        // Add ultimate reveal animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes ultimateBossReveal {
                0% { 
                    opacity: 0; 
                    transform: translate(-50%, -50%) scale(2.5) rotateY(180deg); 
                }
                50% { 
                    opacity: 1; 
                    transform: translate(-50%, -50%) scale(1.2) rotateY(0deg); 
                }
                100% { 
                    opacity: 1; 
                    transform: translate(-50%, -50%) scale(1.0) rotateY(0deg); 
                }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * End epic cinematic and transition to boss fight
     */
    endEpicCinematic() {
        console.log('%c[CINEMATIC] Epic boss invasion complete - DEFEND THE NEST!', 'color: #00FF00; font-weight: bold;');
        
        // Remove all cinematic text elements
        this.hideWarningText();
        
        if (this.bossNameDisplay) {
            this.bossNameDisplay.style.opacity = '0';
            this.bossNameDisplay.style.transform = 'translate(-50%, -50%) scale(0.8)';
            this.bossNameDisplay.style.transition = 'all 0.5s ease';
            setTimeout(() => {
                if (this.bossNameDisplay && this.bossNameDisplay.parentNode) {
                    this.bossNameDisplay.parentNode.removeChild(this.bossNameDisplay);
                }
                this.bossNameDisplay = null;
            }, 500);
        }
        
        // Ensure proper camera position for combat
        if (this.game.cameraManager && this.currentBoss) {
            console.log(`[CINEMATIC] Camera was never moved - no restoration needed`);
            console.log(`[CINEMATIC] Camera remains exactly where player positioned it`);
        }
        
        // Show boss health bar
        if (this.game.uiManager) {
            this.game.uiManager.showBossHealthBar(this.currentBoss.maxHp);
        }
        
        // IMPORTANT: Officially transition to boss fight state
        this.game.transitionToState(IdleAnts.Game.States.BOSS_FIGHT);
        console.log('[CINEMATIC] Camera controls restored - DEFEND THE COLONY!');
    }
};



