# Database Schema

Use PostgreSQL through Prisma.

## User

```text
id
email
passwordHash
displayName
createdAt
updatedAt
lastActiveAt
```

## Character

```text
id
userId
level
totalXp
gold
streakCurrent
streakBest
lastActivityDate
createdAt
updatedAt
```

Attributes can be normalized for flexibility.

## Attribute

```text
id
characterId
key
displayName
value
createdAt
updatedAt
```

Example keys:
- intellect
- strength
- wisdom
- charisma
- vitality

## Task / Quest

```text
id
userId
title
description
categoryKey
difficulty
xpReward
goldReward
completed
completedAt
dueDate
createdAt
updatedAt
```

Important:
`xpReward` and `goldReward` can be stored as task configuration, but the server must calculate/validate actual completion rewards rather than trusting client-provided values.

## CompletionEvent

```text
id
userId
taskId
completedAt
xpAwarded
goldAwarded
streakAfter
levelBefore
levelAfter
createdAt
```

## AttributeEvent

```text
id
userId
attributeKey
amount
sourceType
sourceId
createdAt
```

## ShopItem

```text
id
sku
name
description
itemType
price
rarity
metadataJson
active
createdAt
```

## InventoryItem

```text
id
userId
shopItemId
purchasedAt
```

## Badge

```text
id
key
name
description
icon
unlockRuleJson
```

## UserBadge

```text
id
userId
badgeId
unlockedAt
```

## Theme

```text
id
key
name
description
themeJson
price
active
```

## UserTheme

```text
id
userId
themeId
purchasedAt
equippedAt
```

## ActivityLog

```text
id
userId
eventType
metadataJson
createdAt
```

## Ownership rule

Every user-owned object must have a server-verifiable path back to `userId`.

## Indexes

At minimum:
- User.email unique
- Character.userId unique
- Task.userId
- Task.userId + completed
- CompletionEvent.userId + completedAt
- AttributeEvent.userId + createdAt
- ActivityLog.userId + createdAt
