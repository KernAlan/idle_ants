# Time-Penalty Scoring System

## Overview

The game now features a **10-minute optimization scoring system** that rewards efficient resource management. Kids compete to get the highest score by balancing completion speed with progression.

## How It Works

### Score Formula

```
FINAL SCORE = BASE SCORE × TIME MULTIPLIER

Where:
BASE SCORE = Resource Management + Progression + Advanced Content + Achievements
TIME MULTIPLIER = max(0.25, 2.0 - (minutes / 10))
```

### Time Multiplier Curve

| Completion Time | Multiplier | Rating | Description |
|----------------|------------|--------|-------------|
| 2 minutes | ×1.80 | ⭐⭐⭐⭐⭐ | Lightning Fast! (Speedrun) |
| 5 minutes | ×1.50 | ⭐⭐⭐⭐ | Excellent Efficiency! |
| 10 minutes | ×1.00 | ⭐⭐⭐ | Good Pace (Sweet Spot) |
| 15 minutes | ×0.50 | ⭐⭐ | Room for Improvement |
| 20+ minutes | ×0.25 | ⭐ | Take Your Time (Minimum) |

### Base Score Components

**Resource Management (30%):**
- Food collected (logarithmic scaling)
- Peak ant population (200 pts per ant)
- Average efficiency (food per second)

**Progression (30%):**
- Upgrades purchased (400 pts each)
- Food tier reached (1000 pts per tier)
- Colony capacity expansions (150 pts each)

**Advanced Content (25%):**
- Special ant types unlocked and owned
- Queen ant upgrade level
- Advanced features (autofeeder, etc.)

**Achievements (15%):**
- Regular achievements (400 pts each)
- Daily challenges (800 pts each)
- Golden Ant bonus (15,000 pts)

## Features Implemented

### 1. Subtle Score Display

During gameplay, a minimal score tracker shows:
- **Session Timer** - Live timer (M:SS format)
- **Current Score** - Updates in real-time

**Format:** `8:45 | 51,520`

**Location:** Small pill-shaped badge in the UI bar (blends in with other stats)

**Design Philosophy:** Not prominent - kids focus on gameplay, not the score. The detailed breakdown is revealed on the victory screen.

### 2. Victory Screen Breakdown

After completing a boss, kids see:

```
📊 SCORE BREAKDOWN
─────────────────────
🍯 Resource Management:    12,500 pts
📈 Progression:             8,300 pts
🐜 Advanced Content:        15,200 pts
🏆 Achievements:           10,000 pts
─────────────────────
BASE TOTAL:                46,000 pts

⏱️ EFFICIENCY BONUS
─────────────────────
Completion Time: 8:45
Time Multiplier: ×1.12

Excellent Efficiency! 💨 ⭐⭐⭐⭐

💡 Great job! Finish 165s faster for max multiplier!

🎯 FINAL SCORE: 51,520
```

### 3. Optimization Tips

The system provides actionable feedback:
- "Finish 2 mins faster for +5,000 points!"
- "Try rushing Flying Ants earlier!"
- "Perfect run! Can you beat your own record?"

## Teaching Resource Management

### What Kids Learn

1. **Time is a Resource**
   - Every second counts toward their multiplier
   - Rushing isn't always best (need base score too)

2. **Risk vs Reward**
   - Fast runs = high multiplier, low base score
   - Slow runs = high base score, low multiplier
   - **Optimal = 10 minutes** balances both

3. **Opportunity Cost**
   - "Should I save for Fire Ant OR buy 10 regular ants NOW?"
   - Real resource allocation decisions

4. **Efficiency Thinking**
   - Not about grinding longer
   - About optimizing strategy

### Example Scenarios

**Scenario A - The Speedrunner**
- Time: 5 minutes
- Base Score: 30,000
- Multiplier: ×1.50
- **Final: 45,000**
- Learns: "I need more progression before finishing"

**Scenario B - The Optimizer**
- Time: 10 minutes
- Base Score: 50,000
- Multiplier: ×1.00
- **Final: 50,000**
- Learns: "Perfect balance!"

**Scenario C - The Grinder**
- Time: 20 minutes
- Base Score: 80,000
- Multiplier: ×0.25
- **Final: 20,000** ⚠️
- Learns: "Playing longer HURT my score! Need to be faster!"

## Testing Instructions

### How to Test

1. **Start the Game:**
   ```bash
   npm start
   ```

2. **Play Different Strategies:**

   **Test 1: Speedrun (Target: 5 mins)**
   - Rush basic ants quickly
   - Skip upgrades
   - Beat first boss ASAP
   - Expected: High multiplier, lower base score

   **Test 2: Balanced (Target: 10 mins)**
   - Buy mix of ants and upgrades
   - Progress steadily
   - Beat boss around 10-minute mark
   - Expected: 1.0x multiplier, good base score

   **Test 3: Slow Grind (Target: 20+ mins)**
   - Max out upgrades
   - Collect lots of food
   - Take your time
   - Expected: Low multiplier, high base score penalty

3. **Verify Features:**

   **Real-Time Display:**
   - [ ] Score display appears when game starts
   - [ ] Timer counts up correctly (M:SS format)
   - [ ] Score updates every second
   - [ ] Multiplier changes color based on time
   - [ ] Stars update as time progresses

   **Victory Screen:**
   - [ ] Shows detailed score breakdown
   - [ ] Displays session time correctly
   - [ ] Shows time multiplier
   - [ ] Provides optimization tip
   - [ ] Final score = base × multiplier

4. **Check Edge Cases:**
   - [ ] Score display hidden on title screen
   - [ ] Score display hidden in menus
   - [ ] Score persists across boss battles
   - [ ] Timer resets on game restart
   - [ ] Multiplier never goes below 0.25

### Expected Behavior

**At 2 minutes:**
- Multiplier: ×1.80
- Stars: ⭐⭐⭐⭐⭐
- Color: Green

**At 10 minutes:**
- Multiplier: ×1.00
- Stars: ⭐⭐⭐
- Color: Green

**At 20 minutes:**
- Multiplier: ×0.25
- Stars: ⭐
- Color: Red

## Configuration

### Adjusting the Formula

**File:** `LeaderboardManager.js:160`

```javascript
const TARGET_MINUTES = 10; // Change sweet spot (default: 10)
const timeMultiplier = Math.max(0.25, 2.0 - (sessionMinutes / TARGET_MINUTES));
```

**Examples:**

**Easier (Less Penalty):**
```javascript
const timeMultiplier = Math.max(0.5, 2.0 - (sessionMinutes / 10));
// Floor increased from 0.25 → 0.5
```

**Harder (Tighter Window):**
```javascript
const timeMultiplier = Math.max(0.25, 2.0 - (sessionMinutes / 8));
// Sweet spot changed from 10 → 8 minutes
```

**Different Curve:**
```javascript
// Exponential decay instead of linear
const timeMultiplier = Math.max(0.25, Math.pow(0.9, sessionMinutes));
```

### Adjusting Score Weights

**File:** `LeaderboardManager.js:24-52`

Change the point values:
```javascript
const foodScore = Math.log10(Math.max(foodCollected, 1)) * 2500; // Increase for more weight
const antScore = peakAnts * 200; // Adjust points per ant
const tierScore = (resourceManager.stats.foodTier || 1) * 1000; // Points per tier
```

## Leaderboard Integration

The scoring system automatically integrates with the GitHub leaderboard:

**Data Submitted:**
- Player name
- Final score (with time multiplier applied)
- Session time (in minutes)
- Base score components
- Food collected, ants owned, etc.

**Leaderboard Display:**
```
Rank | Player      | Score     | Time   | Details
-----|-------------|-----------|--------|------------------
1.   | FastKid     | 52,100    | 8.5m   | 12 achievements
2.   | ProGamer    | 48,500    | 9.2m   | Tier 15 reached
3.   | Optimizer   | 45,000    | 10.1m  | Golden Ant!
```

## Troubleshooting

### Score Display Not Showing

**Check:**
1. Game state is PLAYING
2. Elements are cached in UIManager
3. LeaderboardManager is initialized

**Fix:**
```javascript
// In browser console:
document.getElementById('score-display').style.display = 'flex';
```

### Score Calculation Errors

**Check:**
1. sessionStartTime is set in Game.js
2. LeaderboardManager exists
3. No undefined values in gameData

**Debug:**
```javascript
// In browser console:
const gameData = IdleAnts.game.victoryScreenManager.getGameData();
const score = IdleAnts.game.leaderboardManager.calculateScore(gameData);
console.log(score);
```

### Multiplier Not Updating

**Check:**
1. updateLiveScore() is called in UIManager.updateUI()
2. Time is calculated correctly
3. Elements exist in DOM

**Debug:**
```javascript
// In browser console:
const sessionTime = (Date.now() - IdleAnts.game.sessionStartTime) / 1000;
const multiplier = Math.max(0.25, 2.0 - (sessionTime / 600));
console.log({ sessionTime, multiplier });
```

## Next Steps (Optional Enhancements)

1. **Personal Best Tracking**
   - Store best score in localStorage
   - Show "New Record!" on victory screen
   - Display previous best during gameplay

2. **Score Prediction**
   - "If you finish NOW, your score would be X"
   - Helps kids decide when to end run

3. **Multiple Difficulty Modes**
   - Easy: 15-minute sweet spot, 0.5 floor
   - Normal: 10-minute sweet spot, 0.25 floor
   - Hard: 7-minute sweet spot, 0.1 floor

4. **Daily Challenges with Time Limits**
   - "Beat the boss in under 8 minutes!"
   - Extra rewards for time-based challenges

5. **Replay System**
   - Save high-score runs
   - Watch replays to learn strategies

6. **Score Comparison**
   - "You scored 15% better than your last run!"
   - Compare to friends' scores

## Summary

The time-penalty scoring system transforms the game from "wait and grind" into "optimize and compete." Kids learn:
- ✅ Time management
- ✅ Resource allocation
- ✅ Risk vs reward
- ✅ Efficiency optimization

The 10-minute sweet spot creates natural replay value as kids experiment with different strategies to find the perfect balance.

**Key Success Metrics:**
- Kids replay multiple times to beat their score
- Kids understand "faster isn't always better"
- Kids make strategic decisions about ant purchases
- Kids feel rewarded for efficient play
