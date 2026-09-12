# Design System

## Product feel

The official problem asks for an application with a soul: alive, tactile and thematically cohesive rather than generic enterprise SaaS. fileciteturn2file0L13-L27

## Recommended direction

Modern RPG HUD:
- dark base
- high-contrast text
- restrained accent colors
- premium typography
- strong card hierarchy
- subtle glow only where meaningful

## Core semantic tokens

Define tokens for:
- background
- surface
- elevated surface
- text
- muted text
- accent
- success
- warning
- danger
- XP
- Gold
- attribute colors

Do not hardcode colors throughout components.

## Motion hierarchy

### Small
Button hover, checkbox, tab.

### Medium
Reward toast, progress bar, card transitions.

### Large
Level-up celebration.

Animations should communicate state, not merely decorate.

## Responsive

Mobile:
- prioritize quests
- completion action
- XP/streak
- character

Desktop:
- richer dashboard layout
- persistent navigation
- secondary panels

## Theming

Theme purchases must modify design tokens/variables.

Themes cannot modify business logic.
