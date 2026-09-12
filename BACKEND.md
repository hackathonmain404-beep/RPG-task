# BACKEND ARCHITECTURE & IMPLEMENTATION GUIDE

**Branch:** `Backend`  
**Stack:** Node.js, TypeScript, Express, Prisma ORM, PostgreSQL  
**Role:** Authoritative Game Server & API

---

## 1. Directory Structure

```
backend/
├── package.json
├── tsconfig.json
├── .env.example
├── prisma/
│   ├── schema.prisma           # Canonical database schema
│   ├── seed.ts                 # Shop catalogue and starter cosmetics seed
│   └── migrations/             # Versioned SQL migrations
├── src/
│   ├── server.ts               # HTTP server entry point & graceful shutdown
│   ├── app.ts                  # Express application setup, middlewares, routes
│   ├── routes/
│   │   ├── auth.routes.ts      # /api/auth
│   │   ├── character.routes.ts # /api/character
│   │   ├── task.routes.ts      # /api/tasks
│   │   ├── shop.routes.ts      # /api/shop & /api/inventory
│   │   └── health.routes.ts    # /api/health
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── character.controller.ts
│   │   ├── task.controller.ts
│   │   ├── shop.controller.ts
│   │   └── health.controller.ts
│   ├── services/
│   │   ├── auth.service.ts       # Registration, login, password hashing, JWT
│   │   ├── task.service.ts       # Task CRUD operations
│   │   ├── completion.service.ts # Core atomic quest completion transaction
│   │   ├── rpgEngine.service.ts  # Non-linear leveling & XP math
│   │   ├── streak.service.ts     # Daily streak evaluation
│   │   └── shop.service.ts       # Atomic purchase transaction & balance check
│   ├── middleware/
│   │   ├── auth.middleware.ts    # JWT verification & req.user attachment
│   │   ├── validate.middleware.ts# Zod payload validation
│   │   └── error.middleware.ts   # Canonical error formatting
│   ├── schemas/
│   │   ├── auth.schema.ts
│   │   ├── task.schema.ts
│   │   └── shop.schema.ts
│   └── utils/
│       ├── prisma.ts             # Prisma client singleton
│       └── errors.ts             # AppError class with status & machine code
└── tests/
    ├── unit/
    │   ├── rpgEngine.test.ts     # Non-linear curve & multi-level transitions
    │   └── streak.test.ts        # UTC calendar day streak edge cases
    └── integration/
        ├── auth.test.ts          # Register, login, session isolation
        ├── taskFlow.test.ts      # Create, list, complete, prevent double complete
        └── shopFlow.test.ts      # Buy item, insufficient gold, duplicate prevention
```

---

## 2. Core Execution Flows

### 2.1. The Quest Completion Transaction
This is the heart of the Life RPG backend. Everything runs in a single ACID transaction via Prisma:

```typescript
export async function completeTask(userId: string, taskId: string) {
  return await prisma.$transaction(async (tx) => {
    // 1. Fetch task and ensure ownership
    const task = await tx.task.findFirst({
      where: { id: taskId, userId }
    });
    if (!task) {
      throw new AppError(404, "NOT_FOUND", "Quest not found");
    }
    if (task.status === "COMPLETED") {
      throw new AppError(409, "TASK_ALREADY_COMPLETED", "This quest has already been completed");
    }

    // 2. Fetch character
    const character = await tx.character.findUniqueOrThrow({
      where: { userId }
    });

    // 3. Compute rewards authoritatively
    const xpEarned = getXpReward(task.difficulty);
    const goldEarned = getGoldReward(task.difficulty);
    const attrGain = getAttributeGain(task.difficulty);

    // 4. Process non-linear leveling
    const levelState = processXpGain(
      character.level,
      character.currentXp,
      character.totalXp,
      xpEarned
    );

    // 5. Process streak
    const streakResult = evaluateStreak(character.lastActiveDate);
    const newStreakDays = streakResult.isStreakReset 
      ? 1 
      : (streakResult.isStreakIncreased ? character.streakDays + 1 : character.streakDays);

    // 6. Update Character attributes and stats
    const updatedCharacter = await tx.character.update({
      where: { userId },
      data: {
        level: levelState.level,
        currentXp: levelState.currentXp,
        nextLevelXp: levelState.nextLevelXp,
        totalXp: levelState.totalXp,
        gold: { increment: goldEarned },
        streakDays: newStreakDays,
        lastActiveDate: new Date(),
        [task.attribute.toLowerCase()]: { increment: attrGain }
      }
    });

    // 7. Mark Task completed
    const updatedTask = await tx.task.update({
      where: { id: taskId },
      data: {
        status: "COMPLETED",
        completedAt: new Date()
      }
    });

    // 8. Record Activity Log
    await tx.activityLog.create({
      data: {
        userId,
        action: "QUEST_COMPLETED",
        metadata: {
          taskId,
          xpEarned,
          goldEarned,
          didLevelUp: levelState.didLevelUp,
          newLevel: levelState.level
        }
      }
    });

    return {
      task: updatedTask,
      rewards: {
        xpEarned,
        goldEarned,
        attributeUpdated: task.attribute,
        attributeIncrement: attrGain,
        streakDays: newStreakDays,
        isStreakIncreased: streakResult.isStreakIncreased
      },
      levelUp: {
        didLevelUp: levelState.didLevelUp,
        oldLevel: levelState.oldLevel,
        newLevel: levelState.level
      },
      character: updatedCharacter
    };
  });
}
```

---

## 3. Server-Authoritative Anti-Cheat Guarantees
- No client-supplied XP, Gold, or stats are ever accepted.
- Double-completion spam is rejected by the database state check inside the atomic transaction.
- Foreign key user-scoping prevents unauthorized modification or viewing of other players' quests.
