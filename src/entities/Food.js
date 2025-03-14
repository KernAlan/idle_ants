// src/entities/Food.js
IdleAnts.Entities.Food = class extends PIXI.Sprite {
    constructor(texture, position, foodType) {
        // Get the appropriate texture for the food type
        const foodType_ = foodType || IdleAnts.Data.FoodTypes.BASIC;
        let textureToUse = texture;
        
        // If this is a cookie, use the cookie texture if available
        if (foodType_.id === 'cookie') {
            const cookieTexture = IdleAnts.app.assetManager.getTexture('cookieFood');
            if (cookieTexture) {
                textureToUse = cookieTexture;
            }
        }
        
        super(textureToUse);
        
        // Store the food type
        this.foodType = foodType_;
        
        this.anchor.set(0.5);
        this.x = position.x;
        this.y = position.y;
        
        // Apply food type-specific visual enhancements
        this.applyFoodTypeVisuals();
        
        // Add a glowing effect
        this.createGlow();
        
        // Add a shadow
        this.createShadow();
        
        // Add a slight pulsing animation
        this.glowPulse = true;
        this.glowCounter = Math.random() * Math.PI * 2; // Random start phase
        
        // Track if food was manually placed by user
        this.clickPlaced = position.clickPlaced || false;
    }
    
    applyFoodTypeVisuals() {
        // Apply food type-specific scale
        const scaleRange = this.foodType.scale;
        const scale = scaleRange.min + Math.random() * (scaleRange.max - scaleRange.min);
        this.scale.set(scale);
        
        // Apply food type-specific tint
        this.tint = this.foodType.color;
        
        // Random rotation
        this.rotation = Math.random() * Math.PI * 2;
    }
    
    createGlow() {
        const glow = new PIXI.Graphics();
        glow.beginFill(this.foodType.glowColor, this.foodType.glowAlpha);
        glow.drawCircle(0, 0, 10);
        glow.endFill();
        glow.alpha = 0.6;
        this.addChild(glow);
    }
    
    createShadow() {
        const shadow = new PIXI.Graphics();
        shadow.beginFill(0x000000, 0.2);
        shadow.drawEllipse(0, 0, 6, 3);
        shadow.endFill();
        shadow.y = 5; // Position under the food
        this.addChild(shadow);
    }
    
    update() {
        if (this.glowPulse) {
            this.glowCounter += 0.03;
            const pulseFactor = 0.8 + Math.sin(this.glowCounter) * 0.2;
            this.children[0].scale.set(pulseFactor);
            this.children[0].alpha = 0.5 + Math.sin(this.glowCounter) * 0.3;
        }
    }
    
    // Get the value of this food
    getValue() {
        return this.foodType.value;
    }
    
    // Get the name of this food type
    getName() {
        return this.foodType.name;
    }
} 