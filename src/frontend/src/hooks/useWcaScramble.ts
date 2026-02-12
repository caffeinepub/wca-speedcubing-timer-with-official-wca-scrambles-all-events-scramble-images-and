import { useState, useEffect, useCallback } from 'react';

export function useWcaScramble(eventId: string, initialScramble?: string) {
  const [scramble, setScramble] = useState<string>(initialScramble || '');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateScramble = useCallback(async () => {
    setIsGenerating(true);
    try {
      // Use CDN import for better compatibility
      const { randomScrambleForEvent } = await import('https://cdn.cubing.net/v0/js/cubing/scramble');
      const scrambleAlg = await randomScrambleForEvent(eventId);
      setScramble(scrambleAlg.toString());
    } catch (error) {
      console.error('Error generating scramble:', error);
      setScramble('Error generating scramble');
    } finally {
      setIsGenerating(false);
    }
  }, [eventId]);

  useEffect(() => {
    // Only generate if we don't have an initial scramble
    if (!initialScramble) {
      generateScramble();
    }
  }, [eventId, generateScramble, initialScramble]);

  return {
    scramble,
    isGenerating,
    generateScramble,
    setScramble,
  };
}
