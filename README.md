# Idle Ants - Ant Colony Simulation Game

A fun idle game where you manage an ant colony, collect food, and grow your colony!

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Preview production build
npm run preview
```

## Development

- **Development server**: `npm start` or `npm run dev`
  - Runs on `http://localhost:5173`
  - Hot reload enabled
  - Debug mode automatically enabled
  - All your changes appear instantly

- **Production build**: `npm run build`
  - Creates optimized build in `dist/` folder
  - Automatically bundles and minifies all files
  - Ready for deployment

## Project Structure

```
src/
├── core/           # Core game namespace
├── data/           # Game data and configurations
├── effects/        # Visual effects system
├── entities/       # Game entities (ants, food, enemies, etc.)
├── managers/       # Game systems management
└── Game.js         # Main game class

assets/             # Game assets and definitions
styles.css          # Game styling
index.html          # Main entry point
```

## Features

- 🐜 Ant colony management
- 🍎 Resource collection and upgrades
- 👑 Special ant types (Queen, Flying, Car, Fire ants)
- 🎯 Daily challenges and achievements
- 🎵 Audio and visual effects
- 📱 Mobile-friendly responsive design
- 🦌 Boss battles (Anteater Boss)

## Tech Stack

- **Vanilla JavaScript** - No frameworks, pure JS for performance
- **PIXI.js** - 2D graphics rendering
- **Vite** - Modern build tool and dev server
- **CSS3** - Responsive styling with animations

## Legacy Commands

For compatibility with older setups:
- `npm run legacy:bundle` - Create bundle.js (old method)
- `npm run legacy:serve` - Serve with http-server (old method)