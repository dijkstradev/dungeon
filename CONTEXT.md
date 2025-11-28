Arcane Hunger: Survival – Working Context (current)
===================================================

Core Systems / Loop
-------------------
- Level progression with map growth; start overlay gates play. Navigation mesh for enemies (LOS-aware, slows/freezes) and wall-safe pickup spawning.
- Player: dash (double-tap), blink/idle variants, brighter palette; GOLD persists (localStorage). Default 5 spell slots; extra slot costs 10 GOLD; unlock spells for 20 GOLD (unlocks gate spell drops and starters).
- Audio: SFX for attacks/pickups/spells/dash/hurt/mining/level-up; layered background loop; boss fights use a distinct track.
- Share image: refreshed 600x315 card and padding.

Visual Pass
-----------
- World lightened: brighter/warmer floors and walls, softer outlines/shadows; sprites and bosses have stronger highlights, glow/motes, and chibi detailing for readability.
- Boss bars now float over bosses; bosses have richer magical motifs (halos, runes, shards).

Spells Implemented
------------------
- Core: Arc Blast, Sanctify, Swiftstep, Terrashield.
- Offensive/utility: Flame Orb, Frost Nova, Time Warp, Unlimeted Power, Emberstorm, Meteor Drop, Venom Tide, Shadow Step, Stonewall, Gale Slice, Radiant Aegis, Warding Roots, Aura Stride, Star Lance, Void Pulse.
- Metadata-only (not active yet): Mirror Veil, Glacial Spear, Storm Barrier, Life Surge, Arc Burst, Mist Veil, Gravity Well, Ember Dash, Thorn Burst, Chrono Lock, Soul Flare, Ward Bubble, Echo Orb.

Boss System
-----------
- Boss levels at 3/6/9/12; boss spawns at level start while normal enemies still spawn. Level ends only when the boss dies.
- Four bosses (Ember Colossus, Frost Warden, Void Marrow, Stone Tyrant): very large, high HP, unique magical/chibi visuals and varied attacks (dashes, flame wake, frost nova + shards, void pull/beam, stone spikes/charge).
- Rewards: staff +3 levels, full health/mana on boss kill. Boss music during fights; achievements/banner announce boss levels.

Enemies/Prey/Companions
-----------------------
- Enemies use hunger/LOS-based prey hunting; aggro flags persist; titan-style lunge/dash logic.
- Prey/companions have hunger/grazing; companions can follow across levels.
- Minimap blinks for mana/health; GOLD pockets are multi-faceted; pickup spawning respects walls/corridors.

Known Gaps / TODOs
------------------
- Placeholder spells above still need mechanics.
- Persistence is local only (no sync).
