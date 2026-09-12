# PRODUCT SPECIFICATION: LIFE RPG

**Product:** Life RPG Web Application  
**Core Thesis:** Overcoming the "delayed gratification" problem of daily habits by translating real-life actions into an immersive virtual progression system.

---

## 1. Problem & Product Philosophy

Traditional productivity software (to-do lists, reminder apps) fails because checking a box feels like an administrative chore. Going to the gym, studying data structures, or drinking water takes weeks or months to show physical or mental dividends.

Life RPG introduces video-game psychology:
- **Instant Dopamine:** Completing a task triggers visual celebrations, XP accumulation, and auditory feedback.
- **Measurable Progression:** Every action visibly levels up a specific attribute (e.g. studying increases *Intellect*, working out increases *Strength*).
- **Tangible Virtual Economy:** Hard work translates to in-game Gold that unlocks prestige cosmetics, custom titles, and themes.

---

## 2. Core Game Loop

```
+-------------------------------------------------------------+
| 1. Quest Creation:                                          |
|    User registers a real-world task with difficulty & stat  |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
| 2. Real-World Execution:                                    |
|    User completes the study session, workout, or habit      |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
| 3. Authoritative Quest Completion:                          |
|    User checks off quest; server verifies and awards:       |
|    - Instant XP & Level-Up Checks                           |
|    - Attribute stat boost (e.g. +5 Intellect)               |
|    - Gold currency (e.g. +35 Gold)                          |
|    - Streak preservation & advancement                      |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
| 4. Progression & Customization:                             |
|    User spends Gold in the Shop for themes, titles, badges  |
+-------------------------------------------------------------+
```

---

## 3. Product Terminology Mapping

To maintain immersive thematic consistency, standard productivity terms are mapped to RPG terms:

| Standard Term | Life RPG Equivalent |
|---|---|
| Task / To-Do | **Quest** |
| Completed Task | **Quest Complete / Victory** |
| Tag / Category | **Attribute Domain** (`STRENGTH`, `INTELLECT`, etc.) |
| Points / Score | **Gold / Experience Points (XP)** |
| User Profile | **Hero Character Sheet** |
| Settings / Theme | **Realm Wardrobe / Theme Shop** |
