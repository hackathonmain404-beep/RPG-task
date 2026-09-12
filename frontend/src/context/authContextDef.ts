import { createContext } from 'react';
import type { User, Character, LoginRequest, RegisterRequest, CompleteTaskResponse } from '../types/contract';

export interface AuthContextType {
  user: User | null;
  character: Character | null;
  isLoading: boolean;
  serverReachable: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  reconcileCompletion: (res: CompleteTaskResponse) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
