import { useState, useEffect } from 'react';

export interface PracticeSessionState {
  competitionId: string | null;
  competitionName: string | null;
  eventId: string | null;
  scrambles: string[];
  currentIndex: number;
}

const STORAGE_KEY = 'wca_practice_session';

export function usePracticeSessionPersistence() {
  const [state, setState] = useState<PracticeSessionState>({
    competitionId: null,
    competitionName: null,
    eventId: null,
    scrambles: [],
    currentIndex: 0,
  });

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setState(parsed);
      }
    } catch (error) {
      console.error('Failed to load practice session:', error);
    }
  }, []);

  const save = (newState: Partial<PracticeSessionState>) => {
    setState(prev => {
      const updated = { ...prev, ...newState };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to save practice session:', error);
      }
      return updated;
    });
  };

  const clear = () => {
    setState({
      competitionId: null,
      competitionName: null,
      eventId: null,
      scrambles: [],
      currentIndex: 0,
    });
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear practice session:', error);
    }
  };

  return {
    state,
    save,
    clear,
  };
}
