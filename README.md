# Idle Ants Game

A 2D idle game inspired by Idle Ants by Madbox, built with Pixi.js. In this game, you manage a colony of ants that collect food to grow your colony.

## How to Play

- **Collect Food**: Click on the game area to manually add food and earn food points
- **Ants**: Ants will automatically move around, find food, and bring it back to the nest
- **Upgrades**:
  - **Buy Ant**: Purchase a new ant to increase your food collection rate (Cost increases by 50% each purchase)
  - **Upgrade Food Collection**: Increase the amount of food you get per click and per ant (Cost doubles each upgrade)
  - **Expand Colony**: Increase the maximum number of ants you can have (Cost doubles each expansion)
  - **Upgrade Speed**: Increase ant movement speed (Cost increases by 80% each upgrade)
  - **Upgrade Strength**: Improve ants' carrying capacity and collection speed (Cost increases by 80% each upgrade)

## Game Features

- Idle gameplay mechanics where resources accumulate over time
- Visual representation of ants gathering food and returning to the nest
- Progressive upgrade system with scaling costs and benefits
- Food sources that appear randomly throughout the game area

## Game Mechanics

### Ant Attributes
- **Strength**: Determines how much food ants can carry and affects collection speed
  - Increases carrying capacity for multiple food items
  - Provides collection speed bonus (up to 75% faster)
  - Can be upgraded with food resources
  - Each upgrade increases strength by 1 and costs 80% more than the previous
- **Speed**: Affects ant movement rate and collection efficiency
  - Upgradeable multiplier for faster resource gathering
  - Applies to both regular and flying ants
  - Each upgrade increases speed multiplier and costs 80% more than the previous

### Ant Types
- **Regular Ants**: Basic worker units that collect 0.5 food per second
  - Initial cost: 10 food
  - Cost increases by 50% per purchase
  - Limited by colony size
- **Flying Ants**: Premium units that:
  - Must be unlocked with 500 food resources
  - Collect 2 food per second (4x more efficient)
  - Initial cost: 100 food
  - Cost increases by 80% per purchase
  - Have separate expansion mechanics (expand by 2 slots)
  - Expansion costs 50% more than regular ant expansion

### Food System
- Two food tiers currently implemented:
  - Basic Food (Tier 1)
  - Cookie Food (Tier 2)
- Food value scales with upgrades and multipliers
- Collection speed varies based on:
  - Ant strength
  - Food weight
  - Ant type (flying vs regular)
- Food upgrades double in cost each tier
- Food multiplier affects both manual collection and ant collection rates

## Project Structure and Architecture

```
idle_ants/
├── index.html           # Main HTML entry point
├── styles.css           # Global styles for the game
├── package.json         # Project dependencies and metadata
├── src/                 # Source code directory
│   ├── index.js         # JavaScript entry point
│   ├── Game.js          # Main game controller
│   ├── core/            # Core functionality
│   │   └── Namespace.js # Global namespace definition
│   ├── data/            # Game data and configurations
│   │   └── FoodTypes.js # Food type definitions and properties
│   ├── effects/         # Visual effects
│   │   ├── Effect.js           # Base effect class
│   │   ├── FoodCollectEffect.js # Food collection animation
│   │   ├── FoodDropEffect.js   # Food dropping animation
│   │   ├── FoodSpawnEffect.js  # Food spawning animation
│   │   ├── SpawnEffect.js      # Entity spawning animation
│   │   └── index.js            # Effects module exports
│   ├── entities/        # Game entities
│   │   ├── AntBase.js   # Base ant functionality
│   │   ├── Ant.js       # Regular ant implementation
│   │   ├── FlyingAnt.js # Flying ant variant
│   │   ├── Food.js      # Food resource
│   │   └── Nest.js      # Ant nest/colony
│   └── managers/        # Game system managers
│       ├── AssetManager.js      # Handles loading/managing assets
│       ├── BackgroundManager.js # Manages the game background
│       ├── EffectManager.js     # Controls visual effects
│       ├── EntityManager.js     # Manages all game entities
│       ├── ResourceManager.js   # Manages game resources
│       └── UIManager.js         # Handles user interface elements
```

## Code Architecture Overview

### Core Components

- **Game.js**: Central controller that initializes and coordinates all game systems and handles the main game loop.
- **Namespace.js**: Establishes the global `IdleAnts` namespace to prevent pollution of the global scope.

### Entity System

The game uses an entity-based architecture:

- **AntBase.js**: Base class for all ant types that defines common ant behaviors like movement, pathfinding, food collection, and animation.
- **Ant.js**: Standard ant implementation that extends AntBase.
- **FlyingAnt.js**: A specialized ant type that flies and has unique movement patterns and animations.
- **Food.js**: Represents food resources that ants can collect.
- **Nest.js**: The central ant colony where ants return with collected food.

### Manager System

The game uses a manager pattern to organize different subsystems:

- **AssetManager**: Handles loading, caching, and providing game assets (textures, sprites).
- **BackgroundManager**: Controls the game's background visuals.
- **EffectManager**: Manages visual effects like food collection animations.
- **EntityManager**: Controls the creation, updating, and removal of all game entities.
- **ResourceManager**: Tracks and updates game resources like food count and ant population.
- **UIManager**: Handles all UI elements including buttons, counters, and tooltips.

### Effect System

Visual feedback is handled through the effect system:

- **Effect.js**: Base class for all visual effects.
- **FoodCollectEffect.js**: Animation shown when food is collected.
- **FoodDropEffect.js**: Animation shown when food is dropped.
- **FoodSpawnEffect.js**: Animation shown when new food spawns.
- **SpawnEffect.js**: Animation shown when a new entity spawns.

### Data System

Game configurations and constants:

- **FoodTypes.js**: Defines the different types of food, their properties, and spawn rates.

## Extending the Game

### Adding a New Ant Type

1. Create a new class in `src/entities/` that extends `AntBase.js`
2. Override methods as needed to implement unique behaviors
3. Register the new ant type in `EntityManager.js`
4. Add UI elements in `UIManager.js` to allow purchasing the new ant type

### Adding New Food Types

1. Define new food properties in `src/data/FoodTypes.js`
2. Update `Food.js` if necessary to handle special properties
3. Add textures to `AssetManager.js`

### Adding New Upgrades

1. Define upgrade properties in `ResourceManager.js`
2. Implement upgrade effects in the relevant system
3. Add UI elements in `UIManager.js`

## Technologies Used

- HTML5
- CSS3
- JavaScript
- Pixi.js for 2D rendering