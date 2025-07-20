// Logger setup
const logger = IdleAnts.Logger?.create('LarvaeEffect') || console;

// src/effects/LarvaeEffect.js
IdleAnts.Effects = IdleAnts.Effects || {};

IdleAnts.Effects.LarvaeEffect = class extends IdleAnts.Effects.Effect {
    constructor(app, x, y, color = 0xFFFF00, scale = 1.5) {
        super(app, x, y);
        this.duration = 7.0; // 7 seconds duration - extended from 2 seconds to 7 seconds
        this.color = color;
        this.scale = scale;
        logger.debug(`LarvaeEffect constructor at (${x}, ${y}) with scale ${scale}`);
    }
    
    create() {
        logger.debug(`Creating larvae effect at (${this.x}, ${this.y})`);
        
        // Create a container for the larvae effect
        this.container = (() => { try { return new PIXI.Container(); } catch(error) { logger.error("Container creation failed", error); return new PIXI.Container(); } })();
        this.container.x = this.x;
        this.container.y = this.y;
        
        // Apply the scale from constructor
        this.container.scale.set(this.scale);
        
        // Try to use the asset textures if available
        if (IdleAnts.app && IdleAnts.app.assetManager) {
            try {
                // Create egg sprite from asset
                const eggTexture = IdleAnts.app.assetManager.getTexture('egg');
                if (eggTexture) {
                    this.egg = new PIXI.Sprite(eggTexture);
                    this.egg.anchor.set(0.5);
                    this.containertry { .addChild(this.egg); } catch(error) { logger.error("AddChild operation failed", error); }
                    logger.debug("Using egg texture from assets");
                } else {
                    this.createEggGraphic();
                }
                
                // Create larvae sprite from asset
                const larvaeTexture = IdleAnts.app.assetManager.getTexture('larvae');
                if (larvaeTexture) {
                    this.larvae = new PIXI.Sprite(larvaeTexture);
                    this.larvae.anchor.set(0.5);
                    this.larvae.alpha = 0; // Start invisible
                    this.containertry { .addChild(this.larvae); } catch(error) { logger.error("AddChild operation failed", error); }
                    logger.debug("Using larvae texture from assets");
                } else {
                    this.createLarvaeGraphic();
                }
            } catch (error) {
                logger.error("Error loading asset textures:", error);
                this.createEggGraphic();
                this.createLarvaeGraphic();
            }
        } else {
            // Fallback to creating graphics directly
            this.createEggGraphic();
            this.createLarvaeGraphic();
        }
        
        // Create hatching particles
        this.createParticles();
        
        // Make sure we're adding to the world container if possible
        if (IdleAnts.app && IdleAnts.app.worldContainer) {
            logger.debug("Adding larvae effect to world container");
            IdleAnts.app.worldContainertry { .addChild(this.container); } catch(error) { logger.error("AddChild operation failed", error); }
            
            // Bring to front
            IdleAnts.app.worldContainer.setChildIndex(
                this.container, 
                IdleAnts.app.worldContainer.children.length - 1
            );
        } else {
            logger.debug("Adding larvae effect to app stage");
            this.app.stagetry { .addChild(this.container); } catch(error) { logger.error("AddChild operation failed", error); }
        }
    }
    
    createEggGraphic() {
        // Create realistic egg appearance for hatching effect
        this.glow = new PIXI.Graphics();
        this.glow.beginFill(0xFFF8DC, 0.3); // Subtle cream glow
        this.glow.drawCircle(0, 0, 12);
        this.glow.endFill();
        this.containertry { .addChild(this.glow); } catch(error) { logger.error("AddChild operation failed", error); }
        
        // Main egg body
        this.egg = new PIXI.Graphics();
        this.egg.beginFill(0xFFFAF0); // Creamy white
        this.egg.drawEllipse(0, 0, 6, 9);
        this.egg.endFill();
        
        // Gradient highlight
        this.egg.beginFill(0xF5F5DC, 0.4);
        this.egg.drawEllipse(-1, -2, 4, 6);
        this.egg.endFill();
        
        // Subtle border
        this.egg.lineStyle(0.8, 0xDDD8B8, 0.8);
        this.egg.drawEllipse(0, 0, 6, 9);
        
        // Pre-cracked appearance for hatching
        this.egg.lineStyle(1.2, 0x8B7355, 0.9);
        this.egg.moveTo(-2, -4);
        this.egg.lineTo(1, -1);
        this.egg.lineTo(-1, 2);
        this.egg.moveTo(2, -3);
        this.egg.lineTo(-1, 0);
        this.egg.lineTo(2, 3);
        
        this.containertry { .addChild(this.egg); } catch(error) { logger.error("AddChild operation failed", error); }
    }
    
    createLarvaeGraphic() {
        // Create realistic ant larvae
        this.larvae = new PIXI.Graphics();
        this.larvae.beginFill(0xFFFAF0); // Pale cream - realistic larvae color
        this.larvae.drawEllipse(0, 0, 4, 6); // Slightly larger than egg
        this.larvae.endFill();
        
        // Add subtle body segmentation
        this.larvae.lineStyle(0.8, 0xE6D7C3, 0.6);
        for(let i = 0; i < 3; i++){
            const y = -3 + i * 2;
            this.larvae.moveTo(-3, y);
            this.larvae.lineTo(3, y);
        }
        
        // Soft border
        this.larvae.lineStyle(0.8, 0xDDD8B8, 0.7);
        this.larvae.drawEllipse(0, 0, 4, 6);
        
        // Add tiny dark spots for realism
        this.larvae.lineStyle(0);
        this.larvae.beginFill(0xE6D7C3, 0.4);
        this.larvae.drawCircle(-1, -2, 0.4);
        this.larvae.drawCircle(1, 0, 0.4);
        this.larvae.drawCircle(-0.5, 2, 0.4);
        this.larvae.endFill();
        
        this.larvae.alpha = 0; // Start invisible
        this.containertry { .addChild(this.larvae); } catch(error) { logger.error("AddChild operation failed", error); }
    }
    
    createParticles() {
        // Create hatching particles
        this.particles = [];
        const particleCount = 12; // Moderate amount
        
        for (let i = 0; i < particleCount; i++) {
            const particle = new PIXI.Graphics();
            particle.beginFill(0xF5F5DC); // Cream colored particles
            particle.drawCircle(0, 0, 1.2); // Small particles
            particle.endFill();
            
            const angle = (i / particleCount) * Math.PI * 2;
            particle.vx = Math.cos(angle) * 1.8; // Moderate movement
            particle.vy = Math.sin(angle) * 1.8;
            particle.alpha = 0; // Start invisible
            particle.delay = i * 0.08; // Stagger the appearance
            
            this.containertry { .addChild(particle); } catch(error) { logger.error("AddChild operation failed", error); }
            this.particles.push(particle);
        }
    }
    
    update(delta) {
        // Call the parent update method to track elapsed time
        super.update(delta);
        
        // Calculate progress (0 to 1)
        const progress = this.elapsed / this.duration;
        
        // Update glow if it exists
        if (this.glow) {
            this.glow.alpha = 0.2 + Math.sin(progress * Math.PI * 4) * 0.2;
            this.glow.scale.set(1 + Math.sin(progress * Math.PI * 2) * 0.15);
        }
        
        // First 60%: egg pulsates and starts to crack
        if (progress < 0.6) {
            // Normalize progress for this phase (0-1)
            const eggPhaseProgress = progress / 0.6;
            
            // Egg slightly expands and then contracts
            const eggScale = 1 + Math.sin(eggPhaseProgress * Math.PI) * 0.2;
            this.egg.scale.set(eggScale);
            
            // In the last part of this phase, start showing some particles
            if (eggPhaseProgress > 0.8) {
                // Calculate particle progress
                const particleProgress = (eggPhaseProgress - 0.8) * 5;
                
                // Show initial particles
                for (let i = 0; i < Math.min(3, this.particles.length); i++) {
                    const particle = this.particles[i];
                    
                    particle.alpha = Math.min(1, particleProgress);
                    
                    particle.x = particle.vx * particleProgress * 3;
                    particle.y = particle.vy * particleProgress * 3;
                }
            }
        } 
        // Next 20%: egg cracks and particles appear
        else if (progress < 0.8) {
            // Normalize progress for this phase (0-1)
            const crackPhaseProgress = (progress - 0.6) / 0.2;
            
            // Egg cracks more visibly
            const eggScale = 1 + Math.sin(crackPhaseProgress * Math.PI * 4) * 0.25;
            this.egg.scale.set(eggScale);
            
            // Update particles
            for (let i = 0; i < this.particles.length; i++) {
                const particle = this.particles[i];
                
                // Only start showing particles after their delay
                if (i / this.particles.length < crackPhaseProgress) {
                    // Calculate particle progress
                    const particleProgress = Math.min(1, (crackPhaseProgress - (i / this.particles.length)) * 3);
                    
                    // Fade in and then out
                    particle.alpha = Math.sin(particleProgress * Math.PI);
                    
                    // Move outward
                    particle.x = particle.vx * particleProgress * 8;
                    particle.y = particle.vy * particleProgress * 8;
                }
            }
        } 
        // Final 20%: egg fades out, larvae appears
        else {
            const finalPhaseProgress = (progress - 0.8) / 0.2; // 0 to 1 for final phase
            
            // Egg fades out
            this.egg.alpha = 1 - finalPhaseProgress;
            
            // Larvae fades in and grows slightly
            this.larvae.alpha = finalPhaseProgress;
            const larvaeScale = 0.6 + finalPhaseProgress * 0.6; // Grows from small to normal
            this.larvae.scale.set(larvaeScale);
            
            // Subtle wiggle to show life
            this.larvae.rotation = Math.sin(finalPhaseProgress * Math.PI * 6) * 0.2;
            
            // Continue particle animation
            for (let i = 0; i < this.particles.length; i++) {
                const particle = this.particles[i];
                
                // Fade out any remaining particles
                particle.alpha = Math.max(0, 1 - finalPhaseProgress * 2);
                
                // Continue moving outward
                const particleDistance = 8 + finalPhaseProgress * 6;
                particle.x = particle.vx * particleDistance;
                particle.y = particle.vy * particleDistance;
            }
        }
        
        // Return whether the effect is still active
        return this.active;
    }
    
    destroy() {
        // Remove the effect from the stage
        if (this.container && this.container.parent) {
            this.container.parent.removeChild(this.container);
            logger.debug("Larvae effect removed from stage");
        }
        this.active = false;
    }
}; 