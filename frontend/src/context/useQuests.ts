import { useContext } from 'react';
import { QuestsContext } from './questsContextDef';
import type { QuestsContextType } from './questsContextDef';

export const useQuests = (): QuestsContextType => {
  const context = useContext(QuestsContext);
  if (!context) {
    throw new Error('useQuests must be used within a QuestsProvider');
  }
  return context;
};
