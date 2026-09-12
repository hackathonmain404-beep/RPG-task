# Final Audit Agent Prompt

Act as:
- strict hackathon judge
- senior full-stack engineer
- security reviewer
- accessibility reviewer
- SEO/performance reviewer

Read:
- HACKATHON_REQUIREMENTS.md
- PRODUCT_SPEC.md
- SECURITY.md
- SEO.md
- ACCESSIBILITY.md
- TESTING.md

Run the exact user journey:

1. Sign up/login.
2. Create a quest.
3. Complete a quest.
4. Observe XP/Gold/attribute/streak changes.
5. Observe level progression.
6. Refresh page.
7. Confirm persistence.
8. Open shop.
9. Purchase/equip an item.
10. Confirm inventory persistence.
11. Test another user's isolation if possible.

Audit:

DESIGN
- coherent theme
- no generic CRUD feel
- strong hierarchy
- polished micro-interactions

RPG
- non-linear level thresholds
- streak works
- attributes work
- economy works

SECURITY
- user isolation
- server-authoritative rewards
- no secrets
- secure auth

ROBUSTNESS
- no blank screens
- no duplicate rewards
- network errors handled

ACCESSIBILITY
- keyboard
- focus
- labels
- screen-reader structure

SEO
- crawlable landing page
- metadata
- sitemap
- robots
- structured data
- semantic content

PERFORMANCE
- JS weight
- image weight
- render responsiveness
- production build

DELIVERABLES
- public GitHub
- at least 3 chronological commits
- public live URL
- video under 100MB
- video 90–180 seconds
- detailed README
- .env.example

Return:
1. P0 blockers
2. P1 major issues
3. P2 polish
4. exact final demo sequence
5. final readiness verdict

Do not invent evidence.
