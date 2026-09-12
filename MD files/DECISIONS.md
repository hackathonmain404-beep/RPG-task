# Architecture Decisions

## ADR-001 — Full backend persistence
- **Decision:** PostgreSQL-backed persistence is mandatory.
- **Reason:** The problem explicitly requires real database-backed historical logs and cross-device synchronization and disallows localStorage-only primary persistence.

## ADR-002 — Server-authoritative progression
- **Decision:** All XP, Gold, level, streak and inventory calculations are server authoritative.
- **Reason:** Prevents easy cheating and protects game progression integrity.

## ADR-003 — Pure RPG domain functions
- **Decision:** XP/level math lives in pure, deterministic functions (`getLevelForXp`, `getXpRequiredForLevel`, etc.).
- **Reason:** Easy testing, predictable behavior and clear separation of concerns.

## ADR-004 — Relational database
- **Decision:** PostgreSQL with Prisma ORM.
- **Reason:** Tasks, completion history, inventory and character progression have explicit relational foreign keys.

## ADR-005 — Public SEO landing page
- **Decision:** Separate crawlable marketing/product surface from authenticated app.
- **Reason:** Search visibility and app usability have different needs.

## ADR-006 — Theme-based gamification
- **Decision:** Themes and cosmetics are real inventory entities (`ShopItem`, `InventoryItem`, `Theme`, `UserTheme`).
- **Reason:** Makes the economy visible and persistent rather than decorative.

## ADR-007 — No unnecessary AI feature
- **Decision:** AI is optional and must not delay mandatory hackathon requirements.
- **Reason:** The official problem is fundamentally about RPG productivity, not AI.

## ADR-008 — Tactile feedback
- **Decision:** Micro-interactions are part of product quality but must never block functionality.
- **Reason:** The official problem explicitly emphasizes immediate feedback and celebratory completion.
