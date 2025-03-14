// src/managers/EntityManager.js
IdleAnts.Managers.EntityManager = class {
    constructor(app, assetManager, resourceManager) {
        this.app = app;
        this.assetManager = assetManager;
        this.resourceManager = resourceManager;
        this.effectManager = null; // Will be set after initialization
        
        // Create containers for game objects
        this.entitiesContainers = {
            ants: new PIXI.Container(),
            flyingAnts: new PIXI.Container(),
            food: new PIXI.Container(),
            nest: new PIXI.Container(),
            trails: new PIXI.Container()
        };
        
        // Add containers in the correct order
        this.app.stage.addChild(this.entitiesContainers.nest);
        this.app.stage.addChild(this.entitiesContainers.trails);
        this.app.stage.addChild(this.entitiesContainers.food);
        this.app.stage.addChild(this.entitiesContainers.ants);
        this.app.stage.addChild(this.entitiesContainers.flyingAnts);
        
        // Entity collections
        this.entities = {
            ants: [],
            flyingAnts: [],
            foods: [],
            trails: []
        };
        
        this.nest = null;
        this.nestPosition = null;
        
        // Trail settings
        this.trailInterval = 10;
        this.frameCounter = 0;
    }
    
    setEffectManager(effectManager) {
        this.effectManager = effectManager;
    }
    
    setupEntities() {
        // Create nest
        this.createNest();
        
        // Create initial ants
        this.createAnt();
        
        // Create food sources
        this.createFood(5);
    }
    
    createNest() {
        const nest = new IdleAnts.Entities.Nest(
            this.assetManager.getTexture('nest'),
            this.app.screen.width / 2,
            this.app.screen.height / 2
        );
        
        this.entitiesContainers.nest.addChild(nest);
        this.nest = nest;
        this.nestPosition = nest.getPosition();
    }
    
    createAnt() {
        const ant = new IdleAnts.Entities.Ant(
            this.assetManager.getTexture('ant'), 
            this.nestPosition,
            this.resourceManager.stats.speedMultiplier
        );
        
        // Initialize with the current capacity level based on strength
        for (let i = 1; i < this.resourceManager.stats.strengthMultiplier; i++) {
            ant.increaseCapacity();
        }
        
        this.entitiesContainers.ants.addChild(ant);
        this.entities.ants.push(ant);
        
        // Add a spawning effect
        if (this.effectManager) {
            this.effectManager.createSpawnEffect(ant.x, ant.y);
        }
    }
    
    createFlyingAnt() {
        const flyingAnt = new IdleAnts.Entities.FlyingAnt(
            this.assetManager.getTexture('ant'),
            this.nestPosition,
            this.resourceManager.stats.speedMultiplier
        );
        
        // Initialize with the current capacity level based on strength
        for (let i = 1; i < this.resourceManager.stats.strengthMultiplier; i++) {
            flyingAnt.increaseCapacity();
        }
        
        this.entitiesContainers.flyingAnts.addChild(flyingAnt);
        this.entities.flyingAnts.push(flyingAnt);
        
        // Add a sparkly spawning effect for flying ants
        if (this.effectManager) {
            this.effectManager.createSpawnEffect(flyingAnt.x, flyingAnt.y, 0xFFD700);
        }
    }
    
    createFood(count = 1) {
        for (let i = 0; i < count; i++) {
            const x = Math.random() * this.app.screen.width;
            const y = Math.random() * this.app.screen.height;
            
            // Get a random food type based on rarity weights
            const foodType = IdleAnts.Data.FoodTypeUtils.getRandomFoodType();
            
            this.addFood({ x, y }, foodType);
        }
    }
    
    addFood(position, foodType) {
        // Use the specified food type or get a random one if not provided
        const type = foodType || IdleAnts.Data.FoodTypeUtils.getRandomFoodType();
        
        const food = new IdleAnts.Entities.Food(this.assetManager.getTexture('food'), position, type);
        this.entitiesContainers.food.addChild(food);
        this.entities.foods.push(food);
        
        // Add a spawn effect for manually placed food
        if (position.clickPlaced && this.effectManager) {
            // Use food type color for the effect
            this.effectManager.createFoodSpawnEffect(position.x, position.y, type.glowColor);
        }
        
        return food;
    }
    
    update() {
        // Update frame counter for trails
        this.frameCounter++;
        const shouldCreateTrail = this.frameCounter % this.trailInterval === 0;
        
        // Update all ant types
        this.updateAntEntities(this.entities.ants, shouldCreateTrail, this.createTrail.bind(this));
        this.updateAntEntities(this.entities.flyingAnts, shouldCreateTrail, this.createFlyingAntTrail.bind(this));
        
        // Update trail particles
        this.updateTrails();
        
        // Update food items
        for (let i = 0; i < this.entities.foods.length; i++) {
            this.entities.foods[i].update();
        }
    }
    
    // Generic method to update any type of ant entities
    updateAntEntities(antEntities, shouldCreateTrail, createTrailFunc) {
        for (let i = 0; i < antEntities.length; i++) {
            const ant = antEntities[i];
            const actionResult = ant.update(this.nestPosition, this.entities.foods);
            
            // Handle boundary checking
            ant.handleBoundaries(this.app.screen.width, this.app.screen.height);
            
            // Create trail behind the ant if needed
            const isFlyingAnt = ant.constructor.name.includes('Flying');
            const trailChance = isFlyingAnt ? 0.3 : 1.0; // Flying ants leave fewer trails
            
            if (shouldCreateTrail && Math.random() < trailChance) {
                createTrailFunc(ant);
            }
            
            // Check for food collection or delivery
            if (actionResult === true) {
                // Check if the ant is returning to nest or collecting food
                if (ant.foodCollected > 0 && (ant.isAtFullCapacity || this.entities.foods.length === 0)) {
                    // Ant has returned to nest with food
                    this.deliverFood(ant);
                } else {
                    // Ant has reached food - start or finish collecting
                    this.collectFood(ant);
                    
                    // If a flying ant collected food, create a special effect
                    if (isFlyingAnt && this.effectManager) {
                        this.effectManager.createFoodCollectEffect(ant.x, ant.y, 0xFFD700);
                    }
                }
            }
        }
    }
    
    createTrail(ant) {
        // Create a small trail particle where the ant has been
        const trail = new PIXI.Graphics();
        const trailColor = ant.isAtFullCapacity ? 0xFFD700 : 0xFFFFFF; // Gold for food-carrying ants, white for others
        const trailAlpha = ant.isAtFullCapacity ? 0.25 : 0.15;
        
        trail.beginFill(trailColor, trailAlpha);
        trail.drawCircle(0, 0, 1.5);
        trail.endFill();
        
        trail.x = ant.x;
        trail.y = ant.y;
        trail.alpha = trailAlpha;
        trail.timeToLive = 120; // How long the trail lasts (in frames)
        
        this.entitiesContainers.trails.addChild(trail);
        this.entities.trails.push(trail);
    }
    
    createFlyingAntTrail(flyingAnt) {
        // Create a sparkly trail particle where the flying ant has been
        const trail = new PIXI.Graphics();
        const trailColor = flyingAnt.isAtFullCapacity ? 0xFFD700 : 0xAAFFFF; // Gold for food-carrying, light blue otherwise
        const trailAlpha = flyingAnt.isAtFullCapacity ? 0.35 : 0.25;
        
        trail.beginFill(trailColor, trailAlpha);
        trail.drawCircle(0, 0, 2); // Slightly larger than regular ant trails
        trail.endFill();
        
        // Add a subtle glow
        trail.beginFill(trailColor, trailAlpha * 0.3);
        trail.drawCircle(0, 0, 4);
        trail.endFill();
        
        trail.x = flyingAnt.x;
        trail.y = flyingAnt.y;
        trail.alpha = trailAlpha;
        trail.timeToLive = 40; // Shorter trail lifetime for flying ants
        // Floating behavior for flying ant trails
        trail.floatSpeed = Math.random() * 0.2 - 0.1;
        
        this.entitiesContainers.trails.addChild(trail);
        this.entities.trails.push(trail);
    }
    
    updateTrails() {
        // Fade and eventually remove trails
        for (let i = this.entities.trails.length - 1; i >= 0; i--) {
            const trail = this.entities.trails[i];
            trail.timeToLive--;
            
            // Apply floating effect for flying ant trails
            if (trail.floatSpeed) {
                trail.y += trail.floatSpeed;
            }
            
            if (trail.timeToLive <= 0) {
                this.entitiesContainers.trails.removeChild(trail);
                this.entities.trails.splice(i, 1);
            } else {
                // Gradually fade out
                const initialAlpha = trail.isAtFullCapacity ? 0.35 : 0.25;
                trail.alpha = trail.timeToLive / 120 * initialAlpha;
            }
        }
    }
    
    collectFood(ant) {
        // If the ant is collecting (delay for heavier food), we shouldn't remove the food yet
        if (ant.isCollecting) return;
        
        if (!ant.targetFood) return;
        
        // Get ant type info
        const isFlyingAnt = ant.constructor.name.includes('Flying');
        const isCookie = ant.targetFood.foodType && ant.targetFood.foodType.id === 'cookie';
        
        // Remove the food from the game
        const index = this.entities.foods.indexOf(ant.targetFood);
        if (index > -1) {
            const food = this.entities.foods[index];
            this.entities.foods.splice(index, 1);
            this.entitiesContainers.food.removeChild(food);
            
            // Mark ant as carrying food and pass the food type
            ant.pickUpFood(food.foodType);
            
            // Create a small food particle effect on collection
            if (this.effectManager) {
                // Use food type color for the effect
                this.effectManager.createFoodCollectEffect(ant.x, ant.y, food.foodType.glowColor);
            }
            
            // For flying ants collecting cookies, add extra visual effects
            if (isFlyingAnt && isCookie && this.effectManager) {
                // Add a more dramatic effect for flying ants with cookies
                for (let i = 0; i < 5; i++) {
                    setTimeout(() => {
                        const angle = Math.random() * Math.PI * 2;
                        const distance = 5 + Math.random() * 8;
                        const x = ant.x + Math.cos(angle) * distance;
                        const y = ant.y + Math.sin(angle) * distance;
                        this.effectManager.createFoodCollectEffect(x, y, 0xFFD700);
                    }, i * 100);
                }
            }
            
            // Add a new food source randomly
            if (Math.random() < 0.7) {
                this.createFood();
            }
            
            // If the ant hasn't reached its carrying capacity, make it immediately look for more food
            if (!ant.isAtFullCapacity && this.entities.foods.length > 0) {
                // Find the closest food for the ant
                let closestFood = null;
                let closestDistance = Infinity;
                
                for (let i = 0; i < this.entities.foods.length; i++) {
                    const foodItem = this.entities.foods[i];
                    const dx = foodItem.x - ant.x;
                    const dy = foodItem.y - ant.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    // Only consider food that will fit in remaining capacity
                    const foodWeight = foodItem.foodType ? foodItem.foodType.weight : 1;
                    if (ant.capacityWeight + foodWeight <= ant.capacity && distance < closestDistance) {
                        closestDistance = distance;
                        closestFood = foodItem;
                    }
                }
                
                // Set the ant's target to the closest food
                if (closestFood) {
                    ant.targetFood = closestFood;
                    
                    // Explicitly set isAtFullCapacity to false to override any incorrect setting
                    ant.isAtFullCapacity = false;
                }
            } else if (ant.isAtFullCapacity) {
                // If at capacity, make sure the flag is set correctly
                ant.isAtFullCapacity = true;
            }
        }
    }
    
    deliverFood(ant) {
        // Drop food and add to resources based on ant's strength and food value
        const foodResult = ant.dropFood();
        const foodAmount = foodResult.totalValue * this.resourceManager.stats.foodMultiplier;
        
        this.resourceManager.addFood(foodAmount);
        
        // Add food drop effect at nest
        if (this.effectManager) {
            // Use the last food type color for the effect, or default if none
            const effectColor = foodResult.lastFoodType ? foodResult.lastFoodType.glowColor : 0xFFFF99;
            this.effectManager.createFoodDropEffect(this.nestPosition.x, this.nestPosition.y, effectColor);
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
    
    // Method to increase all ants' capacity
    updateAntsCapacity() {
        this.updateAntEntitiesCapacity(this.entities.ants);
        this.updateAntEntitiesCapacity(this.entities.flyingAnts);
    }
    
    updateAntEntitiesCapacity(antEntities) {
        for (let i = 0; i < antEntities.length; i++) {
            antEntities[i].increaseCapacity();
        }
    }
} 