// src/entities/Ant.js
IdleAnts.Entities.Ant = class extends IdleAnts.Entities.AntBase {
    constructor(texture, nestPosition, speedMultiplier = 1) {
        // Call parent constructor with speed factor of 1 (regular ants)
        super(texture, nestPosition, speedMultiplier, 1);
        
        // Leg animation variables
        this.legPhase = Math.random() * Math.PI * 2;
        this.legAnimationSpeed = 0.2;
        
        // Regular ants have more deliberate, slower turns
        this.turnSpeed = 0.08 + Math.random() * 0.02; // Slight randomization for natural variety
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
}; 