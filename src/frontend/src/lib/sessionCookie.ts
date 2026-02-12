import { SolveEntry } from '../types/solves';

const COOKIE_NAME = 'wca_timer_session';
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year in seconds

export interface SessionData {
  event: string;
  scramble: string;
  solves: SolveEntry[];
}

export function saveSessionData(data: SessionData): void {
  try {
    const json = JSON.stringify(data);
    const encoded = encodeURIComponent(json);
    document.cookie = `${COOKIE_NAME}=${encoded}; max-age=${COOKIE_MAX_AGE}; path=/; SameSite=Lax`;
  } catch (error) {
    console.error('Failed to save session data:', error);
  }
}

export function loadSessionData(): SessionData | null {
  try {
    const cookies = document.cookie.split(';');
    const sessionCookie = cookies.find(c => c.trim().startsWith(`${COOKIE_NAME}=`));
    
    if (!sessionCookie) {
      return null;
    }

    const encoded = sessionCookie.split('=')[1];
    const json = decodeURIComponent(encoded);
    const data = JSON.parse(json) as SessionData;
    
    // Validate structure
    if (!data.event || !Array.isArray(data.solves)) {
      return null;
    }

    return data;
  } catch (error) {
    console.error('Failed to load session data:', error);
    return null;
  }
}
