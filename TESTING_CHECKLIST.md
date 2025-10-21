# Time-Penalty Scoring System - Testing Checklist

## Quick Start

```bash
npm start
# Game opens at http://localhost:5173
```

## Visual Verification

### 1. Subtle Score Display (In-Game)

**Start a new game and verify:**
- [ ] Small score badge appears in UI bar when game starts
- [ ] Format: `M:SS | Score` (e.g., "8:45 | 51,520")
- [ ] Session timer counts up: 0:00, 0:01, 0:02...
- [ ] Score increases as you collect food/buy ants
- [ ] Badge blends with other UI elements (not prominent)
- [ ] Uses same styling as Food/Ants counters

### 2. Victory Screen Breakdown

**Beat a boss and verify:**
- [ ] Victory screen shows "📊 SCORE BREAKDOWN"
- [ ] Four score categories listed:
  - 🍯 Resource Management: X pts
  - 📈 Progression: X pts
  - 🐜 Advanced Content: X pts
  - 🏆 Achievements: X pts
- [ ] BASE TOTAL shown
- [ ] "⏱️ EFFICIENCY BONUS" section appears
- [ ] Completion time displayed (M:SS)
- [ ] Time multiplier shown with color coding
- [ ] Efficiency rating with stars
- [ ] Optimization tip provided
- [ ] FINAL SCORE = BASE × MULTIPLIER (verify math)

## Functional Testing

### Test 1: Fast Run (~5 minutes)

**Goal:** Verify high multiplier with lower base score

**Steps:**
1. Start game
2. Spam click food placement
3. Buy only basic ants (no upgrades)
4. Rush first boss around 5 minutes

**Expected Results:**
- Base score: ~25,000-35,000
- Multiplier: ~×1.50
- Final score: ~37,500-52,500
- Rating: ⭐⭐⭐⭐
- Tip: Something about building more

**Actual Results:**
- Base: ______
- Multiplier: ______
- Final: ______
- Pass/Fail: ______

### Test 2: Optimal Run (~10 minutes)

**Goal:** Verify sweet spot scoring

**Steps:**
1. Start game
2. Balance clicking + buying ants
3. Purchase 2-3 upgrades
4. Unlock Flying Ants
5. Beat boss around 10 minutes

**Expected Results:**
- Base score: ~45,000-55,000
- Multiplier: ~×1.00
- Final score: ~45,000-55,000
- Rating: ⭐⭐⭐
- Tip: Good pace message

**Actual Results:**
- Base: ______
- Multiplier: ______
- Final: ______
- Pass/Fail: ______

### Test 3: Slow Run (~20 minutes)

**Goal:** Verify penalty for grinding

**Steps:**
1. Start game
2. Max out all upgrades
3. Unlock multiple special ants
4. Reach high food tiers
5. Beat boss after 20+ minutes

**Expected Results:**
- Base score: ~80,000-100,000
- Multiplier: ×0.25
- Final score: ~20,000-25,000 (MUCH LOWER!)
- Rating: ⭐
- Tip: Speed up strategy

**Actual Results:**
- Base: ______
- Multiplier: ______
- Final: ______
- Pass/Fail: ______

## Edge Case Testing

### Score Display Visibility
- [ ] Hidden on title screen
- [ ] Visible during PLAYING state (subtle, blends with UI)
- [ ] Hidden during boss intro
- [ ] Visible during boss fight
- [ ] Hidden in pause menu
- [ ] Hidden on victory screen
- [ ] Not distracting or overly prominent

### Timer Accuracy
- [ ] Starts at 0:00 when game begins
- [ ] Counts accurately (use stopwatch)
- [ ] Doesn't reset during boss battles
- [ ] Resets on game restart

### Score Calculation
- [ ] Score increases when collecting food
- [ ] Score increases when buying ants
- [ ] Score increases when unlocking features
- [ ] Final score matches breakdown math
- [ ] Multiplier never below 0.25
- [ ] Multiplier never above 2.00

## Browser Console Tests

**Open DevTools (F12) and run:**

```javascript
// Test 1: Check score display is working
document.getElementById('score-display').style.display;
// Should be: "flex" during gameplay, "none" otherwise

// Test 2: Verify timer is running
const startTime = IdleAnts.game.sessionStartTime;
const elapsed = (Date.now() - startTime) / 1000;
console.log('Elapsed seconds:', elapsed);

// Test 3: Calculate current score manually
const gameData = {
    resourceManager: IdleAnts.game.resourceManager,
    achievementManager: IdleAnts.game.achievementManager,
    dailyChallengeManager: IdleAnts.game.dailyChallengeManager,
    game: IdleAnts.game
};
const score = IdleAnts.game.leaderboardManager.calculateScore(gameData);
const breakdown = IdleAnts.game.leaderboardManager.getLastScoreBreakdown();
console.log('Score:', score);
console.log('Breakdown:', breakdown);

// Test 4: Verify multiplier formula
const minutes = elapsed / 60;
const multiplier = Math.max(0.25, 2.0 - (minutes / 10));
console.log('Minutes:', minutes, 'Multiplier:', multiplier);
```

## Performance Testing

### During Gameplay
- [ ] Score updates smoothly (no lag)
- [ ] Timer increments without skips
- [ ] UI doesn't cause frame drops
- [ ] Works on mobile devices

### Memory Leaks
- [ ] Play for 30+ minutes
- [ ] Check browser memory usage
- [ ] Score display doesn't accumulate elements

## Accessibility Testing

### Visual
- [ ] Score display readable on all backgrounds
- [ ] Colors distinguish good/bad multipliers
- [ ] Stars visible and clear
- [ ] Text size appropriate

### Mobile
- [ ] Score display fits on phone screens
- [ ] Touch doesn't interfere with score panel
- [ ] Readable in portrait and landscape

## Final Verification

**The Two-Player Test:**

Have two people play simultaneously:
- Player A: Speedrun (5 minutes)
- Player B: Optimal (10 minutes)

**Player A Expected:**
- Lower base score
- Higher multiplier
- Potentially lower final score

**Player B Expected:**
- Higher base score
- 1.0x multiplier
- Likely higher final score

**Result:** Player B should win if both play equally well, teaching that 10 minutes is the sweet spot.

---

## Sign-Off

- [ ] All visual elements display correctly
- [ ] All three test scenarios work as expected
- [ ] Edge cases handled properly
- [ ] Console tests pass
- [ ] Performance is acceptable
- [ ] Mobile experience is good

**Tester Name:** ________________
**Date:** ________________
**Overall Status:** PASS / FAIL
**Notes:** ________________________________________________
