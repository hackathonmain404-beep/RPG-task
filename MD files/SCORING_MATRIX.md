# HACKATHON SCORING MATRIX & OPTIMIZATION STRATEGY

**Evaluation Reference:** Based on Section 7 of `TZPSv2.pdf`

---

## 1. Evaluation Pillars & Technical Implementation

| Pillar | Hackathon Weight / Focus | Technical & Architectural Implementation |
|---|---|---|
| **Design & UX** *(Crucial)* | Visual appeal, tactile micro-interactions, cohesive theme, not a lazy generic CRUD app. | Dedicated `equippedTheme` selector, spring animations, particle level-up effects, custom RPG iconography. |
| **Performance & SEO** | Fast load times, optimized assets, semantic HTML, metadata. | Sub-50ms API responses, indexed PostgreSQL queries, lightweight JSON payloads, loading skeletons. |
| **Creativity & Gamification** | Meaningful progression system, not an afterthought. | Non-linear XP curve ($\lfloor 100 \times L^{1.5} \rfloor$), 5-attribute leveling, daily streak multipliers, prestige shop catalogue. |
| **Robustness & Edge Cases** | Graceful error handling, network resilience, validation. | Machine-readable error codes (`AppError`), atomic database transactions, zero-trust server validation. |
| **Accessibility & Responsiveness** | Flawless mobile experience, keyboard navigable (Tab/Enter/Space), screen reader friendly. | ARIA attributes, semantic HTML elements, full keyboard trap avoidance, responsive CSS grid/flexbox. |

---

## 2. Zero-Tolerance Self-Audit Checklist

Prior to submission, verify each item:

- [ ] Repository is public with public commit history.
- [ ] At least 3 chronological commits exist on both `Backend` and `Frontend` branches.
- [ ] No primary data is stored in `localStorage` (PostgreSQL is verified active).
- [ ] `GET /api/health` returns HTTP 200 with database connected on live deployment.
- [ ] No unhandled JavaScript runtime exceptions in production browser console.
- [ ] Walkthrough video is 90–180 seconds, $< 100$ MB, public, and shows signup, task completion, level up, and hard refresh.
