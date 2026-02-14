import { useQuery } from '@tanstack/react-query';

export interface WCACompetition {
  id: string;
  name: string;
  city: string;
  country_iso2: string;
  start_date: string;
  end_date: string;
  event_ids: string[];
  competitor_limit?: number;
  venue?: {
    name: string;
    address: string;
  };
}

export function useWcaUpcomingCompetitions() {
  return useQuery<WCACompetition[]>({
    queryKey: ['wca-upcoming-competitions'],
    queryFn: async () => {
      const response = await fetch('https://www.worldcubeassociation.org/api/v0/competitions?start=0&per_page=100');
      
      if (!response.ok) {
        throw new Error('Failed to fetch WCA competitions');
      }
      
      const data = await response.json();
      
      // Filter for upcoming competitions only
      const now = new Date();
      const upcoming = data.filter((comp: WCACompetition) => {
        const startDate = new Date(comp.start_date);
        return startDate >= now;
      });
      
      return upcoming;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
    retry: 2,
  });
}
