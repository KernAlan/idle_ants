/**
 * GameAudioManager - Handles all audio-related functionality for the game
 * Extracted from Game.js to maintain Single Responsibility Principle
 */

// Ensure Game namespace exists
if (!IdleAnts.Game) {
    IdleAnts.Game = {};
}



IdleAnts.Game.GameAudioManager = class {
    constructor(game) {
        this.game = game;
        this.soundEnabled = true;
        this.currentBGM = null;
        
        this.setupAudioResumeOnInteraction();
    }

    /**
     * Set up audio resume on user interaction (required for mobile browsers)
     */
    setupAudioResumeOnInteraction() {
        const startAudio = () => {
            if (IdleAnts.AudioManager) {
                IdleAnts.AudioManager.resumeAudioContext();
                
                // Start playing background music if available
                if (IdleAnts.AudioAssets && IdleAnts.AudioAssets.BGM && IdleAnts.AudioAssets.BGM.MAIN_THEME) {
                    this.startBackgroundMusic();
                }
                
                // Remove listeners after first interaction
                document.removeEventListener('click', startAudio);
                document.removeEventListener('touchstart', startAudio);
                document.removeEventListener('keydown', startAudio);
            }
        };

        // Add listeners for first user interaction
        document.addEventListener('click', startAudio);
        document.addEventListener('touchstart', startAudio);
        document.addEventListener('keydown', startAudio);
    }

    /**
     * Start background music
     */
    startBackgroundMusic() {
        if (this.soundEnabled && IdleAnts.AudioAssets.BGM.MAIN_THEME) {
            this.currentBGM = IdleAnts.AudioAssets.BGM.MAIN_THEME.id;
            IdleAnts.AudioManager.playBGM(this.currentBGM);
        }
    }

    /**
     * Play a sound effect
     * @param {string} soundId - Sound asset ID to play
     */
    playSoundEffect(soundId) {
        if (soundId && IdleAnts.AudioManager && this.soundEnabled) {
            IdleAnts.AudioManager.playSound(soundId);
        }
    }

    /**
     * Toggle sound on/off and update UI
     */
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        
        // Update UI button
        const soundButton = document.getElementById('toggle-sound');
        if (soundButton) {
            const icon = soundButton.querySelector('i');
            if (icon) {
                if (this.soundEnabled) {
                    icon.className = 'fas fa-volume-up';
                    soundButton.innerHTML = '<i class="fas fa-volume-up"></i>Sound: ON';
                    this.startBackgroundMusic();
                } else {
                    icon.className = 'fas fa-volume-mute';
                    soundButton.innerHTML = '<i class="fas fa-volume-mute"></i>Sound: OFF';
                    this.stopAllAudio();
                }
            }
        }
    }

    /**
     * Stop all audio
     */
    stopAllAudio() {
        if (IdleAnts.AudioManager) {
            IdleAnts.AudioManager.stopAllBGM();
            IdleAnts.AudioManager.stopAllSounds();
        }
        this.currentBGM = null;
    }

    /**
     * Play boss battle music
     */
    playBossMusic() {
        if (this.soundEnabled && IdleAnts.AudioManager && IdleAnts.AudioAssets && 
            IdleAnts.AudioAssets.BGM && IdleAnts.AudioAssets.BGM.BOSS_THEME) {
            
            // Stop current BGM
            if (this.currentBGM) {
                IdleAnts.AudioManager.stopBGM(this.currentBGM);
            }
            
            // Play boss theme
            this.currentBGM = IdleAnts.AudioAssets.BGM.BOSS_THEME.id;
            IdleAnts.AudioManager.playBGM(this.currentBGM);
        }
    }

    /**
     * Play victory music
     */
    playVictoryMusic() {
        if (this.soundEnabled && IdleAnts.AudioManager && IdleAnts.AudioAssets && 
            IdleAnts.AudioAssets.BGM && IdleAnts.AudioAssets.BGM.VICTORY_THEME) {
            
            // Stop current BGM
            if (this.currentBGM) {
                IdleAnts.AudioManager.stopBGM(this.currentBGM);
            }
            
            // Play victory theme
            this.currentBGM = IdleAnts.AudioAssets.BGM.VICTORY_THEME.id;
            IdleAnts.AudioManager.playBGM(this.currentBGM);
        }
    }

    /**
     * Return to main background music
     */
    playMainMusic() {
        if (this.soundEnabled && IdleAnts.AudioAssets && 
            IdleAnts.AudioAssets.BGM && IdleAnts.AudioAssets.BGM.MAIN_THEME) {
            
            // Stop current BGM
            if (this.currentBGM) {
                IdleAnts.AudioManager.stopBGM(this.currentBGM);
            }
            
            // Play main theme
            this.currentBGM = IdleAnts.AudioAssets.BGM.MAIN_THEME.id;
            IdleAnts.AudioManager.playBGM(this.currentBGM);
        }
    }

    /**
     * Get current sound state
     * @returns {boolean} True if sound is enabled
     */
    isSoundEnabled() {
        return this.soundEnabled;
    }

    /**
     * Set sound state
     * @param {boolean} enabled - Whether sound should be enabled
     */
    setSoundEnabled(enabled) {
        if (this.soundEnabled !== enabled) {
            this.soundEnabled = enabled;
            
            if (!enabled) {
                this.stopAllAudio();
            } else {
                this.startBackgroundMusic();
            }
        }
    }
};

