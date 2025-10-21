// src/managers/EntityManager.js
IdleAnts.Managers.EntityManager = class {
    constructor(app, assetManager, resourceManager, worldContainer) {
        this.app = app;
        this.assetManager = assetManager;
        this.resourceManager = resourceManager;
        this.worldContainer = worldContainer;
        this.effectManager = null; // Will be set after initialization
        
        // Create containers for game objects
        this.entitiesContainers = {
            ants: new PIXI.Container(),
            flyingAnts: new PIXI.Container(),
            food: new PIXI.Container(),
            nest: new PIXI.Container(),
            queen: new PIXI.Container(), // Container for queen ant
            larvae: new PIXI.Container(), // New container for larvae
            carAnts: new PIXI.Container(), // New container for Car Ants
            fireAnts: new PIXI.Container(), // Container for Fire Ants
            enemies: new PIXI.Container(), // Container for Enemies
            // New ant type containers
            fatAnts: new PIXI.Container(),
            gasAnts: new PIXI.Container(),
            acidAnts: new PIXI.Container(),
            rainbowAnts: new PIXI.Container(),
            smokeAnts: new PIXI.Container(),
            electricAnts: new PIXI.Container(),
            leafCutterAnts: new PIXI.Container(),
            bananaThrowingAnts: new PIXI.Container(),
            juiceAnts: new PIXI.Container(),
            crabAnts: new PIXI.Container(),
            spiderAnts: new PIXI.Container(),
        };
        
        // Add containers to the world container instead of directly to the stage
        this.worldContainer.addChild(this.entitiesContainers.nest);
        this.worldContainer.addChild(this.entitiesContainers.food);
        this.worldContainer.addChild(this.entitiesContainers.larvae); // Add larvae container
        this.worldContainer.addChild(this.entitiesContainers.ants);
        this.worldContainer.addChild(this.entitiesContainers.flyingAnts);
        this.worldContainer.addChild(this.entitiesContainers.queen); // Add queen container
        this.worldContainer.addChild(this.entitiesContainers.carAnts); // Add Car Ants container
        this.worldContainer.addChild(this.entitiesContainers.fireAnts); // Add Fire Ants container
        this.worldContainer.addChild(this.entitiesContainers.enemies); // Enemies container
        // Add new ant type containers
        this.worldContainer.addChild(this.entitiesContainers.fatAnts);
        this.worldContainer.addChild(this.entitiesContainers.gasAnts);
        this.worldContainer.addChild(this.entitiesContainers.acidAnts);
        this.worldContainer.addChild(this.entitiesContainers.rainbowAnts);
        this.worldContainer.addChild(this.entitiesContainers.smokeAnts);
        this.worldContainer.addChild(this.entitiesContainers.electricAnts);
        this.worldContainer.addChild(this.entitiesContainers.leafCutterAnts);
        this.worldContainer.addChild(this.entitiesContainers.bananaThrowingAnts);
        this.worldContainer.addChild(this.entitiesContainers.juiceAnts);
        this.worldContainer.addChild(this.entitiesContainers.crabAnts);
        this.worldContainer.addChild(this.entitiesContainers.spiderAnts);
        
        // Entity collections
        this.entities = {
            ants: [],
            flyingAnts: [],
            foods: [],
            queen: null, // Reference to the queen ant
            larvae: [], // Array for larvae entities
            carAnts: [], // Array for Car Ant entities
            fireAnts: [], // Array for Fire Ant entities
            enemies: [], // Array for enemies
            // New ant type entity arrays
            fatAnts: [],
            gasAnts: [],
            acidAnts: [],
            rainbowAnts: [],
            smokeAnts: [],
            electricAnts: [],
            leafCutterAnts: [],
            bananaThrowingAnts: [],
            juiceAnts: [],
            crabAnts: [],
            spiderAnts: [],
        };
        
        this.nest = null;
        this.nestPosition = null;
        
        // Trail settings
        this.trailInterval = 10;
        this.frameCounter = 0;
        
        // Food spawn timer settings
        this.foodSpawnCounter = 0;
        this.foodSpawnInterval = 180; // Spawn food every 180 frames (about 3 seconds at 60fps)
        
        // Autofeeder timer settings
        this.autofeederCounter = 0;
        
        // Map bounds - will be set during setup
        this.mapBounds = {
            width: 0,
            height: 0
        };
        
        this.enemySpawnCounter = 0;
        this.enemySpawnInterval = 600; // spawn every 10s
        
        // Enemy spawn level tracking for tiered spawning
        this.enemySpawnLevel = 0; // 0-based level (initial waves)
        this.enemyTiers = [
            ['WoollyBearEnemy', 'CricketEnemy'],                   // Level 0 – basic
            ['BeeEnemy'],                                  // Level 1 – after 10 ants
            ['GrasshopperEnemy'],                                       // Level 2 – 20 ants
            ['FrogEnemy'],                                          // Level 3 – 30 ants
            ['HerculesBeetleEnemy'],                               // Level 4 – 40 ants
            ['MantisEnemy'],                                          // Level 5 – 50 ants
        ];
        // Map enemy string names to classes for easy instantiation
        this.enemyClassMap = {
            CricketEnemy: IdleAnts.Entities.CricketEnemy,
            WoollyBearEnemy: IdleAnts.Entities.WoollyBearEnemy,
            GrasshopperEnemy: IdleAnts.Entities.GrasshopperEnemy,
            MantisEnemy: IdleAnts.Entities.MantisEnemy,
            BeeEnemy: IdleAnts.Entities.BeeEnemy,
            HerculesBeetleEnemy: IdleAnts.Entities.HerculesBeetleEnemy,
            FrogEnemy: IdleAnts.Entities.FrogEnemy
        };

        // Boss reference (null until spawned)
        this.boss = null;
        this.bossTriggered = false; // Prevent multiple boss triggers
        this.bossDefeated = false; // Track if boss defeated to avoid respawn
        
        // Miniboss tracking
        this.miniboss1Triggered = false; // Carpenter Ant Queen at 25 ants
        this.miniboss2Triggered = false; // Giant Hornet at 45 ants
    }
    
    setEffectManager(effectManager) {
        this.effectManager = effectManager;
    }
    
    setupEntities() {
        // Get map bounds from game
        if (IdleAnts.app && IdleAnts.app.mapConfig) {
            this.mapBounds.width = IdleAnts.app.mapConfig.width;
            this.mapBounds.height = IdleAnts.app.mapConfig.height;
        } else {
            // Fallback to screen size if mapConfig not available
            this.mapBounds.width = this.app.screen.width;
            this.mapBounds.height = this.app.screen.height;
        }
        
        // Create nest
        this.createNest();
        
        // Create queen ant (every player starts with one)
        this.createQueenAnt();
        
        // Create initial ants
        this.createAnt();
        
        // Create food sources
        this.createFood(20); // More food for a larger map
        
        // Create one of each enemy type at start
        this.spawnInitialEnemies();
        
        // Create initial larvae so the player sees one immediately
        this.createInitialLarvae();
    }
    
    createNest() {
        // Place nest at the center of the world map
        const nest = new IdleAnts.Entities.Nest(
            this.assetManager.getTexture('nest'),
            this.mapBounds.width / 2,
            this.mapBounds.height / 2
        );
        
        this.entitiesContainers.nest.addChild(nest);
        this.nest = nest;
        this.nestPosition = nest.getPosition();
    }
    
    createAnt() {
        // Create the ant with nestPosition as object reference
        const ant = new IdleAnts.Entities.Ant(
            this.assetManager.getTexture('ant'), 
            this.nestPosition,
            this.resourceManager.stats.speedMultiplier
        );
        
        // CRITICAL: Force position to be exactly at the nest
        ant.x = this.nestPosition.x;
        ant.y = this.nestPosition.y;
        
        // Initialize capacity directly based on strength multiplier
        // strengthMultiplier now directly represents capacity
        ant.capacity = this.resourceManager.stats.strengthMultiplier;
        
        this.entitiesContainers.ants.addChild(ant);
        this.entities.ants.push(ant);
        
        // Add a spawning effect
        if (this.effectManager) {
            this.effectManager.createSpawnEffect(ant.x, ant.y);
        }
    }
    
    createGoldenAnt() {
        // Check if nest position is available
        if (!this.nestPosition || this.nestPosition.x === undefined || this.nestPosition.y === undefined) {
            console.error("EntityManager: Nest position not available for golden ant creation");
            return;
        }
        
        // Spawn golden ant at nest position - ultimate reward!
        const goldenAnt = new IdleAnts.Entities.GoldenAnt(
            this.nestPosition.x,
            this.nestPosition.y,
            this.assetManager.getTexture('ant')
        );
        
        this.entitiesContainers.ants.addChild(goldenAnt);
        this.entities.ants.push(goldenAnt);
        
        // Add epic spawning effect
        if (this.effectManager) {
            this.effectManager.createSpawnEffect(goldenAnt.x, goldenAnt.y);
        }
        
        return goldenAnt;
    }
    
    createFlyingAnt() {
        // Create the flying ant with nestPosition as object reference
        const flyingAnt = new IdleAnts.Entities.FlyingAnt(
            this.assetManager.getTexture('ant'),
            this.nestPosition,
            this.resourceManager.stats.speedMultiplier
        );
        
        // CRITICAL: Force position to be exactly at the nest
        flyingAnt.x = this.nestPosition.x;
        flyingAnt.y = this.nestPosition.y;
        
        // Initialize capacity directly based on strength multiplier
        // strengthMultiplier now directly represents capacity
        flyingAnt.capacity = this.resourceManager.stats.strengthMultiplier;
        
        this.entitiesContainers.flyingAnts.addChild(flyingAnt);
        this.entities.flyingAnts.push(flyingAnt);
        
        // Add a sparkly spawning effect for flying ants
        if (this.effectManager) {
            // Pass true as the isFlying parameter to create a special effect for flying ants
            this.effectManager.createSpawnEffect(flyingAnt.x, flyingAnt.y, true);
        }
    }
    
    createCarAnt() {
        if (!this.nestPosition) {
            console.error("EntityManager: Nest position not available to create Car Ant. Nest may not have been initialized yet.");
            return null; // Return null or handle appropriately
        }
        const carAntTexture = this.assetManager.getTexture(IdleAnts.Assets.Ants.CAR_ANT.id);
        if (!carAntTexture) {
            console.error("EntityManager: Car Ant texture not found!");
            // Potentially use a fallback or skip creation
            return;
        }

        const carAnt = new IdleAnts.Entities.CarAnt(
            carAntTexture,
            this.nestPosition,
            this.resourceManager.stats.speedMultiplier // Assuming car ants also benefit from global speed upgrades
        );

        carAnt.x = this.nestPosition.x;
        carAnt.y = this.nestPosition.y;
        
        // Car Ants could have a fixed high capacity or scale with strength.
        // For now, let them scale with strength like other ants.
        carAnt.capacity = this.resourceManager.stats.strengthMultiplier; 

        this.entitiesContainers.carAnts.addChild(carAnt);
        this.entities.carAnts.push(carAnt);

        if (this.effectManager) {
            // Using a generic spawn effect for now, could be customized for cars (e.g., tire screech, engine rev)
            this.effectManager.createSpawnEffect(carAnt.x, carAnt.y, false, { R: 255, G: 0, B: 0 }); // Red spawn effect
        }
    }
    
    createFireAnt() {
        if (!this.nestPosition) {
            console.error("EntityManager: Nest position not available to create Fire Ant.");
            return;
        }
        const fireAntTexture = this.assetManager.getTexture('ant'); // reuse regular ant texture
        const fireAnt = new IdleAnts.Entities.FireAnt(
            fireAntTexture,
            this.nestPosition,
            this.resourceManager.stats.speedMultiplier
        );
        fireAnt.x = this.nestPosition.x;
        fireAnt.y = this.nestPosition.y;

        this.entitiesContainers.fireAnts.addChild(fireAnt);
        this.entities.fireAnts.push(fireAnt);

        if (this.effectManager) {
            this.effectManager.createSpawnEffect(fireAnt.x, fireAnt.y, false, { R: 255, G: 69, B: 0 });
        }
    }

    // ===============================================
    // NEW ANT TYPE CREATION METHODS
    // ===============================================

    createFatAnt() {
        if (!this.nestPosition) {
            console.error("EntityManager: Nest position not available to create Fat Ant.");
            return;
        }
        const ant = IdleAnts.Entities.createAntByType('fatAnt', PIXI.Texture.EMPTY, this.nestPosition, this.resourceManager.stats.speedMultiplier);
        if (!ant) return;
        
        ant.x = this.nestPosition.x;
        ant.y = this.nestPosition.y;
        ant.capacity = this.resourceManager.stats.strengthMultiplier;
        
        this.entitiesContainers.fatAnts.addChild(ant);
        this.entities.fatAnts.push(ant);
        
        if (this.effectManager) {
            this.effectManager.createSpawnEffect(ant.x, ant.y);
        }
    }

    createGasAnt() {
        if (!this.nestPosition) {
            console.error("EntityManager: Nest position not available to create Gas Ant.");
            return;
        }
        const ant = IdleAnts.Entities.createAntByType('gasAnt', PIXI.Texture.EMPTY, this.nestPosition, this.resourceManager.stats.speedMultiplier);
        if (!ant) return;
        
        ant.x = this.nestPosition.x;
        ant.y = this.nestPosition.y;
        ant.capacity = this.resourceManager.stats.strengthMultiplier;
        
        this.entitiesContainers.gasAnts.addChild(ant);
        this.entities.gasAnts.push(ant);
        
        if (this.effectManager) {
            this.effectManager.createSpawnEffect(ant.x, ant.y, false, { R: 0, G: 255, B: 0 });
        }
    }

    createAcidAnt() {
        if (!this.nestPosition) {
            console.error("EntityManager: Nest position not available to create Acid Ant.");
            return;
        }
        const ant = IdleAnts.Entities.createAntByType('acidAnt', PIXI.Texture.EMPTY, this.nestPosition, this.resourceManager.stats.speedMultiplier);
        if (!ant) return;
        
        ant.x = this.nestPosition.x;
        ant.y = this.nestPosition.y;
        ant.capacity = this.resourceManager.stats.strengthMultiplier;
        
        this.entitiesContainers.acidAnts.addChild(ant);
        this.entities.acidAnts.push(ant);
        
        if (this.effectManager) {
            this.effectManager.createSpawnEffect(ant.x, ant.y, false, { R: 255, G: 255, B: 0 });
        }
    }

    createRainbowAnt() {
        if (!this.nestPosition) {
            console.error("EntityManager: Nest position not available to create Rainbow Ant.");
            return;
        }
        const ant = IdleAnts.Entities.createAntByType('rainbowAnt', PIXI.Texture.EMPTY, this.nestPosition, this.resourceManager.stats.speedMultiplier);
        if (!ant) return;
        
        ant.x = this.nestPosition.x;
        ant.y = this.nestPosition.y;
        ant.capacity = this.resourceManager.stats.strengthMultiplier;
        
        this.entitiesContainers.rainbowAnts.addChild(ant);
        this.entities.rainbowAnts.push(ant);
        
        if (this.effectManager) {
            this.effectManager.createSpawnEffect(ant.x, ant.y, false, { R: 255, G: 128, B: 255 });
        }
    }

    createSmokeAnt() {
        if (!this.nestPosition) {
            console.error("EntityManager: Nest position not available to create Smoke Ant.");
            return;
        }
        const ant = IdleAnts.Entities.createAntByType('smokeAnt', PIXI.Texture.EMPTY, this.nestPosition, this.resourceManager.stats.speedMultiplier);
        if (!ant) return;
        
        ant.x = this.nestPosition.x;
        ant.y = this.nestPosition.y;
        ant.capacity = this.resourceManager.stats.strengthMultiplier;
        
        this.entitiesContainers.smokeAnts.addChild(ant);
        this.entities.smokeAnts.push(ant);
        
        if (this.effectManager) {
            this.effectManager.createSpawnEffect(ant.x, ant.y, false, { R: 128, G: 128, B: 128 });
        }
    }

    createElectricAnt() {
        if (!this.nestPosition) {
            console.error("EntityManager: Nest position not available to create Electric Ant.");
            return;
        }
        const ant = IdleAnts.Entities.createAntByType('electricAnt', PIXI.Texture.EMPTY, this.nestPosition, this.resourceManager.stats.speedMultiplier);
        if (!ant) return;
        
        ant.x = this.nestPosition.x;
        ant.y = this.nestPosition.y;
        ant.capacity = this.resourceManager.stats.strengthMultiplier;
        
        this.entitiesContainers.electricAnts.addChild(ant);
        this.entities.electricAnts.push(ant);
        
        if (this.effectManager) {
            this.effectManager.createSpawnEffect(ant.x, ant.y, false, { R: 0, G: 255, B: 255 });
        }
    }

    createLeafCutterAnt() {
        if (!this.nestPosition) {
            console.error("EntityManager: Nest position not available to create Leaf Cutter Ant.");
            return;
        }
        const ant = IdleAnts.Entities.createAntByType('leafCutterAnt', PIXI.Texture.EMPTY, this.nestPosition, this.resourceManager.stats.speedMultiplier);
        if (!ant) return;
        
        ant.x = this.nestPosition.x;
        ant.y = this.nestPosition.y;
        ant.capacity = this.resourceManager.stats.strengthMultiplier;
        
        this.entitiesContainers.leafCutterAnts.addChild(ant);
        this.entities.leafCutterAnts.push(ant);
        
        if (this.effectManager) {
            this.effectManager.createSpawnEffect(ant.x, ant.y, false, { R: 34, G: 139, B: 34 });
        }
    }


    createBananaThrowingAnt() {
        if (!this.nestPosition) {
            console.error("EntityManager: Nest position not available to create Banana Throwing Ant.");
            return;
        }
        const ant = IdleAnts.Entities.createAntByType('bananaThrowingAnt', PIXI.Texture.EMPTY, this.nestPosition, this.resourceManager.stats.speedMultiplier);
        if (!ant) return;
        
        ant.x = this.nestPosition.x;
        ant.y = this.nestPosition.y;
        ant.capacity = this.resourceManager.stats.strengthMultiplier;
        
        this.entitiesContainers.bananaThrowingAnts.addChild(ant);
        this.entities.bananaThrowingAnts.push(ant);
        
        if (this.effectManager) {
            this.effectManager.createSpawnEffect(ant.x, ant.y, false, { R: 255, G: 255, B: 0 });
        }
    }

    createJuiceAnt() {
        if (!this.nestPosition) {
            console.error("EntityManager: Nest position not available to create Juice Ant.");
            return;
        }
        const ant = IdleAnts.Entities.createAntByType('juiceAnt', PIXI.Texture.EMPTY, this.nestPosition, this.resourceManager.stats.speedMultiplier);
        if (!ant) return;
        
        ant.x = this.nestPosition.x;
        ant.y = this.nestPosition.y;
        ant.capacity = this.resourceManager.stats.strengthMultiplier;
        
        this.entitiesContainers.juiceAnts.addChild(ant);
        this.entities.juiceAnts.push(ant);
        
        if (this.effectManager) {
            this.effectManager.createSpawnEffect(ant.x, ant.y, false, { R: 255, G: 165, B: 0 });
        }
    }

    createCrabAnt() {
        if (!this.nestPosition) {
            console.error("EntityManager: Nest position not available to create Crab Ant.");
            return;
        }
        const ant = IdleAnts.Entities.createAntByType('crabAnt', PIXI.Texture.EMPTY, this.nestPosition, this.resourceManager.stats.speedMultiplier);
        if (!ant) return;
        
        ant.x = this.nestPosition.x;
        ant.y = this.nestPosition.y;
        ant.capacity = this.resourceManager.stats.strengthMultiplier;
        
        this.entitiesContainers.crabAnts.addChild(ant);
        this.entities.crabAnts.push(ant);
        
        if (this.effectManager) {
            this.effectManager.createSpawnEffect(ant.x, ant.y, false, { R: 255, G: 20, B: 147 });
        }
    }



    createSpiderAnt() {
        if (!this.nestPosition) {
            console.error("EntityManager: Nest position not available to create Spider Ant.");
            return;
        }
        const ant = IdleAnts.Entities.createAntByType('spiderAnt', PIXI.Texture.EMPTY, this.nestPosition, this.resourceManager.stats.speedMultiplier);
        if (!ant) return;
        
        ant.x = this.nestPosition.x;
        ant.y = this.nestPosition.y;
        ant.capacity = this.resourceManager.stats.strengthMultiplier;
        
        this.entitiesContainers.spiderAnts.addChild(ant);
        this.entities.spiderAnts.push(ant);
        
        if (this.effectManager) {
            this.effectManager.createSpawnEffect(ant.x, ant.y, false, { R: 0, G: 0, B: 0 });
        }
    }

    
    createFood(count = 1) {
        for (let i = 0; i < count; i++) {
            // Create food at random positions across the map
            const position = {
                x: Math.random() * this.mapBounds.width,
                y: Math.random() * this.mapBounds.height
            };
            
            // Always use BASIC food type for random spawns
            let foodType;
            try {
                // Use the basic food type for random spawns
                foodType = IdleAnts.Data.FoodTypes.BASIC;
                
                // Verify that the food type has all required properties
                if (!foodType || !foodType.scale || typeof foodType.scale.min === 'undefined') {
                    console.warn("Invalid food type detected, falling back to basic food type");
                    foodType = IdleAnts.Data.FoodTypes.BASIC;
                }
            } catch (error) {
                console.error("Error getting food type:", error);
                foodType = IdleAnts.Data.FoodTypes.BASIC;
            }
            
            this.addFood(position, foodType);
        }
    }
    
    addFood(position, foodType) {
        // Ensure position is within map bounds
        const x = Math.max(20, Math.min(position.x, this.mapBounds.width - 20));
        const y = Math.max(20, Math.min(position.y, this.mapBounds.height - 20));
        
        // Ensure we have a valid food type with required properties
        const validFoodType = foodType && foodType.scale && typeof foodType.scale.min !== 'undefined' 
            ? foodType 
            : IdleAnts.Data.FoodTypes.BASIC;
        
        try {
            const food = new IdleAnts.Entities.Food(
                this.assetManager.getTexture('food'),
                { x, y, clickPlaced: position.clickPlaced || false },
                validFoodType
            );
            
            // Check if this food was placed by the player's click
            if (position.clickPlaced && this.effectManager) {
                this.effectManager.createFoodSpawnEffect(x, y, validFoodType.glowColor);
            }
            
            this.entitiesContainers.food.addChild(food);
            this.entities.foods.push(food);
        } catch (error) {
            console.error("Error creating food:", error);
        }
    }
    
    update() {
        // Increment frame counter
        this.frameCounter++;
        
        // Update nest
        if (this.nest) {
            this.nest.update();
        }
        
        // Update queen ant
        if (this.entities.queen) {
            this.entities.queen.update(this.nestPosition, this.entities.foods);
        }
        
        // Update larvae
        this.updateLarvae();
        
        // Update ants
        this.updateAnts();
        
        // Update flying ants
        this.updateFlyingAnts();
        
        // Update Car Ants
        this.updateCarAnts();
        
        // Update Fire Ants
        this.updateFireAnts();

        // Update new ant types (basic, exploding, throwing, special, other)
        this.updateNewAntTypes();
        
        // Update food
        this.updateFood();
        
        // Handle food spawning
        this.handleFoodSpawning();
        
        // Handle autofeeder
        this.handleAutofeeder();
        
        // Update Enemies
        this.updateEnemies();
    }

    // Update all newly added ant categories using the generic updater
    updateNewAntTypes() {
        const shouldCreateTrail = this.frameCounter % this.trailInterval === 0;

        // Basic combat ants
        this.updateAntEntities(this.entities.fatAnts, shouldCreateTrail, false);
        this.updateAntEntities(this.entities.gasAnts, shouldCreateTrail, false);
        this.updateAntEntities(this.entities.acidAnts, shouldCreateTrail, false);
        this.updateAntEntities(this.entities.rainbowAnts, shouldCreateTrail, false);

        // Exploding ants (now pursue enemies like others)
        this.updateAntEntities(this.entities.smokeAnts, shouldCreateTrail, false, /*pursueEnemies=*/true);
        this.updateAntEntities(this.entities.electricAnts, shouldCreateTrail, false, /*pursueEnemies=*/true);
        this.updateAntEntities(this.entities.leafCutterAnts, shouldCreateTrail, false, /*pursueEnemies=*/true);
        // Door ants: not implemented

        // Throwing ants
        // Enable pursuit so they will still engage when enemies are near
        this.updateAntEntities(this.entities.bananaThrowingAnts, shouldCreateTrail, false, /*pursueEnemies=*/true);
        this.updateAntEntities(this.entities.juiceAnts, shouldCreateTrail, false);
        this.updateAntEntities(this.entities.crabAnts, shouldCreateTrail, false);

        // Special ants
        this.updateAntEntities(this.entities.spiderAnts, shouldCreateTrail, false);

        // Other
    }
    
    // New method to update larvae
    updateLarvae() {
        // Update each larvae and remove hatched ones
        for (let i = this.entities.larvae.length - 1; i >= 0; i--) {
            const larvae = this.entities.larvae[i];
            
            // Update the larvae and check if it's still active
            const isActive = larvae.update(this.app.ticker.deltaTime);
            
            // If the larvae is no longer active (hatched), remove it
            if (!isActive) {
                this.entities.larvae.splice(i, 1);
            }
        }
    }
    
    // Method to detect and resolve clustering of ants at the nest
    resolveNestClustering() {
        // Only check every 30 frames to save performance (reduced frequency for better performance)
        if (this.frameCounter % 30 !== 0) return;
        
        const nestX = this.nestPosition.x;
        const nestY = this.nestPosition.y;
        const checkRadiusSq = 8 * 8; // Use squared radius for faster comparison
        const stuckThreshold = 3; // How many ants within radius is considered a cluster
        
        // First identify ants with food that need to deposit
        const antsWithFood = [];
        const antsWithoutFood = [];
        
        // Helper function to process both ant types
        const processAntType = (ants) => {
            for (const ant of ants) {
                const dx = ant.x - nestX;
                const dy = ant.y - nestY;
                const distSq = dx * dx + dy * dy; // Squared distance (faster than sqrt)
                
                if (distSq < checkRadiusSq) {
                    if (ant.foodCollected > 0) {
                        antsWithFood.push(ant);
                    } else {
                        antsWithoutFood.push(ant);
                    }
                }
            }
        };
        
        // Process both regular and flying ants
        processAntType(this.entities.ants);
        processAntType(this.entities.flyingAnts);
        
        // First priority: Give space to ants with food to deposit
        if (antsWithFood.length > 0) {
            // Prioritize ants with food - make ants without food move away
            for (const emptyAnt of antsWithoutFood) {
                // Move empty ants away from the nest to make room
                const angle = Math.random() * Math.PI * 2;
                const pushForce = emptyAnt.speed * 2; // Strong push
                emptyAnt.vx = Math.cos(angle) * pushForce;
                emptyAnt.vy = Math.sin(angle) * pushForce;
                
                // Offset position so they don't all gather at the same spot
                emptyAnt.x += Math.cos(angle) * 10;
                emptyAnt.y += Math.sin(angle) * 10;
            }
            
            // If too many ants with food are clustered, distribute them in a ring pattern
            if (antsWithFood.length >= stuckThreshold) {
                const nestRadius = 10; // Radius for forming a ring around nest
                const angleDelta = (2 * Math.PI) / antsWithFood.length;
                
                antsWithFood.forEach((ant, index) => {
                    // Place ants in a ring pattern around the nest
                    const angle = index * angleDelta;
                    const targetX = nestX + Math.cos(angle) * nestRadius;
                    const targetY = nestY + Math.sin(angle) * nestRadius;
                    
                    // Move ant to position on the ring
                    if (Math.random() < 0.5) { // Only adjust position 50% of the time
                        ant.x = targetX;
                        ant.y = targetY;
                        
                        // Adjust velocity to point toward nest for deposit
                        const dx = nestX - ant.x;
                        const dy = nestY - ant.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        ant.vx = (dx / dist) * ant.speed * 0.5;
                        ant.vy = (dy / dist) * ant.speed * 0.5;
                    }
                });
            }
        } else if (antsWithoutFood.length >= stuckThreshold * 2) {
            // If only ants without food are clustered, spread them out evenly
            // Use a wider spread pattern since they're leaving to look for food
            for (let i = 0; i < antsWithoutFood.length; i++) {
                const ant = antsWithoutFood[i];
                const angle = (i / antsWithoutFood.length) * Math.PI * 2;
                const pushForce = ant.speed * 1.5;
                
                ant.vx = Math.cos(angle) * pushForce;
                ant.vy = Math.sin(angle) * pushForce;
                
                // Offset position more dramatically
                ant.x += Math.cos(angle) * 12;
                ant.y += Math.sin(angle) * 12;
            }
        }
    }
    
    // Generic method to update any type of ant entities
    updateAntEntities(antEntities, shouldCreateTrail, isFlying = false, pursueEnemies = true) {
        // Only process enemy detection every 3 frames for performance
        const shouldCheckEnemies = pursueEnemies && this.frameCounter % 3 === 0;
        
        for (let i = 0; i < antEntities.length; i++) {
            const ant = antEntities[i];
            
            // Skip enemy detection if not needed this frame, unless ant is already targeting
            if (pursueEnemies && (shouldCheckEnemies || ant.targetEnemy)) {
                const perceptionSq = 250 * 250; // 250-px perception radius (squared)
                const engageDistSq = 20 * 20; // 20-px engage radius (squared)

                // Locate closest living enemy using squared distances
                let closestE = null,
                    closestESq = Infinity;
                for (const enemy of this.entities.enemies) {
                    if (enemy.isDead) continue;
                    const dx = enemy.x - ant.x,
                          dy = enemy.y - ant.y,
                          distSq = dx * dx + dy * dy;
                    if (distSq < closestESq) { closestESq = distSq; closestE = enemy; }
                }

                if (closestE && closestESq <= perceptionSq) {
                    ant.targetEnemy = closestE;

                    // Force ant into aggressive pursuit unless already in combat
                    if (ant.state !== IdleAnts.Entities.AntBase.States.FIGHTING) {
                        // Ensure we're in a movable state while chasing
                        if (ant.state !== IdleAnts.Entities.AntBase.States.SEEKING_FOOD) {
                            ant.transitionToState(IdleAnts.Entities.AntBase.States.SEEKING_FOOD);
                        }
                    }

                    if (closestESq > engageDistSq) {
                        // Move toward the enemy using squared distance comparison
                        const dist = Math.sqrt(closestESq); // Only calculate sqrt when needed
                        ant.vx = (closestE.x - ant.x) / dist * ant.speed;
                        ant.vy = (closestE.y - ant.y) / dist * ant.speed;
                    } else {
                        // Engage – freeze and switch to fighting if not already
                        ant.vx = ant.vy = 0;
                        if (ant.state !== IdleAnts.Entities.AntBase.States.FIGHTING) {
                            ant.transitionToState(IdleAnts.Entities.AntBase.States.FIGHTING);
                        }
                    }
                } else {
                    // No enemy in perception – clear any previous lock
                    ant.targetEnemy = null;
                }
            }
            
            // Update the ant with nest position and available foods
            const actionResult = ant.update(this.nestPosition, this.entities.foods);
            
            // Skip boundary checks for ants at the nest - allows ants to overlap at nest (optimized)
            const dx = ant.x - this.nestPosition.x;
            const dy = ant.y - this.nestPosition.y;
            const distToNestSq = dx * dx + dy * dy;
            
            const atNest = distToNestSq < 15 * 15; // Compare with squared distance
            
            // Only apply boundary handling if not at the nest
            if (!atNest) {
                ant.handleBoundaries(this.mapBounds.width, this.mapBounds.height);
            }
            
            // Create trail behind the ant if needed
            if (shouldCreateTrail && this.effectManager) {
                const trailChance = isFlying ? 0.3 : 1.0; // Flying ants leave fewer trails
                
                if (Math.random() < trailChance) {
                    if (isFlying) {
                        this.effectManager.createFlyingAntTrail(ant);
                    } else {
                        this.effectManager.createAntTrail(ant);
                    }
                }
            }
            
            // Check for food collection or delivery based on action result and state
            if (actionResult === true) {
                // Handle action based on ant's current state
                if (ant.state === IdleAnts.Entities.AntBase.States.COLLECTING_FOOD) {
                    // Ant has completed food collection
                    this.collectFood(ant);
                    
                    // Special effect for flying ants
                    if (isFlying && this.effectManager) {
                        this.effectManager.createFoodCollectEffect(ant.x, ant.y, 0xFFD700);
                    }
                } else if (ant.state === IdleAnts.Entities.AntBase.States.DELIVERING_FOOD || 
                           ant.state === IdleAnts.Entities.AntBase.States.RETURNING_TO_NEST) {
                    // Ant has returned to nest with food
                    this.deliverFood(ant);
                }
            }
            
            // Remove dead ants
            if(ant.isDead){
                // Update resource manager stats based on ant type
                if(this.resourceManager){
                    if(antEntities === this.entities.ants && typeof this.resourceManager.decreaseAntCount === 'function'){
                        this.resourceManager.decreaseAntCount();
                    } else if(antEntities === this.entities.flyingAnts){
                        this.resourceManager.stats.flyingAnts = Math.max(0, this.resourceManager.stats.flyingAnts - 1);
                    } else if(antEntities === this.entities.carAnts){
                        this.resourceManager.stats.carAnts = Math.max(0, this.resourceManager.stats.carAnts - 1);
                    } else if(antEntities === this.entities.fireAnts){
                        this.resourceManager.stats.fireAnts = Math.max(0, this.resourceManager.stats.fireAnts - 1);
                    }
                    // Recompute food per second since ant counts changed
                    this.resourceManager.updateFoodPerSecond();
                }
                // Remove from array and continue iteration
                antEntities.splice(i,1);
                i--;
                continue;
            }
        }
    }
    
    collectFood(ant) {
        // If the ant is still in the collecting state but hasn't finished the timer, just return
        if (ant.state === IdleAnts.Entities.AntBase.States.COLLECTING_FOOD && ant.collectionTimer < ant.collectionTarget.getCollectionTimeForAnt(ant)) {
            return;
        }
        
        // Get the target food
        if (!ant.collectionTarget) return;
        
        const foodItem = ant.collectionTarget;
        const isFlyingAnt = ant.constructor.name.includes('Flying');
        const isCookie = foodItem.foodType && foodItem.foodType.id === 'cookie';
        
        // Handle collection based on how many ants are collecting this food
        const collectingAntCount = foodItem.getCollectingAntCount();
        let foodValue = foodItem.foodType ? foodItem.foodType.value : 1;
        // Food weight is tracked but not used for capacity checks
        let foodWeight = 1; // Always count as 1 regardless of type
        
        // Check if this is the last ant collecting or if the food should be completely consumed
        const shouldRemoveFood = collectingAntCount <= 1 || Math.random() < 0.95;
        
        if (shouldRemoveFood) {
            // This ant gets the full value of the food item
            
            // Create a particle effect
            if (this.effectManager) {
                // For cookies, create a special particle effect
                if (isCookie) {
                    // Use the existing createFoodCollectEffect with a gold color for cookies
                    const cookieColor = 0xFFD700; // Gold color for cookies
                    this.effectManager.createFoodCollectEffect(foodItem.x, foodItem.y, cookieColor, 1.5); // Larger effect for cookies
                    
                    // Add multiple particles for a more dramatic cookie effect
                    for (let i = 0; i < 5; i++) {
                        const angle = Math.random() * Math.PI * 2;
                        const distance = 5 + Math.random() * 8;
                        const x = foodItem.x + Math.cos(angle) * distance;
                        const y = foodItem.y + Math.sin(angle) * distance;
                        this.effectManager.createFoodCollectEffect(x, y, cookieColor, 0.8);
                    }
                } else {
                    // For normal food, use the food type's glow color
                    const color = foodItem.foodType ? foodItem.foodType.glowColor : 0xFFFF99;
                    this.effectManager.createFoodCollectEffect(foodItem.x, foodItem.y, color);
                }
            }
            
            // Remove the food entity
            this.entitiesContainers.food.removeChild(foodItem);
            const foodIndex = this.entities.foods.indexOf(foodItem);
            if (foodIndex !== -1) {
                this.entities.foods.splice(foodIndex, 1);
            }
            
            // Removed dynamic food spawning on harvest to prevent performance issues
            // Food spawning is now only handled by the periodic timer in handleFoodSpawning()
        } else {
            // Food is not being removed - this ant's share is determined proportionally
            // Get the ant's contribution percentage from the food item
            const valueDistribution = foodItem.distributeValue();
            
            // If this ant has a share, use a percentage of the total value
            if (valueDistribution[ant.id]) {
                foodValue = valueDistribution[ant.id];
            } else {
                // If somehow the ant isn't in the distribution, use a fallback value
                foodValue = Math.max(1, Math.floor(foodItem.foodType.value / collectingAntCount));
            }
            
            // Create a smaller particle effect for partial collection
            if (this.effectManager) {
                this.effectManager.createFoodCollectEffect(
                    ant.x, ant.y, 
                    foodItem.foodType.glowColor,
                    0.7  // Smaller effect for partial collection
                );
            }
        }
        
        // Call pickUpFood to update the ant's food state
        ant.pickUpFood(foodItem.foodType, foodValue);
    }
    
    deliverFood(ant) {
        // Drop food and add to resources based on ant's strength and food value
        const foodResult = ant.dropFood();
        let foodAmount = foodResult.totalValue * this.resourceManager.stats.foodMultiplier;

        // BERSERKER BONUS: If this ant is a berserker, apply massive multiplier!
        if (ant.isBerserker && ant.foodValueMultiplier) {
            foodAmount *= ant.foodValueMultiplier;

            // Epic visual feedback for berserker collection
            if (this.effectManager) {
                this.effectManager.createFoodCollectEffect(ant.x, ant.y, 0xFF0000, 2.0);
                this.effectManager.createFoodCollectEffect(ant.x, ant.y, 0xFF4500, 1.5);
            }
        }

        // Add food to resources and track it for food rate calculation
        this.resourceManager.addFood(foodAmount);
        
        // For more responsive UI updates, also update the displayFood value directly
        // This makes the counter animation start from a value closer to the actual food amount
        this.resourceManager.resources.displayFood = this.resourceManager.resources.food;
        
        // Add food drop effect at nest
        if (this.effectManager) {
            // Use the last food type color for the effect, or default if none
            const effectColor = foodResult.lastFoodType ? foodResult.lastFoodType.glowColor : 0xFFFF99;
            this.effectManager.createFoodDropEffect(this.nestPosition.x, this.nestPosition.y, effectColor);
        }
        
        // Apply a random velocity to move away from nest and start searching for food
        const pushAngle = Math.random() * Math.PI * 2;
        const pushStrength = ant.speed * 0.8; // Strong enough push to leave nest area
        ant.vx = Math.cos(pushAngle) * pushStrength;
        ant.vy = Math.sin(pushAngle) * pushStrength;
        
        // Update the UI to reflect the new food amount
        if (IdleAnts.app && IdleAnts.app.uiManager) {
            IdleAnts.app.uiManager.updateUI();
        }
    }
    
    // Helper to find ants near a specific point or ant
    findNearbyAnts(targetAnt, radius) {
        const nearbyAnts = [];
        const checkAntType = (ants) => {
            for (const ant of ants) {
                if (ant !== targetAnt) { // Skip the target ant itself
                    const dx = ant.x - targetAnt.x;
                    const dy = ant.y - targetAnt.y;
                    const distSq = dx * dx + dy * dy;
                    
                    if (distSq < radius * radius) {
                        nearbyAnts.push(ant);
                    }
                }
            }
        };
        
        checkAntType(this.entities.ants);
        checkAntType(this.entities.flyingAnts);
        
        return nearbyAnts;
    }
    
    // Helper to gently spread apart crowded ants
    spreadAntsApart(ants) {
        if (ants.length <= 1) return;
        
        // Calculate center of the group
        let centerX = 0;
        let centerY = 0;
        
        for (const ant of ants) {
            centerX += ant.x;
            centerY += ant.y;
        }
        
        centerX /= ants.length;
        centerY /= ants.length;
        
        // Gently push ants away from center
        for (const ant of ants) {
            const dx = ant.x - centerX;
            const dy = ant.y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 0.1) {
                // If ants are perfectly stacked, choose random directions
                const angle = Math.random() * Math.PI * 2;
                ant.vx += Math.cos(angle) * ant.speed * 0.3;
                ant.vy += Math.sin(angle) * ant.speed * 0.3;
            } else {
                // Push away from center
                const normalizedDx = dx / distance;
                const normalizedDy = dy / distance;
                
                ant.vx += normalizedDx * ant.speed * 0.3;
                ant.vy += normalizedDy * ant.speed * 0.3;
            }
        }
    }
    
    expandNest() {
        if (this.nest) {
            this.nest.expand();
        }
    }
    
    // Update all ants' speed when speed multiplier changes
    updateAntsSpeed() {
        const multiplier = this.resourceManager.stats.speedMultiplier;
        this.updateAntEntitiesSpeed(this.entities.ants, multiplier);
        this.updateAntEntitiesSpeed(this.entities.flyingAnts, multiplier);
        this.updateAntEntitiesSpeed(this.entities.carAnts, multiplier);
        this.updateAntEntitiesSpeed(this.entities.fireAnts, multiplier);
    }
    
    // Generic method to update speed for any ant type
    updateAntEntitiesSpeed(antEntities, multiplier) {
        antEntities.forEach(ant => {
            ant.updateSpeedMultiplier(multiplier);
        });
    }
    
    // Method to increase all ants' strength
    updateAntsCapacity() {
        this.updateAntEntitiesStrength(this.entities.ants);
        this.updateAntEntitiesStrength(this.entities.flyingAnts);
        this.updateAntEntitiesStrength(this.entities.carAnts);
        this.updateAntEntitiesStrength(this.entities.fireAnts);
    }
    
    updateAntEntitiesStrength(antEntities) {
        const currentStrength = this.resourceManager.stats.strengthMultiplier;
        for (let i = 0; i < antEntities.length; i++) {
            // Set the capacity directly to the strength value
            antEntities[i].capacity = currentStrength;
            
            // Update HP based on strength
            const baseHp = 50;
            const newMaxHp = baseHp + (currentStrength - 1) * 25; // +25 HP per strength level
            const hpRatio = antEntities[i].hp / antEntities[i].maxHp; // Preserve HP percentage
            antEntities[i].maxHp = newMaxHp;
            antEntities[i].hp = newMaxHp * hpRatio; // Scale current HP
            
            // Update health bar if it exists
            if (antEntities[i].updateHealthBar) {
                antEntities[i].updateHealthBar();
            }
            
            // Ensure the canStackFood config is updated based on capacity
            antEntities[i].config.canStackFood = antEntities[i].capacity > 1;
            
            // Log capacity and canStackFood status
            
            // If the ant is already carrying food but not at full capacity with the new strength,
            // allow it to collect more food
            if (antEntities[i].foodCollected > 0 && antEntities[i].capacityWeight < currentStrength) {
                antEntities[i].isAtFullCapacity = false;
            }
        }
    }
    
    activateAutofeeder() {
        // Get the current food type based on the food tier
        const foodType = this.resourceManager.getCurrentFoodType();
        
        // Get the amount of food to sprinkle based on autofeeder level
        const foodAmount = this.resourceManager.getAutofeederFoodAmount();
        
        // Calculate a random position near the nest
        const nestRadius = 300; // Distance from nest to sprinkle food
        const randomAngle = Math.random() * Math.PI * 2; // Random angle around the nest
        
        // Calculate the center position for the food cluster
        const centerX = this.nestPosition.x + Math.cos(randomAngle) * nestRadius;
        const centerY = this.nestPosition.y + Math.sin(randomAngle) * nestRadius;
        
        // Sprinkle food in a cluster around the center position
        for (let i = 0; i < foodAmount; i++) {
            // Random offset from the center position (within a small radius)
            const offsetRadius = Math.random() * 100; // 100px radius for the food cluster
            const offsetAngle = Math.random() * Math.PI * 2;
            
            const foodX = centerX + Math.cos(offsetAngle) * offsetRadius;
            const foodY = centerY + Math.sin(offsetAngle) * offsetRadius;
            
            // Add the food with the current food type
            this.addFood({
                x: foodX,
                y: foodY,
                clickPlaced: true // Treat as click-placed to show spawn effect
            }, foodType);
        }
    }
    
    // New method to update the queen ant
    updateQueenAnt() {
        const queen = this.entities.queen;
        if (!queen) return;
        
        // Update queen with nest position and foods
        queen.update(this.nestPosition, this.entities.foods);
        
        // Handle boundaries
        queen.handleBoundaries(this.mapBounds.width, this.mapBounds.height);
    }
    
    // New method to create a queen ant
    createQueenAnt() {
        // Check if queen already exists
        if (this.entities.queen) {
            console.warn('Queen ant already exists');
            return;
        }
        
        // Create the queen ant with the queen ant texture
        const queen = new IdleAnts.Entities.QueenAnt(
            this.assetManager.getTexture('queenAnt'), // Use queen ant texture
            this.nestPosition,
            this.resourceManager.stats.speedMultiplier
        );
        
        // CRITICAL: Force position to be exactly at the nest
        queen.x = this.nestPosition.x;
        queen.y = this.nestPosition.y;
        
        // Add to container and store reference
        this.entitiesContainers.queen.addChild(queen);
        this.entities.queen = queen;
        
        // Create spawn effect
        if (this.effectManager) {
            this.effectManager.createSpawnEffect(queen.x, queen.y);
        }
        
        // Update resource manager stats
        this.resourceManager.stats.hasQueen = true;
        
        return queen;
    }
    
    // New method to create an ant from larvae (without cost)
    createAntFromLarvae(x, y) {
        // Check if we can add more ants
        if (this.entities.ants.length >= this.resourceManager.stats.maxAnts) {
            return;
        }
        
        
        // Create the ant
        const ant = new IdleAnts.Entities.Ant(
            this.assetManager.getTexture('ant'),
            this.nestPosition,
            this.resourceManager.stats.speedMultiplier
        );
        
        // Use the larvae position if provided, otherwise use nest position
        if (x !== undefined && y !== undefined) {
            ant.x = x;
            ant.y = y;
        } else {
            ant.x = this.nestPosition.x;
            ant.y = this.nestPosition.y;
        }
        
        // Add to container and array
        this.entitiesContainers.ants.addChild(ant);
        this.entities.ants.push(ant);
        
        // Create spawn effect
        if (this.effectManager) {
            this.effectManager.createSpawnEffect(ant.x, ant.y);
        }
        
        // Update resource manager stats
        this.resourceManager.increaseAntCount();
        
        // Decrement larvae count on queen
        if (this.entities.queen) {
            this.entities.queen.currentLarvae--;
        }
        
        return ant;
    }
    
    // New method to create larvae
    createLarvae(x, y) {
        // Create a new larvae entity
        const larvae = new IdleAnts.Entities.Larvae(x, y);
        
        // Add to the larvae array
        this.entities.larvae.push(larvae);
        
        return larvae;
    }
    
    // Modified method to handle larvae production from queen
    produceLarvae(x, y) {
        // Create a larvae production effect for visual feedback
        if (this.effectManager) {
            this.effectManager.createSpawnEffect(x, y);
        }
        
        // Create the actual larvae entity that will hatch after ~30 seconds
        this.createLarvae(x, y);
    }
    
    // Method to handle queen ant producing larvae
    produceQueenLarvae(capacity) {
        // Check if we have a queen
        if (!this.entities.queen) {
            return;
        }
        
        // Get the queen's position
        const queenX = this.entities.queen.x;
        const queenY = this.entities.queen.y;
        
        // Create larvae effect around the queen
        if (this.effectManager) {
            this.effectManager.createLarvaeEffect(queenX, queenY);
        }
        
        // Determine larvae to produce – one per allowed capacity that is free
        const availableSlots = capacity - this.entities.queen.currentLarvae;
        if (availableSlots <= 0) return;
        const larvaeCount = 1; // always produce a single egg per cycle
        
        // Create larvae entity around the queen
        for (let i = 0; i < larvaeCount; i++) {
            // Calculate a random position near the queen
            const angle = Math.random() * Math.PI * 2;
            const distance = 20 + Math.random() * 30; // 20-50 pixels from queen
            const larvaeX = queenX + Math.cos(angle) * distance;
            const larvaeY = queenY + Math.sin(angle) * distance;
            
            // Create the larvae
            this.produceLarvae(larvaeX, larvaeY);
        }
        
        // Update the queen's larvae count
        if (this.entities.queen) {
            this.entities.queen.currentLarvae += larvaeCount;
        }
    }
    
    // Method to update ants
    updateAnts() {
        // Update frame counter for trails
        const shouldCreateTrail = this.frameCounter % this.trailInterval === 0;
        
        // Check for and resolve any ant clustering at the nest
        this.resolveNestClustering();
        
        // Update each ant
        this.updateAntEntities(this.entities.ants, shouldCreateTrail);
    }
    
    // Method to update flying ants
    updateFlyingAnts() {
        // Update frame counter for trails
        const shouldCreateTrail = this.frameCounter % this.trailInterval === 0;
        
        // Update each flying ant
        this.updateAntEntities(this.entities.flyingAnts, shouldCreateTrail, true);
    }
    
    // New method to update Car Ants
    updateCarAnts() {
        // For CarAnts, trail might be different (e.g. tire tracks) or disabled.
        // Let's disable default ant trail for now.
        this.updateAntEntities(this.entities.carAnts, false, false); // No trail, not strictly flying for pathing
    }
    
    // Update Fire Ants
    updateFireAnts() {
        const shouldCreateTrail = this.frameCounter % this.trailInterval === 0;
        this.updateAntEntities(this.entities.fireAnts, shouldCreateTrail, false);
    }
    
    // Method to update food
    updateFood() {
        // Update food items
        this.entities.foods.forEach(food => {
            if (typeof food.update === 'function') {
                food.update();
            }
        });
    }
    
    // Method to handle food spawning
    handleFoodSpawning() {
        // Spawn food periodically
        this.foodSpawnCounter++;
        if (this.foodSpawnCounter >= this.foodSpawnInterval) {
            this.foodSpawnCounter = 0;
            
            // Spawn a constant 2 food items to maintain consistent performance
            const foodCount = 2;
            this.createFood(foodCount);
        }
    }
    
    // Method to handle autofeeder
    handleAutofeeder() {
        // Handle autofeeder if unlocked
        if (this.resourceManager.stats.autofeederUnlocked && this.resourceManager.stats.autofeederLevel > 0) {
            this.autofeederCounter++;
            
            // Activate autofeeder when counter reaches interval
            if (this.autofeederCounter >= this.resourceManager.stats.autofeederInterval) {
                this.activateAutofeeder();
                this.autofeederCounter = 0;
            }
        }
    }
    
    createEnemy(count = 1){
        const unlockedTypes = this.enemyTiers.slice(0, this.enemySpawnLevel + 1).flat();
        if(unlockedTypes.length === 0) return;

        for(let i = 0; i < count; i++){
            const tex = this.assetManager.getTexture('ant'); // placeholder texture
            // Randomly pick an unlocked enemy type
            const typeName = unlockedTypes[Math.floor(Math.random() * unlockedTypes.length)];
            const EnemyClass = this.enemyClassMap[typeName];
            if(!EnemyClass){ continue; }
            const enemy = new EnemyClass(tex, {width: this.mapBounds.width, height: this.mapBounds.height});
            this.entitiesContainers.enemies.addChild(enemy);
            this.entities.enemies.push(enemy);
        }
    }
    
    updateEnemies(){
        // If the boss is active, update the boss but continue with regular enemy updates
        if (this.boss && !this.boss.isDead) {
            // Get all ant entities for boss combat
            const ants = [
                ...this.entities.ants,
                ...this.entities.flyingAnts,
                ...this.entities.carAnts, 
                ...this.entities.fireAnts,
                ...this.entities.fatAnts,
                ...this.entities.gasAnts,
                ...this.entities.acidAnts,
                ...this.entities.rainbowAnts,
                ...this.entities.smokeAnts,
                ...this.entities.electricAnts,
                ...this.entities.leafCutterAnts,
                ...this.entities.bananaThrowingAnts,
                ...this.entities.juiceAnts,
                ...this.entities.crabAnts,
                ...this.entities.spiderAnts,
            ];
            this.boss.update(ants);
            // Don't return - continue with regular enemy updates so they don't freeze
        }
        // Use the total ant count from ResourceManager (which includes all special ants)
        const antTotal = this.resourceManager.stats.ants;

        // ---------- NEW: Update spawn level based on colony size ----------
        const maxLevel = this.enemyTiers.length - 1;
        const newLevel = Math.min(Math.floor(antTotal / 10), maxLevel);
        if(newLevel > this.enemySpawnLevel){
            this.enemySpawnLevel = newLevel;
            // Notify player about new enemy tier
            if(typeof IdleAnts.notify === 'function'){
                const lvl = newLevel; // 1-based for players
                IdleAnts.notify(`Level ${lvl} unlocked! New creatures are appearing…`, 'warning');
            }
        }
        
        // ---------- MINIBOSS TRIGGERS ----------
        // Miniboss 1: Giant Hornet at 25 ants
        if (antTotal >= 25 && !this.miniboss1Triggered && !this.boss && !this.bossTriggered) {
            this.miniboss1Triggered = true;
            if(typeof IdleAnts.notify === 'function'){
                IdleAnts.notify(`A massive Japanese Giant Hornet descends from the sky!`, 'warning');
            }
            setTimeout(() => {
                if (IdleAnts.game && typeof IdleAnts.game.spawnBoss === 'function') {
                    IdleAnts.game.spawnBoss('giant_hornet');
                }
            }, 2000);
            return; // Skip regular enemy spawning during miniboss intro
        }
        
        // Miniboss 2: Tarantula at 35 ants
        if (antTotal >= 35 && !this.miniboss2Triggered && !this.boss && !this.bossTriggered) {
            this.miniboss2Triggered = true;
            if(typeof IdleAnts.notify === 'function'){
                IdleAnts.notify(`A massive Tarantula emerges from its lair!`, 'warning');
            }
            setTimeout(() => {
                if (IdleAnts.game && typeof IdleAnts.game.spawnBoss === 'function') {
                    IdleAnts.game.spawnBoss('tarantula');
                }
            }, 2000);
            return; // Skip regular enemy spawning during miniboss intro
        }
        
        // ---------- BOSS TRIGGER: Spawn boss when colony reaches 60+ ants (final level) ----------
        if (antTotal >= 60 && !this.boss && !this.bossTriggered && !this.bossDefeated) {
            this.bossTriggered = true;
            // Notify player about the boss
            if(typeof IdleAnts.notify === 'function'){
                IdleAnts.notify(`The Anteater Boss has been awakened! Prepare for the ultimate challenge!`, 'danger');
            }
            // Trigger boss fight after a short delay to let the notification show
            setTimeout(() => {
                if (IdleAnts.game && typeof IdleAnts.game.startBossFight === 'function') {
                    IdleAnts.game.startBossFight();
                }
            }, 2000);
            return; // Skip regular enemy spawning during boss intro
        }
        // ------------------------------------------------------------------

        // Update existing enemies
        // Include ALL allied ant types so enemies can target any of them
        const ants = [
            ...this.entities.ants,
            ...this.entities.flyingAnts,
            ...this.entities.carAnts,
            ...this.entities.fireAnts,
            ...this.entities.fatAnts,
            ...this.entities.gasAnts,
            ...this.entities.acidAnts,
            ...this.entities.rainbowAnts,
            ...this.entities.smokeAnts,
            ...this.entities.electricAnts,
            ...this.entities.leafCutterAnts,
            ...this.entities.bananaThrowingAnts,
            ...this.entities.juiceAnts,
            ...this.entities.crabAnts,
            ...this.entities.spiderAnts,
        ];
        for(let i=this.entities.enemies.length-1;i>=0;i--){
            const e=this.entities.enemies[i];
            if(e.isDead){this.entities.enemies.splice(i,1);continue;}
            if(e instanceof IdleAnts.Entities.WoollyBearEnemy){
                e.update(this.nestPosition,[],ants);
            } else {
                e.update(ants);
            }
        }
        // Dynamic enemy spawning based on colony size
        const baseInterval = 900; // 15s default for 0-10 ants
        const scaledInterval = Math.max(300, Math.floor(baseInterval / (1 + antTotal/10)));

        this.enemySpawnCounter++;
        if(this.enemySpawnCounter >= scaledInterval){
            const batch = 1 + Math.floor(antTotal / 20);
            this.createEnemy(batch);
            this.enemySpawnCounter = 0;
        }
    }

    // Spawn one of each enemy type for early variety
    spawnInitialEnemies(){
        // Spawn only initial tier enemies (woolly bear & cricket)
        const initialTypes = this.enemyTiers[0];
        const tex = this.assetManager.getTexture('ant');
        const bounds = {width:this.mapBounds.width,height:this.mapBounds.height};
        initialTypes.forEach(typeName => {
            const EnemyClass = this.enemyClassMap[typeName];
            if(!EnemyClass) return;
            const e = new EnemyClass(tex, bounds);
            this.entitiesContainers.enemies.addChild(e);
            this.entities.enemies.push(e);
        });
    }

    createInitialLarvae() {
        // Create a larvae near the nest position for immediate visual feedback
        if (this.nestPosition) {
            // Position the larvae slightly offset from the nest
            const angle = Math.random() * Math.PI * 2;
            const distance = 30 + Math.random() * 20; // 30-50 pixels from nest
            const larvaeX = this.nestPosition.x + Math.cos(angle) * distance;
            const larvaeY = this.nestPosition.y + Math.sin(angle) * distance;
            
            // Create the larvae
            this.createLarvae(larvaeX, larvaeY);
            
        }
    }

    // Spawn the anteater boss and return reference
    spawnAnteaterBoss() {
        if (this.boss && !this.boss.isDead) return this.boss;
        const textures = {
            body: this.assetManager.getTexture('anteater_boss_body'),
            front_leg: this.assetManager.getTexture('anteater_boss_leg_front'),
            back_leg: this.assetManager.getTexture('anteater_boss_leg_back')
        };
        this.boss = new IdleAnts.Entities.AnteaterBoss(textures, { width: this.mapBounds.width, height: this.mapBounds.height });
        this.bossDefeated = false;
        this.entitiesContainers.enemies.addChild(this.boss);
        this.entities.enemies.push(this.boss);
        return this.boss;
    }

    // Flexible boss spawning with configuration
    spawnBossWithConfig(bossConfig) {
        if (this.boss && !this.boss.isDead) return this.boss;
        
        
        // Calculate spawn position
        const spawnPos = IdleAnts.Data.BossConfigUtils.calculateSpawnPosition(bossConfig, this.mapBounds);
        
        // Get required textures based on boss type
        const textures = {};
        for (const [key, textureName] of Object.entries(bossConfig.textures)) {
            textures[key] = this.assetManager.getTexture(textureName);
        }
        
        // Create boss instance based on className
        let bossInstance;
        const BossClass = IdleAnts.Entities[bossConfig.className];
        
        if (BossClass) {
            // Use the specific boss class
            bossInstance = new BossClass(textures, this.mapBounds);
        } else {
            console.warn(`Boss class ${bossConfig.className} not found, using AnteaterBoss as fallback`);
            bossInstance = new IdleAnts.Entities.AnteaterBoss(textures, this.mapBounds);
        }
        
        // Note: Using entity-level properties instead of overriding with BossConfigs
        // this.applyBossStats(bossInstance, bossConfig.defaultStats);
        
        // Set custom spawn position
        bossInstance.x = spawnPos.x;
        bossInstance.y = spawnPos.y;
        
        this.boss = bossInstance;
        this.bossDefeated = false;
        this.entitiesContainers.enemies.addChild(this.boss);
        this.entities.enemies.push(this.boss);
        
        return this.boss;
    }

    // Apply boss stats from configuration
    applyBossStats(bossInstance, stats) {
        if (stats.maxHp !== undefined) {
            bossInstance.maxHp = stats.maxHp;
            bossInstance.hp = stats.maxHp;
        }
        if (stats.attackDamage !== undefined) bossInstance.attackDamage = stats.attackDamage;
        if (stats.attackRange !== undefined) bossInstance.attackRange = stats.attackRange;
        if (stats.speed !== undefined) bossInstance.speed = stats.speed;
        if (stats.perceptionRange !== undefined) bossInstance.perceptionRange = stats.perceptionRange;
        if (stats.foodValue !== undefined) bossInstance.foodValue = stats.foodValue;
        
    }

    // Remove all current enemies except the boss (used before boss intro)
    clearEnemies() {
        for (let i = this.entities.enemies.length - 1; i >= 0; i--) {
            const e = this.entities.enemies[i];
            
            if (e === this.boss) {
                continue;
            }

            if (e.parent) e.parent.removeChild(e);
            this.entities.enemies.splice(i, 1);
        }
    }
    
    // Reset boss trigger for testing or replay
    resetBossTrigger() {
        this.bossTriggered = false;
        this.boss = null;
        this.miniboss1Triggered = false;
        this.miniboss2Triggered = false;
    }
    
    // Reset all entities and manager state
    reset() {
        // Clear all entities
        this.entities.ants.forEach(ant => {
            if (ant.parent) ant.parent.removeChild(ant);
            if (ant.healthBarContainer && ant.healthBarContainer.parent) {
                ant.healthBarContainer.parent.removeChild(ant.healthBarContainer);
            }
        });
        this.entities.flyingAnts.forEach(ant => {
            if (ant.parent) ant.parent.removeChild(ant);
            if (ant.healthBarContainer && ant.healthBarContainer.parent) {
                ant.healthBarContainer.parent.removeChild(ant.healthBarContainer);
            }
        });
        this.entities.carAnts.forEach(ant => {
            if (ant.parent) ant.parent.removeChild(ant);
            if (ant.healthBarContainer && ant.healthBarContainer.parent) {
                ant.healthBarContainer.parent.removeChild(ant.healthBarContainer);
            }
        });
        this.entities.fireAnts.forEach(ant => {
            if (ant.parent) ant.parent.removeChild(ant);
            if (ant.healthBarContainer && ant.healthBarContainer.parent) {
                ant.healthBarContainer.parent.removeChild(ant.healthBarContainer);
            }
        });
        this.entities.larvae.forEach(larva => {
            if (larva.parent) larva.parent.removeChild(larva);
        });
        this.entities.foods.forEach(food => {
            if (food.parent) food.parent.removeChild(food);
        });
        this.entities.enemies.forEach(enemy => {
            if (enemy.parent) enemy.parent.removeChild(enemy);
            if (enemy.healthBarContainer && enemy.healthBarContainer.parent) {
                enemy.healthBarContainer.parent.removeChild(enemy.healthBarContainer);
            }
        });
        
        // Remove queen
        if (this.entities.queen) {
            if (this.entities.queen.parent) this.entities.queen.parent.removeChild(this.entities.queen);
            if (this.entities.queen.healthBarContainer && this.entities.queen.healthBarContainer.parent) {
                this.entities.queen.healthBarContainer.parent.removeChild(this.entities.queen.healthBarContainer);
            }
        }
        
        // Remove boss
        if (this.boss) {
            if (this.boss.parent) this.boss.parent.removeChild(this.boss);
            if (this.boss.healthBarContainer && this.boss.healthBarContainer.parent) {
                this.boss.healthBarContainer.parent.removeChild(this.boss.healthBarContainer);
            }
        }
        
        // Reset arrays
        this.entities = {
            ants: [],
            flyingAnts: [],
            carAnts: [],
            fireAnts: [],
            larvae: [],
            foods: [],
            enemies: [],
            queen: null
        };
        
        // Reset boss tracking
        this.bossTriggered = false;
        this.bossDefeated = false;
        this.boss = null;
        this.miniboss1Triggered = false;
        this.miniboss2Triggered = false;
        
        // Reset timers
        this.autofeederTimer = 0;
        this.enemySpawnTimer = 0;
        this.foodSpawnTimer = 0;
        
        // Create initial ant and queen
        this.createInitialAnt();
        this.createQueenAnt();
        
    }
} 
