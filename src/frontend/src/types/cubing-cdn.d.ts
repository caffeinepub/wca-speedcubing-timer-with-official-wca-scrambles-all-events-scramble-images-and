declare module 'https://cdn.cubing.net/js/cubing/scramble' {
  export function randomScrambleForEvent(eventId: string): Promise<{ toString(): string }>;
}
