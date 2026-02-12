import { SessionStats as Stats } from '../lib/sessionStats';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface SessionStatsProps {
  stats: Stats;
}

export function SessionStats({ stats }: SessionStatsProps) {
  const statItems = [
    { label: 'Current', value: stats.current },
    { label: 'Best', value: stats.best },
    { label: 'ao5', value: stats.ao5 },
    { label: 'ao12', value: stats.ao12 },
    { label: 'mo3', value: stats.mo3 },
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Session Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {statItems.map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-1">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">
                {item.label}
              </span>
              <span className="text-lg font-mono font-semibold">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
