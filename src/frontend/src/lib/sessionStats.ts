import { SolveEntry, getNumericTime } from '../types/solves';

export interface SessionStats {
  current: string;
  best: string;
  ao5: string;
  ao12: string;
  mo3: string;
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = Math.floor((ms % 1000) / 10);

  if (minutes > 0) {
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  }
  return `${seconds}.${milliseconds.toString().padStart(2, '0')}`;
}

function calculateAverage(solves: SolveEntry[], count: number): string {
  if (solves.length < count) {
    return `—`;
  }

  const recentSolves = solves.slice(-count);
  const times = recentSolves.map(getNumericTime);

  // If any DNF, the average is DNF
  if (times.some(t => t === null)) {
    return 'DNF';
  }

  const validTimes = times as number[];
  
  // For ao5 and ao12, remove best and worst
  if (count >= 5) {
    const sorted = [...validTimes].sort((a, b) => a - b);
    const trimmed = sorted.slice(1, -1);
    const avg = trimmed.reduce((sum, t) => sum + t, 0) / trimmed.length;
    return formatTime(avg);
  }

  return 'DNF';
}

function calculateMean(solves: SolveEntry[], count: number): string {
  if (solves.length < count) {
    return `—`;
  }

  const recentSolves = solves.slice(-count);
  const times = recentSolves.map(getNumericTime);

  // If any DNF, the mean is DNF
  if (times.some(t => t === null)) {
    return 'DNF';
  }

  const validTimes = times as number[];
  const mean = validTimes.reduce((sum, t) => sum + t, 0) / validTimes.length;
  return formatTime(mean);
}

export function computeSessionStats(solves: SolveEntry[]): SessionStats {
  // Current
  const current = solves.length > 0 
    ? (solves[solves.length - 1].inspectionOutcome === 'dnf' 
        ? 'DNF' 
        : formatTime(getNumericTime(solves[solves.length - 1])!))
    : '—';

  // Best (exclude DNFs)
  const validTimes = solves
    .map(getNumericTime)
    .filter((t): t is number => t !== null);
  
  const best = validTimes.length > 0
    ? formatTime(Math.min(...validTimes))
    : '—';

  // ao5
  const ao5 = calculateAverage(solves, 5);

  // ao12
  const ao12 = calculateAverage(solves, 12);

  // mo3
  const mo3 = calculateMean(solves, 3);

  return { current, best, ao5, ao12, mo3 };
}
