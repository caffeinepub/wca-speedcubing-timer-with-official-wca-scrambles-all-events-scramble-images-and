import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { WCA_EVENTS } from '../lib/wcaEvents';

interface EventSelectorProps {
  selectedEvent: string;
  onEventChange: (eventId: string) => void;
  disabled?: boolean;
}

export function EventSelector({ selectedEvent, onEventChange, disabled }: EventSelectorProps) {
  const selectedEventData = WCA_EVENTS.find((e) => e.id === selectedEvent);

  return (
    <div className="w-full max-w-md">
      <Select value={selectedEvent} onValueChange={onEventChange} disabled={disabled}>
        <SelectTrigger className="h-12 text-base bg-card border-border/60 hover:border-border transition-colors">
          <SelectValue>
            <span className="font-medium">{selectedEventData?.name || 'Select Event'}</span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {WCA_EVENTS.map((event) => (
            <SelectItem key={event.id} value={event.id} className="text-base">
              {event.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
