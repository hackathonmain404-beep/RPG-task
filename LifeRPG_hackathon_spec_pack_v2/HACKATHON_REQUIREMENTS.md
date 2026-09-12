# Hackathon Requirements

## Official problem framing

Build a Life RPG web application that translates mundane real-world tasks into a virtual progression system.

## Required product systems

### Authentication & security
- secure signup/login/session management
- users only see and modify their own tasks and character data
- cross-device persistence

### Task CRUD
Users must be able to:
- create tasks
- read/list tasks
- update tasks
- delete tasks
- complete tasks

### RPG progression
The level system must be non-linear:
- Level N+1 requires more cumulative XP than Level N.
- XP thresholds must be deterministic and testable.

### Streaks
Track consecutive days of activity.

The implementation should clearly define:
- what counts as activity
- timezone behavior
- streak increment
- streak reset
- same-day completion behavior

### Attributes
Task categories contribute to specific character attributes.

Example mapping:
- Coding → Intellect
- Gym → Strength
- Reading → Wisdom
- Social → Charisma
- Mindfulness → Spirit

Use a coherent attribute set and document it.

### Rewards/economy
Users earn currency/points and can purchase virtual:
- items
- themes
- profile badges

Purchased inventory must persist in the database.

### UX
The official statement strongly emphasizes:
- alive/tactile interaction
- celebratory XP/level/reward feedback
- cohesive theme
- clear visual hierarchy
- optimistic UI/loading skeletons where useful

### Accessibility
Must support:
- mobile to desktop
- keyboard navigation with Tab/Enter/Space
- screen readers
- meaningful labels/focus states
- semantic HTML

### Judgment pillars
Optimize for:
1. Design & UX
2. Performance & SEO
3. Creativity & gamification
4. Robustness & edge cases
5. Accessibility & responsiveness

## Zero-tolerance risks

Never submit with:
- private GitHub repository
- broken deployment
- localStorage as the primary persistence layer
- backend disconnected from production database
- runtime/blank-screen crashes
- fewer than three chronological commits
- missing backend code
- missing/restricted video
- video outside the 100MB / 90–180 second limits

Source: official problem statement. fileciteturn2file0L38-L46 fileciteturn2file0L65-L86
