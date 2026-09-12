Figma Prompt — Soulforge (Full Design System + Screens)

Create a mobile-first, responsive UI design system and full screen set for Soulforge — an AI-powered "Life RPG" productivity app that turns real-world tasks into character progression. Visual direction: cinematic AAA game menu aesthetic — reference Destiny 2's character screen, Diablo IV's inventory system, and Genshin Impact's UI panels. This should NOT look like flat corporate SaaS, and NOT pixel art — it should feel immersive, layered, and premium.

Design System Foundations (build these first as Figma styles/variables)

Color Styles:

Background base: Obsidian 
#0d0d14, Deep navy 
#12122e
Primary accent (XP/rewards): Molten gold 
#f6ad37
Secondary accent (streaks/fire): Ember orange 
#ff6b35
AI/magic accent: Electric violet 
#8b5cf6
Success: Emerald 
#10e07f
Danger/penalty: Blood red 
#dc2626
Debuff/warning: Muted amber 
#d97706
Rank-tier progression colors: Grey (Beginner/Novice) → Blue-grey (Intermediate) → Steel/silver (Professional) → Bronze (Expert) → Gold (Master/Grand Master) → Prismatic shimmer gradient (Enlightened — max rank)
Rarity colors (shop items): Common grey, Rare blue, Epic violet, Legendary gold
Glass panel fill: White at 6% opacity with backdrop blur

Typography Styles:

Display/Headings/Stat numerals: Rajdhani or Chakra Petch, Bold, condensed — angular sci-fi/HUD feel
Body/descriptions: Inter or Sora, Regular/Medium — clean and legible
Numeral treatment: slightly italicized, tabular-nums, glow drop-shadow in accent color, animated digit roll-up on value change

Core Component Library:

Buttons — primary (gold glow), secondary (outline), danger (red) — each with default/hover/pressed/disabled states
Stat bar — XP energy-fill bar (glowing liquid fill with particle trail), HP-style bar, debuff bar (desaturated/muted fill)
Card — diagonal-cut corner variant, hexagonal-frame variant
Badge/medal — bronze/silver/gold/legendary tiers, plus locked/greyed-out variant
Rank row component — tiered icon (shield → medal → trophy → sparkle, increasing in visual complexity/glow per tier), XP range label, rank name, optional "Your current level" tag pill, glowing left-border accent when active — laid out as a horizontal list row (see reference roadmap layout)
Status icons — streak flame (3 intensity states, low/medium/high), debuff/fatigue icon, streak-recovery shield icon
Tab bar — glowing underline on active tab
Modals/overlays — celebratory level-up (gold burst), penalty (red-tinted, screen-shake), rank-up (slow cinematic reveal, distinct pacing from level-up)

Texture/Overlay Treatment:

Subtle grain/scanline texture overlay across the app (very low opacity)
Vignette effect darkening screen edges, pulling focus to center
Cards use diagonal-cut corners (not rounded) with a thin animated gradient border sweep (gold → orange → violet)
Section dividers styled as glowing horizontal energy lines
Screens to Design (mobile + desktop frames for each)
Onboarding — character-creation-style intro flow; user answers 2-3 prompts (focus areas) to set beginner starting stats
Dashboard (Home) — avatar in glowing hexagonal frame, Level badge, XP energy-fill bar, coin counter (digit roll-up), streak flame icon, debuff/fatigue status indicator (if active), current Rank tag near avatar
Quest Log — tabbed (Daily / Projects / AI-Suggested), quest cards with AI-assigned coin/XP reward and an "AI-graded" badge, difficulty shown as colored gem icons, overdue tasks flagged with red-tinted border + countdown, completion = checkmark burst animation cue
Deadline Miss / Penalty Modal — red-tinted overlay, "−XX XP" readout, non-shaming copy, shows debuff being applied and its duration
Projects — grid of mission cards, circular progress ring per project, bonus reward icon pulses when ready to claim
AI Project Planner — conversational input inside a glowing console/oracle-style panel (violet scanline glow); generated task cards shown materializing in sequence
Habit Changer — same console UI, violet-tinted, generated quest chain marked with a distinct rune/sigil tag
Level-Up Modal — full-screen gold light burst, particle embers, bold "LEVEL UP" text, before/after stat comparison
Rank-Up Modal — visually distinct from level-up: slower, more cinematic reveal (icon morphs/upgrades on screen, e.g. shield transforming into a medal), rank title displayed large — reads as a rarer, bigger milestone
Character Sheet — full attribute stat bars, streak badge collection grid (tiered medals, locked ones greyed), equipped cosmetics, unlocked titles, current rank badge prominent near name
Progression Path (new dedicated screen) — full vertical rank roadmap matching the reference layout: icon + XP range + rank name per row, current rank row highlighted with glow and "Your current level" tag, future ranks dimmed, completed ranks shown with a filled/checkmark state
Shop/Inventory — hexagonal item slots grouped by category (Avatars, Skins, Pets, Backgrounds, UI Themes, Profile Frames, Titles, Effects), rarity-based glow colors, streak-recovery item pinned with pulsing urgency glow, rank-locked items greyed with "Unlocks at [Rank]" label
Leaderboard — toggle Global/Friends, podium-style top 3 with glowing rank frames (gold/silver/bronze), rank title shown next to each name, animated rank-change arrows, sticky user row while scrolling
Stats & History — streak calendar heatmap (ember-intensity grid), XP-over-time line chart (neon draw-in), personal records as engraved stat plaques, badge earn history and rank-up history timelines
Friends — friend list with mini character cards (portrait, level, rank title, streak flame), shareable full character card (HUD-frame treatment) showing badges + rank for screenshots
Interaction Annotations (sticky notes for developer handoff)
"XP bar: spring fill animation, particle trail follows fill edge"
"Coin/XP numbers: roll-up digit animation on change"
"Penalty modal: screen shake + red flash on entry"
"Rank-up modal: slow cinematic reveal — distinct pacing from fast level-up burst, should feel rarer and more earned"
"Task completion: optimistic UI — instant checkmark + particle burst before backend confirms"
"AI Planner/Habit Changer: violet particle motion while generating, signals 'AI is thinking'"
Design Principles to Maintain
One primary focal point per frame — use layered depth, not flat clutter, to manage visual density
Reward (gold/emerald glow), penalty (red/muted tones), and rank-prestige (escalating icon complexity + shimmer at max tier) must be visually distinguishable at a glance
Maintain WCAG AA text contrast throughout despite the dark, glowing background treatment
Max 3-4 primary content blocks visible per screen; secondary data lives behind tabs/expand/detail screens