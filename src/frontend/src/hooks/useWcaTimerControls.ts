import { useState, useEffect, useCallback, useRef } from 'react';

export type TimerState = 'idle' | 'armed' | 'running' | 'stopped';

export function useWcaTimerControls() {
  const [state, setState] = useState<TimerState>('idle');
  const [time, setTime] = useState(0);
  const [finalTime, setFinalTime] = useState<number | null>(null);
  
  const startTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const armTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSpaceDownRef = useRef(false);
  const isTouchDownRef = useRef(false);

  const updateTime = useCallback(() => {
    if (startTimeRef.current !== null) {
      setTime(Date.now() - startTimeRef.current);
      animationFrameRef.current = requestAnimationFrame(updateTime);
    }
  }, []);

  const startTimer = useCallback(() => {
    setState('running');
    setFinalTime(null);
    startTimeRef.current = Date.now();
    setTime(0);
    updateTime();
  }, [updateTime]);

  const stopTimer = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    startTimeRef.current = null;
    setFinalTime(time);
    setState('stopped');
  }, [time]);

  const armTimer = useCallback(() => {
    if (state === 'idle' || state === 'stopped') {
      armTimeoutRef.current = setTimeout(() => {
        setState('armed');
      }, 300); // 300ms hold to arm
    }
  }, [state]);

  const disarmTimer = useCallback(() => {
    if (armTimeoutRef.current) {
      clearTimeout(armTimeoutRef.current);
      armTimeoutRef.current = null;
    }
    if (state === 'armed') {
      startTimer();
    } else if (state === 'idle' || state === 'stopped') {
      // Released too early, reset
      setState(state);
    }
  }, [state, startTimer]);

  const reset = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (armTimeoutRef.current) {
      clearTimeout(armTimeoutRef.current);
      armTimeoutRef.current = null;
    }
    startTimeRef.current = null;
    setTime(0);
    setFinalTime(null);
    setState('idle');
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        
        if (state === 'running') {
          stopTimer();
        } else if (!isSpaceDownRef.current && (state === 'idle' || state === 'stopped')) {
          isSpaceDownRef.current = true;
          armTimer();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        isSpaceDownRef.current = false;
        if (state !== 'running') {
          disarmTimer();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [state, armTimer, disarmTimer, stopTimer]);

  // Touch/pointer controls
  const handlePointerDown = useCallback(() => {
    if (state === 'running') {
      stopTimer();
    } else if (!isTouchDownRef.current && (state === 'idle' || state === 'stopped')) {
      isTouchDownRef.current = true;
      armTimer();
    }
  }, [state, armTimer, stopTimer]);

  const handlePointerUp = useCallback(() => {
    isTouchDownRef.current = false;
    if (state !== 'running') {
      disarmTimer();
    }
  }, [state, disarmTimer]);

  const displayTime = finalTime !== null ? finalTime : time;

  return {
    state,
    time: displayTime,
    isRunning: state === 'running',
    handlePointerDown,
    handlePointerUp,
    reset,
  };
}
