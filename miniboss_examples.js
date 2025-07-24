// Example usage of the reusable epic cinematic system for minibosses
// These examples can be run in the browser console when the game is loaded

console.log('Miniboss Cinematic Examples:');
console.log('===========================');

console.log('1. Spider miniboss with red theme:');
console.log('   spawnBoss("spider")');

console.log('2. Beetle miniboss with blue theme:');
console.log('   spawnBoss("beetle")');

console.log('3. Mantis miniboss with green theme:');
console.log('   spawnBoss("mantis")');

console.log('4. Custom spider with reduced HP:');
console.log('   spawnBoss("spider", 5000)');

'''console.log('5. Powerful mantis with stat multipliers:');
console.log('   spawnBoss("mantis", {hp: 2.0, damage: 1.5})');

console.log('6. Tarantula miniboss:');
console.log('   spawnBoss("tarantula")');'

console.log('7. Japanese Giant Hornet miniboss:');
console.log('   spawnBoss("giant_hornet")');''

// Function to test all minibosses sequentially
function testAllMinibosses() {
    if (typeof spawnBoss === 'function') {
        console.log('Testing Spider miniboss...');
        spawnBoss('spider');
        
        // Wait 15 seconds then spawn beetle
        setTimeout(() => {
            console.log('Testing Beetle miniboss...');
            spawnBoss('beetle', 15000);
        }, 15000);
        
        // Wait another 15 seconds then spawn mantis
        '''        setTimeout(() => {
            console.log('Testing Mantis miniboss...');
            spawnBoss('mantis', {hp: 1.5, damage: 2.0});
        }, 30000);

        // Wait another 15 seconds then spawn tarantula
        setTimeout(() => {
            console.log('Testing Tarantula miniboss...');
            spawnBoss('tarantula');
        }, 45000);

        // Wait another 15 seconds then spawn japanese giant hornet
        setTimeout(() => {
            console.log('Testing Japanese Giant Hornet miniboss...');
            spawnBoss('giant_hornet');
        }, 60000);''
    } else {
        console.error('spawnBoss function not available. Make sure the game is loaded.');
    }
}

// Function to test different spawn positions
function testSpawnPositions() {
    if (typeof spawnBoss === 'function') {
        console.log('Testing spawn from left (Spider)...');
        spawnBoss('spider');
        
        setTimeout(() => {
            console.log('Testing spawn from right (Beetle)...');
            spawnBoss('beetle');
        }, 15000);
        
        '''        setTimeout(() => {
            console.log('Testing spawn from center (Mantis)...');
            spawnBoss('mantis');
        }, 30000);

        setTimeout(() => {
            console.log('Testing spawn from left (Tarantula)...');
            spawnBoss('tarantula');
        }, 45000);

        setTimeout(() => {
            console.log('Testing spawn from right (Japanese Giant Hornet)...');
            spawnBoss('giant_hornet');
        }, 60000);''
    }
}

// Add to global scope for easy testing
window.testAllMinibosses = testAllMinibosses;
window.testSpawnPositions = testSpawnPositions;

console.log('Functions loaded: testAllMinibosses(), testSpawnPositions()');
console.log('Each miniboss has unique:');
console.log('- Arrival text ("A VENOMOUS SPIDER APPROACHES", etc.)');
console.log('- Boss titles ("◆ MINIBOSS ◆" vs "◆ FINAL BOSS ◆")');
console.log('- Boss names ("ARACHNO HUNTER", "IRON SHELL CRUSHER", etc.)');
console.log('- Color themes (red, blue, green vs gold)');
console.log('- Spawn positions (left, right, center)');
console.log('- Stats and difficulty levels');