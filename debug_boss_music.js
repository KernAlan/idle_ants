// Debug script for boss music issues
// Run this in the browser console when the game is loaded

function debugBossMusic() {
    console.log('=== BOSS MUSIC DEBUG ===');
    
    // Check if AudioManager exists
    console.log('AudioManager exists:', !!IdleAnts.AudioManager);
    
    // Check if AudioAssets exist
    console.log('AudioAssets exists:', !!IdleAnts.AudioAssets);
    console.log('AudioAssets.BGM exists:', !!IdleAnts.AudioAssets?.BGM);
    
    // List all available BGM themes
    if (IdleAnts.AudioAssets?.BGM) {
        console.log('Available BGM themes:', Object.keys(IdleAnts.AudioAssets.BGM));
        
        // Check specifically for BOSS_THEME
        console.log('BOSS_THEME config:', IdleAnts.AudioAssets.BGM.BOSS_THEME);
    }
    
    // Check if HTML audio element exists
    const bossAudioElement = document.getElementById('bgm_anteater_boss');
    console.log('Boss audio HTML element exists:', !!bossAudioElement);
    if (bossAudioElement) {
        console.log('Boss audio element src:', bossAudioElement.src);
        console.log('Boss audio element readyState:', bossAudioElement.readyState);
        console.log('Boss audio element networkState:', bossAudioElement.networkState);
    }
    
    // Check AudioManager sounds array
    if (IdleAnts.AudioManager) {
        // We can't directly access the private sounds array, but we can try to play
        console.log('Attempting to play boss music directly...');
        try {
            IdleAnts.AudioManager.playBGM('bgm_anteater_boss');
            console.log('Direct playBGM call completed');
        } catch (error) {
            console.error('Error playing boss music directly:', error);
        }
    }
}

function testBossSpawnWithMusic() {
    console.log('=== TESTING BOSS SPAWN WITH MUSIC ===');
    
    // First debug the music system
    debugBossMusic();
    
    // Then try spawning boss
    console.log('Spawning boss...');
    if (typeof spawnBoss === 'function') {
        spawnBoss('anteater', null, {});
    } else {
        console.error('spawnBoss function not available');
    }
}

// Add to global scope
window.debugBossMusic = debugBossMusic;
window.testBossSpawnWithMusic = testBossSpawnWithMusic;

console.log('Boss music debug functions loaded. Run debugBossMusic() or testBossSpawnWithMusic()');