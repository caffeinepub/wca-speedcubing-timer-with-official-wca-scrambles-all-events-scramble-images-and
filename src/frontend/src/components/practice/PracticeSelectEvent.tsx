import { useWcaCompetitionDetails } from '../../hooks/useWcaCompetitionDetails';
import { WCA_EVENTS } from '../../lib/wcaEvents';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Loader2, ArrowLeft, Calendar, MapPin } from 'lucide-react';

interface PracticeSelectEventProps {
  competitionId: string;
  competitionName: string;
  onSelect: (eventId: string) => void;
  onBack: () => void;
}

export function PracticeSelectEvent({ competitionId, competitionName, onSelect, onBack }: PracticeSelectEventProps) {
  const { data: competition, isLoading, error } = useWcaCompetitionDetails(competitionId);

  const availableEvents = competition?.event_ids
    .map(eventId => WCA_EVENTS.find(e => e.id === eventId))
    .filter(Boolean) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-practice-primary" />
          <p className="text-muted-foreground">Loading competition details...</p>
        </div>
      </div>
    );
  }

  if (error || !competition) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Competition</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Failed to load competition details. Please try again.
            </p>
            <Button onClick={onBack} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Competitions
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Button onClick={onBack} variant="ghost" className="gap-2">
        <ArrowLeft className="w-4 h-4" />
        Back to Competitions
      </Button>

      {/* Competition Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{competition.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{new Date(competition.start_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{competition.city}</span>
          </div>
        </CardContent>
      </Card>

      {/* Event Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select an Event to Practice</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {availableEvents.map(event => (
              <Button
                key={event!.id}
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2 hover:border-practice-primary hover:bg-practice-primary/5"
                onClick={() => onSelect(event!.scrambleEvent)}
              >
                <span className="text-3xl">🧩</span>
                <span className="font-semibold">{event!.name}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
