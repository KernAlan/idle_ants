// AbilityManager - God Powers System for Ant Colony
// Inspired by WorldBox but themed for ant management

class AbilityManager {
    constructor(game) {
        this.game = game;
        this.abilities = this.initializeAbilities();
        this.activeEffects = new Map(); // Track active ability effects

        // Bind methods for event listeners
        this.onAbilityClick = this.onAbilityClick.bind(this);
    }

    initializeAbilities() {
        return {
            foodRain: {
                id: 'foodRain',
                name: 'Food Rain',
                description: 'Summon food from the sky',
                icon: '🌧️',
                cooldown: 60000, // 60 seconds
                lastUsed: 0,
                duration: 0, // Instant effect
                effect: this.activateFoodRain.bind(this)
            },
            speedSurge: {
                id: 'speedSurge',
                name: 'Speed Surge',
                description: 'All ants move 3x faster',
                icon: '⚡',
                cooldown: 45000, // 45 seconds
                lastUsed: 0,
                duration: 15000, // 15 seconds
                effect: this.activateSpeedSurge.bind(this)
            },
            antFrenzy: {
                id: 'antFrenzy',
                name: 'Mecha Minions',
                description: 'Summon robotic worker ants',
                icon: '🤖',
                cooldown: 90000, // 90 seconds
                lastUsed: 0,
                duration: 30000, // 30 seconds
                effect: this.activateAntFrenzy.bind(this)
            },
            berserkerMode: {
                id: 'berserkerMode',
                name: 'Berserker Mode',
                description: 'One ant becomes HUGE and POWERFUL',
                icon: '🔥',
                cooldown: 120000, // 120 seconds
                lastUsed: 0,
                duration: 45000, // 45 seconds
                effect: this.activateBerserkerMode.bind(this)
            },
            cloneArmy: {
                id: 'cloneArmy',
                name: 'Clone Army',
                description: 'Every ant spawns a shadow clone',
                icon: '👥',
                cooldown: 90000, // 90 seconds
                lastUsed: 0,
                duration: 30000, // 30 seconds
                effect: this.activateCloneArmy.bind(this)
            },
            meteorShower: {
                id: 'meteorShower',
                name: 'Meteor Shower',
                description: 'Meteors rain down, damaging enemies and leaving food',
                icon: '☄️',
                cooldown: 75000, // 75 seconds
                lastUsed: 0,
                duration: 0, // Instant but effect lasts ~5 seconds
                effect: this.activateMeteorShower.bind(this)
            }
        };
    }

    // Check if ability is ready to use
    isAbilityReady(abilityId) {
        const ability = this.abilities[abilityId];
        if (!ability) return false;

        const timeSinceLastUse = Date.now() - ability.lastUsed;
        return timeSinceLastUse >= ability.cooldown;
    }

    // Get remaining cooldown time in milliseconds
    getRemainingCooldown(abilityId) {
        const ability = this.abilities[abilityId];
        if (!ability) return 0;

        const timeSinceLastUse = Date.now() - ability.lastUsed;
        const remaining = ability.cooldown - timeSinceLastUse;
        return Math.max(0, remaining);
    }

    // Use an ability
    useAbility(abilityId) {
        const ability = this.abilities[abilityId];
        if (!ability) {
            console.warn(`Ability ${abilityId} not found`);
            return false;
        }

        // Check if ability is ready
        if (!this.isAbilityReady(abilityId)) {
            const remaining = Math.ceil(this.getRemainingCooldown(abilityId) / 1000);
            console.log(`Ability on cooldown: ${remaining}s remaining`);

            // Play error sound
            if (this.game.audioManager) {
                this.game.audioManager.playSound('error');
            }
            return false;
        }

        // Mark as used
        ability.lastUsed = Date.now();

        // Execute ability effect
        ability.effect();

        // Play activation sound
        if (this.game.audioManager) {
            this.game.audioManager.playSound('ability');
        }

        // Update UI
        this.updateAbilityUI();

        return true;
    }

    // ========== ABILITY IMPLEMENTATIONS ==========

    activateFoodRain() {
        console.log('🌧️ FOOD RAIN ACTIVATED - STORM INCOMING!');

        const entityManager = this.game.entityManager;
        const mapWidth = 3000;
        const mapHeight = 2000;
        const foodCount = 50; // OPTIMIZED: Reduced from 80 for better performance
        const rainDuration = 15000; // 15 SECOND EPIC STORM!

        // Lightning flash effect!
        this.createScreenFlash(0xFFFFFF, 0.4);
        setTimeout(() => this.createScreenFlash(0xFFFFFF, 0.3), 150);
        setTimeout(() => this.createScreenFlash(0x87CEEB, 0.2), 300);

        // Create storm clouds at top of screen
        this.createStormClouds(rainDuration);

        // Create rain particles falling from sky
        this.createRainEffect(rainDuration);

        // Mixed food types for variety!
        const foodTypes = [
            IdleAnts.Data.FoodTypes.BASIC,
            IdleAnts.Data.FoodTypes.APPLE,
            IdleAnts.Data.FoodTypes.COOKIE,
            IdleAnts.Data.FoodTypes.MARSHMALLOW,
            IdleAnts.Data.FoodTypes.MANGO,
        ];

        // Spawn food items with falling animation
        for (let i = 0; i < foodCount; i++) {
            const x = Math.random() * mapWidth;
            const y = Math.random() * mapHeight;

            // Weighted random food type (more common = more basic, rare chance for good stuff)
            const roll = Math.random();
            let foodType;
            if (roll < 0.4) {
                foodType = IdleAnts.Data.FoodTypes.BASIC; // 40% basic
            } else if (roll < 0.65) {
                foodType = IdleAnts.Data.FoodTypes.APPLE; // 25% apple
            } else if (roll < 0.85) {
                foodType = IdleAnts.Data.FoodTypes.COOKIE; // 20% cookie
            } else if (roll < 0.95) {
                foodType = IdleAnts.Data.FoodTypes.MARSHMALLOW; // 10% marshmallow
            } else {
                foodType = IdleAnts.Data.FoodTypes.MANGO; // 5% RARE mango!
            }

            // Stagger spawns with falling effect
            setTimeout(() => {
                // Create falling raindrop effect from sky (optimized - no intervals)
                this.createFallingFoodEffect(x, y, foodType.color);

                // Spawn actual food after "fall time"
                setTimeout(() => {
                    entityManager.addFood({ x, y }, foodType);

                    // OPTIMIZED: Reduced effects - only spawn effect, no extra particles except for rare food
                    if (this.game.effectManager && foodType === IdleAnts.Data.FoodTypes.MANGO) {
                        this.game.effectManager.createFoodSpawnEffect(x, y, foodType.color);
                    }
                }, 400); // Food appears after falling
            }, i * 300); // OPTIMIZED: Increased spacing from 188ms to 300ms
        }

        // BONUS: Ants get excited and move faster during the rain!
        this.activateRainSpeedBoost(rainDuration);

        // Random lightning flashes throughout the storm!
        const lightningIntervals = [3000, 6000, 9000, 12000]; // At 3s, 6s, 9s, 12s
        lightningIntervals.forEach(delay => {
            setTimeout(() => {
                this.createScreenFlash(0xFFFFFF, 0.3);
            }, delay);
        });

        console.log('🌧️ EPIC 15-SECOND FOOD STORM IN PROGRESS! Ants are HYPED!');
    }

    createStormClouds(duration) {
        if (!this.game.app) return;

        const clouds = new PIXI.Graphics();
        clouds.beginFill(0x505050, 0.6);

        // Draw several cloud shapes at top of screen
        for (let i = 0; i < 8; i++) {
            const x = (this.game.app.screen.width / 8) * i;
            clouds.drawEllipse(x + 50, 30, 80, 40);
            clouds.drawEllipse(x + 120, 30, 60, 30);
        }
        clouds.endFill();

        this.game.app.stage.addChild(clouds);

        // Fade out and remove
        let alpha = 0.6;
        const fadeInterval = setInterval(() => {
            alpha -= 0.02;
            clouds.alpha = alpha;
            if (alpha <= 0) {
                clearInterval(fadeInterval);
                if (clouds.parent) {
                    this.game.app.stage.removeChild(clouds);
                }
            }
        }, 50);
    }

    createRainEffect(duration) {
        if (!this.game.app) return;

        const raindrops = [];
        const raindropCount = 150; // OPTIMIZED: Reduced from 400 for better performance

        // Create lots of raindrops
        for (let i = 0; i < raindropCount; i++) {
            const drop = new PIXI.Graphics();
            drop.lineStyle(2, 0x87CEEB, 0.5);
            drop.moveTo(0, 0);
            drop.lineTo(0, 10);

            drop.x = Math.random() * this.game.app.screen.width;
            drop.y = Math.random() * -this.game.app.screen.height;
            drop.velocity = 8 + Math.random() * 4;

            this.game.app.stage.addChild(drop);
            raindrops.push(drop);
        }

        // Animate rain falling
        const startTime = Date.now();
        const rainInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;

            if (elapsed > duration) {
                clearInterval(rainInterval);
                // Clean up raindrops
                raindrops.forEach(drop => {
                    if (drop.parent) {
                        this.game.app.stage.removeChild(drop);
                    }
                });
                return;
            }

            raindrops.forEach(drop => {
                drop.y += drop.velocity;

                // Reset to top when it falls off screen
                if (drop.y > this.game.app.screen.height) {
                    drop.y = -20;
                    drop.x = Math.random() * this.game.app.screen.width;
                }
            });
        }, 16); // ~60fps
    }

    createFallingFoodEffect(targetX, targetY, color) {
        if (!this.game.app) return;

        // OPTIMIZED: Create simple visual trail without expensive setInterval
        // Just create a few particles along the fall path
        for (let i = 0; i < 3; i++) {
            const particle = new PIXI.Graphics();
            particle.beginFill(color, 0.6 - i * 0.15);
            particle.drawCircle(0, 0, 6 - i);
            particle.endFill();

            particle.x = targetX;
            particle.y = -50 + (i * 30);

            this.game.worldContainer.addChild(particle);

            // Simple fade and remove - no interval needed
            setTimeout(() => {
                if (particle.parent) {
                    this.game.worldContainer.removeChild(particle);
                }
            }, 300 + (i * 100));
        }
    }

    activateRainSpeedBoost(duration) {
        console.log('⚡ Ants are excited by the food rain!');

        const ants = [
            ...(this.game.entityManager?.entities?.ants || []),
            ...(this.game.entityManager?.entities?.flyingAnts || []),
            ...(this.game.entityManager?.entities?.carAnts || []),
            ...(this.game.entityManager?.entities?.fireAnts || [])
        ];

        // Speed boost during rain
        const originalSpeeds = new Map();
        ants.forEach(ant => {
            originalSpeeds.set(ant, ant.speed);
            ant.speed *= 1.5; // 50% speed boost

            // Add excited sparkle effect
            if (ant.sprite) {
                ant.sprite.tint = 0xCCFFFF; // Light blue tint
            }
        });

        // Restore speeds after rain ends
        setTimeout(() => {
            ants.forEach(ant => {
                const originalSpeed = originalSpeeds.get(ant);
                if (originalSpeed !== undefined) {
                    ant.speed = originalSpeed;
                }
                if (ant.sprite) {
                    ant.sprite.tint = 0xFFFFFF; // Reset tint
                }
            });
            console.log('🌤️ Rain has ended, ants returning to normal speed');
        }, duration);
    }

    activateSpeedSurge() {
        console.log('⚡ SPEED SURGE ACTIVATED - TURBO MODE!');

        const duration = this.abilities.speedSurge.duration;

        // Get ALL ant types from entityManager
        const allAnts = [
            ...(this.game.entityManager?.entities?.ants || []),
            ...(this.game.entityManager?.entities?.flyingAnts || []),
            ...(this.game.entityManager?.entities?.carAnts || []),
            ...(this.game.entityManager?.entities?.fireAnts || []),
            ...(this.game.entityManager?.entities?.fatAnts || []),
            ...(this.game.entityManager?.entities?.gasAnts || []),
            ...(this.game.entityManager?.entities?.electricAnts || []),
            ...(this.game.entityManager?.entities?.bananaThrowingAnts || []),
            ...(this.game.entityManager?.entities?.dpsAnts || []),
            ...(this.game.entityManager?.entities?.acidAnts || []),
            ...(this.game.entityManager?.entities?.rainbowAnts || []),
            ...(this.game.entityManager?.entities?.smokeAnts || []),
            ...(this.game.entityManager?.entities?.leafCutterAnts || []),
            ...(this.game.entityManager?.entities?.juiceAnts || []),
            ...(this.game.entityManager?.entities?.crabAnts || []),
            ...(this.game.entityManager?.entities?.spiderAnts || [])
        ];

        // Store original speeds and apply boost
        const originalData = new Map();

        allAnts.forEach(ant => {
            // Store original values
            originalData.set(ant, {
                speed: ant.speed,
                maxVelocity: ant.maxVelocity,
                originalSpeed: ant.originalSpeed
            });

            // Apply 3x speed boost
            ant.speed *= 3;
            ant.maxVelocity *= 3;
            ant.originalSpeed *= 3;

            // Visual: Add yellow lightning overlay
            if (ant.sprite) {
                ant.sprite.tint = 0xFFFF00; // Bright yellow tint
            }

            // Add initial speed burst effect
            if (this.game.effectManager) {
                this.game.effectManager.createFoodCollectEffect(ant.x, ant.y, 0xFFFF00, 1.5);
            }
        });

        // Track active effect
        this.activeEffects.set('speedSurge', {
            startTime: Date.now(),
            duration: duration,
            originalData: originalData,
            ants: allAnts
        });

        // Create ongoing speed trail effects during surge - VERY VISIBLE!
        const trailInterval = setInterval(() => {
            if (!this.activeEffects.has('speedSurge')) {
                clearInterval(trailInterval);
                return;
            }

            allAnts.forEach(ant => {
                if (ant && ant.x && ant.y) {
                    // Create yellow sparkle trail particles
                    if (this.game.effectManager) {
                        this.game.effectManager.createFoodCollectEffect(ant.x, ant.y, 0xFFFF00, 1.2);
                    }

                    // Create additional motion blur trail
                    this.createSpeedTrail(ant.x, ant.y);
                }
            });
        }, 100); // Create trails every 100ms for ALL ants

        // Restore speeds after duration
        setTimeout(() => {
            clearInterval(trailInterval);

            allAnts.forEach(ant => {
                const data = originalData.get(ant);
                if (data && ant) {
                    ant.speed = data.speed;
                    ant.maxVelocity = data.maxVelocity;
                    ant.originalSpeed = data.originalSpeed;

                    // Remove visual effect
                    if (ant.sprite) {
                        ant.sprite.tint = 0xFFFFFF; // Reset tint
                    }
                }
            });

            this.activeEffects.delete('speedSurge');
            console.log('⚡ Speed Surge ended - ants back to normal speed');
        }, duration);

        // Triple screen pulse effect
        this.createScreenFlash(0xFFFF00, 0.2);
        setTimeout(() => this.createScreenFlash(0xFFFF00, 0.15), 100);
        setTimeout(() => this.createScreenFlash(0xFFFF00, 0.1), 200);

        console.log(`⚡ ${allAnts.length} ants now moving at TRIPLE SPEED!`);
    }

    createSpeedTrail(x, y) {
        if (!this.game.worldContainer) return;

        // Create a visible yellow trail circle
        const trail = new PIXI.Graphics();
        trail.beginFill(0xFFFF00, 0.6); // Bright yellow
        trail.drawCircle(0, 0, 6);
        trail.endFill();

        trail.x = x;
        trail.y = y;

        this.game.worldContainer.addChild(trail);

        // Fade out and remove
        let alpha = 0.6;
        const fadeInterval = setInterval(() => {
            alpha -= 0.1;
            trail.alpha = alpha;

            if (alpha <= 0) {
                clearInterval(fadeInterval);
                if (trail.parent) {
                    this.game.worldContainer.removeChild(trail);
                }
            }
        }, 30);
    }

    activateAntFrenzy() {
        console.log('🤖 MECHA MINIONS ACTIVATED - ROBOT ARMY ONLINE!');

        const duration = this.abilities.antFrenzy.duration;
        const tempAntCount = 10;
        const tempAnts = [];

        // Spawn temporary robotic worker ants using EntityManager's createAnt method
        for (let i = 0; i < tempAntCount; i++) {
            if (!this.game.entityManager) continue;

            // Create ant at nest (EntityManager handles positioning)
            this.game.entityManager.createAnt();

            // Get the last created ant
            const ants = this.game.entityManager.entities.ants;
            const ant = ants[ants.length - 1];

            if (ant) {
                tempAnts.push(ant);
                ant.isTemporary = true; // Mark as temporary
                ant.isMechaMinion = true; // Mark as robot

                // Nerf combat power: Mecha Minions are only 50% as strong as regular ants
                ant.attackDamage = ant.attackDamage * 0.5;

                // Visual: Complete robot transformation - REPLACE THE BODY!
                this.createMechaBody(ant);

                // Visual: Blue tech spawn effect with circuit particles
                if (this.game.effectManager) {
                    this.game.effectManager.createSpawnEffect(ant.x, ant.y, false);
                    this.game.effectManager.createFoodCollectEffect(ant.x, ant.y, 0x00FFFF, 2.0);
                    this.game.effectManager.createFoodCollectEffect(ant.x, ant.y, 0x0099FF, 1.5);
                }
            }
        }

        // Create continuous tech particle effects for all mecha minions
        const techEffectInterval = setInterval(() => {
            tempAnts.forEach(ant => {
                if (ant && !ant.isDead && this.game.effectManager) {
                    // Small blue circuit particles
                    if (Math.random() < 0.3) {
                        this.createCircuitParticle(ant.x, ant.y);
                    }
                }
            });
        }, 200);

        // Store interval for cleanup
        this.mechaEffectInterval = techEffectInterval;

        // Track active effect
        this.activeEffects.set('antFrenzy', {
            startTime: Date.now(),
            duration: duration,
            tempAnts: tempAnts
        });

        // Remove temporary ants after duration
        setTimeout(() => {
            // Clear tech effect interval
            if (this.mechaEffectInterval) {
                clearInterval(this.mechaEffectInterval);
                this.mechaEffectInterval = null;
            }

            tempAnts.forEach(ant => {
                if (ant && this.game.entityManager) {
                    // Despawn with blue tech particle effect
                    if (this.game.effectManager && ant.x && ant.y) {
                        this.game.effectManager.createFoodCollectEffect(ant.x, ant.y, 0x00FFFF, 2.0);
                        this.game.effectManager.createFoodCollectEffect(ant.x, ant.y, 0x0099FF, 1.5);
                    }

                    // Clean up HP bar if it exists
                    if (ant.healthBarContainer && ant.healthBarContainer.parent) {
                        ant.healthBarContainer.parent.removeChild(ant.healthBarContainer);
                    }

                    // Remove ant from display and array
                    if (ant.parent) {
                        ant.parent.removeChild(ant);
                    }

                    const ants = this.game.entityManager.entities.ants;
                    const index = ants.indexOf(ant);
                    if (index !== -1) {
                        ants.splice(index, 1);
                    }

                    // No need to update resource manager count - mecha minions don't affect ant count
                    // Just update the food per second calculation
                    if (this.game.resourceManager) {
                        this.game.resourceManager.updateFoodPerSecond();
                    }
                }
            });

            this.activeEffects.delete('antFrenzy');
            console.log('🤖 Mecha Minions have powered down!');
        }, duration);

        // Blue tech screen flash effect
        this.createScreenFlash(0x00FFFF, 0.3);
        setTimeout(() => this.createScreenFlash(0x0099FF, 0.2), 100);

        console.log('🤖 ROBOT ARMY DEPLOYED - 10 MECHA MINIONS ONLINE!');
    }

    activateBerserkerMode() {
        console.log('🔥 BERSERKER MODE ACTIVATED - ONE ANT GOES BERSERK!');

        const duration = this.abilities.berserkerMode.duration;

        // Get all ants
        const allAnts = [
            ...(this.game.entityManager?.entities?.ants || []),
            ...(this.game.entityManager?.entities?.flyingAnts || []),
            ...(this.game.entityManager?.entities?.carAnts || []),
            ...(this.game.entityManager?.entities?.fireAnts || [])
        ].filter(ant => ant && !ant.isDead);

        if (allAnts.length === 0) {
            console.log('No ants available for berserker mode!');
            return;
        }

        // Pick ONE random ant to become the BERSERKER
        const berserkerAnt = allAnts[Math.floor(Math.random() * allAnts.length)];

        // Store original properties
        const originalData = {
            scale: berserkerAnt.scale.x,
            speed: berserkerAnt.speed,
            originalSpeed: berserkerAnt.originalSpeed,
            maxVelocity: berserkerAnt.maxVelocity,
            baseScale: berserkerAnt.baseScale,
            foodValueMultiplier: berserkerAnt.foodValueMultiplier || 1
        };

        // TRANSFORM INTO BERSERKER!
        const newScale = originalData.scale * 2; // Perfect size - noticeable but not overwhelming!
        berserkerAnt.scale.set(newScale, newScale);
        berserkerAnt.speed *= 5; // 5x SPEED!
        berserkerAnt.originalSpeed *= 5;
        berserkerAnt.maxVelocity *= 5;
        berserkerAnt.foodValueMultiplier = 10; // Collects 10x food value!
        berserkerAnt.isBerserker = true;

        console.log(`🔥 BERSERKER TRANSFORMED! Size: ${originalData.scale} → ${newScale}`);

        // Visual: ANGRY RED GLOW
        if (berserkerAnt.sprite) {
            berserkerAnt.sprite.tint = 0xFF0000; // Bright red
        }

        // Epic transformation effect - HUGE explosions
        if (this.game.effectManager) {
            for (let i = 0; i < 10; i++) {
                setTimeout(() => {
                    this.game.effectManager.createFoodCollectEffect(
                        berserkerAnt.x + (Math.random() - 0.5) * 50,
                        berserkerAnt.y + (Math.random() - 0.5) * 50,
                        0xFF0000,
                        3.0
                    );
                }, i * 50);
            }
        }

        // Track active effect
        this.activeEffects.set('berserkerMode', {
            startTime: Date.now(),
            duration: duration,
            berserkerAnt: berserkerAnt,
            originalData: originalData
        });

        // Create continuous RAGE effects (smoke, fire particles) - VERY VISIBLE!
        const rageInterval = setInterval(() => {
            if (!this.activeEffects.has('berserkerMode') || berserkerAnt.isDead) {
                clearInterval(rageInterval);
                return;
            }

            if (berserkerAnt.x && berserkerAnt.y) {
                // Create MASSIVE red smoke rings
                for (let i = 0; i < 3; i++) {
                    this.createRageParticle(
                        berserkerAnt.x + (Math.random() - 0.5) * 40,
                        berserkerAnt.y + (Math.random() - 0.5) * 40,
                        0xFF0000
                    );
                }

                // Create orange fire particles
                for (let i = 0; i < 2; i++) {
                    this.createRageParticle(
                        berserkerAnt.x + (Math.random() - 0.5) * 30,
                        berserkerAnt.y + (Math.random() - 0.5) * 30,
                        0xFF4500
                    );
                }

                // Yellow embers
                this.createRageParticle(berserkerAnt.x, berserkerAnt.y, 0xFFFF00);
            }
        }, 100); // Rage effects every 100ms - CONSTANT FIRE!

        // Restore ant after duration
        setTimeout(() => {
            clearInterval(rageInterval);

            if (berserkerAnt && !berserkerAnt.isDead) {
                // Restore original properties
                berserkerAnt.scale.set(originalData.scale, originalData.scale);
                berserkerAnt.speed = originalData.speed;
                berserkerAnt.originalSpeed = originalData.originalSpeed;
                berserkerAnt.maxVelocity = originalData.maxVelocity;
                berserkerAnt.foodValueMultiplier = originalData.foodValueMultiplier;
                berserkerAnt.isBerserker = false;

                // Remove visual effect
                if (berserkerAnt.sprite) {
                    berserkerAnt.sprite.tint = 0xFFFFFF; // Reset tint
                }

                // Shrink effect
                if (this.game.effectManager) {
                    this.game.effectManager.createFoodCollectEffect(
                        berserkerAnt.x,
                        berserkerAnt.y,
                        0xFFFFFF,
                        2.0
                    );
                }
            }

            this.activeEffects.delete('berserkerMode');
            console.log('🔥 Berserker ant has calmed down!');
        }, duration);

        // Triple RED screen flash!
        this.createScreenFlash(0xFF0000, 0.3);
        setTimeout(() => this.createScreenFlash(0xFF0000, 0.25), 150);
        setTimeout(() => this.createScreenFlash(0xFF0000, 0.2), 300);

        // SCREEN SHAKE effect!
        if (this.game.cameraManager) {
            this.createCameraShake(20, 500); // Shake for 500ms
        }

        console.log('🔥 ONE ANT IS NOW A GIANT BERSERKER! Watch it RAMPAGE!');
    }

    createBerserkerAura(ant) {
        if (!this.game.worldContainer) return;

        // Create a MASSIVE pulsing red circle around the berserker
        const aura = new PIXI.Graphics();
        aura.lineStyle(4, 0xFF0000, 0.8);
        aura.drawCircle(0, 0, 60); // Big circle
        aura.lineStyle(3, 0xFF4500, 0.6);
        aura.drawCircle(0, 0, 45); // Medium circle
        aura.lineStyle(2, 0xFFFF00, 0.4);
        aura.drawCircle(0, 0, 30); // Small circle

        aura.x = ant.x;
        aura.y = ant.y;

        this.game.worldContainer.addChild(aura);

        // Pulse animation
        let scale = 1;
        let growing = true;
        const pulseInterval = setInterval(() => {
            if (!this.activeEffects.has('berserkerMode')) {
                clearInterval(pulseInterval);
                if (aura.parent) {
                    this.game.worldContainer.removeChild(aura);
                }
                return;
            }

            // Update position to follow ant
            aura.x = ant.x;
            aura.y = ant.y;

            // Pulse effect
            if (growing) {
                scale += 0.05;
                if (scale >= 1.3) growing = false;
            } else {
                scale -= 0.05;
                if (scale <= 1) growing = true;
            }
            aura.scale.set(scale, scale);
        }, 50);
    }

    createRageParticle(x, y, color) {
        if (!this.game.worldContainer) return;

        // Create a BIG visible particle
        const particle = new PIXI.Graphics();
        particle.beginFill(color, 0.8);
        particle.drawCircle(0, 0, 10); // Large particle
        particle.endFill();

        particle.x = x;
        particle.y = y;

        this.game.worldContainer.addChild(particle);

        // Animate upward and fade out (like smoke rising)
        let alpha = 0.8;
        let yOffset = 0;
        const animateInterval = setInterval(() => {
            alpha -= 0.08;
            yOffset -= 2; // Rise upward
            particle.alpha = alpha;
            particle.y = y + yOffset;

            if (alpha <= 0) {
                clearInterval(animateInterval);
                if (particle.parent) {
                    this.game.worldContainer.removeChild(particle);
                }
            }
        }, 30);
    }

    createCameraShake(intensity, duration) {
        if (!this.game.worldContainer) return;

        const originalX = this.game.worldContainer.x;
        const originalY = this.game.worldContainer.y;
        const startTime = Date.now();

        const shakeInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;

            if (elapsed >= duration) {
                // Restore original position
                this.game.worldContainer.x = originalX;
                this.game.worldContainer.y = originalY;
                clearInterval(shakeInterval);
                return;
            }

            // Shake with decreasing intensity
            const progress = elapsed / duration;
            const currentIntensity = intensity * (1 - progress);

            this.game.worldContainer.x = originalX + (Math.random() - 0.5) * currentIntensity * 2;
            this.game.worldContainer.y = originalY + (Math.random() - 0.5) * currentIntensity * 2;
        }, 16); // ~60fps
    }

    createCircuitParticle(x, y) {
        if (!this.game.worldContainer) return;

        const particle = new PIXI.Graphics();
        const isSquare = Math.random() < 0.5;

        if (isSquare) {
            // Small square circuit chip
            particle.beginFill(0x00FFFF, 0.9);
            particle.drawRect(-3, -3, 6, 6);
            particle.endFill();
        } else {
            // Small circle tech dot
            particle.beginFill(0x0099FF, 0.9);
            particle.drawCircle(0, 0, 4);
            particle.endFill();
        }

        particle.x = x + (Math.random() - 0.5) * 15;
        particle.y = y + (Math.random() - 0.5) * 15;

        this.game.worldContainer.addChild(particle);

        // Fade and float upward like tech energy
        let alpha = 0.9;
        let yOffset = 0;
        const animateInterval = setInterval(() => {
            alpha -= 0.12;
            yOffset -= 1.5;
            particle.alpha = alpha;
            particle.y = y + yOffset;

            if (alpha <= 0) {
                clearInterval(animateInterval);
                if (particle.parent) {
                    this.game.worldContainer.removeChild(particle);
                }
            }
        }, 40);
    }

    createMechaBody(ant) {
        if (!ant) return;

        // Don't remove legs! They need to animate.
        // Just hide the body and add robot body on top
        if (ant.body) {
            ant.body.visible = false;
        }

        // Create METALLIC SILVER ROBOT BODY
        const robotBody = new PIXI.Graphics();

        // Rectangular metallic body (like a tiny robot/tank)
        robotBody.beginFill(0xC0C0C0); // Metallic silver
        robotBody.drawRect(-10, -5, 20, 25); // Rectangular robot body
        robotBody.endFill();

        // Darker chassis details
        robotBody.beginFill(0x808080); // Dark gray
        robotBody.drawRect(-8, 0, 16, 15); // Inner chassis
        robotBody.endFill();

        // Light metallic highlights
        robotBody.beginFill(0xE8E8E8); // Light gray highlights
        robotBody.drawRect(-9, -4, 4, 6); // Left shoulder highlight
        robotBody.drawRect(5, -4, 4, 6); // Right shoulder highlight
        robotBody.endFill();

        // Glowing eyes/sensors - cyan for tech look
        robotBody.beginFill(0x000000, 1.0);
        robotBody.drawCircle(-5, -3, 3); // Left eye socket
        robotBody.drawCircle(5, -3, 3); // Right eye socket
        robotBody.endFill();

        // Glowing cyan LED eyes
        robotBody.beginFill(0x00FFFF);
        robotBody.drawCircle(-5, -3, 2);
        robotBody.drawCircle(5, -3, 2);
        robotBody.endFill();

        // Antenna on top - metallic
        robotBody.lineStyle(2, 0x999999); // Gray antenna
        robotBody.moveTo(0, -5);
        robotBody.lineTo(0, -12);
        robotBody.beginFill(0xFF0000); // Red blinking light on top
        robotBody.drawCircle(0, -14, 2);
        robotBody.endFill();

        // Panel lines/rivets on body
        robotBody.lineStyle(1, 0x606060); // Dark gray panel lines
        robotBody.moveTo(-8, 5);
        robotBody.lineTo(8, 5);
        robotBody.moveTo(0, 2);
        robotBody.lineTo(0, 18);

        // Add rivets/bolts
        robotBody.beginFill(0x404040);
        robotBody.drawCircle(-7, 3, 1);
        robotBody.drawCircle(7, 3, 1);
        robotBody.drawCircle(-7, 12, 1);
        robotBody.drawCircle(7, 12, 1);
        robotBody.endFill();

        ant.addChild(robotBody);

        // Override the animateLegs method to use mechanical gray legs
        if (ant.animateLegs) {
            ant.originalAnimateLegs = ant.animateLegs; // Store original
            ant.animateLegs = function() {
                // Update leg animation phase
                this.legPhase += this.legAnimationSpeed;

                // Animate each leg with mechanical gray color
                for (let i = 0; i < this.legs.length; i++) {
                    const leg = this.legs[i];

                    let phase = this.legPhase + (leg.index * Math.PI / 3);
                    if (leg.side === 'right') {
                        phase += Math.PI;
                    }

                    const legMovement = Math.sin(phase) * 2;

                    // Redraw with MECHANICAL GRAY COLOR
                    leg.clear();
                    leg.lineStyle(2, 0x808080); // Gray mechanical legs (thicker)
                    leg.moveTo(0, 0);

                    const bendFactor = Math.max(0, -Math.sin(phase)) * 0.8;

                    if (leg.side === 'left') {
                        const endX = -4 + legMovement;
                        const endY = 2 + bendFactor;
                        leg.lineTo(endX, endY);
                    } else {
                        const endX = 4 - legMovement;
                        const endY = 2 + bendFactor;
                        leg.lineTo(endX, endY);
                    }
                }
            };
        }

        // Make it bigger
        ant.scale.set(1.3);

        // Store reference for cleanup
        ant.mechaBody = robotBody;
    }

    createShadowBody(ant) {
        if (!ant) return;

        // Don't remove legs! They need to animate.
        // Just hide the body and add shadow body on top
        if (ant.body) {
            ant.body.visible = false;
        }

        // Also make legs shadowy by changing their color
        if (ant.legsContainer) {
            ant.legsContainer.alpha = 0.3; // Very faint shadowy legs
        }

        // Create ETHEREAL SHADOWY BODY - very transparent!
        const shadowBody = new PIXI.Graphics();

        // Dark wispy aura (outer glow) - much more transparent
        shadowBody.beginFill(0x000000, 0.2);
        shadowBody.drawCircle(0, 5, 18); // Large dark aura
        shadowBody.endFill();

        shadowBody.beginFill(0x110011, 0.25);
        shadowBody.drawCircle(0, 5, 13); // Medium aura
        shadowBody.endFill();

        // Core shadow body (ant-shaped but very transparent)
        shadowBody.beginFill(0x000000, 0.4);
        shadowBody.drawEllipse(0, 8, 7, 10); // Abdomen
        shadowBody.endFill();

        shadowBody.beginFill(0x111111, 0.4);
        shadowBody.drawEllipse(0, -2, 5, 7); // Thorax
        shadowBody.endFill();

        shadowBody.beginFill(0x000000, 0.5);
        shadowBody.drawCircle(0, -10, 5); // Head
        shadowBody.endFill();

        // Glowing purple/red eyes for spookiness - only thing that's solid
        shadowBody.beginFill(0x880088, 0.8);
        shadowBody.drawCircle(-2, -11, 1.5);
        shadowBody.drawCircle(2, -11, 1.5);
        shadowBody.endFill();

        ant.addChild(shadowBody);

        // Create wispy tendrils - very transparent
        const tendrils = new PIXI.Graphics();
        tendrils.lineStyle(2, 0x000000, 0.3); // Much more transparent

        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const length = 12 + Math.random() * 8;
            const endX = Math.cos(angle) * length;
            const endY = Math.sin(angle) * length;

            tendrils.moveTo(0, 5);
            tendrils.bezierCurveTo(
                endX * 0.4, endY * 0.4 + 5,
                endX * 0.7, endY * 0.7 + 5,
                endX, endY + 5
            );
        }

        ant.addChild(tendrils);

        // Make it slightly bigger and VERY transparent (elusive, shadowy)
        ant.scale.set(1.2);
        ant.alpha = 0.5; // Much more transparent - elusive shadowy figure!

        // Store reference for cleanup
        ant.shadowBody = shadowBody;
        ant.shadowTendrils = tendrils;

        // Animate tendrils rotation
        let rotation = 0;
        const rotateInterval = setInterval(() => {
            if (!ant || ant.isDead || !ant.isClone) {
                clearInterval(rotateInterval);
                return;
            }
            rotation += 0.03;
            if (tendrils && tendrils.parent) {
                tendrils.rotation = rotation;
            }
        }, 50);

        ant.shadowRotateInterval = rotateInterval;
    }


    activateCloneArmy() {
        console.log('👥 CLONE ARMY ACTIVATED - SHADOW CLONES!');

        const duration = this.abilities.cloneArmy.duration;

        // Get all ants
        const allAnts = [
            ...(this.game.entityManager?.entities?.ants || []),
            ...(this.game.entityManager?.entities?.flyingAnts || []),
            ...(this.game.entityManager?.entities?.carAnts || []),
            ...(this.game.entityManager?.entities?.fireAnts || [])
        ].filter(ant => ant && !ant.isDead && !ant.isClone);

        if (allAnts.length === 0) {
            console.log('No ants available to clone!');
            return;
        }

        const clones = [];

        // Create a shadow clone for EACH ant
        allAnts.forEach(ant => {
            // Create clone using EntityManager
            if (this.game.entityManager) {
                let clone;

                // Create the appropriate type of ant
                if (ant.constructor.name.includes('Flying')) {
                    this.game.entityManager.createFlyingAnt();
                    const flyingAnts = this.game.entityManager.entities.flyingAnts;
                    clone = flyingAnts[flyingAnts.length - 1];
                } else if (ant.constructor.name.includes('Car')) {
                    this.game.entityManager.createCarAnt();
                    const carAnts = this.game.entityManager.entities.carAnts;
                    clone = carAnts[carAnts.length - 1];
                } else if (ant.constructor.name.includes('Fire')) {
                    this.game.entityManager.createFireAnt();
                    const fireAnts = this.game.entityManager.entities.fireAnts;
                    clone = fireAnts[fireAnts.length - 1];
                } else {
                    this.game.entityManager.createAnt();
                    const ants = this.game.entityManager.entities.ants;
                    clone = ants[ants.length - 1];
                }

                if (clone) {
                    // Position clone near original ant
                    clone.x = ant.x + (Math.random() - 0.5) * 30;
                    clone.y = ant.y + (Math.random() - 0.5) * 30;
                    if (clone.sprite) {
                        clone.sprite.x = clone.x;
                        clone.sprite.y = clone.y;
                    }

                    // Mark as clone
                    clone.isClone = true;
                    clone.isTemporary = true;

                    // Nerf combat power: Shadow Clones are only 10% as strong as regular ants
                    clone.attackDamage = clone.attackDamage * 0.1;

                    // Visual: Complete shadow transformation - REPLACE THE BODY!
                    this.createShadowBody(clone);

                    // Spawn effect - dark smoke
                    if (this.game.effectManager) {
                        this.game.effectManager.createFoodCollectEffect(clone.x, clone.y, 0x000000, 1.5);
                        this.game.effectManager.createFoodCollectEffect(clone.x, clone.y, 0x222222, 1.2);
                    }

                    clones.push(clone);
                }
            }
        });

        console.log(`👥 Created ${clones.length} shadow clones!`);

        // Track active effect
        this.activeEffects.set('cloneArmy', {
            startTime: Date.now(),
            duration: duration,
            clones: clones
        });

        // Remove clones after duration
        setTimeout(() => {
            clones.forEach(clone => {
                if (clone && !clone.isDead && this.game.entityManager) {
                    // Clear shadow rotation interval
                    if (clone.shadowRotateInterval) {
                        clearInterval(clone.shadowRotateInterval);
                        clone.shadowRotateInterval = null;
                    }

                    // Despawn effect - dark smoke
                    if (this.game.effectManager && clone.x && clone.y) {
                        this.game.effectManager.createFoodCollectEffect(clone.x, clone.y, 0x000000, 1.5);
                        this.game.effectManager.createFoodCollectEffect(clone.x, clone.y, 0x222222, 1.2);
                    }

                    // Clean up HP bar if it exists
                    if (clone.healthBarContainer && clone.healthBarContainer.parent) {
                        clone.healthBarContainer.parent.removeChild(clone.healthBarContainer);
                    }

                    // Remove from display and array
                    if (clone.parent) {
                        clone.parent.removeChild(clone);
                    }

                    // Find and remove from appropriate array
                    const arrays = [
                        this.game.entityManager.entities.ants,
                        this.game.entityManager.entities.flyingAnts,
                        this.game.entityManager.entities.carAnts,
                        this.game.entityManager.entities.fireAnts
                    ];

                    arrays.forEach(arr => {
                        const index = arr.indexOf(clone);
                        if (index !== -1) {
                            arr.splice(index, 1);
                        }
                    });

                    // No need to update resource manager counts - shadow clones don't affect ant count
                    // Just update the food per second calculation once after all clones removed
                    if (this.game.resourceManager) {
                        this.game.resourceManager.updateFoodPerSecond();
                    }
                }
            });

            this.activeEffects.delete('cloneArmy');
            console.log('👥 Shadow clones have vanished!');
        }, duration);

        // Dark shadow flash effect
        this.createScreenFlash(0x222222, 0.3);
        setTimeout(() => this.createScreenFlash(0x111111, 0.2), 100);

        console.log(`👥 CLONE JUTSU! Army size doubled to ${allAnts.length * 2}!`);
    }

    activateMeteorShower() {
        console.log('☄️ METEOR SHOWER - SELECT TARGET LOCATION!');

        // Enter targeting mode
        this.meteorShowerTargeting = true;
        const targetRadius = 300; // Wide AoE area

        // Create targeting indicator circle
        const targetingCircle = new PIXI.Graphics();
        targetingCircle.lineStyle(4, 0xFF4500, 0.8);
        targetingCircle.beginFill(0xFF4500, 0.2);
        targetingCircle.drawCircle(0, 0, targetRadius);
        targetingCircle.endFill();
        targetingCircle.name = 'meteorTargeting';

        this.game.worldContainer.addChild(targetingCircle);
        this.meteorTargetingCircle = targetingCircle;

        // Update targeting circle position to follow cursor
        const updateTargetingCircle = (e) => {
            if (!this.meteorShowerTargeting) return;

            const rect = this.game.app.view.getBoundingClientRect();
            const screenX = e.clientX - rect.left;
            const screenY = e.clientY - rect.top;

            // Convert to world coordinates
            const worldX = (screenX / this.game.mapConfig.zoom.level) + this.game.mapConfig.viewport.x;
            const worldY = (screenY / this.game.mapConfig.zoom.level) + this.game.mapConfig.viewport.y;

            targetingCircle.x = worldX;
            targetingCircle.y = worldY;

            // Pulse effect
            const time = Date.now() * 0.005;
            targetingCircle.alpha = 0.5 + Math.sin(time) * 0.3;
        };

        // Listen for mouse move
        this.game.app.view.addEventListener('mousemove', updateTargetingCircle);
        this.meteorTargetingMouseMove = updateTargetingCircle;

        // Listen for click to activate
        const clickHandler = (e) => {
            if (!this.meteorShowerTargeting) return;

            const rect = this.game.app.view.getBoundingClientRect();
            const screenX = e.clientX - rect.left;
            const screenY = e.clientY - rect.top;

            // Convert to world coordinates
            const targetX = (screenX / this.game.mapConfig.zoom.level) + this.game.mapConfig.viewport.x;
            const targetY = (screenY / this.game.mapConfig.zoom.level) + this.game.mapConfig.viewport.y;

            console.log(`☄️ METEOR SHOWER TARGETING: ${targetX.toFixed(0)}, ${targetY.toFixed(0)}`);

            // Deactivate targeting mode
            this.meteorShowerTargeting = false;
            if (this.meteorTargetingCircle && this.meteorTargetingCircle.parent) {
                this.game.worldContainer.removeChild(this.meteorTargetingCircle);
            }
            this.game.app.view.removeEventListener('mousemove', updateTargetingCircle);
            this.game.app.view.removeEventListener('click', clickHandler);

            // Launch meteors at target location
            this.launchMeteorShowerAt(targetX, targetY, targetRadius);
        };

        this.game.app.view.addEventListener('click', clickHandler);

        console.log('☄️ Click to select meteor shower target!');
    }

    launchMeteorShowerAt(centerX, centerY, radius) {
        console.log(`☄️ METEOR SHOWER LAUNCHED AT ${centerX.toFixed(0)}, ${centerY.toFixed(0)}!`);

        const meteorCount = 50;
        const meteorDamage = 50;
        const impactRadius = 100; // Damage radius per meteor

        // Get all enemies and boss
        const enemies = this.game.entityManager?.entities?.enemies || [];
        const boss = this.game.boss;

        // Spawn meteors concentrated around target location
        for (let i = 0; i < meteorCount; i++) {
            // Random position within the target radius
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * radius;
            const x = centerX + Math.cos(angle) * distance;
            const y = centerY + Math.sin(angle) * distance;

            setTimeout(() => {
                // Create meteor falling effect
                this.createMeteor(x, y);

                // After meteor lands (500ms), create explosion and damage
                setTimeout(() => {
                    // Explosion effect
                    if (this.game.effectManager) {
                        this.game.effectManager.createFoodCollectEffect(x, y, 0xFF4500, 3.0);
                        this.game.effectManager.createFoodCollectEffect(x, y, 0xFF0000, 2.5);
                        this.game.effectManager.createFoodCollectEffect(x, y, 0xFFFF00, 2.0);
                    }

                    // Screen shake
                    this.createCameraShake(5, 200);

                    // AOE DAMAGE to enemies
                    enemies.forEach(enemy => {
                        if (enemy && !enemy.isDead) {
                            const dx = enemy.x - x;
                            const dy = enemy.y - y;
                            const distance = Math.sqrt(dx * dx + dy * dy);

                            if (distance < impactRadius) {
                                // Deal damage
                                if (enemy.takeDamage) {
                                    enemy.takeDamage(meteorDamage);
                                } else if (enemy.hp) {
                                    enemy.hp -= meteorDamage;
                                }

                                // Flash red
                                if (enemy.sprite) {
                                    const originalTint = enemy.sprite.tint;
                                    enemy.sprite.tint = 0xFF0000;
                                    setTimeout(() => {
                                        if (enemy.sprite) enemy.sprite.tint = originalTint;
                                    }, 100);
                                }
                            }
                        }
                    });

                    // Damage BOSS if in range
                    if (boss && !boss.isDead) {
                        const dx = boss.x - x;
                        const dy = boss.y - y;
                        const distance = Math.sqrt(dx * dx + dy * dy);

                        if (distance < impactRadius) {
                            if (boss.takeDamage) {
                                boss.takeDamage(meteorDamage);
                            } else if (boss.hp) {
                                boss.hp -= meteorDamage;
                            }

                            // Flash red
                            if (boss.sprite) {
                                const originalTint = boss.sprite.tint;
                                boss.sprite.tint = 0xFF0000;
                                setTimeout(() => {
                                    if (boss.sprite) boss.sprite.tint = originalTint;
                                }, 100);
                            }
                        }
                    }

                    // Leave food behind
                    const roll = Math.random();
                    let foodType;
                    if (roll < 0.3) {
                        foodType = IdleAnts.Data.FoodTypes.BASIC;
                    } else if (roll < 0.6) {
                        foodType = IdleAnts.Data.FoodTypes.APPLE;
                    } else if (roll < 0.85) {
                        foodType = IdleAnts.Data.FoodTypes.COOKIE;
                    } else {
                        foodType = IdleAnts.Data.FoodTypes.MARSHMALLOW;
                    }

                    this.game.entityManager.addFood({ x, y }, foodType);
                }, 500);
            }, i * 100); // Stagger meteors over 5 seconds
        }

        // Orange screen flash
        this.createScreenFlash(0xFF4500, 0.3);
    }

    createMeteor(targetX, targetY) {
        if (!this.game.worldContainer) return;

        // Create meteor (falling fireball)
        const meteor = new PIXI.Graphics();
        meteor.beginFill(0xFF4500, 1.0);
        meteor.drawCircle(0, 0, 15);
        meteor.endFill();

        // Start from top of map
        meteor.x = targetX;
        meteor.y = -100;

        this.game.worldContainer.addChild(meteor);

        // Animate falling
        const fallSpeed = 20;
        const fallInterval = setInterval(() => {
            meteor.y += fallSpeed;

            // Create fire trail
            if (Math.random() < 0.5) {
                const trail = new PIXI.Graphics();
                trail.beginFill(0xFFFF00, 0.6);
                trail.drawCircle(0, 0, 8);
                trail.endFill();
                trail.x = meteor.x + (Math.random() - 0.5) * 10;
                trail.y = meteor.y;

                this.game.worldContainer.addChild(trail);

                // Fade trail
                setTimeout(() => {
                    if (trail.parent) {
                        this.game.worldContainer.removeChild(trail);
                    }
                }, 200);
            }

            // Remove when reaches target
            if (meteor.y >= targetY) {
                clearInterval(fallInterval);
                if (meteor.parent) {
                    this.game.worldContainer.removeChild(meteor);
                }
            }
        }, 16);
    }

    // ========== VISUAL EFFECTS ==========

    createScreenFlash(color, opacity) {
        if (!this.game.app) return;

        const flash = new PIXI.Graphics();
        flash.beginFill(color, opacity);
        flash.drawRect(0, 0, this.game.app.screen.width, this.game.app.screen.height);
        flash.endFill();

        // Add to stage temporarily
        this.game.app.stage.addChild(flash);

        // Fade out and remove
        let alpha = opacity;
        const fadeInterval = setInterval(() => {
            alpha -= 0.05;
            flash.alpha = alpha;

            if (alpha <= 0) {
                clearInterval(fadeInterval);
                this.game.app.stage.removeChild(flash);
            }
        }, 16); // ~60fps
    }

    // ========== UPDATE & UI ==========

    update() {
        // Update active effects (for UI progress bars)
        this.activeEffects.forEach((effect, id) => {
            const elapsed = Date.now() - effect.startTime;
            effect.progress = Math.min(1, elapsed / effect.duration);
        });

        // Update ability UI cooldowns
        this.updateAbilityUI();
    }

    updateAbilityUI() {
        // This will be called by UIManager to update button states
        if (this.game.uiManager && this.game.uiManager.updateAbilityButtons) {
            this.game.uiManager.updateAbilityButtons();
        }
    }

    onAbilityClick(abilityId) {
        // Allow abilities during PLAYING, BOSS_INTRO, and BOSS_FIGHT states
        const allowAbilities = this.game.state === IdleAnts.Game.States.PLAYING ||
                              this.game.state === IdleAnts.Game.States.BOSS_INTRO ||
                              this.game.state === IdleAnts.Game.States.BOSS_FIGHT;

        if (!allowAbilities) {
            return;
        }

        this.useAbility(abilityId);
    }

    // Get all abilities with their current states
    getAbilitiesState() {
        const states = {};

        Object.keys(this.abilities).forEach(id => {
            const ability = this.abilities[id];
            const ready = this.isAbilityReady(id);
            const remaining = this.getRemainingCooldown(id);
            const activeEffect = this.activeEffects.get(id);

            states[id] = {
                ...ability,
                ready: ready,
                remainingCooldown: remaining,
                active: activeEffect !== undefined,
                progress: activeEffect?.progress || 0
            };
        });

        return states;
    }

    destroy() {
        // Clean up any active effects
        this.activeEffects.clear();
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AbilityManager;
}

// Add to global namespace
if (typeof IdleAnts !== 'undefined') {
    IdleAnts.AbilityManager = AbilityManager;
}
