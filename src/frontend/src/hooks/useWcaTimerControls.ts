import { useState, useEffect, useCallback, useRef } from 'react';
import { InspectionOutcome } from '../types/solves';
import { inspectionAudio } from '../lib/inspectionAudio';

export type TimerState = 'idle' | 'inspection' | 'armed' | 'running' | 'stopped';

export interface TimerResult {
  time: number;
  inspectionOutcome: InspectionOutcome;
}

export function useWcaTimerControls() {
  const [state, setState] = useState<TimerState>('idle');
  const [time, setTime] = useState(0);
  const [inspectionTime, setInspectionTime] = useState(15000); // 15 seconds in ms
  const [finalResult, setFinalResult] = useState<TimerResult | null>(null);
  
  const startTimeRef = useRef<number | null>(null);
  const inspectionStartRef = useRef<number | null>(null);
  const inspectionZeroTimeRef = useRef<number | null>(null); // Track when inspection hit 0
  const animationFrameRef = useRef<number | null>(null);
  const armTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSpaceDownRef = useRef(false);
  const isTouchDownRef = useRef(false);
  const has8SecondWarningRef = useRef(false);
  const has5SecondWarningRef = useRef(false);
  const previousRemainingRef = useRef<number>(15000);
  const stateRef = useRef<TimerState>('idle');

  // Keep stateRef in sync
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const updateTime = useCallback(() => {
    if (startTimeRef.current !== null) {
      setTime(Date.now() - startTimeRef.current);
      animationFrameRef.current = requestAnimationFrame(updateTime);
    }
  }, []);

  const updateInspection = useCallback(() => {
    if (inspectionStartRef.current !== null && stateRef.current !== 'running') {
      const elapsed = Date.now() - inspectionStartRef.current;
      const remaining = Math.max(0, 15000 - elapsed);
      const previousRemaining = previousRemainingRef.current;
      
      setInspectionTime(remaining);
      previousRemainingRef.current = remaining;

      // Track when inspection hits 0
      if (remaining === 0 && inspectionZeroTimeRef.current === null) {
        inspectionZeroTimeRef.current = Date.now();
      }

      // Threshold-crossing logic for warnings
      if (previousRemaining > 8000 && remaining <= 8000 && !has8SecondWarningRef.current) {
        has8SecondWarningRef.current = true;
        inspectionAudio.play8SecondWarning();
      }
      if (previousRemaining > 5000 && remaining <= 5000 && !has5SecondWarningRef.current) {
        has5SecondWarningRef.current = true;
        inspectionAudio.play5SecondWarning();
      }

      // Continue animation if still in inspection or armed during inspection
      if (stateRef.current === 'inspection' || (stateRef.current === 'armed' && inspectionStartRef.current !== null)) {
        animationFrameRef.current = requestAnimationFrame(updateInspection);
      }
    }
  }, []);

  const startInspection = useCallback(() => {
    setState('inspection');
    setFinalResult(null);
    inspectionStartRef.current = Date.now();
    inspectionZeroTimeRef.current = null;
    setInspectionTime(15000);
    previousRemainingRef.current = 15000;
    has8SecondWarningRef.current = false;
    has5SecondWarningRef.current = false;
    
    // Initialize audio on first user interaction
    inspectionAudio.initialize();
    
    animationFrameRef.current = requestAnimationFrame(updateInspection);
  }, [updateInspection]);

  const startTimer = useCallback(() => {
    // Stop inspection countdown
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Calculate inspection outcome based on time elapsed
    let inspectionOutcome: InspectionOutcome = 'none';
    if (inspectionStartRef.current !== null) {
      const inspectionElapsed = Date.now() - inspectionStartRef.current;
      
      if (inspectionElapsed > 17000) {
        // More than 2 seconds after inspection ended
        inspectionOutcome = 'dnf';
      } else if (inspectionElapsed > 15000) {
        // Between 0 and 2 seconds after inspection ended
        inspectionOutcome = 'plus2';
      }
      // else: started within 15 seconds, no penalty
    }

    setState('running');
    startTimeRef.current = Date.now();
    inspectionStartRef.current = null;
    inspectionZeroTimeRef.current = null;
    setTime(0);
    
    // Store inspection outcome for later
    (startTimeRef as any).inspectionOutcome = inspectionOutcome;
    
    animationFrameRef.current = requestAnimationFrame(updateTime);
  }, [updateTime]);

  const stopTimer = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    const inspectionOutcome = (startTimeRef as any).inspectionOutcome || 'none';
    startTimeRef.current = null;
    
    setFinalResult({
      time,
      inspectionOutcome,
    });
    setState('stopped');
  }, [time]);

  const armTimer = useCallback(() => {
    if (state === 'idle' || state === 'stopped') {
      armTimeoutRef.current = setTimeout(() => {
        setState('armed');
      }, 300); // 300ms hold to arm
    } else if (state === 'inspection') {
      armTimeoutRef.current = setTimeout(() => {
        setState('armed');
        // Keep inspection countdown running
      }, 300);
    }
  }, [state]);

  const disarmTimer = useCallback(() => {
    if (armTimeoutRef.current) {
      clearTimeout(armTimeoutRef.current);
      armTimeoutRef.current = null;
    }
    if (state === 'armed') {
      // Released from armed state - start the appropriate action
      if (inspectionStartRef.current !== null) {
        // We were in inspection, now start the solve
        startTimer();
      } else {
        // We were idle/stopped, now start inspection
        startInspection();
      }
    } else if (state === 'idle' || state === 'stopped' || state === 'inspection') {
      // Released too early, do nothing (stay in current state)
    }
  }, [state, startTimer, startInspection]);

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
    inspectionStartRef.current = null;
    inspectionZeroTimeRef.current = null;
    setTime(0);
    setInspectionTime(15000);
    previousRemainingRef.current = 15000;
    setFinalResult(null);
    setState('idle');
    has8SecondWarningRef.current = false;
    has5SecondWarningRef.current = false;
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        
        if (state === 'running') {
          stopTimer();
        } else if (!isSpaceDownRef.current && (state === 'idle' || state === 'stopped' || state === 'inspection' || state === 'armed')) {
          isSpaceDownRef.current = true;
          if (state !== 'armed') {
            armTimer();
          }
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
    } else if (!isTouchDownRef.current && (state === 'idle' || state === 'stopped' || state === 'inspection' || state === 'armed')) {
      isTouchDownRef.current = true;
      if (state !== 'armed') {
        armTimer();
      }
    }
  }, [state, armTimer, stopTimer]);

  const handlePointerUp = useCallback(() => {
    isTouchDownRef.current = false;
    if (state !== 'running') {
      disarmTimer();
    }
  }, [state, disarmTimer]);

  return {
    state,
    time,
    inspectionTime,
    finalResult,
    isRunning: state === 'running',
    handlePointerDown,
    handlePointerUp,
    reset,
  };
}
