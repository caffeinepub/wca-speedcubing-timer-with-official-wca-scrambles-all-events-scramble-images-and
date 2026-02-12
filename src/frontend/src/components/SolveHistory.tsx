import { SolveEntry, getDisplayTime } from '../types/solves';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';

interface SolveHistoryProps {
  solves: SolveEntry[];
}

export function SolveHistory({ solves }: SolveHistoryProps) {
  if (solves.length === 0) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Solve History</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px] w-full">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {solves.map((solve, index) => (
              <div
                key={solve.id}
                className="flex flex-col items-center gap-1 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <span className="text-xs text-muted-foreground">#{solves.length - index}</span>
                <Badge
                  variant={solve.inspectionOutcome === 'dnf' ? 'destructive' : 'default'}
                  className="text-sm font-mono"
                >
                  {getDisplayTime(solve)}
                </Badge>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
