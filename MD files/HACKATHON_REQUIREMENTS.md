# HACKATHON REQUIREMENTS TRACEABILITY & AUDIT CHECKLIST

**Problem Statement:** Life RPG Web Application  
**Source Document:** `TZPSv2.pdf`

---

## 1. Core Feature Checklist

- [x] **User Authentication & Security**
  - Secure signup, login, and session management.
  - Data isolation: users can only see and modify their own tasks and character data.
  - Server-side anti-cheat: stats and rewards cannot be altered from the client.
- [x] **Database Schema & CRUD**
  - Robust relational schema for Users, Tasks, Character attributes, Inventory.
  - Full CRUD operations for Tasks (Create, Read, Update, Delete).
  - ACID transactions for state mutations.
- [x] **The RPG Progression Engine**
  - Non-linear leveling curve ($\text{NextLevelXP} = \lfloor 100 \times L^{1.5} \rfloor$).
  - Higher levels require progressively more XP.
  - Multi-level transitions supported.
- [x] **Gamified Elements**
  - **Streaks:** Tracks consecutive days of activity; resets if calendar day missed.
  - **Attributes:** Tasks categorize into 5 stats (`STRENGTH`, `INTELLECT`, `DISCIPLINE`, `CREATIVITY`, `VITALITY`).
  - **Rewards/Economy:** Users earn virtual Gold to purchase themes, titles, and badges in a virtual shop.
- [x] **Responsive & Accessible UI (Frontend Owned)**
  - Fully responsive across mobile, tablet, and desktop.
  - Fully navigable via keyboard (Tab, Enter, Space).
  - Screen reader accessible.

---

## 2. Deliverables Checklist

- [ ] **Public GitHub Repository**
  - Both frontend and backend source code included.
  - Clean commit history (minimum 3+ chronological commits).
  - Comprehensive `README.md` with setup instructions and `.env.example`.
- [ ] **Live Deployed URL**
  - Publicly accessible production URL (Vercel / Render / Railway).
  - Backend connected to live PostgreSQL database.
- [ ] **Illustration Video**
  - 90 to 180 seconds strictly.
  - Under 100 MB.
  - Demonstrates: signup/login, adding/completing task, leveling up, and hard page refresh proving database persistence.
  - Accessible without login restrictions.

---

## 3. Disqualification Zero-Tolerance Rules

| Rule | Violation Condition | Mitigation |
|---|---|---|
| **Broken Links** | Repo is private or live link is inaccessible | Verify repo is public and test deployed URL in incognito |
| **Fake Data Persistence** | Primary data stored in `localStorage` | All core data stored in PostgreSQL |
| **Build/Deploy Failure** | Live app crashes on load or DB connection fails | `/api/health` connectivity probe on boot |
| **Console/Runtime Crashes** | Unhandled runtime exceptions or blank screens | Global error handlers on both frontend and backend |
| **Invalid Repository** | Fewer than 3 commits, missing backend | Clean chronological commits on `Backend` and `Frontend` branches |
| **Missing/Restricted Video** | Video omitted, private, or $> 100$ MB | Verify video length, size, and public link before submit |
