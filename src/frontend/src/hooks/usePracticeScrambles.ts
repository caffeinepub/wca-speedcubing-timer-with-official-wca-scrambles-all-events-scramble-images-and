import { useState, useEffect } from 'react';

export interface PracticeScramble {
  index: number;
  scramble: string;
}

export function usePracticeScrambles(eventId: string | null, count: number = 5) {
  const [scrambles, setScrambles] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateScrambles = async () => {
    if (!eventId) return;
    
    setIsGenerating(true);
    try {
      const { randomScrambleForEvent } = await import('https://cdn.cubing.net/js/cubing/scramble');
      
      const newScrambles: string[] = [];
      for (let i = 0; i < count; i++) {
        const scramble = await randomScrambleForEvent(eventId);
        newScrambles.push(scramble.toString());
      }
      
      setScrambles(newScrambles);
      setCurrentIndex(0);
    } catch (error) {
      console.error('Failed to generate scrambles:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (eventId) {
      generateScrambles();
    }
  }, [eventId]);

  const next = () => {
    if (currentIndex < scrambles.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const previous = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const regenerate = () => {
    generateScrambles();
  };

  return {
    scrambles,
    currentScramble: scrambles[currentIndex] || '',
    currentIndex,
    totalCount: scrambles.length,
    isGenerating,
    next,
    previous,
    regenerate,
    canGoNext: currentIndex < scrambles.length - 1,
    canGoPrevious: currentIndex > 0,
  };
}
