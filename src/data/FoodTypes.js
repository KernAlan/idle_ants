// src/data/FoodTypes.js
IdleAnts.Data = IdleAnts.Data || {};

// Food types define the properties of different food items in the game
IdleAnts.Data.FoodTypes = {
    // Basic food type - standard seed/crumb
    BASIC: {
        id: 'basic',
        name: 'Seed',
        value: 1,              // Value when deposited at nest
        weight: 1,             // How much capacity it uses (1 = one slot)
        collectionTime: 0,     // Time in seconds needed to collect (0 = instant)
        rarity: 1,             // Higher values mean more rare
        scale: {min: 0.7, max: 1.3},  // Size variation
        color: 0xEAD2AC,       // Main color
        shadowColor: 0xD9BF93, // Shadow color
        glowColor: 0xFFFF99,   // Glow effect color
        glowAlpha: 0.3,        // Glow transparency
        description: 'Simple seeds that ants collect for food.'
    },
    
    // Cookie crumb - fun food type for kids
    COOKIE: {
        id: 'cookie',
        name: 'Cookie Crumb',
        value: 5,              // Worth 5x the basic food
        weight: 2,             // Takes up 2 capacity slots
        collectionTime: 1.5,   // Takes 1.5 seconds to collect
        rarity: 3,             // More rare than basic food
        scale: {min: 1.0, max: 1.8},  // Larger than basic food
        color: 0xC68E17,       // Cookie brown
        shadowColor: 0x8B5A00, // Darker brown shadow
        glowColor: 0xFFE0A3,   // Warm glow
        glowAlpha: 0.4,        // Slightly stronger glow
        description: 'Delicious cookie crumbs are a special treat for ants!'
    }
};

// Helper functions for working with food types
IdleAnts.Data.FoodTypeUtils = {
    // Get a random food type based on rarity weights
    getRandomFoodType: function() {
        // Calculate total rarity for weighting
        let totalRarity = 0;
        let types = [];
        
        for (const key in IdleAnts.Data.FoodTypes) {
            const foodType = IdleAnts.Data.FoodTypes[key];
            // Invert rarity for weighting (higher rarity = lower chance)
            const weight = 1 / foodType.rarity;
            totalRarity += weight;
            types.push({
                type: foodType,
                weight: weight
            });
        }
        
        // Select a random food type based on weights
        let random = Math.random() * totalRarity;
        let currentSum = 0;
        
        for (let i = 0; i < types.length; i++) {
            currentSum += types[i].weight;
            if (random <= currentSum) {
                return types[i].type;
            }
        }
        
        // Fallback to basic food
        return IdleAnts.Data.FoodTypes.BASIC;
    }
}; 