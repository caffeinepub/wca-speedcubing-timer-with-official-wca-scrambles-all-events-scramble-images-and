export type InspectionOutcome = 'none' | 'plus2' | 'dnf';

export interface SolveEntry {
  id: string;
  time: number; // milliseconds
  event: string;
  scramble: string;
  timestamp: number;
  inspectionOutcome: InspectionOutcome;
}

export function getDisplayTime(solve: SolveEntry): string {
  if (solve.inspectionOutcome === 'dnf') {
    return 'DNF';
  }
  
  const effectiveTime = solve.inspectionOutcome === 'plus2' 
    ? solve.time + 2000 
    : solve.time;
  
  const totalSeconds = Math.floor(effectiveTime / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = Math.floor((effectiveTime % 1000) / 10);

  const timeStr = minutes > 0
    ? `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`
    : `${seconds}.${milliseconds.toString().padStart(2, '0')}`;
  
  return solve.inspectionOutcome === 'plus2' ? `${timeStr}+` : timeStr;
}

export function getNumericTime(solve: SolveEntry): number | null {
  if (solve.inspectionOutcome === 'dnf') {
    return null;
  }
  return solve.inspectionOutcome === 'plus2' ? solve.time + 2000 : solve.time;
}
