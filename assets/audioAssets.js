// assets/audioAssets.js - ES6 Module

// Audio assets for Idle Ants
const AudioAssets = {
    // Background music
    BGM: {
        MAIN_THEME: {
            id: 'bgm_main_theme',
            path: 'assets/audio/main_theme.mp3',
            loop: true,
            volume: 0.5
        },
        // Boss fight theme
        BOSS_THEME: {
            id: 'bgm_anteater_boss',
            path: 'assets/audio/anteater_boss_music.mp3',
            loop: true,
            volume: 0.6
        },
        VICTORY_THEME: {
            id: 'bgm_victory_theme',
            path: 'assets/audio/victory_music.mp3',
            loop: false,
            volume: 0.6
        },
        // Add more BGM tracks as needed
    },
    
    // Sound effects
    SFX: {
        ANT_SPAWN: {
            id: 'sfx_ant_spawn',
            path: 'assets/audio/ant_spawn.mp3',
            volume: 0.4
        }
        // Add more sound effects as needed
    }
};

// Register to global namespace for backward compatibility
IdleAnts.AudioAssets = AudioAssets;

// Export for ES6 module system
export default AudioAssets; 