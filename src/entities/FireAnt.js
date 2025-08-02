// src/entities/FireAnt.js
if (typeof IdleAnts === 'undefined') IdleAnts = {};
if (typeof IdleAnts.Entities === 'undefined') IdleAnts.Entities = {};

// FireAnt – fast ground ant with fiery colouring
IdleAnts.Entities.FireAnt = class extends IdleAnts.Entities.AntBase {
    constructor(texture, nestPosition, speedMultiplier = 1) {
        // Fire ants are 1.6× faster than regular ants
        super(texture, nestPosition, speedMultiplier, 1.3);

        // Bright red to visually distinguish Fire Ants
        this.tint = 0xFF0000;

        // Combat-related placeholders (future implementation)
        this.attackDamage = 20; // Reduced attack power (was 25, now 20% less)
        this.attackCooldown = 60; // frames
        this._attackTimer = 0;

        // Override HP calculation for doubled health again
        const baseHp = 300; // 2x the previous 150 HP
        const strengthMultiplier = IdleAnts.app && IdleAnts.app.resourceManager ? 
            IdleAnts.app.resourceManager.stats.strengthMultiplier : 1;
        this.maxHp = baseHp + (strengthMultiplier - 1) * 150; // Doubled HP scaling per strength level
        this.hp = this.maxHp;
        this.updateHealthBar();

        // Leg animation setup (reuse regular ant behaviour)
        this.legPhase = Math.random() * Math.PI * 2;
        this.legAnimationSpeed = 0.25;
    }

    // Override base scale slightly larger
    getBaseScale() {
        return 0.9 + Math.random() * 0.2;
    }

    // Create bright-red body overlay then legs
    createTypeSpecificElements() {
        this.createBody();
        this.createLegs();
    }

    createBody() {
        const body = new PIXI.Graphics();

        // Abdomen
        body.beginFill(0xFF0000);
        body.drawEllipse(0, 8, 7, 10);
        body.endFill();

        // Thorax
        body.beginFill(0xD80000);
        body.drawEllipse(0, -2, 5, 7);
        body.endFill();

        // Head
        body.beginFill(0xB00000);
        body.drawCircle(0, -14, 5);
        body.endFill();

        // Simple eyes for contrast
        body.beginFill(0xFFFFFF);
        body.drawCircle(-2, -15, 1.2);
        body.drawCircle(2, -15, 1.2);
        body.endFill();

        this.addChild(body);
    }

    createLegs() {
        this.legsContainer = new PIXI.Container();
        this.addChild(this.legsContainer);

        this.legs = [];
        const legPositions = [ {x: 0, y: -8}, {x: 0, y: -2}, {x: 0, y: 6} ];

        for (let i = 0; i < 3; i++) {
            // Left leg
            const leftLeg = new PIXI.Graphics();
            leftLeg.lineStyle(1.5, 0x8B2500); // Darker orange
            leftLeg.moveTo(0, 0);
            leftLeg.lineTo(-8, -5);
            leftLeg.position.set(-5, legPositions[i].y);
            leftLeg.baseY = legPositions[i].y;
            leftLeg.index = i;
            leftLeg.side = 'left';

            // Right leg
            const rightLeg = new PIXI.Graphics();
            rightLeg.lineStyle(1.5, 0x8B2500);
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

    performAnimation() {
        this.animateLegs();

        // Decrement attack timer if active (preparation for combat system)
        if (this._attackTimer > 0) this._attackTimer--;
    }

    animateLegs() {
        this.legPhase += this.legAnimationSpeed;
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        const animationRate = Math.max(0.1, speed * 0.35);

        for (let i = 0; i < this.legs.length; i++) {
            const leg = this.legs[i];
            let phase = this.legPhase + (leg.index * Math.PI / 3);
            if (leg.side === 'right') phase += Math.PI;

            const legMovement = Math.sin(phase * animationRate) * 2;
            leg.clear();
            leg.lineStyle(1.5, 0x8B2500);
            leg.moveTo(0, 0);

            const bendFactor = Math.max(0, -Math.sin(phase));
            const midX = (leg.side === 'left' ? -4 : 4) - bendFactor * 2 * (leg.side === 'left' ? 1 : -1);
            const midY = legMovement - 2 - bendFactor * 2;
            const endX = (leg.side === 'left' ? -8 : 8);
            leg.lineTo(midX, midY);
            leg.lineTo(endX, -5 + legMovement);
        }
    }

    // Placeholder for future combat bite action
    bite(target) {
        if (this._attackTimer === 0) {
            // TODO: integrate with CombatManager to apply damage to target
            this._attackTimer = this.attackCooldown;
        }
    }
}; 