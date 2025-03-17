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
            larvae: new PIXI.Container() // New container for larvae
        };
        
        // Add containers to the world container instead of directly to the stage
        this.worldContainer.addChild(this.entitiesContainers.nest);
        this.worldContainer.addChild(this.entitiesContainers.food);
        this.worldContainer.addChild(this.entitiesContainers.larvae); // Add larvae container
        this.worldContainer.addChild(this.entitiesContainers.ants);
        this.worldContainer.addChild(this.entitiesContainers.flyingAnts);
        this.worldContainer.addChild(this.entitiesContainers.queen); // Add queen container
        
        // Entity collections
        this.entities = {
            ants: [],
            flyingAnts: [],
            foods: [],
            queen: null, // Reference to the queen ant
            larvae: [] // Array for larvae entities
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
        
        // Update food
        this.updateFood();
        
        // Handle food spawning
        this.handleFoodSpawning();
        
        // Handle autofeeder
        this.handleAutofeeder();
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
                console.log(`EntityManager: Removing larvae at (${larvae.x}, ${larvae.y})`);
                this.entities.larvae.splice(i, 1);
            }
        }
    }
    
    // Method to detect and resolve clustering of ants at the nest
    resolveNestClustering() {
        // Only check every 15 frames to save performance (increased frequency from 30)
        if (this.frameCounter % 15 !== 0) return;
        
        const nestX = this.nestPosition.x;
        const nestY = this.nestPosition.y;
        const checkRadius = 8; // Increased from 5 to cover more area
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
                
                if (distSq < checkRadius * checkRadius) {
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
    updateAntEntities(antEntities, shouldCreateTrail, isFlying = false) {
        for (let i = 0; i < antEntities.length; i++) {
            const ant = antEntities[i];
            
            // Update the ant with nest position and available foods
            const actionResult = ant.update(this.nestPosition, this.entities.foods);
            
            // Skip boundary checks for ants at the nest - allows ants to overlap at nest
            const distToNest = Math.sqrt(
                Math.pow(ant.x - this.nestPosition.x, 2) + 
                Math.pow(ant.y - this.nestPosition.y, 2)
            );
            
            const atNest = distToNest < 15;
            
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
                    
                    // Log when food is collected
                    console.log(`Ant collected food: Capacity=${ant.capacity}, CurrentWeight=${ant.capacityWeight}`);
                    
                } else if (ant.state === IdleAnts.Entities.AntBase.States.DELIVERING_FOOD || 
                           ant.state === IdleAnts.Entities.AntBase.States.RETURNING_TO_NEST) {
                    // Ant has returned to nest with food
                    this.deliverFood(ant);
                }
            }
        }
    }
    
    collectFood(ant) {
        // If the ant is still in the collecting state but hasn't finished the timer, just return
        if (ant.state === IdleAnts.Entities.AntBase.States.COLLECTING_FOOD && ant.collectionTimer < ant.collectionTarget.getCollectionTimeForAnt(ant)) {
            return;
        }
        
        console.log(`=== Ant collecting food, BEFORE: Capacity=${ant.capacity}, CurrentWeight=${ant.capacityWeight}, FoodCollected=${ant.foodCollected} ===`);
        
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
        
        console.log(`Food item: Type=${foodItem.foodType ? foodItem.foodType.id : 'unknown'}, Value=${foodValue}, Weight=${foodWeight}`);
        
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
            
            // Add a new food source at a certain chance on harvest
            if (Math.random() < 0.8) {
                this.createFood();
            }
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
        
        console.log(`=== Ant collecting food, AFTER: Capacity=${ant.capacity}, CurrentWeight=${ant.capacityWeight}, FoodCollected=${ant.foodCollected}, State=${ant.state} ===`);
    }
    
    deliverFood(ant) {
        // Drop food and add to resources based on ant's strength and food value
        const foodResult = ant.dropFood();
        const foodAmount = foodResult.totalValue * this.resourceManager.stats.foodMultiplier;
        
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
    }
    
    // Generic method to update speed for any ant type
    updateAntEntitiesSpeed(antEntities, multiplier) {
        for (let i = 0; i < antEntities.length; i++) {
            antEntities[i].updateSpeedMultiplier(multiplier);
        }
    }
    
    // Method to increase all ants' strength
    updateAntsCapacity() {
        this.updateAntEntitiesStrength(this.entities.ants);
        this.updateAntEntitiesStrength(this.entities.flyingAnts);
    }
    
    updateAntEntitiesStrength(antEntities) {
        const currentStrength = this.resourceManager.stats.strengthMultiplier;
        for (let i = 0; i < antEntities.length; i++) {
            // Set the capacity directly to the strength value
            antEntities[i].capacity = currentStrength;
            
            // Ensure the canStackFood config is updated based on capacity
            antEntities[i].config.canStackFood = antEntities[i].capacity > 1;
            
            // Log capacity and canStackFood status
            console.log(`Updating ant strength: capacity=${antEntities[i].capacity}, canStackFood=${antEntities[i].config.canStackFood}`);
            
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
            console.log(`Cannot create more ants, colony at capacity (${this.entities.ants.length}/${this.resourceManager.stats.maxAnts})`);
            return;
        }
        
        console.log(`Creating ant from larvae. Colony size: ${this.entities.ants.length}/${this.resourceManager.stats.maxAnts}`);
        
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
            console.log(`Creating ant from larvae at position (${x}, ${y})`);
        } else {
            ant.x = this.nestPosition.x;
            ant.y = this.nestPosition.y;
            console.log('Creating ant from larvae at nest position');
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
            console.log(`Queen now has ${this.entities.queen.currentLarvae} larvae after ant creation`);
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
            
            // Spawn 1-3 food items at random
            const foodCount = 1 + Math.floor(Math.random() * 3);
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
} 