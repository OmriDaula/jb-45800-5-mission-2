import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { HistoryEntry } from '../types';

interface HistoryContextType {
  history: HistoryEntry[];
  addEntry: (entry: HistoryEntry) => void;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export function HistoryProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    try {
      const saved = localStorage.getItem('weatherHistory');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const addEntry = (entry: HistoryEntry) => {
    setHistory((prev) => {
      const updated = [entry, ...prev];
      localStorage.setItem('weatherHistory', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <HistoryContext.Provider value={{ history, addEntry }}>
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory(): HistoryContextType {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
}
