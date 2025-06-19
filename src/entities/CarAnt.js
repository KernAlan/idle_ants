// src/entities/CarAnt.js
if (typeof IdleAnts === 'undefined') IdleAnts = {};
if (typeof IdleAnts.Entities === 'undefined') IdleAnts.Entities = {};

IdleAnts.Entities.CarAnt = class extends IdleAnts.Entities.AntBase {
    constructor(texture, nestPosition, speedMultiplier = 1) {
        // CarAnts are super fast! Let's give them a high speedFactor.
        // Assuming FlyingAnts might be around 5-10, let's make this 15.
        super(texture, nestPosition, speedMultiplier, 5); // High speedFactor

        // CRITICAL: Ensure position is set directly at the nest
        this.x = nestPosition.x;
        this.y = nestPosition.y;

        // Car-specific properties
        this.wheelRotationSpeed = 0.5; // Radians per frame

        // Car ants might have a more fixed or different turn speed
        this.turnSpeed = 0.2; 
    }

    // Override to set a potentially different base scale for CarAnt
    getBaseScale() {
        return 0.9 + Math.random() * 0.2; // Slightly larger and less variable than default
    }

    createTypeSpecificElements() {
        // Create car body and wheels
        this.createCarBody();
        this.createWheels();
    }

    createCarBody() {
        this.carBody = new PIXI.Graphics();
        
        // Simple rectangular car body
        this.carBody.beginFill(0xFF0000); // Red color for the car
        this.carBody.drawRect(-15, -8, 30, 16); // Body size
        this.carBody.endFill();

        // Add a small "cabin"
        this.carBody.beginFill(0xCCCCCC); // Light grey for cabin
        this.carBody.drawRect(-8, -12, 16, 6); // Cabin on top
        this.carBody.endFill();
        
        this.addChild(this.carBody);
    }

    createWheels() {
        this.wheels = [];
        this.wheelsContainer = new PIXI.Container();
        this.addChild(this.wheelsContainer);

        const wheelRadius = 5;
        const wheelColor = 0x333333; // Dark grey for wheels

        // Wheel positions (relative to ant/car center)
        // [x, y]
        const wheelPositions = [
            [-10, 8], // Front-left
            [10, 8],  // Front-right
            [-10, -8], // Rear-left
            [10, -8]   // Rear-right
        ];

        wheelPositions.forEach(pos => {
            const wheel = new PIXI.Graphics();
            wheel.beginFill(wheelColor);
            wheel.drawCircle(0, 0, wheelRadius);
            wheel.endFill();

            // Add a small hubcap detail
            wheel.beginFill(0xAAAAAA);
            wheel.drawCircle(0, 0, wheelRadius * 0.4);
            wheel.endFill();

            wheel.position.set(pos[0], pos[1]);
            this.wheelsContainer.addChild(wheel);
            this.wheels.push(wheel);
        });
    }

    performAnimation() {
        this.animateWheels();
        this.createExhaustEffect(); // Add a little exhaust
    }

    animateWheels() {
        // Calculate current speed to modulate wheel animation speed
        const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        const effectiveRotationSpeed = this.wheelRotationSpeed * (currentSpeed / this.speed); // Modulate by current speed vs max speed

        this.wheels.forEach(wheel => {
            wheel.rotation += effectiveRotationSpeed;
        });
    }

    createExhaustEffect() {
        // Occasionally create a small puff of "exhaust"
        if (Math.random() < 0.1 && IdleAnts.app.effectManager) { // 10% chance per frame
            const exhaustOffsetX = -18; // Relative to car center, towards the back
            const exhaustOffsetY = 0;

            // Rotate offset by car's rotation (this.rotation is body, ant faces right initially, PIXI up is 0)
            // Ant's visual rotation is this.rotation. Actual movement angle is Math.atan2(this.vy, this.vx)
            // For visual effect, align with the body. Sprite faces right.
            const angle = this.rotation - (Math.PI / 2); // Adjust because sprite is drawn facing up

            const worldExhaustX = this.x + (exhaustOffsetX * Math.cos(angle) - exhaustOffsetY * Math.sin(angle)) * this.scale.x;
            const worldExhaustY = this.y + (exhaustOffsetX * Math.sin(angle) + exhaustOffsetY * Math.cos(angle)) * this.scale.y;
            
            IdleAnts.app.effectManager.createEffect( // Using a generic effect for now
                worldExhaustX,
                worldExhaustY,
                [0xAAAAAA, 0x888888], // Greyish colors
                10, // particle count
                0.3, // minSize
                0.8, // maxSize
                0.5, // minDuration
                1.0, // maxDuration
                { x: -0.5, y: 0 }, // velocity (slightly backwards)
                0.1 // spread
            );
        }
    }

    // CarAnts might have different boundary handling, e.g., they don't just wrap around.
    // For now, uses AntBase's default. Can be overridden.
    // handleBoundaries(width, height) {
    //     super.handleBoundaries(width, height);
    // }
}; 