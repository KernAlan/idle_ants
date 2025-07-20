// Jest setup file for Idle Ants game testing

// Mock PIXI.js for testing
global.PIXI = {
    Application: jest.fn(),
    Container: jest.fn(),
    Sprite: jest.fn(),
    Graphics: jest.fn(),
    Text: jest.fn(),
    Loader: {
        shared: {
            add: jest.fn(),
            load: jest.fn()
        }
    },
    Assets: {
        load: jest.fn()
    },
    Texture: {
        from: jest.fn()
    }
};

// Mock IdleAnts namespace
global.IdleAnts = {
    Game: {},
    Managers: {},
    Entities: {},
    Effects: {},
    Data: {}
};

// Mock browser APIs
Object.defineProperty(window, 'localStorage', {
    value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn()
    }
});

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 16));
global.cancelAnimationFrame = jest.fn();

// Mock Audio
global.Audio = jest.fn().mockImplementation(() => ({
    play: jest.fn(),
    pause: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    load: jest.fn(),
    volume: 1,
    currentTime: 0,
    duration: 0,
    paused: true
}));