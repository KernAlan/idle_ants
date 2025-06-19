// src/entities/Ant.js
IdleAnts.Entities.Ant = class extends IdleAnts.Entities.AntBase {
    constructor(texture, nestPosition, speedMultiplier = 1) {
        // Call parent constructor with speed factor of 1 (regular ants)
        super(texture, nestPosition, speedMultiplier, 1);
        
        // CRITICAL: Ensure position is set directly at the nest
        this.x = nestPosition.x;
        this.y = nestPosition.y;
        
        // Leg animation variables
        this.legPhase = Math.random() * Math.PI * 2;
        this.legAnimationSpeed = 0.2;
        
        // Regular ants have randomized turn rates
        this.turnSpeed = 0.1 + Math.random() * 0.8; // Randomized between 0.1 and 0.9
    }
    
    // Implement type-specific visual elements
    createTypeSpecificElements() {
        // Create legs that can be animated
        this.createLegs();
    }
    
    createLegs() {
        // Create container for legs
        this.legsContainer = new PIXI.Container();
        this.addChild(this.legsContainer);
        
        // Create each pair of legs - positioned for bird's eye view
        this.legs = [];
        
        // Leg positions for bird's eye view - symmetrical
        const legPositions = [
            {x: -4, y: -8, side: 'left'},   // Left front leg
            {x: 4, y: -8, side: 'right'},   // Right front leg
            {x: -4, y: -2, side: 'left'},   // Left middle leg
            {x: 4, y: -2, side: 'right'},   // Right middle leg
            {x: -4, y: 4, side: 'left'},    // Left rear leg
            {x: 4, y: 4, side: 'right'}     // Right rear leg
        ];
        
        // Create each leg
        for (let i = 0; i < legPositions.length; i++) {
            const legPos = legPositions[i];
            const leg = new PIXI.Graphics();
            
            // Set leg properties
            leg.position.set(legPos.x, legPos.y);
            leg.baseX = legPos.x;
            leg.baseY = legPos.y;
            leg.index = Math.floor(i / 2); // 0, 0, 1, 1, 2, 2
            leg.side = legPos.side;
            
            // Draw initial leg
            this.drawLeg(leg);
            
            this.legsContainer.addChild(leg);
            this.legs.push(leg);
        }
    }
    
    drawLeg(leg) {
        leg.clear();
        leg.lineStyle(1.5, 0x2A1B10);
        
        // Draw leg extending outward from body - symmetrical for bird's eye view
        leg.moveTo(0, 0);
        if (leg.side === 'left') {
            leg.lineTo(-4, 2); // Left legs extend left and slightly down
        } else {
            leg.lineTo(4, 2); // Right legs extend right and slightly down
        }
    }
    
    // Implement ant-specific animation
    performAnimation() {
        this.animateLegs();
    }
    
    animateLegs() {
        // Update leg animation phase
        this.legPhase += this.legAnimationSpeed;
        
        // Speed-based animation rate - faster movement = faster leg movement
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        const animationRate = Math.max(0.1, speed * 0.3);
        
        // Animate each leg with symmetrical movement
        for (let i = 0; i < this.legs.length; i++) {
            const leg = this.legs[i];
            
            // Alternating leg movement pattern - opposite sides move in opposite phases
            let phase = this.legPhase + (leg.index * Math.PI / 3);
            if (leg.side === 'right') {
                phase += Math.PI; // Opposite phase for right legs
            }
            
            // Apply leg animation - symmetrical movement
            const legMovement = Math.sin(phase) * 2; // Full movement for both sides
            
            // Redraw the leg with animation
            leg.clear();
            leg.lineStyle(1.5, 0x2A1B10);
            leg.moveTo(0, 0);
            
            // Symmetrical leg animation for bird's eye view
            const bendFactor = Math.max(0, -Math.sin(phase)) * 0.8;
            
            if (leg.side === 'left') {
                const endX = -4 + legMovement;
                const endY = 2 + bendFactor;
                leg.lineTo(endX, endY);
            } else {
                const endX = 4 - legMovement; // Mirror the movement for right side
                const endY = 2 + bendFactor;
                leg.lineTo(endX, endY);
            }
        }
    }
}; 