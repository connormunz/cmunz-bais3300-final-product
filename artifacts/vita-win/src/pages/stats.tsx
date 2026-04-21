import { useGetAdherenceSummary, getGetAdherenceSummaryQueryKey } from "@workspace/api-client-react";
import { Flame, Calendar, Activity, CheckSquare, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function Stats() {
  const { data: stats, isLoading } = useGetAdherenceSummary({
    query: {
      queryKey: getGetAdherenceSummaryQueryKey(),
      enabled: true
    }
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col py-6">
        <header className="mb-8">
          <div className="h-10 w-32 bg-secondary/50 animate-pulse rounded-lg" />
        </header>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-secondary/50 animate-pulse rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="flex-1 flex flex-col py-6 animate-in fade-in duration-500">
      <header className="mb-8">
        <h2 className="text-3xl font-semibold tracking-tight text-foreground" data-testid="text-page-title">
          Stats
        </h2>
        <p className="text-muted-foreground mt-1">Your adherence overview</p>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <StatCard
          title="Current Streak"
          value={stats.currentStreak.toString()}
          subtitle="days in a row"
          icon={Flame}
          colorClass="text-orange-500"
          bgClass="bg-orange-50 dark:bg-orange-500/10"
          testId="stat-current-streak"
        />
        
        <StatCard
          title="Longest Streak"
          value={stats.longestStreak.toString()}
          subtitle="personal best"
          icon={Activity}
          colorClass="text-primary"
          bgClass="bg-primary/10"
          testId="stat-longest-streak"
        />

        <StatCard
          title="30-Day Rate"
          value={`${Math.round(stats.adherenceRateLast30)}%`}
          subtitle="logged days"
          icon={Calendar}
          colorClass="text-blue-500"
          bgClass="bg-blue-50 dark:bg-blue-500/10"
          testId="stat-adherence-rate"
        />

        <StatCard
          title="Taken Last 30"
          value={`${stats.takenDaysLast30} / 30`}
          subtitle="days taken"
          icon={CheckSquare}
          colorClass="text-primary"
          bgClass="bg-primary/10"
          testId="stat-taken-last-30"
        />
      </div>

      <div className="mt-8 bg-card border border-border p-6 rounded-3xl shadow-sm text-center">
        <p className="text-lg font-medium text-foreground mb-2">Consistency is key</p>
        <p className="text-muted-foreground text-sm">
          You've logged {stats.loggedDaysLast30} out of the last 30 days. Keep building the habit!
        </p>
      </div>
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  colorClass, 
  bgClass,
  testId 
}: { 
  title: string; 
  value: string; 
  subtitle: string; 
  icon: LucideIcon; 
  colorClass: string; 
  bgClass: string;
  testId: string;
}) {
  return (
    <div className="bg-card border border-border p-5 rounded-3xl flex flex-col items-center text-center justify-center shadow-sm relative overflow-hidden group">
      <div className={cn("absolute -right-4 -top-4 w-16 h-16 rounded-full opacity-20 transition-transform group-hover:scale-150 duration-500", bgClass)} />
      
      <Icon className={cn("w-6 h-6 mb-3", colorClass)} />
      <div className="text-3xl font-semibold text-foreground mb-1 tracking-tight" data-testid={testId}>
        {value}
      </div>
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {title}
      </div>
      <div className="text-[10px] text-muted-foreground mt-1 opacity-70">
        {subtitle}
      </div>
    </div>
  );
}
