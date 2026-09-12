import { createContext } from 'react';
import type { User, Character, LoginRequest, RegisterRequest, CompleteTaskResponse } from '../types/contract';

export interface XpProgress {
  currentLevelXp: number;
  nextLevelXp: number;
  progressPercent: number;
}

export interface ProgressionActivityItem {
  id: string;
  type: 'quest_completed' | 'level_up' | 'streak_milestone';
  title: string;
  timestamp: string;
  xpGained?: number;
  goldGained?: number;
  attributeGained?: {
    key: string;
    amount: number;
  };
  levelBefore?: number;
  levelAfter?: number;
  streakCurrent?: number;
}

export interface AttributeChangeNotice {
  key: string;
  amount: number;
  prevValue?: number;
  newValue?: number;
  timestamp: number;
}

export interface AuthContextType {
  user: User | null;
  character: Character | null;
  isLoading: boolean;
  serverReachable: boolean;
  xpProgress: XpProgress | null;
  recentActivity: ProgressionActivityItem[];
  lastAttributeChange: AttributeChangeNotice | null;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  refreshCharacter: () => Promise<void>;
  reconcileCompletion: (res: CompleteTaskResponse, taskTitle?: string) => void;
  reconcilePurchase: (walletGold: number) => void;
  clearAttributeChangeNotice: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

