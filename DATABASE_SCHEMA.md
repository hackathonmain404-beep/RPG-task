# DATABASE SCHEMA SPECIFICATION

**Canonical Database:** PostgreSQL 15+  
**ORM / Query Builder:** Prisma ORM  
**Authority:** Server-side Only (Clients have zero direct database access)

---

## 1. Architectural Principles

1. **Relational Integrity & ACID Transactions:**  
   Task completion, reward calculation, and shop purchasing rely on atomic PostgreSQL transactions (`$transaction` in Prisma) to guarantee no partial state (e.g. XP awarded without marking task complete, or gold deducted without granting an item).
2. **User Data Isolation:**  
   Every tenant model (`Character`, `Task`, `Inventory`, `ActivityLog`) is strictly foreign-keyed to `User.id` with mandatory indexes for fast lookup and strict scoping.
3. **No LocalStorage Persistence:**  
   Per hackathon zero-tolerance disqualification rules, PostgreSQL is the sole authoritative store. Browser state is hydrated strictly from backend API responses.

---

## 2. Complete Prisma Schema (`prisma/schema.prisma`)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum TaskDifficulty {
  TRIVIAL
  EASY
  MEDIUM
  HARD
  EPIC
}

enum AttributeType {
  STRENGTH
  INTELLECT
  DISCIPLINE
  CREATIVITY
  VITALITY
}

enum TaskStatus {
  PENDING
  COMPLETED
}

enum ItemCategory {
  AVATAR_FRAME
  THEME
  TITLE
  BADGE
  POTION
}

enum ActivityType {
  QUEST_CREATED
  QUEST_COMPLETED
  LEVEL_UP
  ITEM_PURCHASED
  STREAK_INCREASED
}

model User {
  id           String        @id @default(cuid())
  email        String        @unique
  passwordHash String
  username     String        @unique
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  character    Character?
  tasks        Task[]
  inventory    Inventory[]
  activityLogs ActivityLog[]

  @@index([email])
  @@index([username])
}

model Character {
  id             String    @id @default(cuid())
  userId         String    @unique
  user           User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  level          Int       @default(1)
  currentXp      Int       @default(0)
  nextLevelXp    Int       @default(100)
  totalXp        Int       @default(0)
  gold           Int       @default(50)
  streakDays     Int       @default(0)
  lastActiveDate DateTime?

  // RPG Attributes
  strength       Int       @default(10)
  intellect      Int       @default(10)
  discipline     Int       @default(10)
  creativity     Int       @default(10)
  vitality       Int       @default(10)

  // Cosmetics
  equippedTheme  String    @default("default_fantasy")
  equippedTitle  String    @default("Novice Adventurer")

  updatedAt      DateTime  @updatedAt

  @@index([userId])
}

model Task {
  id          String         @id @default(cuid())
  userId      String
  user        User           @relation(fields: [userId], references: [id], onDelete: Cascade)

  title       String
  description String?
  difficulty  TaskDifficulty @default(MEDIUM)
  attribute   AttributeType  @default(INTELLECT)
  status      TaskStatus     @default(PENDING)
  dueDate     DateTime?
  completedAt DateTime?

  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt

  @@index([userId, status])
  @@index([userId, dueDate])
}

model Item {
  id          String       @id
  name        String
  description String
  category    ItemCategory
  cost        Int
  imageUrl    String?
  isUnique    Boolean      @default(true)
  createdAt   DateTime     @default(now())

  inventories Inventory[]

  @@index([category])
}

model Inventory {
  id         String   @id @default(cuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  itemId     String
  item       Item     @relation(fields: [itemId], references: [id], onDelete: Restrict)
  acquiredAt DateTime @default(now())

  @@unique([userId, itemId])
  @@index([userId])
}

model ActivityLog {
  id        String       @id @default(cuid())
  userId    String
  user      User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  action    ActivityType
  metadata  Json?
  createdAt DateTime     @default(now())

  @@index([userId, createdAt])
}
```

---

## 3. Seed Data Specification

Initial items pre-seeded in the database on deployment:

1. **`theme_cyberpunk`**: Cyberpunk 2077 neon glow dashboard (`THEME`, 150 Gold, Unique).
2. **`theme_lofi`**: Cozy Lo-Fi study room aesthetic (`THEME`, 100 Gold, Unique).
3. **`title_code_wizard`**: "Code Wizard" Title (`TITLE`, 75 Gold, Unique).
4. **`title_iron_lifter`**: "Iron Lifter" Title (`TITLE`, 75 Gold, Unique).
5. **`badge_streak_master`**: 7-day consistency badge (`BADGE`, 120 Gold, Unique).
6. **`badge_polymath`**: Master of all 5 attributes (`BADGE`, 200 Gold, Unique).
