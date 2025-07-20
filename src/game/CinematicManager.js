/**
 * CinematicManager - Handles boss fight cinematics and camera movements
 * Extracted from Game.js to improve maintainability
 */

// Ensure Game namespace exists
if (!IdleAnts.Game) {
    IdleAnts.Game = {};
}

IdleAnts.Game.CinematicManager = class {
    constructor(game) {
        this.game = game;
        this.isPlaying = false;
        this.currentSequence = null;
        this.sequenceStep = 0;
        this.stepStartTime = 0;
        
        // Cinematic properties
        this.originalCameraPosition = { x: 0, y: 0 };
        this.originalCameraScale = 1;
        this.cinematicDuration = 0;
        this.totalDuration = 0;
        
        // Animation properties
        this.animationCallbacks = [];
    }

    /**
     * Start a boss intro cinematic sequence
     * @param {object} boss - Boss entity
     */
    startBossIntro(boss) {
        if (this.isPlaying) {
            console.warn('Cinematic already playing, skipping new sequence');
            return;
        }

        this.isPlaying = true;
        this.currentSequence = 'boss_intro';
        this.sequenceStep = 0;
        this.stepStartTime = Date.now();

        // Store original camera state
        this.storeCameraState();

        // Change game state
        this.game.stateManager.setState('BOSS_INTRO');

        // Start the cinematic sequence
        this.playBossIntroSequence(boss);
    }

    /**
     * Play the boss intro cinematic sequence
     * @param {object} boss - Boss entity
     */
    playBossIntroSequence(boss) {
        const sequence = [
            { type: 'camera_pan', target: boss, duration: 2000, zoom: 0.8 },
            { type: 'boss_reveal', duration: 1500 },
            { type: 'dramatic_zoom', target: boss, duration: 1000, zoom: 1.2 },
            { type: 'fade_to_fight', duration: 500 }
        ];

        this.executeSequence(sequence, () => {
            this.endBossIntro();
        });
    }

    /**
     * End the boss intro and transition to boss fight
     */
    endBossIntro() {
        this.game.stateManager.setState('BOSS_FIGHT');
        this.isPlaying = false;
        this.currentSequence = null;
        
        // Start boss fight logic
        if (this.game.bossManager) {
            this.game.bossManager.startFight();
        }
    }

    /**
     * Start boss defeat cinematic
     * @param {object} boss - Boss entity
     */
    startBossDefeat(boss) {
        if (this.isPlaying) {
            console.warn('Cinematic already playing, skipping new sequence');
            return;
        }

        this.isPlaying = true;
        this.currentSequence = 'boss_defeat';
        this.sequenceStep = 0;
        this.stepStartTime = Date.now();

        this.playBossDefeatSequence(boss);
    }

    /**
     * Play the boss defeat cinematic sequence
     * @param {object} boss - Boss entity
     */
    playBossDefeatSequence(boss) {
        const sequence = [
            { type: 'boss_death_animation', duration: 2000 },
            { type: 'victory_zoom_out', duration: 1500, zoom: 0.6 },
            { type: 'return_to_nest', duration: 2000 },
            { type: 'victory_celebration', duration: 1000 }
        ];

        this.executeSequence(sequence, () => {
            this.endBossDefeat();
        });
    }

    /**
     * End boss defeat cinematic and show victory
     */
    endBossDefeat() {
        this.game.stateManager.setState('WIN');
        this.isPlaying = false;
        this.currentSequence = null;
        
        // Restore camera state
        this.restoreCameraState();
    }

    /**
     * Execute a cinematic sequence
     * @param {Array} sequence - Array of sequence steps
     * @param {Function} onComplete - Callback when sequence completes
     */
    executeSequence(sequence, onComplete) {
        if (this.sequenceStep >= sequence.length) {
            if (onComplete) onComplete();
            return;
        }

        const step = sequence[this.sequenceStep];
        this.executeStep(step, () => {
            this.sequenceStep++;
            this.executeSequence(sequence, onComplete);
        });
    }

    /**
     * Execute a single cinematic step
     * @param {object} step - Sequence step
     * @param {Function} onComplete - Callback when step completes
     */
    executeStep(step, onComplete) {
        this.stepStartTime = Date.now();

        switch(step.type) {
            case 'camera_pan':
                this.executeCameraPan(step, onComplete);
                break;
            case 'boss_reveal':
                this.executeBossReveal(step, onComplete);
                break;
            case 'dramatic_zoom':
                this.executeDramaticZoom(step, onComplete);
                break;
            case 'fade_to_fight':
                this.executeFadeToFight(step, onComplete);
                break;
            case 'boss_death_animation':
                this.executeBossDeathAnimation(step, onComplete);
                break;
            case 'victory_zoom_out':
                this.executeVictoryZoomOut(step, onComplete);
                break;
            case 'return_to_nest':
                this.executeReturnToNest(step, onComplete);
                break;
            case 'victory_celebration':
                this.executeVictoryCelebration(step, onComplete);
                break;
            default:
                console.warn(`Unknown cinematic step type: ${step.type}`);
                if (onComplete) onComplete();
        }
    }

    /**
     * Execute camera pan to target
     * @param {object} step - Step configuration
     * @param {Function} onComplete - Completion callback
     */
    executeCameraPan(step, onComplete) {
        const startPos = {
            x: this.game.worldContainer.x,
            y: this.game.worldContainer.y
        };
        const startScale = this.game.worldContainer.scale.x;

        // Calculate target position (center target on screen)
        const targetX = -(step.target.sprite.x * step.zoom - window.innerWidth / 2);
        const targetY = -(step.target.sprite.y * step.zoom - window.innerHeight / 2);

        this.animateCamera(
            startPos, { x: targetX, y: targetY },
            startScale, step.zoom,
            step.duration,
            onComplete
        );
    }

    /**
     * Execute boss reveal effect
     * @param {object} step - Step configuration
     * @param {Function} onComplete - Completion callback
     */
    executeBossReveal(step, onComplete) {
        // Add screen shake effect
        this.addScreenShake(step.duration, 5);
        
        // Add boss entrance effects
        if (this.game.effectManager) {
            this.game.effectManager.createBossEntranceEffect();
        }
        
        setTimeout(onComplete, step.duration);
    }

    /**
     * Execute dramatic zoom effect
     * @param {object} step - Step configuration
     * @param {Function} onComplete - Completion callback
     */
    executeDramaticZoom(step, onComplete) {
        const currentScale = this.game.worldContainer.scale.x;
        
        this.animateCamera(
            null, null, // Keep current position
            currentScale, step.zoom,
            step.duration,
            onComplete
        );
    }

    /**
     * Execute fade to fight transition
     * @param {object} step - Step configuration
     * @param {Function} onComplete - Completion callback
     */
    executeFadeToFight(step, onComplete) {
        // Create fade overlay
        const fadeOverlay = document.createElement('div');
        fadeOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: black;
            opacity: 0;
            z-index: 1000;
            pointer-events: none;
            transition: opacity ${step.duration}ms ease-in-out;
        `;
        
        document.body.appendChild(fadeOverlay);
        
        // Fade in
        setTimeout(() => {
            fadeOverlay.style.opacity = '0.3';
        }, 50);
        
        // Fade out and remove
        setTimeout(() => {
            fadeOverlay.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(fadeOverlay);
                if (onComplete) onComplete();
            }, step.duration);
        }, step.duration / 2);
    }

    /**
     * Execute boss death animation
     * @param {object} step - Step configuration
     * @param {Function} onComplete - Completion callback
     */
    executeBossDeathAnimation(step, onComplete) {
        // Add death effects
        if (this.game.effectManager) {
            this.game.effectManager.createBossDeathEffect();
        }
        
        // Add screen shake
        this.addScreenShake(step.duration, 8);
        
        setTimeout(onComplete, step.duration);
    }

    /**
     * Execute victory zoom out
     * @param {object} step - Step configuration
     * @param {Function} onComplete - Completion callback
     */
    executeVictoryZoomOut(step, onComplete) {
        const currentScale = this.game.worldContainer.scale.x;
        
        this.animateCamera(
            null, null, // Keep current position
            currentScale, step.zoom,
            step.duration,
            onComplete
        );
    }

    /**
     * Execute return to nest camera movement
     * @param {object} step - Step configuration
     * @param {Function} onComplete - Completion callback
     */
    executeReturnToNest(step, onComplete) {
        const nestPos = this.game.entityManager.getNestPosition();
        if (!nestPos) {
            if (onComplete) onComplete();
            return;
        }

        const currentPos = {
            x: this.game.worldContainer.x,
            y: this.game.worldContainer.y
        };
        const currentScale = this.game.worldContainer.scale.x;

        // Calculate target position (center nest on screen)
        const targetX = -(nestPos.x * currentScale - window.innerWidth / 2);
        const targetY = -(nestPos.y * currentScale - window.innerHeight / 2);

        this.animateCamera(
            currentPos, { x: targetX, y: targetY },
            currentScale, currentScale, // Keep same zoom
            step.duration,
            onComplete
        );
    }

    /**
     * Execute victory celebration
     * @param {object} step - Step configuration
     * @param {Function} onComplete - Completion callback
     */
    executeVictoryCelebration(step, onComplete) {
        // Add celebration effects
        if (this.game.effectManager) {
            this.game.effectManager.createVictoryEffect();
        }
        
        setTimeout(onComplete, step.duration);
    }

    /**
     * Animate camera position and scale
     * @param {object} fromPos - Starting position
     * @param {object} toPos - Target position
     * @param {number} fromScale - Starting scale
     * @param {number} toScale - Target scale
     * @param {number} duration - Animation duration in ms
     * @param {Function} onComplete - Completion callback
     */
    animateCamera(fromPos, toPos, fromScale, toScale, duration, onComplete) {
        const startTime = Date.now();
        
        // Use current position if not specified
        if (!fromPos) {
            fromPos = {
                x: this.game.worldContainer.x,
                y: this.game.worldContainer.y
            };
        }
        if (!toPos) {
            toPos = fromPos;
        }

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease-in-out)
            const eased = progress < 0.5 
                ? 2 * progress * progress 
                : 1 - Math.pow(-2 * progress + 2, 2) / 2;
            
            // Interpolate position
            this.game.worldContainer.x = fromPos.x + (toPos.x - fromPos.x) * eased;
            this.game.worldContainer.y = fromPos.y + (toPos.y - fromPos.y) * eased;
            
            // Interpolate scale
            const scale = fromScale + (toScale - fromScale) * eased;
            this.game.worldContainer.scale.set(scale);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                if (onComplete) onComplete();
            }
        };
        
        animate();
    }

    /**
     * Add screen shake effect
     * @param {number} duration - Shake duration in ms
     * @param {number} intensity - Shake intensity
     */
    addScreenShake(duration, intensity) {
        const startTime = Date.now();
        const originalX = this.game.worldContainer.x;
        const originalY = this.game.worldContainer.y;
        
        const shake = () => {
            const elapsed = Date.now() - startTime;
            if (elapsed < duration) {
                const progress = elapsed / duration;
                const currentIntensity = intensity * (1 - progress);
                
                const shakeX = (Math.random() - 0.5) * currentIntensity * 2;
                const shakeY = (Math.random() - 0.5) * currentIntensity * 2;
                
                this.game.worldContainer.x = originalX + shakeX;
                this.game.worldContainer.y = originalY + shakeY;
                
                requestAnimationFrame(shake);
            } else {
                // Restore original position
                this.game.worldContainer.x = originalX;
                this.game.worldContainer.y = originalY;
            }
        };
        
        shake();
    }

    /**
     * Store current camera state
     */
    storeCameraState() {
        this.originalCameraPosition = {
            x: this.game.worldContainer.x,
            y: this.game.worldContainer.y
        };
        this.originalCameraScale = this.game.worldContainer.scale.x;
    }

    /**
     * Restore camera to original state
     */
    restoreCameraState() {
        this.animateCamera(
            {
                x: this.game.worldContainer.x,
                y: this.game.worldContainer.y
            },
            this.originalCameraPosition,
            this.game.worldContainer.scale.x,
            this.originalCameraScale,
            1000, // 1 second transition
            null
        );
    }

    /**
     * Skip current cinematic sequence
     */
    skipCinematic() {
        if (!this.isPlaying) return;
        
        this.isPlaying = false;
        
        // Clean up any ongoing animations
        this.animationCallbacks.forEach(callback => callback());
        this.animationCallbacks = [];
        
        // Transition based on current sequence
        switch(this.currentSequence) {
            case 'boss_intro':
                this.endBossIntro();
                break;
            case 'boss_defeat':
                this.endBossDefeat();
                break;
        }
    }

    /**
     * Check if a cinematic is currently playing
     * @returns {boolean} True if cinematic is active
     */
    isPlayingCinematic() {
        return this.isPlaying;
    }

    /**
     * Clean up cinematic manager
     */
    cleanup() {
        this.isPlaying = false;
        this.animationCallbacks.forEach(callback => callback());
        this.animationCallbacks = [];
    }
};

