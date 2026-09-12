# 06 — Business Rules & Game Mechanics: SoulForge (Life RPG)

## 1. Core Invariant: Server-Authoritative Progression

1. **The Client is Untrusted**: The frontend never determines XP, gold, attributes, level increments, item costs, or streak states.
2. **AI is Purely Advisory**: The LLM analyzes and classifies task semantics (Difficulty, Effort, Category, Impact). The **Reward Engine** calculates concrete mathematical XP and Gold deterministically.

---

## 2. Mathematical Progression Engine

### 2.1 Non-Linear Level Progression Formula
The hackathon specification strictly requires:
> *"Implement a non-linear leveling system (where each subsequent level requires more XP than the last)."*

SoulForge calculates required XP using a power-law curve:

$$\text{RequiredXP}(L) = \lfloor 100 \times L^{1.6} \rfloor$$

Where:
- $L$ is the hero's current level.
- $\text{RequiredXP}(L)$ is the exact amount of XP required to advance from Level $L$ to Level $L + 1$.

#### Level Scaling Reference Table
| Level ($L$) | Required XP to Next Level | Cumulative XP from Level 1 |
| :---: | :---: | :---: |
| **1** | 100 | 0 |
| **2** | 303 | 100 |
| **3** | 580 | 403 |
| **4** | 921 | 983 |
| **5** | 1,319 | 1,904 |
| **6** | 1,770 | 3,223 |
| **7** | 2,270 | 4,993 |
| **8** | 2,817 | 7,263 |
| **9** | 3,407 | 10,080 |
| **10** | 4,040 | 13,487 |
| **15** | 7,725 | 42,958 |
| **20** | 12,382 | 93,654 |

### 2.2 Multi-Level Leap Advancement Algorithm
If a user finishes an epic task or campaign that yields a massive XP windfall, the leveling engine advances recursively:

```typescript
function applyXP(currentLevel: number, currentXP: number, xpToAdd: number) {
  const oldLevel = currentLevel;
  let totalXP = currentXP + xpToAdd;
  let newLevel = currentLevel;

  while (true) {
    const needed = getRequiredXP(newLevel);
    if (totalXP >= needed) {
      totalXP -= needed;
      newLevel += 1;
    } else {
      break;
    }
  }

  return {
    oldLevel,
    newLevel,
    leveledUp: newLevel > oldLevel,
    remainingXP: totalXP,
    nextLevelXP: getRequiredXP(newLevel)
  };
}
```

---

## 3. Deterministic Reward Engine

When a quest is submitted, the AI classifies it into standardized metadata. The Reward Engine computes persistent values using the formula:

$$\text{FinalXP} = \text{round}(\text{BaseXP}(\text{Difficulty}) \times \text{Multiplier}(\text{Effort}) + \text{Bonus}(\text{Impact}) + \text{Modifier}(\text{Priority}))$$

$$\text{CoinReward} = \max(5, \text{round}(\text{FinalXP} \times 0.4))$$

### 3.1 Reward Coefficient Tables

#### Base XP by Difficulty
| Difficulty | Base XP | Description |
| :--- | :---: | :--- |
| `EASY` | 15 | Quick, low-friction task (< 20 mins) |
| `MEDIUM` | 30 | Standard task requiring focused effort (30–60 mins) |
| `HARD` | 60 | Demanding session requiring deep focus (1–3 hours) |
| `EPIC` | 100 | Massive undertaking, major exam, or full-day milestone |

#### Effort Multiplier
| Effort | Multiplier |
| :--- | :---: |
| `LOW` | $\times 1.00$ |
| `MEDIUM` | $\times 1.25$ |
| `HIGH` | $\times 1.50$ |

#### Impact Bonus XP
| Impact | Bonus XP |
| :--- | :---: |
| `LOW` | $+0$ |
| `MEDIUM` | $+5$ |
| `HIGH` | $+15$ |

#### Priority Modifier XP
| Priority | Modifier XP |
| :--- | :---: |
| `LOW` | $+0$ |
| `MEDIUM` | $+0$ |
| `HIGH` | $+5$ |
| `URGENT` | $+10$ |

*Example*: A `HARD` difficulty, `HIGH` effort, `HIGH` impact, `HIGH` priority task:
$$\text{XP} = \text{round}(60 \times 1.5 + 15 + 5) = 110 \text{ XP}$$
$$\text{Coins} = \text{round}(110 \times 0.4) = 44 \text{ Coins}$$

---

## 4. Attribute Progression System

Every completed quest feeds the character's core attributes based on category:

| Category | Character Attribute Increased | Stat Gain per Difficulty |
| :--- | :--- | :--- |
| `INTELLECT` | `intellect` | EASY: +2, MEDIUM: +4, HARD: +7, EPIC: +12 |
| `STRENGTH` | `strength` | EASY: +2, MEDIUM: +4, HARD: +7, EPIC: +12 |
| `DISCIPLINE` | `discipline` | EASY: +2, MEDIUM: +4, HARD: +7, EPIC: +12 |
| `HEALTH` | `health` | EASY: +2, MEDIUM: +4, HARD: +7, EPIC: +12 |
| `CREATIVITY` | `creativity` | EASY: +2, MEDIUM: +4, HARD: +7, EPIC: +12 |
| `SOCIAL` | `social` | EASY: +2, MEDIUM: +4, HARD: +7, EPIC: +12 |

---

## 5. Consecutive Day Streak Mechanics

### 5.1 Calendar Day Determination
- The server determines dates using the current UTC timestamp (or user's timezone if specified) converted to `YYYY-MM-DD`.
- Let $D_{\text{last}}$ be the calendar date of the user's `lastActiveDate`.
- Let $D_{\text{now}}$ be the current calendar date.
- Difference in days: $\Delta D = D_{\text{now}} - D_{\text{last}}$

### 5.2 Streak State Transitions
1. **First Activity Ever** ($D_{\text{last}} = \text{null}$):
   - `currentStreak = 1`
   - `longestStreak = max(1, longestStreak)`
2. **Same Calendar Day** ($\Delta D = 0$):
   - `currentStreak` remains unchanged.
   - Activity is logged without altering streak counter.
3. **Consecutive Calendar Day** ($\Delta D = 1$):
   - `currentStreak += 1`
   - `longestStreak = max(currentStreak, longestStreak)`
4. **Broken Streak** ($\Delta D > 1$):
   - `currentStreak = 1` (restarts streak).
   - A `STREAK_BROKEN` event is recorded.

### 5.3 Streak Recovery Rules (The Phoenix Shield)
- **Cost**: 50 Gold Coins.
- **Cooldown**: Minimum 7 days between streak recoveries (verified via `StreakRecovery` table).
- **Condition**: Eligible if user had a previous streak $\ge 3$ that was broken within the last 48 hours.
- **Effect**: Restores previous streak counter + 1, deducts 50 coins, and logs `STREAK_RECOVERED`.

---

## 6. Economy & Armory Rules

1. **Unique Cosmetic Rule**: A user cannot buy the same cosmetic item twice (`@@unique([userId, itemId])`).
2. **Atomic Balance Verification**:
   - `character.coins >= item.price` must hold inside an ACID transaction.
   - Negative coin balances are mathematically impossible.
3. **Equip Slots**:
   - Equipping an item of type `THEME` updates `character.themeId` and un-equips any previously equipped theme.
   - Cosmetic slots: `avatarId`, `themeId`, `skinId`, `frameId`, `titleId`.

---

## 7. Campaigns & Milestones (Projects)

1. **Progress Tracking**:
   $$\text{Progress} = \frac{\text{Completed Tasks}}{\text{Total Tasks}}$$
2. **Campaign Completion Bonus**:
   - Triggered when all tasks belonging to the project reach `COMPLETED` status.
   - Grants project-level bonus: `bonusXP` and `bonusCoins`.
   - Cannot be claimed more than once per campaign.
