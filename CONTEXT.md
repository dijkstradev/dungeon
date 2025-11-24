Arcane Run: Survival – Working Context
======================================

Core Systems Added/Changed
--------------------------
- Level progression, resized maps per level; start overlay (Start button) gates gameplay.
- Navigation mesh/A* for enemy pathing; enemies slow/freeze aware; wall-safe pickup spawning.
- Player: faster walk bob, dash via double-tap, blink/idle variants, richer sprite polish.
- Minerals: gold deposits embedded in ground; mine with `M`; GOLD persists (localStorage). GOLD label in HUD/spell dialog. Purchase extra spell slot for 100 GOLD.
- Spellbook: dialog lists spells with runes, descriptions, locked/unlocked state; unlock costs 20 GOLD; pick starter spells per slot; unlocks/starter choices persist (localStorage). Spell drops only choose unlocked spells.
- Sound: Web Audio SFX for attack/pickup/spell/dash/hurt/mining/level-up; background soft-bit music loop.
- Share image: larger padding between stat labels/values; 600x315 card layout refreshed.

Implemented Spells (behavior + visuals)
---------------------------------------
- Blast (Arc Blast), Heal (Sanctify), Haste (Swiftstep), Terrashield (root + armor + burst).
- Flame Orb: homing fireball (LOS-gated), stops on walls, explodes with layered flame FX.
- Frost Nova: radial freeze/slow, shard damage, layered icy rings/sparkles.
- Time Warp: large AoE slow on enemies, player speed buff; layered warp rings/sparkles.
- Unlimeted Power: forward cone zaps multiple foes with jittery bolts.

New Spells Defined (metadata only, not yet implemented)
-------------------------------------------------------
- Offense/utility/defense placeholders: flameorb, frostnova, timewarp, chainlightning (implemented), plus emberstorm, meteordrop, venomtide, shadowstep, stonewall, galeslice, radiantaegis, wardingroots, aurastride, starlance, voidpulse, mirrorveil, glacialspear, stormbarrier, lifesurge, arcburst, mistveil, gravitywell, emberdash, thornburst, chronolock, soulflare, wardbubble, echoorb. All have runes/colors/labels/descriptions for spellbook/unlocks.

Enemies/Prey
------------
- Enemies gain hunger/LOS-based prey hunting; pathfinding via nav mesh; slows/freeze fields.
- Companions/prey: hunger, grazing on grass; sparkles/footsteps.
- Aggro unlock per variant persists across level transitions.

Environment/Visuals
-------------------
- Gold deposits: multi-facet embedded nuggets with close sparkles; no shadow. Minerals called GOLD.
- Map generator: rooms + corridors; central chamber; pickup spawns avoid walls/corridors.
- Minimap blinks for mana/health; HUD shows GOLD.

Known Gaps / TODOs
------------------
- Extra spells (besides Flame Orb/Frost Nova/Time Warp/Unlimeted Power + base four) have no mechanics yet.
- Mineral spawn visuals could be further tuned; verify LOS/dash/walk bob interactions.
- Spell unlock flow uses localStorage; no server sync.
