# ARCHITECTURE DECISION RECORDS (ADR)

**Canonical Authority:** Backend Branch

---

## ADR-001: PostgreSQL with Prisma ORM
- **Status:** Accepted
- **Context:** The hackathon strictly forbids `localStorage` as primary persistence (zero-tolerance rule). The app requires structured relations between Users, Characters, Quests, Inventory, and Activity Logs.
- **Decision:** Use PostgreSQL as the primary relational database with Prisma ORM.
- **Consequences:** Provides robust schema typing, automated migration tracking, foreign key cascades, and ACID transactions.

---

## ADR-002: Server-Authoritative Progression & Anti-Cheat
- **Status:** Accepted
- **Context:** If the client decides XP, Gold, or stat increases, users can trivially edit network payloads and cheat their progression, undermining the product's integrity.
- **Decision:** The client only sends the quest identifier (`POST /api/tasks/:id/complete`). The server looks up task difficulty in PostgreSQL, evaluates leveling formulas, applies streak logic, and writes updates atomically.
- **Consequences:** Guarantees tamper-proof progression, eliminates cheat vectors, and ensures fair leaderboards and achievements.

---

## ADR-003: Non-Linear XP Power Curve
- **Status:** Accepted
- **Context:** Section 5 of the hackathon problem statement mandates a non-linear leveling system where each subsequent level requires more XP than the last.
- **Decision:** Adopt the power curve formula: $\text{NextLevelXP}(L) = \lfloor 100 \times L^{1.5} \rfloor$.
- **Consequences:** Provides fast initial rewards (Levels 1–3) to build early user engagement, while scaling smoothly to prevent runaway level inflation.

---

## ADR-004: JWT Session Authentication with Request Context Injection
- **Status:** Accepted
- **Context:** Users must securely authenticate and be strictly isolated to their own data across devices.
- **Decision:** Use standard JWTs signed with `JWT_SECRET`. Middleware extracts `userId` from the verified token and attaches it to `req.user`.
- **Consequences:** Endpoints never trust client-supplied `userId` parameters, preventing insecure direct object reference (IDOR) attacks.

---

## ADR-005: ACID Transactions for Quest Completion and Shop Purchases
- **Status:** Accepted
- **Context:** A network failure or crash during quest completion could leave a user with XP awarded but the quest uncompleted, or gold deducted without item delivery.
- **Decision:** Wrap quest completion and shop purchasing within `prisma.$transaction`.
- **Consequences:** Eliminates partial state corruption and ensures complete atomicity.
