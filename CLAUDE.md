# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Start development server with hot reload
npm start
# or
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Legacy compatibility commands
npm run legacy:bundle    # Creates bundle.js (old build method)
npm run legacy:serve     # Serves with http-server
```

Development server runs on `http://localhost:5173` with hot reload enabled.

## Architecture Overview

This is an **idle game about ant colony management** built with **vanilla JavaScript and PIXI.js** for 2D graphics rendering. The architecture follows a **manager-based pattern** with clear separation of concerns:

### Core Structure
- **`IdleAnts` namespace**: Global namespace containing all game classes and modules
- **`src/Game.js`**: Main game class with state management (TITLE, PLAYING, BOSS_FIGHT, etc.)
- **Manager pattern**: Each game system has a dedicated manager in `src/managers/`
- **Entity system**: Game objects (ants, food, enemies) in `src/entities/`

### Key Managers
- **EntityManager**: Handles all game entities and their PIXI containers
- **ResourceManager**: Manages food collection, ant counts, upgrades
- **UIManager**: Controls all UI elements and game interface
- **AudioManager**: Sound effects and background music
- **CameraManager**: Viewport movement and zoom controls
- **EffectManager**: Visual effects system
- **CombatManager**: Boss fights and enemy interactions
- **AchievementManager**: Achievement tracking and rewards

### Game World Setup
- **Map size**: 3000x2000 pixels with camera system
- **Entity containers**: Layered PIXI containers for proper rendering order
- **Asset system**: Centralized asset loading with `AssetManager`

### Special Features
- **Boss battles**: Anteater Boss, Tarantula Boss, Giant Hornet Boss
- **Special ant types**: Queen, Flying, Car, Fire, Golden ants
- **Daily challenges**: Time-limited objectives with rewards
- **Leaderboard system**: GitHub-based leaderboard integration
- **Mobile support**: Responsive design with touch controls

### Development Notes
- No testing framework currently configured
- Uses Vite for modern development with ES modules
- All game logic in vanilla JS (no external frameworks)
- PIXI.js handles all graphics rendering
- Assets loaded via `assets/` directory with structured definitions