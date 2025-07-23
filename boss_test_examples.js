// Example usage of the new flexible boss spawning system
// These examples can be run in the browser console when the game is loaded

console.log('Boss Spawning Examples:');
console.log('=====================');

console.log('1. Basic anteater boss with default stats:');
console.log('   spawnBoss("anteater")');

console.log('2. Anteater boss with custom HP:');
console.log('   spawnBoss("anteater", 10000)');

console.log('3. Anteater boss with stat multipliers:');
console.log('   spawnBoss("anteater", {hp: 0.5, damage: 1.5, speed: 2.0})');

console.log('4. Anteater boss without music:');
console.log('   spawnBoss("anteater", null, {noMusic: true})');

console.log('5. Anteater boss without cinematic:');
console.log('   spawnBoss("anteater", null, {noCinematic: true})');

console.log('6. Future boss examples (when implemented):');
console.log('   spawnBoss("spider", 15000)');
console.log('   spawnBoss("beetle", {hp: 2.0, damage: 0.8})');

// Function to test all variations
function testBossSpawning() {
    if (typeof spawnBoss === 'function') {
        console.log('Testing basic anteater spawn...');
        spawnBoss('anteater', 5000);
        
        // Wait a few seconds then spawn another
        setTimeout(() => {
            console.log('Testing anteater with multipliers...');
            spawnBoss('anteater', {hp: 0.3, damage: 2.0, speed: 1.5});
        }, 10000);
    } else {
        console.error('spawnBoss function not available. Make sure the game is loaded.');
    }
}

// Add to global scope for easy testing
window.testBossSpawning = testBossSpawning;