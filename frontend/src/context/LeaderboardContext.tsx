import React, { createContext, useContext, useState, useCallback } from 'react';

export interface LeaderboardContextType {
  isLeaderboardOpen: boolean;
  openLeaderboard: () => void;
  closeLeaderboard: () => void;
}

const LeaderboardContext = createContext<LeaderboardContextType | undefined>(undefined);

export const LeaderboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);

  const openLeaderboard = useCallback(() => {
    setIsLeaderboardOpen(true);
  }, []);

  const closeLeaderboard = useCallback(() => {
    setIsLeaderboardOpen(false);
  }, []);

  return (
    <LeaderboardContext.Provider value={{ isLeaderboardOpen, openLeaderboard, closeLeaderboard }}>
      {children}
    </LeaderboardContext.Provider>
  );
};

const defaultLeaderboardContext: LeaderboardContextType = {
  isLeaderboardOpen: false,
  openLeaderboard: () => {},
  closeLeaderboard: () => {},
};

export function useLeaderboard(): LeaderboardContextType {
  const context = useContext(LeaderboardContext);
  return context || defaultLeaderboardContext;
}
