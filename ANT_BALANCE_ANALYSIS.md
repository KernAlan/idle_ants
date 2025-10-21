# Ant Balance Analysis for 10-Minute Optimization

## Current Ant Economics

| Ant Type | Cost | Food/Sec | ROI (Break-even) | Viable for 10-min? |
|----------|------|----------|------------------|-------------------|
| Regular  | 10   | 0.5      | 20 seconds       | ✅ Yes (speedrun) |
| Flying   | 100  | 2.0      | 50 seconds       | ⚠️ Marginal       |
| Fire     | 700  | 8.0      | 87.5 seconds     | ❌ Too slow       |
| Car      | 2500 | 5.0      | 500 seconds      | ❌ Way too slow   |

## The Problem

### Fire Ant Math:
- Cost: 700 food
- Output: 8 food/sec
- Break-even: 87.5 seconds (1.5 minutes)
- **In a 10-minute run:** Only generates profit for 8.5 minutes = 4,080 food
- **But:** You could buy 70 regular ants for same cost = 35 food/sec for 10 mins = 21,000 food!

**Fire Ants are 5x WORSE than spam regular ants for 10-minute runs!**

### Flying Ant Math:
- Cost: 100 food
- Output: 2 food/sec
- Break-even: 50 seconds
- Better than Fire Ants, but only 4x better than regular ants (vs 10x cost)

### Car Ant Math:
- Cost: 2500 food
- Break-even: **8.3 MINUTES**
- Useless for 10-minute optimization

---

## Rebalanced Proposal

### Strategy Tiers:

**Speedrun Strategy (5-6 minutes):**
- Spam regular ants
- High multiplier (×1.5-1.6)
- Lower base score

**Balanced Strategy (8-10 minutes):**
- Mix regular + Flying + Fire ants
- Sweet spot multiplier (×1.0-1.2)
- Highest total score

**Greedy Strategy (12-15 minutes):**
- Invest in Car ants
- Low multiplier (×0.5-0.7)
- Multiplier penalty outweighs ant power

---

## New Balance (Option A - Aggressive Rebalance)

| Ant Type | Old Cost | New Cost | Food/Sec | New ROI | 10-Min Profit |
|----------|----------|----------|----------|---------|---------------|
| Regular  | 10       | 10       | 0.5      | 20s     | 290 food      |
| Flying   | 100      | **60**   | 2.0      | 30s     | 1,140 food    |
| Fire     | 700      | **250**  | 8.0      | 31.25s  | 4,550 food    |
| Car      | 2500     | 2500     | 5.0      | 500s    | -500 food (!) |

### Efficiency per 100 food spent:
- Regular (10 ants): 5 food/sec for 10 mins = **3,000 food gained**
- Flying (1.66 ants): 3.33 food/sec for 10 mins = **1,900 food gained**
- Fire (0.4 ants): 3.2 food/sec for 10 mins = **1,820 food gained**

**Result:** Regular ants still best for raw efficiency, but Fire ants competitive now!

---

## New Balance (Option B - Conservative Rebalance)

| Ant Type | Old Cost | New Cost | Food/Sec | New ROI | Strategy |
|----------|----------|----------|----------|---------|----------|
| Regular  | 10       | 10       | 0.5      | 20s     | Speedrun |
| Flying   | 100      | **75**   | 2.0      | 37.5s   | Mid-game |
| Fire     | 700      | **350**  | 8.0      | 43.75s  | Late-game|
| Car      | 2500     | 2500     | 5.0      | 500s    | Endgame  |

### Why This Works:

**Fire Ant at 350 cost:**
- Break-even: 43.75 seconds (under 1 minute!)
- Profit window: 9+ minutes in a 10-min run
- Generates 4,320 food over 10 mins (vs 4,800 for same cost in regular ants)
- **Trade-off:** Slightly worse raw value, but less micromanagement

**Flying Ant at 75 cost:**
- Break-even: 37.5 seconds
- Better mid-game bridge between regular and fire ants
- Still not as efficient as regular, but faster to deploy

---

## Recommended: Option B (Conservative)

**Why:**
1. Keeps regular ants viable (cheap spam strategy)
2. Makes Fire ants worthwhile (premium efficiency strategy)
3. Flying ants become useful stepping stone
4. Car ants stay endgame (penalty for grinding)

**Teaching Moment:**
Kids learn: "Fire ants cost more but I don't need as many = good for 10-min runs"
NOT: "Just spam the cheapest thing forever"

---

## Implementation

Change these values in `ResourceManager.js`:

```javascript
// Line 21: Flying Ant cost
flyingAntCost: 75,  // Was: 100

// Line 63: Fire Ant cost
fireAntCost: 350,  // Was: 700
```

**Unlock costs stay the same** - those are progression gates, not optimization decisions.
