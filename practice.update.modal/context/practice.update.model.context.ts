import { createContext, useContext } from 'react';
import { PracticeUpdateModel } from '../model';

export const PracticeUpdateModelContext = createContext<PracticeUpdateModel | null>(null);

export const PracticeUpdateModelProvider = PracticeUpdateModelContext.Provider;

export const usePracticeUpdateModel = () => {
  const context = useContext(PracticeUpdateModelContext);
  if (!context) {
    throw new Error('usePracticeUpdateModel must be used in PracticeUpdateModelContext');
  }

  return context;
};
