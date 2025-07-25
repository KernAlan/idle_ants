// Debug script to check metric accuracy
function debugMetrics() {
    if (!IdleAnts.game) {
        console.log('Game not found');
        return;
    }

    const game = IdleAnts.game;
    const rm = game.resourceManager;
    const am = game.achievementManager;
    const dm = game.dailyChallengeManager;

    console.log('=== METRICS DEBUG ===');
    
    // Current vs Tracked Food
    console.log('\n🍯 FOOD METRICS:');
    console.log('Current Food:', rm.resources.food);
    console.log('Tracked Food Collected:', am.progress.foodCollected);
    console.log('Debug Mode:', IdleAnts.Config.debug);
    
    // Current vs Tracked Ants  
    console.log('\n🐜 ANT METRICS:');
    console.log('Current Live Ants:', game.entityManager.entities.ants.length);
    console.log('Total Ants Created:', rm.stats.ants);
    console.log('Max Ants Capacity:', rm.stats.maxAnts);
    console.log('Peak Concurrent Ants:', am.progress.peakConcurrentAnts);
    console.log('Legacy Tracked (Total Created):', am.progress.antsOwned);
    
    // Play Time
    console.log('\n⏰ TIME METRICS:');
    console.log('Tracked Play Time (seconds):', am.progress.playTime);
    console.log('Tracked Play Time (hours):', (am.progress.playTime / 3600).toFixed(2));
    
    // Upgrades
    console.log('\n⚡ UPGRADE METRICS:');
    console.log('Tracked Upgrades Purchased:', am.progress.upgradesPurchased);
    console.log('Tracked Speed Upgrades:', am.progress.speedUpgrades);
    console.log('Tracked Strength Upgrades:', am.progress.strengthUpgrades);
    console.log('Current Speed Multiplier:', rm.stats.speedMultiplier);
    console.log('Current Strength Multiplier:', rm.stats.strengthMultiplier);
    
    // Advanced Units
    console.log('\n🚁 ADVANCED UNITS:');
    console.log('Flying Ants Unlocked:', rm.stats.flyingAntsUnlocked);
    console.log('Car Ants Unlocked:', rm.stats.carAntsUnlocked);
    console.log('Fire Ants Unlocked:', rm.stats.fireAntsUnlocked);
    console.log('Queen Upgrade Level:', rm.stats.queenUpgradeLevel);
    console.log('Autofeeder Unlocked:', rm.stats.autofeederUnlocked);
    
    // Food Per Second
    console.log('\n📈 EFFICIENCY:');
    console.log('Food Per Second:', rm.stats.foodPerSecond);
    console.log('Food Tier:', rm.stats.foodTier);
    
    // Achievements vs Daily Challenges
    console.log('\n🏆 ACHIEVEMENTS:');
    let achievementCount = 0;
    for (const key in am.achievements) {
        if (am.achievements[key].unlocked) {
            achievementCount++;
            console.log('✓', am.achievements[key].name);
        }
    }
    console.log('Total Achievements:', achievementCount);
    
    console.log('\n📅 DAILY CHALLENGES:');
    let challengeCount = 0;
    if (dm.currentChallenges) {
        for (const challenge of dm.currentChallenges) {
            if (challenge.completed) {
                challengeCount++;
                console.log('✓', challenge.name);
            }
        }
    }
    console.log('Total Completed Challenges:', challengeCount);
    
    // Check localStorage data
    console.log('\n💾 SAVED DATA:');
    const savedAchievements = localStorage.getItem('idleAnts_achievements');
    if (savedAchievements) {
        const data = JSON.parse(savedAchievements);
        console.log('Saved Progress:', data.progress);
    }
    
    console.log('\n=== END DEBUG ===');
}

// Add to window for easy access
window.debugMetrics = debugMetrics;

console.log('Debug loaded! Run debugMetrics() in console to check values');