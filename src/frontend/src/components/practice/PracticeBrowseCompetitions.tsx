import { useState, useMemo } from 'react';
import { useWcaUpcomingCompetitions } from '../../hooks/useWcaUpcomingCompetitions';
import { getCountryName, getUniqueCountries } from '../../lib/wcaCountries';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ScrollArea } from '../ui/scroll-area';
import { Loader2, Search, X, Calendar, MapPin, Users } from 'lucide-react';

interface PracticeBrowseCompetitionsProps {
  onSelect: (competitionId: string, competitionName: string) => void;
}

export function PracticeBrowseCompetitions({ onSelect }: PracticeBrowseCompetitionsProps) {
  const { data: competitions, isLoading, error } = useWcaUpcomingCompetitions();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');

  const countries = useMemo(() => {
    if (!competitions) return [];
    return getUniqueCountries(competitions);
  }, [competitions]);

  const filteredCompetitions = useMemo(() => {
    if (!competitions) return [];

    return competitions.filter(comp => {
      const matchesCountry = selectedCountry === 'all' || comp.country_iso2 === selectedCountry;
      
      if (!searchQuery) return matchesCountry;

      const query = searchQuery.toLowerCase();
      const matchesName = comp.name.toLowerCase().includes(query);
      const matchesCity = comp.city.toLowerCase().includes(query);
      const matchesCountryName = getCountryName(comp.country_iso2).toLowerCase().includes(query);

      return matchesCountry && (matchesName || matchesCity || matchesCountryName);
    });
  }, [competitions, searchQuery, selectedCountry]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCountry('all');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-practice-primary" />
          <p className="text-muted-foreground">Loading upcoming competitions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Competitions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Failed to fetch competitions from the WCA API. Please check your internet connection and try again.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Browse Upcoming Competitions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, city, or country..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger>
                <SelectValue placeholder="All Countries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {countries.map(country => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {(searchQuery || selectedCountry !== 'all') && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              className="gap-2"
            >
              <X className="w-4 h-4" />
              Clear Filters
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filteredCompetitions.length} competition{filteredCompetitions.length !== 1 ? 's' : ''} found
          </p>
        </div>

        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-3">
            {filteredCompetitions.map(comp => (
              <Card
                key={comp.id}
                className="cursor-pointer hover:border-practice-primary transition-colors"
                onClick={() => onSelect(comp.id, comp.name)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <h3 className="font-semibold text-lg">{comp.name}</h3>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(comp.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4" />
                          <span>{comp.city}, {getCountryName(comp.country_iso2)}</span>
                        </div>
                        {comp.competitor_limit && (
                          <div className="flex items-center gap-1.5">
                            <Users className="w-4 h-4" />
                            <span>{comp.competitor_limit} limit</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {comp.event_ids.slice(0, 6).map(eventId => (
                          <span
                            key={eventId}
                            className="px-2 py-0.5 text-xs rounded-md bg-practice-primary/10 text-practice-primary font-medium"
                          >
                            {eventId}
                          </span>
                        ))}
                        {comp.event_ids.length > 6 && (
                          <span className="px-2 py-0.5 text-xs rounded-md bg-muted text-muted-foreground">
                            +{comp.event_ids.length - 6} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
