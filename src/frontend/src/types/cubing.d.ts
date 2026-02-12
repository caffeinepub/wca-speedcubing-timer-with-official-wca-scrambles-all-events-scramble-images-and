declare module 'https://cdn.cubing.net/v0/js/cubing/scramble' {
  export class Alg {
    toString(): string;
    log(): void;
  }
  
  export function randomScrambleForEvent(eventId: string): Promise<Alg>;
}

declare module 'https://cdn.cubing.net/v0/js/cubing/twisty' {
  export interface TwistyPlayerConfig {
    puzzle?: string;
    alg?: string;
    hintFacelets?: string;
    backView?: string;
    controlPanel?: string;
    background?: string;
    visualization?: string;
  }

  export class TwistyPlayer extends HTMLElement {
    constructor(config?: TwistyPlayerConfig);
    style: CSSStyleDeclaration;
  }
}
