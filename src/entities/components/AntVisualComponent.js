/**
 * AntVisualComponent - Handles ant visual elements, shadows, food indicators
 * Extracted from AntBase.js to maintain Single Responsibility Principle
 */

// Ensure Components namespace exists
if (!IdleAnts.Entities.Components) {
    IdleAnts.Entities.Components = {};
}

IdleAnts.Entities.Components.AntVisualComponent = class {
    constructor(ant) {
        this.ant = ant;
        this.shadow = null;
        this.foodIndicator = null;
        this.trailPoints = [];
        this.maxTrailLength = 10;
        
        this.createVisualElements();
    }

    /**
     * Get base scale for the ant with variation
     * @returns {number} Base scale value
     */
    getBaseScale() {
        // Random scale between 0.8 and 1.2 for variation
        return 0.8 + Math.random() * 0.4;
    }

    /**
     * Create all visual elements for the ant
     */
    createVisualElements() {
        this.createShadow();
        this.createFoodIndicator();
        this.createTypeSpecificElements();
    }

    /**
     * Create type-specific visual elements (override in subclasses)
     */
    createTypeSpecificElements() {
        // Base implementation - can be overridden by specific ant types
    }

    /**
     * Create shadow effect
     */
    createShadow() {
        this.shadow = new PIXI.Graphics();
        this.shadow.beginFill(0x000000, 0.3);
        this.shadow.drawEllipse(0, 0, this.ant.width * 0.6, this.ant.height * 0.3);
        this.shadow.endFill();
        this.shadow.x = this.ant.x;
        this.shadow.y = this.ant.y + 5;
        
        if (IdleAnts.app && IdleAnts.app.worldContainer) {
            IdleAnts.app.worldContainer.addChild(this.shadow);
        }
    }

    /**
     * Create food capacity indicator
     */
    createFoodIndicator() {
        this.foodIndicator = new PIXI.Container();
        this.foodIndicator.x = this.ant.x;
        this.foodIndicator.y = this.ant.y;
        
        // Create dots to show food capacity
        for (let i = 0; i < this.ant.capacity; i++) {
            const dot = new PIXI.Graphics();
            dot.beginFill(0xFFD700, 0.8); // Gold color
            dot.drawCircle(0, 0, 2);
            dot.endFill();
            
            // Position dots in a small arc above the ant
            const angle = (i / Math.max(1, this.ant.capacity - 1)) * Math.PI - Math.PI / 2;
            dot.x = Math.cos(angle) * 8;
            dot.y = Math.sin(angle) * 8 - 10;
            dot.visible = false; // Initially hidden
            
            this.foodIndicator.addChild(dot);
        }
        
        if (IdleAnts.app && IdleAnts.app.worldContainer) {
            IdleAnts.app.worldContainer.addChild(this.foodIndicator);
        }
    }

    /**
     * Update food indicator based on current food collected
     */
    updateFoodIndicator() {
        if (!this.foodIndicator) return;
        
        for (let i = 0; i < this.foodIndicator.children.length; i++) {
            const dot = this.foodIndicator.children[i];
            dot.visible = i < this.ant.foodCollected;
        }
    }

    /**
     * Update visual elements
     */
    update() {
        // Update shadow position
        if (this.shadow) {
            this.shadow.x = this.ant.x;
            this.shadow.y = this.ant.y + 5;
        }
        
        // Update food indicator position
        if (this.foodIndicator) {
            this.foodIndicator.x = this.ant.x;
            this.foodIndicator.y = this.ant.y;
            this.updateFoodIndicator();
        }
        
        // Update trail
        this.updateTrail();
    }

    /**
     * Update movement trail
     */
    updateTrail() {
        // Add current position to trail
        this.trailPoints.push({ x: this.ant.x, y: this.ant.y });
        
        // Limit trail length
        if (this.trailPoints.length > this.maxTrailLength) {
            this.trailPoints.shift();
        }
    }

    /**
     * Draw movement trail (if enabled)
     */
    drawTrail(graphics) {
        if (this.trailPoints.length < 2) return;
        
        graphics.lineStyle(1, 0x00FF00, 0.3);
        graphics.moveTo(this.trailPoints[0].x, this.trailPoints[0].y);
        
        for (let i = 1; i < this.trailPoints.length; i++) {
            const alpha = i / this.trailPoints.length;
            graphics.lineStyle(1, 0x00FF00, alpha * 0.3);
            graphics.lineTo(this.trailPoints[i].x, this.trailPoints[i].y);
        }
    }

    /**
     * Highlight the ant (for selection or hover effects)
     * @param {boolean} highlight - Whether to highlight or unhighlight
     */
    setHighlight(highlight) {
        if (highlight) {
            this.ant.tint = 0xFFFFAA; // Slight yellow tint
            this.ant.scale.set(this.ant.baseScale * 1.1);
        } else {
            this.ant.tint = 0xFFFFFF; // Normal color
            this.ant.scale.set(this.ant.baseScale);
        }
    }

    /**
     * Create speed boost visual effect
     */
    createSpeedBoostEffect() {
        if (IdleAnts.app && IdleAnts.app.effectManager) {
            IdleAnts.app.effectManager.createSpeedBoostEffect(this.ant.x, this.ant.y);
        }
    }

    /**
     * Create collection effect when picking up food
     */
    createCollectionEffect() {
        if (IdleAnts.app && IdleAnts.app.effectManager) {
            IdleAnts.app.effectManager.createFoodCollectEffect(this.ant.x, this.ant.y);
        }
    }

    /**
     * Create delivery effect when delivering food to nest
     */
    createDeliveryEffect() {
        if (IdleAnts.app && IdleAnts.app.effectManager) {
            IdleAnts.app.effectManager.createFoodDropEffect(this.ant.x, this.ant.y);
        }
    }

    /**
     * Animate ant based on current state
     */
    animateForState(state) {
        switch (state) {
            case 'SPAWNING':
                // Spawn animation - grow from small to normal size
                this.ant.scale.set(0.1);
                const targetScale = this.ant.baseScale;
                const scaleStep = (targetScale - 0.1) / 30; // 30 frames to reach full size
                
                const scaleUp = () => {
                    if (this.ant.scale.x < targetScale) {
                        this.ant.scale.set(this.ant.scale.x + scaleStep);
                        requestAnimationFrame(scaleUp);
                    }
                };
                scaleUp();
                break;
                
            case 'COLLECTING_FOOD':
                // Slight bob animation while collecting
                this.ant.y += Math.sin(Date.now() * 0.01) * 0.5;
                break;
                
            case 'FIGHTING':
                // Shake effect during combat
                this.ant.x += (Math.random() - 0.5) * 2;
                this.ant.y += (Math.random() - 0.5) * 2;
                break;
        }
    }

    /**
     * Set ant opacity
     * @param {number} alpha - Opacity value (0-1)
     */
    setOpacity(alpha) {
        this.ant.alpha = alpha;
        if (this.shadow) this.shadow.alpha = alpha * 0.3;
        if (this.foodIndicator) this.foodIndicator.alpha = alpha;
    }

    /**
     * Destroy all visual elements
     */
    destroy() {
        if (this.shadow && this.shadow.parent) {
            this.shadow.parent.removeChild(this.shadow);
            this.shadow.destroy();
        }
        
        if (this.foodIndicator && this.foodIndicator.parent) {
            this.foodIndicator.parent.removeChild(this.foodIndicator);
            this.foodIndicator.destroy();
        }
        
        this.shadow = null;
        this.foodIndicator = null;
        this.trailPoints = [];
        this.ant = null;
    }
};