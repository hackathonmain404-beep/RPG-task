# Content Specification & Terminology Dictionary — Life RPG

## 1. Brand Voice & Narrative Tone

The Life RPG narrative tone is **motivating, adventurous, focused, and genuine**. 
- It treats everyday productivity (coding, studying, lifting, meditating) with heroic dignity.
- It completely avoids cringe corporate hustle jargon (*"crush your KPIs"*, *"be a 10x grinder"*) as well as juvenile parody.
- It respects the user's real effort by providing clear, truthful feedback without fake exaggeration.

---

## 2. Terminology Mapping Dictionary

To ensure cohesive immersion across the application, standard software terms are systematically mapped to RPG equivalents while maintaining intuitive clarity:

| Standard Term | Life RPG Equivalent | User-Facing Context & Notes |
|---|---|---|
| **Task / To-Do** | **Quest** | An actionable unit of real-world work with a difficulty and category. |
| **Complete Task** | **Complete Quest / Claim Victory** | Triggers the celebratory completion loop and server reward transaction. |
| **Points / Credits** | **Gold** | Virtual currency earned by completing quests, spent in the Armory. |
| **Category / Tag** | **Discipline** | The skill domain the quest trains (Intellect, Strength, Wisdom, Charisma, Vitality). |
| **Stats** | **Attributes** | Numerical ratings of character competence in each Discipline. |
| **Consecutive Days** | **Flame Streak / Momentum** | Consecutive calendar days with at least one completed quest. |
| **Store / Shop** | **Armory** | The marketplace for acquiring virtual themes, badges, and cosmetic frames. |
| **Achievements** | **Relics / Badges** | Permanent unlockable honors recognizing milestones and consistency. |
| **User Profile** | **Character Sheet** | The central view of player identity, titles, level, and attribute radar. |
| **Dashboard** | **Command Citadel / HUD** | The active workspace showing today's quests, quick stats, and active streak. |

---

## 3. Public Landing Page Copy Deck

### Section 1: Hero Banner
- **Eyebrow Tag**: `[ENTER THE PRODUCTIVITY REALM]`
- **Headline**: *Your Life is the Game. Start Gaining XP.*
- **Sub-headline**: *Turn daily routines, study sessions, and workouts into an engaging RPG adventure. Level up real-world attributes, build streaks, earn gold, and unlock equipment with authentic database persistence.*
- **Primary CTA**: `[Begin Your Adventure — Free]`
- **Secondary CTA**: `[Enter the Citadel (Log In)]`
- **Proof Pill**: *“Zero fake client persistence. Powered by PostgreSQL & verified game mechanics.”*

### Section 2: How It Works (The 4-Step Loop)
1. **Formulate the Quest**: Record your daily goals with targeted disciplines and balanced difficulty tiers.
2. **Conquer the Real World**: Put your phone away, hit the gym, study the code, write the prose.
3. **Claim Authoritative Spoils**: Check off the quest to trigger immediate XP fly-ups, gold counter chimes, and attribute progression verified by the server.
4. **Ascend & Personalize**: Cross non-linear level thresholds, unlock permanent relics, and purchase cosmetic themes in the Armory.

### Section 3: Feature Spotlights
- **Feature A: Non-Linear RPG Engine**: *"Levels that mean something. Unlike linear checklists, our exponential XP curve ensures each ascension feels like a hard-won milestone."*
- **Feature B: Multi-Discipline Attributes**: *"Shape your adventurer. Coding develops your Intellect; lifting boosts Strength; meditation fuels Vitality; reading deepens Wisdom."*
- **Feature C: Flame Streak Engine**: *"Consistency is king. Maintain daily momentum to keep your streak flame blazing. One day missed resets the flame, driving steady daily dedication."*
- **Feature D: The Armory Economy**: *"Earn your gear. Spend hard-won Gold on authentic cosmetic themes, avatar borders, and relics stored securely in your persistent inventory."*

### Section 4: Public FAQ Accordion (6 Crawled Items)
1. **Q: What is Life RPG?**  
   *A: Life RPG is a full-stack gamified productivity platform that transforms daily habits and tasks into a role-playing game. You earn verified XP, level up your character across 5 real-world attributes, maintain streaks, and spend earned currency in a virtual armory.*
2. **Q: How does the XP and Leveling system work?**  
   *A: Progression uses a non-linear mathematical curve where each subsequent level requires progressively more XP. XP is calculated and verified securely on our server engine, preventing cheating and preserving the value of your milestones.*
3. **Q: How are streaks calculated?**  
   *A: A streak increments when you complete at least one quest within a calendar day in your chosen timezone. Completing multiple quests in the same day continues to award XP and Gold, while maintaining your daily streak.*
4. **Q: What are the 5 Disciplines and Attributes?**  
   *A: Tasks belong to one of 5 core disciplines: Intellect (coding, technical work), Strength (fitness, physical conditioning), Wisdom (reading, research), Charisma (communication, social), and Vitality (sleep, nutrition, mindfulness).*
5. **Q: What can I purchase with Gold?**  
   *A: Gold earned from completing quests can be spent in the Armory on customizable UI themes (such as Neon Outpost or Mystic Forest), avatar frames, and milestone relics. All purchases are permanently stored in your database inventory.*
6. **Q: Is my progression saved across devices?**  
   *A: Yes. All characters, quest logs, streaks, and inventory are persisted in a secure PostgreSQL cloud database. You can sign in from any desktop or mobile browser and pick up right where you left off.*

---

## 4. In-App Microcopy & Dialogue Deck

### A. Quest Completion Praise Variations
Displayed in floating toasts or reward pills upon completing a quest:
- *"Quest Accomplished! +{xp} XP earned."*
- *"Victory Claimed! Momentum surges."*
- *"Discipline Honed! +{attr} to {discipline}."*
- *"Task Slain! Gold added to your pouch."*

### B. Level-Up Celebration Fanfare
- **Modal Headline**: *LEVEL UP!*
- **Ascension Banner**: *“You have ascended to Level {newLevel}!”*
- **Milestone Message**: *“Your persistence echoes through the Citadel. Your attributes have expanded, and new Armory gear awaits.”*
- **Button CTA**: `[Continue Questing]`

### C. Empty State Copy
- **Today's Quests Empty**:
  - Headline: *“The Quest Board is Clear.”*
  - Body: *“Rest your sword, adventurer. Or create a new quest to begin building today’s momentum.”*
  - CTA: `[+ Forge a New Quest]`
- **Armory Empty / Filtered**:
  - Headline: *“No Items Match Your Filter.”*
  - Body: *“The armory smiths have categorized gear by Themes, Badges, and Frames. Try selecting another category.”*
- **Inventory Empty**:
  - Headline: *“Your Inventory Pouch is Empty.”*
  - Body: *“Complete daily quests to earn Gold and acquire your first cosmetic theme in the Armory.”*
  - CTA: `[Visit the Armory]`
- **History Log Empty**:
  - Headline: *“Your Chronicles Await.”*
  - Body: *“Every completed quest will be etched into this permanent timeline.”*

---

## 5. Error & Confirmation Dialog Copy

- **Delete Quest Confirmation**:
  - Title: *“Abandon Quest?”*
  - Message: *“Are you sure you wish to discard ‘{title}’? This quest will be removed from your board, and no XP will be awarded.”*
  - Confirm: `[Abandon Quest]` (Destructive red) / Cancel: `[Keep Quest]`
- **Insufficient Gold Alert**:
  - Title: *“Insufficient Gold in Pouch”*
  - Message: *“You need {required} Gold for this item, but your wallet currently holds {current} Gold. Complete {questsNeeded} more quests to earn the difference.”*
- **Duplicate Completion Conflict (409)**:
  - Message: *“This quest has already been completed and rewarded. Your current XP and Gold reflect the confirmed state.”*
- **Session Expired (401)**:
  - Message: *“Your Citadel session has timed out. Please sign in again to continue recording your progress.”*
