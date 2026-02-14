import { useQuery } from '@tanstack/react-query';

export interface WCACompetitionDetails {
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

export function useWcaCompetitionDetails(competitionId: string | null) {
  return useQuery<WCACompetitionDetails>({
    queryKey: ['wca-competition-details', competitionId],
    queryFn: async () => {
      if (!competitionId) throw new Error('No competition ID provided');
      
      const response = await fetch(`https://www.worldcubeassociation.org/api/v0/competitions/${competitionId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch competition details');
      }
      
      return response.json();
    },
    enabled: !!competitionId,
    staleTime: 1000 * 60 * 30, // 30 minutes
    retry: 2,
  });
}
