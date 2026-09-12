/**
 * CONTRACT_FRONTEND_BACKEND.md Shared Types
 * 
 * Strict type definitions matching the authoritative backend contract.
 * Frontend MUST NOT invent fields not documented in the shared specification.
 */

export interface User {
  id: string;
  email: string;
  displayName: string;
  role?: 'USER' | 'ADMIN' | string;
}

export interface Attribute {
  key: 'intellect' | 'strength' | 'wisdom' | 'charisma' | 'vitality' | string;
  displayName: string;
  value: number;
}

export interface Character {
  level: number;
  totalXp: number;
  gold: number;
  streakCurrent: number;
  streakBest: number;
  attributes?: Attribute[];
}

export interface AuthMeResponse {
  user: User;
  character: Character;
}

export interface RegisterRequest {
  email: string;
  displayName: string;
  starterDiscipline?: string;
}

export interface LoginRequest {
  email: string;
}

/**
 * Sent after Supabase OAuth/email auth to sync the user into our Prisma database.
 */
export interface SyncRequest {
  displayName?: string;
  starterDiscipline?: string;
}

/* ==========================================================================
   TASK / QUEST TYPES
   ========================================================================== */

export type DisciplineKey = 'intellect' | 'strength' | 'wisdom' | 'charisma' | 'vitality' | string;
export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'epic' | string;

export interface Task {
  id: string;
  userId?: string;
  title: string;
  description?: string | null;
  categoryKey: DisciplineKey;
  difficulty: DifficultyLevel;
  dueDate?: string | null;
  completed: boolean;
  completedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  xpReward?: number;
  goldReward?: number;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  categoryKey: DisciplineKey;
  difficulty: DifficultyLevel;
  dueDate?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  categoryKey?: DisciplineKey;
  difficulty?: DifficultyLevel;
  dueDate?: string;
}

export interface CompleteTaskResponse {
  task: {
    id: string;
    completed: boolean;
    completedAt?: string;
  };
  rewards?: {
    xp?: number;
    gold?: number;
    attribute?: {
      key: string;
      amount: number;
      increment?: number;
    };
  };
  progression?: {
    levelBefore?: number;
    levelAfter?: number;
    totalXp?: number;
    currentLevelXp?: number;
    nextLevelXp?: number;
    progressPercent?: number;
  };
  streak?: {
    current?: number;
    best?: number;
  };
  character?: Character;
  levelUp?: boolean;
}

/* ==========================================================================
   SHOP & INVENTORY CONTRACT (CONTRACT_FRONTEND_BACKEND.md Sections 6 & 7)
   ========================================================================== */

export type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type ItemType = 'theme' | 'frame' | 'badge' | 'title' | string;

export interface ShopItem {
  id: string;
  sku?: string;
  name: string;
  description: string;
  itemType: ItemType;
  category?: string | null;
  imageUrl?: string | null;
  price: number;
  rarity: ItemRarity;
  metadataJson?: string | Record<string, unknown>;
  active?: boolean;
}

export interface InventoryItem {
  id: string;
  userId?: string;
  shopItemId: string;
  itemId?: string;
  purchasedAt?: string;
  equipped?: boolean;
  equippedAt?: string;
  shopItem?: ShopItem;
}

export interface PurchaseResponse {
  purchase: {
    itemId: string;
    price: number;
  };
  wallet: {
    gold: number;
  };
  inventoryItem: {
    id: string;
    itemId: string;
  };
}

export interface EquipResponse {
  success: boolean;
  equippedItemId: string;
  itemType?: string;
}

/* ==========================================================================
   API ERROR CONTRACT
   ========================================================================== */

export interface ApiErrorDetail {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiErrorResponse {
  error: ApiErrorDetail;
}

export class ApiError extends Error {
  code: string;
  status: number;
  details?: Record<string, unknown>;

  constructor(code: string, message: string, status: number, details?: Record<string, unknown>) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

/* ==========================================================================
   FEEDBACK SYSTEM CONTRACT
   ========================================================================== */

export type FeedbackType = 'BUG_REPORT' | 'FEATURE_REQUEST' | 'GENERAL';

export interface Feedback {
  id: string;
  userId: string;
  type: FeedbackType;
  message: string;
  status: string;
  adminReply?: string | null;
  repliedAt?: string | null;
  createdAt: string;
}

export interface CreateFeedbackRequest {
  type: FeedbackType;
  message: string;
}

export interface FeedbackResponse {
  feedback: Feedback;
}

export interface FeedbackListResponse {
  feedbacks: Feedback[];
}

/* ==========================================================================
   MAGIC LINK CONTRACT
   ========================================================================== */

export interface SendMagicLinkRequest {
  email: string;
}

export interface SendMagicLinkResponse {
  success: boolean;
  message: string;
  email: string;
  isAdmin: boolean;
  verificationToken?: string;
}

export interface VerifyMagicLinkResponse {
  token: string;
  user: User;
  isAdmin: boolean;
  redirectTo: string;
}

/* ==========================================================================
   ADMIN PANEL CONTRACT
   ========================================================================== */

export interface AdminUserListItem {
  id: string;
  email: string;
  displayName: string;
  role: 'USER' | 'ADMIN' | string;
  createdAt: string;
  updatedAt: string;
  character: {
    level: number;
    totalXp: number;
    gold: number;
    streakCurrent: number;
  } | null;
}

export interface GrantEconomyRequest {
  xp?: number;
  gold?: number;
  title?: string;
}

export interface Broadcast {
  id: string;
  type: 'EVENT' | 'INFO' | 'ALERT' | 'PARTY';
  message: string;
  actionText?: string | null;
  actionUrl?: string | null;
  active: boolean;
  createdAt: string;
  expiresAt?: string | null;
}

export interface SetBroadcastRequest {
  type: 'EVENT' | 'INFO' | 'ALERT' | 'PARTY';
  message: string;
  actionText?: string;
  actionUrl?: string;
  expiresInMinutes?: number;
}

export interface SurgeStatus {
  active: boolean;
  multiplier: number;
  endsAt: string | null;
  remainingSeconds: number;
}

export interface StartSurgeRequest {
  hours: number;
}

export interface AdminFeedbackItem {
  id: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  type: FeedbackType;
  message: string;
  status: string;
  adminReply?: string | null;
  repliedAt?: string | null;
  createdAt: string;
}

export interface MarketItem {
  id: string;
  name: string;
  description: string;
  price: number;
  itemType: string;
  category?: string | null;
  rarity: string;
  iconName?: string | null;
  imageUrl?: string | null;
  active: boolean;
  displayOrder: number;
  createdAt: string;
}

export interface CreateMarketItemRequest {
  name: string;
  description: string;
  price: number;
  itemType?: string;
  category?: string;
  rarity?: string;
  imageUrl?: string;
  active?: boolean;
  displayOrder?: number;
}

export interface UpdateMarketItemRequest {
  name?: string;
  description?: string;
  price?: number;
  itemType?: string;
  category?: string;
  rarity?: string;
  imageUrl?: string;
  active?: boolean;
  displayOrder?: number;
}


