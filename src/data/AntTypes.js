// src/data/AntTypes.js
IdleAnts.Data = IdleAnts.Data || {};

// Ant types define the properties of different ant varieties in the game
IdleAnts.Data.AntTypes = {
    // Basic Combat Ants - Enhanced ground units with special damage types
    FAT_ANT: {
        id: 'fatAnt',
        name: 'Phat Ant',
        category: 'basic',
        cost: 4000,
        damage: 25,
        hp: 500,
        speed: 0.5, // Slower due to size
        capacity: 3, // Can carry more food
        color: 0x8B4513, // Brown
        glowColor: 0xD2691E,
        size: 1.5,
        description: 'Large, slow ant that can carry multiple food items'
    },
    
    GAS_ANT: {
        id: 'gasAnt',
        name: 'Gas Ant',
        category: 'basic',
        cost: 2000,
        damage: 52,
        hp: 200,
        speed: 1.0,
        color: 0x32CD32, // Lime green
        glowColor: 0x90EE90,
        effect: 'gasCloud',
        description: 'Releases poisonous gas clouds when attacking'
    },
    
    ACID_ANT: {
        id: 'acidAnt',
        name: 'Acid Ant',
        category: 'basic',
        cost: 3000,
        damage: 40,
        hp: 250,
        speed: 1.0,
        color: 0xFFFF00, // Bright yellow
        glowColor: 0xFFFACD,
        effect: 'acidPuddle',
        description: 'Leaves acid puddles that damage enemies over time'
    },
    
    RAINBOW_ANT: {
        id: 'rainbowAnt',
        name: 'Rainbow Ant',
        category: 'basic',
        cost: 3000,
        damage: 49,
        hp: 200,
        speed: 1.2,
        color: 0xFF69B4, // Hot pink (will cycle through colors)
        glowColor: 0xFFB6C1,
        effect: 'rainbowTrail',
        description: 'Colorful ant that leaves a beautiful rainbow trail'
    },
    
    // Exploding Ants - Deal AOE damage on death
    SMOKE_ANT: {
        id: 'smokeAnt',
        name: 'Smoke Ant',
        category: 'exploding',
        cost: 2000,
        damage: 240,
        hp: 50,
        speed: 1.5, // Fast glass cannon
        color: 0x696969, // Dim gray
        glowColor: 0xA9A9A9,
        effect: 'smokeExplosion',
        explosionRadius: 80,
        description: 'Explodes in a cloud of concealing smoke on death'
    },
    
    FIRE_ANT_EXPLOSIVE: {
        id: 'fireAntExplosive',
        name: 'Explosive Fire Ant',
        category: 'exploding',
        cost: 3000,
        damage: 290,
        hp: 40,
        speed: 1.3,
        color: 0xFF4500, // Orange red
        glowColor: 0xFF6347,
        effect: 'fireExplosion',
        explosionRadius: 100,
        description: 'Enhanced fire ant that explodes in flames on death'
    },
    
    ELECTRIC_ANT: {
        id: 'electricAnt',
        name: 'Electric Ant',
        category: 'exploding',
        cost: 7000,
        damage: 1000,
        hp: 30,
        speed: 2.0,
        color: 0x00BFFF, // Deep sky blue
        glowColor: 0x87CEEB,
        effect: 'electricExplosion',
        explosionRadius: 120,
        description: 'Devastating electric explosion damages all nearby enemies'
    },
    
    LEAF_CUTTER_ANT: {
        id: 'leafCutterAnt',
        name: 'Leaf Cutter Ant',
        category: 'exploding',
        cost: 8000,
        damage: 370,
        hp: 20,
        speed: 1.0,
        color: 0x228B22, // Forest green
        glowColor: 0x90EE90,
        effect: 'leafExplosion',
        explosionRadius: 90,
        description: 'Explodes in a shower of sharp leaves'
    },
    
    DOOR_ANT: {
        id: 'doorAnt',
        name: 'Door Ant',
        category: 'exploding',
        cost: 9000,
        damage: 570,
        hp: 10,
        speed: 0.8,
        color: 0x8B4513, // Saddle brown
        glowColor: 0xD2691E,
        effect: 'doorSlam',
        explosionRadius: 60,
        description: 'Slams shut like a door, crushing nearby enemies'
    },
    
    // Throwing Ants - Ranged attackers with projectiles
    BANANA_THROWING_ANT: {
        id: 'bananaThrowingAnt',
        name: 'Banana Throwing Ant',
        category: 'throwing',
        cost: 15000,
        damage: 550,
        hp: 5,
        speed: 1.0,
        range: 300,
        color: 0xFFFF00, // Yellow
        glowColor: 0xFFFACD,
        projectile: 'banana',
        description: 'Hurls explosive bananas at distant enemies'
    },
    
    JUICE_ANT: {
        id: 'juiceAnt',
        name: 'Juice Ant',
        category: 'throwing',
        cost: 12000,
        damage: 555,
        hp: 5,
        speed: 1.2,
        range: 120,
        color: 0xFF4500, // Orange
        glowColor: 0xFFA500,
        projectile: 'juice',
        description: 'Splashes enemies with sticky fruit juice'
    },
    
    CRAB_ANT: {
        id: 'crabAnt',
        name: 'Crab Ant',
        category: 'throwing',
        cost: 10000,
        damage: 570,
        hp: 5,
        speed: 0.8,
        range: 100,
        color: 0xFF6347, // Tomato
        glowColor: 0xFFB6C1,
        projectile: 'claw',
        description: 'Throws sharp crab claws with pinpoint accuracy'
    },
    
    // Special Ants - Unique mechanics and abilities
    UPSIDE_DOWN_ANT: {
        id: 'upsideDownAnt',
        name: 'Upside Down Ant',
        category: 'special',
        cost: 5000,
        damage: 65,
        hp: 5,
        speed: 1.5,
        color: 0x9370DB, // Medium slate blue
        glowColor: 0xDDA0DD,
        ability: 'ceilingWalk',
        description: 'Walks on the ceiling, confusing enemies below'
    },
    
    DPS_ANT: {
        id: 'dpsAnt',
        name: 'DPS Ant',
        category: 'special',
        cost: 8000,
        damage: 370,
        hp: 5,
        speed: 3.0,
        attackSpeed: 5.0, // Attacks 5x faster
        color: 0xFF1493, // Deep pink
        glowColor: 0xFF69B4,
        ability: 'rapidFire',
        description: 'Ultra-fast attacks with devastating damage per second'
    },
    
    SPIDER_ANT: {
        id: 'spiderAnt',
        name: 'Spider Ant',
        category: 'special',
        cost: 25000,
        damage: 72,
        hp: 320,
        speed: 1.0,
        range: 200,
        color: 0x000000, // Black
        glowColor: 0x800080,
        ability: 'webShoot',
        description: 'Shoots webs to slow and trap enemies'
    },
    
    // Other - Special utility entities
    BOMBER_BEETLE: {
        id: 'bomberBeetle',
        name: 'Bomber Beetle',
        category: 'other',
        cost: 6000,
        damage: 21,
        hp: 110,
        speed: 0.6,
        color: 0x8B4513, // Saddle brown
        glowColor: 0xD2691E,
        ability: 'autoSave',
        description: 'Automatically saves the game when spawned'
    }
};

// Helper functions for working with ant types
IdleAnts.Data.AntTypeUtils = {
    // Get all ant types by category
    getAntsByCategory: function(category) {
        const result = [];
        for (const key in IdleAnts.Data.AntTypes) {
            const antType = IdleAnts.Data.AntTypes[key];
            if (antType.category === category) {
                result.push(antType);
            }
        }
        return result;
    },
    
    // Get ant type by id
    getAntTypeById: function(id) {
        for (const key in IdleAnts.Data.AntTypes) {
            const antType = IdleAnts.Data.AntTypes[key];
            if (antType.id === id) {
                return antType;
            }
        }
        return null;
    },
    
    // Calculate cost with scaling
    getScaledCost: function(antType, currentCount = 0) {
        const baseCost = antType.cost;
        const scaling = Math.pow(1.15, currentCount); // 15% increase per ant
        return Math.floor(baseCost * scaling);
    },
    
    // Get all categories
    getCategories: function() {
        const categories = new Set();
        for (const key in IdleAnts.Data.AntTypes) {
            categories.add(IdleAnts.Data.AntTypes[key].category);
        }
        return Array.from(categories);
    }
};
