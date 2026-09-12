import { useContext } from 'react';
import { ShopContext } from './shopContextDef';
import type { ShopContextType } from './shopContextDef';

export const useShop = (): ShopContextType => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};
