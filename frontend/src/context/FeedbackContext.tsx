import React, { createContext, useContext, useState, useCallback } from 'react';

export interface FeedbackContextType {
  isFeedbackOpen: boolean;
  openFeedback: () => void;
  closeFeedback: () => void;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

export const FeedbackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const openFeedback = useCallback(() => {
    setIsFeedbackOpen(true);
  }, []);

  const closeFeedback = useCallback(() => {
    setIsFeedbackOpen(false);
  }, []);

  return (
    <FeedbackContext.Provider value={{ isFeedbackOpen, openFeedback, closeFeedback }}>
      {children}
    </FeedbackContext.Provider>
  );
};

const defaultFeedbackContext: FeedbackContextType = {
  isFeedbackOpen: false,
  openFeedback: () => {},
  closeFeedback: () => {},
};

export function useFeedback(): FeedbackContextType {
  const context = useContext(FeedbackContext);
  return context || defaultFeedbackContext;
}
