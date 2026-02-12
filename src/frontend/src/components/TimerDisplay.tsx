import { TimerState, TimerResult } from '../hooks/useWcaTimerControls';

interface TimerDisplayProps {
  state: TimerState;
  time: number;
  inspectionTime: number;
  finalResult: TimerResult | null;
  handlePointerDown: () => void;
  handlePointerUp: () => void;
}

export function TimerDisplay({ 
  state, 
  time, 
  inspectionTime,
  finalResult,
  handlePointerDown, 
  handlePointerUp 
}: TimerDisplayProps) {
  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((ms % 1000) / 10);

    if (minutes > 0) {
      return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
    }
    return `${seconds}.${milliseconds.toString().padStart(2, '0')}`;
  };

  const formatInspectionTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const centiseconds = Math.floor((ms % 1000) / 10);
    return `${seconds}.${centiseconds.toString().padStart(2, '0')}`;
  };

  const getStateColor = () => {
    switch (state) {
      case 'inspection':
        return inspectionTime <= 5000 ? 'text-destructive' : 'text-timer-armed';
      case 'armed':
        return 'text-timer-armed';
      case 'running':
        return 'text-timer-running';
      case 'stopped':
        return 'text-timer-stopped';
      default:
        return 'text-foreground';
    }
  };

  const getStateText = () => {
    if (state === 'inspection' && inspectionTime <= 5000) {
      return '5 sec';
    }
    switch (state) {
      case 'inspection':
        return 'Inspection';
      case 'armed':
        return 'Ready';
      case 'running':
        return 'Solving...';
      case 'stopped':
        return 'Finished';
      default:
        return 'Press and hold to start';
    }
  };

  const getDisplayValue = () => {
    if (state === 'inspection' || (state === 'armed' && inspectionTime < 15000)) {
      return formatInspectionTime(inspectionTime);
    }
    if (state === 'stopped' && finalResult) {
      const displayTime = formatTime(finalResult.time);
      if (finalResult.inspectionOutcome === 'dnf') {
        return 'DNF';
      }
      if (finalResult.inspectionOutcome === 'plus2') {
        return `${displayTime}+`;
      }
      return displayTime;
    }
    return formatTime(time);
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl">
      <div
        className="w-full aspect-[3/2] rounded-2xl border-2 border-border/60 bg-card/30 backdrop-blur-sm flex flex-col items-center justify-center cursor-pointer select-none transition-all hover:border-border active:scale-[0.98] touch-none"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        style={{ touchAction: 'none' }}
      >
        <div className={`text-7xl sm:text-8xl md:text-9xl font-bold tabular-nums transition-colors ${getStateColor()}`}>
          {getDisplayValue()}
        </div>
        <div className="mt-4 text-sm sm:text-base text-muted-foreground font-medium">
          {getStateText()}
        </div>
      </div>
    </div>
  );
}
