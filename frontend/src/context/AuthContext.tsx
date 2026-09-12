import React, { useEffect, useState, useCallback } from 'react';
import type { User, Character, LoginRequest, RegisterRequest } from '../types/contract';
import { ApiError } from '../types/contract';
import { authApi } from '../services/api/auth';
import { AuthContext } from './authContextDef';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [character, setCharacter] = useState<Character | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [serverReachable, setServerReachable] = useState<boolean>(true);

  // Authenticate session from backend on initial mount
  const refreshSession = useCallback(async () => {
    try {
      const data = await authApi.getMe();
      setUser(data.user);
      setCharacter(data.character);
      setServerReachable(true);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          // Unauthenticated session - expected for guests
          setUser(null);
          setCharacter(null);
          setServerReachable(true);
        } else if (err.code === 'NETWORK_ERROR' || err.status === 0) {
          // Server offline or proxy unavailable
          setUser(null);
          setCharacter(null);
          setServerReachable(false);
        } else {
          setUser(null);
          setCharacter(null);
        }
      } else {
        setUser(null);
        setCharacter(null);
        setServerReachable(false);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const initAuth = async () => {
      try {
        const data = await authApi.getMe();
        if (isMounted) {
          setUser(data.user);
          setCharacter(data.character);
          setServerReachable(true);
        }
      } catch (err) {
        if (isMounted) {
          if (err instanceof ApiError && err.status === 401) {
            setUser(null);
            setCharacter(null);
            setServerReachable(true);
          } else {
            setUser(null);
            setCharacter(null);
            setServerReachable(false);
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    void initAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (credentials: LoginRequest) => {
    const data = await authApi.login(credentials);
    setUser(data.user);
    setCharacter(data.character);
    setServerReachable(true);
  };

  const register = async (data: RegisterRequest) => {
    const res = await authApi.register(data);
    setUser(res.user);
    setCharacter(res.character);
    setServerReachable(true);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      setCharacter(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        character,
        isLoading,
        serverReachable,
        login,
        register,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
