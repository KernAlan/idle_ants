// src/entities/QueenAnt.js
IdleAnts.Entities.QueenAnt = class extends IdleAnts.Entities.AntBase {
    constructor(texture, nestPosition, speedMultiplier = 1) {
        // Call parent constructor with speed factor of 0.3 (queen is much slower)
        super(texture, nestPosition, speedMultiplier, 0.3);
        
        // CRITICAL: Ensure position is set directly at the nest
        this.x = nestPosition.x;
        this.y = nestPosition.y;
        
        // Queen-specific properties
        this.isQueen = true;
        
        // Queen health system - high HP as she's the most important
        this.maxHp = 1000;
        this.hp = this.maxHp;
        this.healthBarTimer = 0;
        
        // Make queen targetable by enemies
        this.isTargetable = true;
        this.targetPriority = 10; // High priority target for enemies
        
        // Larvae production settings
        this.baseProductionRate = 30 * 60; // Base rate: 30 seconds at 60fps (0.5 minute) - FASTER!
        this.productionVariance = 15 * 60; // Variance: +/- 15 seconds (0.25 minute)
        this.setNextProductionTime(); // Initialize the first production time
        this.larvaeCounter = 0;
        this.larvaeCapacity = 3; // Maximum number of larvae that can be produced at once
        this.currentLarvae = 0;
        
        // Override stuck detection settings for queen (less sensitive)
        this.minMovementSpeed = this.speed * 0.1;
        this.stuckThreshold = 1.5;
        
        // Queen has slower turn rate
        this.turnSpeed = 0.05 + Math.random() * 0.1;
        
        // Scale the queen to be larger
        this.scale.set(1.5);
        
        // Override state to always be SPAWNING or near-nest state
        this.transitionToState(IdleAnts.Entities.AntBase.States.SPAWNING);
    }
    
    // Set a random production time for the next larvae
    setNextProductionTime() {
        // Random time between baseProductionRate ± productionVariance
        this.larvaeProductionRate = this.baseProductionRate + 
            Math.floor((Math.random() * 2 - 1) * this.productionVariance);
        
        // Ensure it's at least 1 minute (60 seconds = 3600 frames)
        this.larvaeProductionRate = Math.max(20 * 60, this.larvaeProductionRate); // Minimum 20 seconds
        
        // Log the next production time for debugging
        // console.log(`Queen will produce next larvae in ${this.larvaeProductionRate/60} seconds (${this.larvaeProductionRate/3600} minutes)`);
    }
    
    // Override base scale for queen ant
    getBaseScale() {
        return 1.5; // Queen is larger than regular ants
    }
    
    // Implement type-specific visual elements
    createTypeSpecificElements() {
        // Create legs like regular ant
        this.createLegs();
    }
    
    createLegs() {
        // Create container for legs
        this.legsContainer = new PIXI.Container();
        this.addChild(this.legsContainer);
        
        // Create each pair of legs - these will be animated
        this.legs = [];
        
        // Leg positions (relative to ant center)
        const legPositions = [
            {x: 0, y: -8}, // Front legs
            {x: 0, y: -2}, // Middle legs
            {x: 0, y: 6}   // Rear legs
        ];
        
        // Create each pair of legs
        for (let i = 0; i < 3; i++) {
            // Left leg
            const leftLeg = new PIXI.Graphics();
            leftLeg.lineStyle(1.5, 0x2A1B10);
            leftLeg.moveTo(0, 0);
            leftLeg.lineTo(-8, -5);
            leftLeg.position.set(-5, legPositions[i].y);
            leftLeg.baseY = legPositions[i].y;
            leftLeg.index = i;
            leftLeg.side = 'left';
            
            // Right leg
            const rightLeg = new PIXI.Graphics();
            rightLeg.lineStyle(1.5, 0x2A1B10);
            rightLeg.moveTo(0, 0);
            rightLeg.lineTo(8, -5);
            rightLeg.position.set(5, legPositions[i].y);
            rightLeg.baseY = legPositions[i].y;
            rightLeg.index = i;
            rightLeg.side = 'right';
            
            this.legsContainer.addChild(leftLeg);
            this.legsContainer.addChild(rightLeg);
            
            this.legs.push(leftLeg, rightLeg);
        }
    }
    
    // Override update method to focus on larvae production and staying near nest
    update(nestPosition, foods) {
        // Store the nest position
        this.nestPosition = nestPosition;
        
        // Ensure health bar follows queen
        if (this.healthBarContainer) {
            this.healthBarContainer.x = this.x;
            this.healthBarContainer.y = this.y - 25;
            this.healthBarContainer.rotation = 0;
        }
        
        // Update movement
        this.updateMovement();
        
        // Update larvae production
        this.updateLarvaeProduction();
        
        // Update rotation based on movement direction
        this.updateRotation();
        
        // Update health bar visibility
        if (this.healthBarTimer > 0) {
            this.healthBarTimer--;
            if (this.healthBarTimer === 0 && this.healthBarContainer) {
                this.healthBarContainer.visible = false;
            }
        }
        
        // Perform animation
        this.performAnimation();
    }
    
    // Override to create queen-specific movement
    updateMovement() {
        // Calculate distance from nest
        const dx = this.x - this.nestPosition.x;
        const dy = this.y - this.nestPosition.y;
        const distanceFromNest = Math.sqrt(dx * dx + dy * dy);
        
        // Define the queen's territory - a ring around the nest
        const minDistance = 30; // Minimum distance from nest (inner ring)
        const maxDistance = 100; // Maximum distance from nest (outer ring)
        
        if (distanceFromNest > maxDistance) {
            // Too far from nest - move back toward nest
            const angleToNest = Math.atan2(this.nestPosition.y - this.y, this.nestPosition.x - this.x);
            this.vx = Math.cos(angleToNest) * this.speed * 1.5; // Faster return to territory
            this.vy = Math.sin(angleToNest) * this.speed * 1.5;
        } else if (distanceFromNest < minDistance) {
            // Too close to nest - move away from nest
            const angleFromNest = Math.atan2(this.y - this.nestPosition.y, this.x - this.nestPosition.x);
            this.vx = Math.cos(angleFromNest) * this.speed;
            this.vy = Math.sin(angleFromNest) * this.speed;
        } else {
            // Within the queen's territory - wander around
            this.wander();
            
            // Add a slight circular movement tendency to patrol around the nest
            const currentAngle = Math.atan2(dy, dx);
            const tangentialAngle = currentAngle + Math.PI / 2; // 90 degrees clockwise
            
            // Add a small tangential component to create a tendency to circle the nest
            this.vx += Math.cos(tangentialAngle) * this.speed * 0.1;
            this.vy += Math.sin(tangentialAngle) * this.speed * 0.1;
        }
        
        // Apply velocity
        this.x += this.vx;
        this.y += this.vy;
        
        // Apply momentum (damping)
        this.vx *= this.momentum;
        this.vy *= this.momentum;
    }
    
    updateLarvaeProduction() {
        // Sync capacity with global stats
        if (IdleAnts.app && IdleAnts.app.resourceManager) {
            this.larvaeCapacity = IdleAnts.app.resourceManager.stats.queenLarvaeCapacity;
        }
        
        // Check if the colony is at max capacity
        if (IdleAnts.app && IdleAnts.app.entityManager && 
            IdleAnts.app.resourceManager) {
            
            const currentAnts = IdleAnts.app.entityManager.entities.ants.length;
            const currentLarvae = IdleAnts.app.entityManager.entities.larvae.length;
            const maxAnts = IdleAnts.app.resourceManager.stats.maxAnts;
            
            // If colony is at or above max capacity accounting for existing larvae, don't produce
            if (currentAnts + currentLarvae >= maxAnts) {
                // Reset counter to avoid immediate production when space becomes available
                this.larvaeCounter = 0;
                return;
            }
        }
        
        // Increment larvae counter
        this.larvaeCounter++;
        
        // Check if it's time to produce larvae
        if (this.larvaeCounter >= this.larvaeProductionRate && this.currentLarvae < this.larvaeCapacity) {
            this.produceLarvae();
            this.larvaeCounter = 0;
            
            // Set a new random production time for the next larvae
            this.setNextProductionTime();
        }
    }
    
    produceLarvae() {
        // Double-check if the colony is at max capacity
        if (IdleAnts.app && IdleAnts.app.entityManager && 
            IdleAnts.app.resourceManager) {
            
            const currentAnts = IdleAnts.app.entityManager.entities.ants.length;
            const currentLarvae = IdleAnts.app.entityManager.entities.larvae.length;
            const maxAnts = IdleAnts.app.resourceManager.stats.maxAnts;
            
            // If colony is at max capacity, don't produce larvae
            if (currentAnts + currentLarvae >= maxAnts) {
                // console.log("Cannot produce larvae: colony at maximum capacity");
                return;
            }
        }
        
        // Create a single larvae entity near the queen
        if (IdleAnts.app && IdleAnts.app.entityManager) {
            try {
                // Calculate how many larvae to spawn based on queen level
                const queenLevel = IdleAnts.app.resourceManager ? IdleAnts.app.resourceManager.stats.queenUpgradeLevel : 0;
                const larvaeToSpawn = 1 + queenLevel; // 1 at level 0, 2 at level 1, etc.
                
                // console.log(`Queen level ${queenLevel} spawning ${larvaeToSpawn} larvae`);
                
                // Spawn multiple larvae based on queen level
                for(let i = 0; i < larvaeToSpawn; i++){
                    // Generate a random offset from the queen for each larvae
                    const angle = Math.random() * Math.PI * 2; // Random angle
                    const distance = 40 + Math.random() * 20; // Random distance between 40-60 pixels
                    const offsetX = Math.cos(angle) * distance;
                    const offsetY = Math.sin(angle) * distance;
                    
                    // Create a larvae entity at the offset position
                    IdleAnts.app.entityManager.produceLarvae(this.x + offsetX, this.y + offsetY);
                    
                    // Log for debugging
                    // console.log(`Queen produced larvae ${i+1}/${larvaeToSpawn} at (${this.x + offsetX}, ${this.y + offsetY})`);
                }
                
                // Also create a special effect at the queen's position
                if (IdleAnts.app.effectManager) {
                    IdleAnts.app.effectManager.createSpawnEffect(this.x, this.y, false);
                }
                
                // Increment current larvae count by the number spawned
                this.currentLarvae += larvaeToSpawn;
                // console.log(`Queen now has ${this.currentLarvae} larvae`);
            } catch (error) {
                console.error('Error creating larvae:', error);
            }
        }
    }
    
    // Implement queen-specific animation
    performAnimation() {
        this.animateLegs();
    }
    
    animateLegs() {
        // Update leg animation phase
        this.legPhase = (this.legPhase || 0) + 0.1; // Slower leg movement for queen
        
        // Speed-based animation rate - faster movement = faster leg movement
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        const animationRate = Math.max(0.1, speed * 0.3);
        
        // Animate each leg
        for (let i = 0; i < this.legs.length; i++) {
            const leg = this.legs[i];
            
            // Alternating leg movement pattern - opposite sides move in opposite phases
            let phase = this.legPhase + (leg.index * Math.PI / 3);
            if (leg.side === 'right') {
                phase += Math.PI; // Opposite phase for right legs
            }
            
            // Apply leg animation - a slight up and down movement
            const legMovement = Math.sin(phase) * 2;
            
            // For a walking motion, bend the legs when they're moving down
            if (leg.side === 'left') {
                leg.clear();
                leg.lineStyle(1.5, 0x2A1B10);
                leg.moveTo(0, 0);
                
                // Bend the leg differently based on the phase
                const bendFactor = Math.max(0, -Math.sin(phase));
                const midX = -4 - bendFactor * 2;
                const midY = legMovement - 2 - bendFactor * 2;
                leg.lineTo(midX, midY);
                leg.lineTo(-8, -5 + legMovement);
            } else {
                leg.clear();
                leg.lineStyle(1.5, 0x2A1B10);
                leg.moveTo(0, 0);
                
                // Bend the leg differently based on the phase
                const bendFactor = Math.max(0, -Math.sin(phase));
                const midX = 4 + bendFactor * 2;
                const midY = legMovement - 2 - bendFactor * 2;
                leg.lineTo(midX, midY);
                leg.lineTo(8, -5 + legMovement);
            }
        }
    }
    
    // Override wander method for more royal, deliberate movement
    wander() {
        // Queens move more deliberately with less random changes
        if (Math.random() < 0.01) { // 1% chance vs 5% for regular ants
            const angle = Math.random() * Math.PI * 2;
            this.vx = Math.cos(angle) * this.speed * 0.5; // Slower wandering
            this.vy = Math.sin(angle) * this.speed * 0.5;
        }
        
        // Add a very small random variation to prevent getting stuck
        this.vx += (Math.random() - 0.5) * this.speed * 0.05;
        this.vy += (Math.random() - 0.5) * this.speed * 0.05;
    }
    
    // Override boundary handling for queen - stays closer to nest
    handleBoundaries(width, height) {
        // Standard boundary handling
        if (this.x < 0) {
            this.x = 0;
            this.vx = Math.abs(this.vx);
        } else if (this.x > width) {
            this.x = width;
            this.vx = -Math.abs(this.vx);
        }
        
        if (this.y < 0) {
            this.y = 0;
            this.vy = Math.abs(this.vy);
        } else if (this.y > height) {
            this.y = height;
            this.vy = -Math.abs(this.vy);
        }
    }
    
    // Add method to handle rotation
    updateRotation() {
        // Only rotate if we're moving
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > 0.1) {
            // Calculate the angle of movement
            const targetAngle = Math.atan2(this.vy, this.vx) + Math.PI / 2; // Add 90 degrees because the ant sprite faces up
            
            // Initialize rotation if not set
            if (this.rotation === undefined) {
                this.rotation = targetAngle;
            }
            
            // Calculate the difference between current and target angle
            let angleDiff = targetAngle - this.rotation;
            
            // Normalize the angle difference to be between -PI and PI
            while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
            while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
            
            // Smooth rotation - interpolate towards the target angle
            // The lower the factor, the smoother (and slower) the rotation
            const rotationSpeed = 0.05; // Adjust this for smoother/slower rotation
            this.rotation += angleDiff * rotationSpeed;
        }
    }
    
    // Queen damage handling
    takeDamage(dmg) {
        console.log(`Queen taking ${dmg} damage! HP: ${this.hp} -> ${this.hp - dmg}`);
        this.hp -= dmg;
        this.healthBarTimer = 180; // Show health bar for 3 seconds
        this.updateHealthBar();
        
        // Create visual feedback
        if (IdleAnts.app && IdleAnts.app.effectManager) {
            IdleAnts.app.effectManager.createSpawnEffect(this.x, this.y - 20, true);
        }
        
        // Queen death triggers game over
        if (this.hp <= 0) {
            this.die();
        }
    }
    
    // Queen death handling
    die() {
        console.log('Queen has died! Game Over!');
        
        // Trigger lose condition in game
        if (IdleAnts.game && typeof IdleAnts.game.onQueenDeath === 'function') {
            IdleAnts.game.onQueenDeath();
        }
        
        // Remove from world
        if (this.parent) {
            this.parent.removeChild(this);
        }
        if (this.healthBarContainer && this.healthBarContainer.parent) {
            this.healthBarContainer.parent.removeChild(this.healthBarContainer);
        }
        
        this.isDead = true;
    }
    
    // Update health bar display
    updateHealthBar() {
        if (!this.healthBarContainer) {
            this.createHealthBar();
        }
        
        const ratio = Math.max(this.hp, 0) / this.maxHp;
        
        // Clear and redraw health bar
        this.healthBarFg.clear();
        this.healthBarFg.beginFill(ratio > 0.5 ? 0x00FF00 : ratio > 0.25 ? 0xFFFF00 : 0xFF0000);
        this.healthBarFg.drawRect(-10, 0, 20 * ratio, 3);
        this.healthBarFg.endFill();
        
        // Show health bar
        this.healthBarContainer.visible = true;
    }
    
    // Create health bar for queen
    createHealthBar() {
        // Create separate container for health bar (not affected by rotation)
        this.healthBarContainer = new PIXI.Container();
        if (IdleAnts.app && IdleAnts.app.worldContainer) {
            IdleAnts.app.worldContainer.addChild(this.healthBarContainer);
        } else {
            this.addChild(this.healthBarContainer);
        }
        this.healthBarContainer.visible = false;
        
        // Background bar
        this.healthBarBg = new PIXI.Graphics();
        this.healthBarBg.beginFill(0x000000, 0.6);
        this.healthBarBg.drawRect(-10, 0, 20, 3);
        this.healthBarBg.endFill();
        this.healthBarContainer.addChild(this.healthBarBg);
        
        // Foreground bar
        this.healthBarFg = new PIXI.Graphics();
        this.healthBarContainer.addChild(this.healthBarFg);
    }
}; 