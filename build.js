const fs = require('fs');
const path = require('path');

// List of JavaScript files in the correct loading order (from index.html)
const scriptFiles = [
    'src/core/Namespace.js',
    'src/data/FoodTypes.js',
    // Effect Classes
    'src/effects/Effect.js',
    'src/effects/SpawnEffect.js',
    'src/effects/FoodSpawnEffect.js',
    'src/effects/FoodDropEffect.js',
    'src/effects/FoodCollectEffect.js',
    'src/effects/Trail.js',
    'src/effects/LarvaeEffect.js',
    'src/effects/index.js',
    // Asset Definitions
    'assets/AssetDefinition.js',
    'assets/antAssets.js',
    'assets/foodAssets.js',
    'assets/environmentAssets.js',
    'assets/audioAssets.js',
    // Managers
    'src/managers/ResourceManager.js',
    'src/managers/AssetManager.js',
    'src/managers/BackgroundManager.js',
    'src/managers/EffectManager.js',
    'src/managers/EntityManager.js',
    'src/managers/AudioManager.js',
    'src/managers/UIManager.js',
    // Notification Manager
    'src/managers/NotificationManager.js',
    'src/managers/camera/CameraManager.js',
    'src/managers/input/InputManager.js',
    'src/managers/CombatManager.js',
    // Entities
    'src/entities/AntBase.js',
    'src/entities/Ant.js',
    'src/entities/FlyingAnt.js',
    'src/entities/CarAnt.js',
    'src/entities/QueenAnt.js',
    'src/entities/Larvae.js',
    'src/entities/Food.js',
    'src/entities/Nest.js',
    'src/entities/FireAnt.js',
    'src/entities/Enemy.js',
    'src/entities/GrasshopperEnemy.js',
    'src/entities/WoollyBearEnemy.js',
    'src/entities/CricketEnemy.js',
    'src/entities/MantisEnemy.js',
    'src/entities/BeeEnemy.js',
    'src/entities/HerculesBeetleEnemy.js',
    'src/entities/FrogEnemy.js',
    // Game Core
    'src/Game.js',
    'src/index.js'
];

function buildBundle() {
    console.log('Building JavaScript bundle...');
    
    let bundledContent = '// Idle Ants - Bundled JavaScript\n';
    bundledContent += '// Generated on: ' + new Date().toISOString() + '\n\n';
    
    let filesProcessed = 0;
    
    for (const filePath of scriptFiles) {
        try {
            if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath, 'utf8');
                bundledContent += `\n// ===== ${filePath} =====\n`;
                bundledContent += content;
                bundledContent += '\n';
                filesProcessed++;
                console.log(`✓ Included: ${filePath}`);
            } else {
                console.warn(`⚠ File not found: ${filePath}`);
            }
        } catch (error) {
            console.error(`✗ Error reading ${filePath}:`, error.message);
        }
    }
    
    // Write the bundled file
    try {
        fs.writeFileSync('bundle.js', bundledContent);
        console.log(`\n✓ Bundle created successfully!`);
        console.log(`  Files processed: ${filesProcessed}/${scriptFiles.length}`);
        console.log(`  Output: bundle.js`);
        console.log(`  Size: ${(bundledContent.length / 1024).toFixed(2)} KB`);
        
        // Create a production index.html that uses the bundle
        createProductionIndex();
        
    } catch (error) {
        console.error('✗ Error writing bundle:', error.message);
    }
}

function createProductionIndex() {
    console.log('\nCreating production index.html...');
    
    try {
        const indexContent = fs.readFileSync('index.html', 'utf8');
        
        // Replace all the individual script tags with a single bundle script
        const scriptRegex = /<!-- Import our game scripts in correct order -->[\s\S]*?<script src="src\/index\.js"><\/script>/;
        
        const productionContent = indexContent.replace(
            scriptRegex,
            '<!-- Bundled JavaScript for production -->\n    <script src="bundle.js"></script>'
        );
        
        fs.writeFileSync('index-production.html', productionContent);
        console.log('✓ Production index.html created as index-production.html');
        
    } catch (error) {
        console.error('✗ Error creating production index:', error.message);
    }
}

// Run the build
buildBundle();