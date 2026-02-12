export interface WCAEvent {
  id: string;
  name: string;
  scrambleEvent: string;
}

export const WCA_EVENTS: WCAEvent[] = [
  { id: '333', name: '3x3x3 Cube', scrambleEvent: '333' },
  { id: '222', name: '2x2x2 Cube', scrambleEvent: '222' },
  { id: '444', name: '4x4x4 Cube', scrambleEvent: '444' },
  { id: '555', name: '5x5x5 Cube', scrambleEvent: '555' },
  { id: '666', name: '6x6x6 Cube', scrambleEvent: '666' },
  { id: '777', name: '7x7x7 Cube', scrambleEvent: '777' },
  { id: '333bf', name: '3x3x3 Blindfolded', scrambleEvent: '333bf' },
  { id: '333fm', name: '3x3x3 Fewest Moves', scrambleEvent: '333fm' },
  { id: '333oh', name: '3x3x3 One-Handed', scrambleEvent: '333oh' },
  { id: 'clock', name: 'Clock', scrambleEvent: 'clock' },
  { id: 'minx', name: 'Megaminx', scrambleEvent: 'minx' },
  { id: 'pyram', name: 'Pyraminx', scrambleEvent: 'pyram' },
  { id: 'skewb', name: 'Skewb', scrambleEvent: 'skewb' },
  { id: 'sq1', name: 'Square-1', scrambleEvent: 'sq1' },
  { id: '444bf', name: '4x4x4 Blindfolded', scrambleEvent: '444bf' },
  { id: '555bf', name: '5x5x5 Blindfolded', scrambleEvent: '555bf' },
];
