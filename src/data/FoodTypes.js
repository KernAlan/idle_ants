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
    
    // Apple slice - healthy and common
    APPLE: {
        id: 'apple',
        name: 'Apple Slice',
        value: 3,              // Simple progression
        weight: 1,             // Still manageable
        collectionTime: 0.5,   // Quick to collect
        rarity: 2,             // Common
        scale: {min: 0.8, max: 1.4},
        color: 0xFF4500,       // Red apple color
        shadowColor: 0x8B0000, // Dark red shadow
        glowColor: 0xFF6347,   // Tomato glow
        glowAlpha: 0.3,
        description: 'Fresh apple slices are a healthy snack for ants!'
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
    },
    
    // Marshmallow - light and fluffy
    MARSHMALLOW: {
        id: 'marshmallow',
        name: 'Marshmallow',
        value: 8,              // Sweet and valuable
        weight: 1,             // Light despite size
        collectionTime: 2.0,   // Takes time to collect
        rarity: 4,             // More rare
        scale: {min: 1.2, max: 1.8},
        color: 0xFFF8DC,       // Cornsilk white
        shadowColor: 0xF0E68C, // Khaki shadow
        glowColor: 0xFFE4E1,   // Misty rose glow
        glowAlpha: 0.5,
        description: 'Fluffy marshmallows are a delightful surprise for ants!'
    },
    
    // Mango piece - tropical fruit
    MANGO: {
        id: 'mango',
        name: 'Mango Piece',
        value: 15,             // Tropical and valuable
        weight: 3,             // Heavier fruit
        collectionTime: 2.5,   // Takes time to collect
        rarity: 5,             // Rare tropical fruit
        scale: {min: 1.3, max: 2.0},
        color: 0xFF8C00,       // Dark orange
        shadowColor: 0xFF4500, // Orange red shadow
        glowColor: 0xFFD700,   // Golden glow
        glowAlpha: 0.5,
        description: 'Sweet tropical mango pieces are a rare delicacy!'
    },
    
    // Hot dog piece - protein-rich
    HOT_DOG: {
        id: 'hot_dog',
        name: 'Hot Dog Piece',
        value: 20,             // Protein-rich food
        weight: 4,             // Heavy protein
        collectionTime: 3.0,   // Takes time to collect
        rarity: 6,             // Rare protein source
        scale: {min: 1.4, max: 2.1},
        color: 0xDEB887,       // Burlywood tan to match bun
        shadowColor: 0xCD853F, // Peru brown shadow
        glowColor: 0xF4A460,   // Sandy brown glow
        glowAlpha: 0.6,
        description: 'Juicy hot dog pieces provide valuable protein for the colony!'
    },
    
    // Watermelon piece - premium food source
    WATERMELON: {
        id: 'watermelon',
        name: 'Watermelon Piece',
        value: 25,             // Worth 5x the cookie (following the progression)
        weight: 4,             // Takes up 4 capacity slots (heavier than cookie)
        collectionTime: 3.0,   // Takes 3 seconds to collect (harder to gather)
        rarity: 5,             // More rare than cookies
        scale: {min: 1.5, max: 2.2},  // Larger than cookies
        color: 0xFF3B3F,       // Watermelon red
        shadowColor: 0x2EA12E, // Green shadow (rind)
        glowColor: 0xFF9999,   // Pinkish glow
        glowAlpha: 0.5,        // Stronger glow for premium food
        description: 'Sweet watermelon pieces are a rare and valuable food source!'
    },
    
    // Donut - premium sugary treat
    DONUT: {
        id: 'donut',
        name: 'Donut Piece',
        value: 35,             // Premium treat
        weight: 5,             // Heavy and filling
        collectionTime: 4.0,   // Takes time due to size
        rarity: 7,             // Very rare treat
        scale: {min: 1.6, max: 2.3},
        color: 0xDDA0DD,       // Plum color (glazed)
        shadowColor: 0x9370DB, // Medium slate blue shadow
        glowColor: 0xFF1493,   // Deep pink glow
        glowAlpha: 0.6,
        description: 'Glazed donut pieces are the ultimate sugary reward!'
    },
    
    // Cake slice - ultimate premium food
    CAKE: {
        id: 'cake',
        name: 'Cake Slice',
        value: 50,             // Ultimate premium food
        weight: 6,             // Heaviest food
        collectionTime: 5.0,   // Takes longest to collect
        rarity: 8,             // Ultra rare
        scale: {min: 1.8, max: 2.5},
        color: 0xFFB6C1,       // Light pink
        shadowColor: 0xDB7093, // Pale violet red shadow
        glowColor: 0xFF69B4,   // Hot pink glow
        glowAlpha: 0.7,        // Strongest glow
        description: 'Delicious cake slices are the ultimate feast for the colony!'
    },
    
    // === FAST FOOD CATEGORY (1-13) ===
    FRIES: {
        id: 'fries',
        name: 'French Fries',
        value: 24,
        weight: 2,
        collectionTime: 1.8,
        rarity: 4,
        scale: {min: 1.0, max: 1.6},
        color: 0xFFD700,       // Golden
        shadowColor: 0xDAA520, // Goldenrod shadow
        glowColor: 0xFFFACD,   // Lemon chiffon glow
        glowAlpha: 0.4,
        description: 'Crispy golden fries are a tasty fast food treat!'
    },
    
    CHICKEN_NUGGETS: {
        id: 'chickenNuggets',
        name: 'Chicken Nuggets',
        value: 8,
        weight: 1,
        collectionTime: 1.0,
        rarity: 3,
        scale: {min: 0.8, max: 1.4},
        color: 0xDEB887,       // Burlywood
        shadowColor: 0xCD853F, // Peru shadow
        glowColor: 0xF4A460,   // Sandy brown glow
        glowAlpha: 0.4,
        description: 'Bite-sized chicken nuggets perfect for ants!'
    },
    
    HOT_DOG_NEW: {
        id: 'hotDogNew',
        name: 'Hot Dog',
        value: 21,
        weight: 3,
        collectionTime: 2.2,
        rarity: 5,
        scale: {min: 1.2, max: 1.8},
        color: 0xDEB887,       // Burlywood
        shadowColor: 0xCD853F, // Peru shadow
        glowColor: 0xF4A460,   // Sandy brown glow
        glowAlpha: 0.5,
        description: 'Juicy hot dogs are a hearty fast food option!'
    },
    
    // === HEALTHY FOOD CATEGORY ===
    CARROTS: {
        id: 'carrots',
        name: 'Carrots',
        value: 23,
        weight: 2,
        collectionTime: 1.5,
        rarity: 3,
        scale: {min: 1.0, max: 1.5},
        color: 0xFF8C00,       // Dark orange
        shadowColor: 0xFF4500, // Orange red shadow
        glowColor: 0xFFA500,   // Orange glow
        glowAlpha: 0.4,
        description: 'Crunchy orange carrots packed with vitamins!'
    },
    
    LETTUCE: {
        id: 'lettuce',
        name: 'Lettuce',
        value: 22,
        weight: 1,
        collectionTime: 1.2,
        rarity: 2,
        scale: {min: 1.1, max: 1.7},
        color: 0x90EE90,       // Light green
        shadowColor: 0x228B22, // Forest green shadow
        glowColor: 0x98FB98,   // Pale green glow
        glowAlpha: 0.3,
        description: 'Fresh, crispy lettuce leaves for healthy eating!'
    },
    
    BANANAS: {
        id: 'bananas',
        name: 'Bananas',
        value: 23,
        weight: 2,
        collectionTime: 1.8,
        rarity: 4,
        scale: {min: 1.2, max: 1.8},
        color: 0xFFFF00,       // Yellow
        shadowColor: 0xFFD700, // Gold shadow
        glowColor: 0xFFFACD,   // Lemon chiffon glow
        glowAlpha: 0.4,
        description: 'Sweet yellow bananas full of natural energy!'
    },
    
    GRAPES: {
        id: 'grapes',
        name: 'Grapes',
        value: 24,
        weight: 1,
        collectionTime: 1.3,
        rarity: 4,
        scale: {min: 0.9, max: 1.4},
        color: 0x9370DB,       // Medium slate blue
        shadowColor: 0x8B008B, // Dark magenta shadow
        glowColor: 0xDDA0DD,   // Plum glow
        glowAlpha: 0.4,
        description: 'Juicy purple grapes bursting with flavor!'
    },
    
    // === DESSERT CATEGORY (14-16) ===
    ICE_CREAM_CONE: {
        id: 'iceCreamCone',
        name: 'Ice Cream Cone',
        value: 65,
        weight: 4,
        collectionTime: 4.5,
        rarity: 7,
        scale: {min: 1.6, max: 2.2},
        color: 0xFFF8DC,       // Cornsilk
        shadowColor: 0xF0E68C, // Khaki shadow
        glowColor: 0xFFE4E1,   // Misty rose glow
        glowAlpha: 0.6,
        description: 'Creamy ice cream cone is the perfect summer treat!'
    },
    
    SNOW_CONE: {
        id: 'snowCone',
        name: 'Snow Cone',
        value: 65,
        weight: 3,
        collectionTime: 4.0,
        rarity: 7,
        scale: {min: 1.4, max: 2.0},
        color: 0x87CEEB,       // Sky blue
        shadowColor: 0x4682B4, // Steel blue shadow
        glowColor: 0xB0E0E6,   // Powder blue glow
        glowAlpha: 0.6,
        description: 'Refreshing snow cone with colorful syrup!'
    },
    
    COOKIES_NEW: {
        id: 'cookiesNew',
        name: 'Cookies',
        value: 14,
        weight: 2,
        collectionTime: 1.8,
        rarity: 4,
        scale: {min: 1.0, max: 1.6},
        color: 0xC68E17,       // Cookie brown
        shadowColor: 0x8B5A00, // Dark brown shadow
        glowColor: 0xFFE0A3,   // Warm glow
        glowAlpha: 0.4,
        description: 'Sweet cookies perfect for an afternoon snack!'
    },
    
    // === CANDY CATEGORY (17-24) ===
    CANDY: {
        id: 'candy',
        name: 'Candy',
        value: 19,
        weight: 1,
        collectionTime: 1.0,
        rarity: 3,
        scale: {min: 0.8, max: 1.3},
        color: 0xFF1493,       // Deep pink
        shadowColor: 0xC71585, // Medium violet red shadow
        glowColor: 0xFF69B4,   // Hot pink glow
        glowAlpha: 0.5,
        description: 'Colorful candy that makes ants extra energetic!'
    },
    
    CHOCOLATE_CHIPS: {
        id: 'chocolateChips',
        name: 'Chocolate Chips',
        value: 22,
        weight: 1,
        collectionTime: 1.2,
        rarity: 4,
        scale: {min: 0.7, max: 1.2},
        color: 0x8B4513,       // Saddle brown
        shadowColor: 0x654321, // Dark brown shadow
        glowColor: 0xD2691E,   // Chocolate glow
        glowAlpha: 0.4,
        description: 'Rich chocolate chips for sweet indulgence!'
    },
    
    // === BEVERAGE CATEGORY ===
    CHOCOLATE_MILK: {
        id: 'chocolateMilk',
        name: 'Chocolate Milk',
        value: 23,
        weight: 3,
        collectionTime: 2.0,
        rarity: 5,
        scale: {min: 1.3, max: 1.9},
        color: 0xD2B48C,       // Tan
        shadowColor: 0xBC8F8F, // Rosy brown shadow
        glowColor: 0xF5DEB3,   // Wheat glow
        glowAlpha: 0.5,
        description: 'Creamy chocolate milk for growing ants!'
    },
    
    CEREAL: {
        id: 'cereal',
        name: 'Cereal',
        value: 24,
        weight: 2,
        collectionTime: 1.8,
        rarity: 4,
        scale: {min: 1.1, max: 1.6},
        color: 0xDAA520,       // Goldenrod
        shadowColor: 0xB8860B, // Dark goldenrod shadow
        glowColor: 0xFFE4B5,   // Moccasin glow
        glowAlpha: 0.4,
        description: 'Crunchy cereal pieces for a nutritious breakfast!'
    },
    
    LEMONADE: {
        id: 'lemonade',
        name: 'Lemonade',
        value: 17,
        weight: 2,
        collectionTime: 1.5,
        rarity: 3,
        scale: {min: 1.2, max: 1.7},
        color: 0xFFFACD,       // Lemon chiffon
        shadowColor: 0xFFE4B5, // Moccasin shadow
        glowColor: 0xFFFFE0,   // Light yellow glow
        glowAlpha: 0.5,
        description: 'Refreshing lemonade to quench thirst!'
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