// Audio assets for Idle Ants
IdleAnts.AudioAssets = {
    // Background music
    BGM: {
        MAIN_THEME: {
            id: 'bgm_main_theme',
            path: 'assets/audio/main_theme.mp3',
            loop: true,
            volume: 0.5
        },
        OLD_MAIN_THEME: {
            id: 'bgm_old_main_theme',
            path: 'assets/audio/old_main_theme_daft_punk.mp3',
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
        // Miniboss theme
        MINIBOSS_THEME: {
            id: 'bgm_miniboss_theme',
            path: 'assets/audio/miniboss_bgm.mp3',
            loop: true,
            volume: 0.6
        },
        VICTORY_THEME: {
            id: 'bgm_victory_theme',
            path: 'assets/audio/victory_music.mp3',
            loop: false,
            volume: 0.6
        },
        GAME_OVER_THEME: {
            id: 'bgm_game_over_theme',
            path: 'assets/audio/game_over_music.mp3',
            loop: false,
            volume: 0.7
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