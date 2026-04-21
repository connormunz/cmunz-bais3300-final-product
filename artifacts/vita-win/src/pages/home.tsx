import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { 
  useGetTodayLog, 
  useLogToday, 
  getGetTodayLogQueryKey,
  getGetAdherenceSummaryQueryKey,
  getGetLogHistoryQueryKey
} from "@workspace/api-client-react";
import { format } from "date-fns";
import { Check, X, Clock, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

function getLocalDate(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function Home() {
  const queryClient = useQueryClient();
  const localDate = getLocalDate();

  const { data: todayData, isLoading } = useGetTodayLog(
    { date: localDate },
    {
      query: {
        queryKey: getGetTodayLogQueryKey({ date: localDate }),
        enabled: true,
      },
    }
  );

  const logToday = useLogToday({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetTodayLogQueryKey({ date: localDate }) });
        queryClient.invalidateQueries({ queryKey: getGetAdherenceSummaryQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetLogHistoryQueryKey() });
      },
    },
  });

  const [isEditing, setIsEditing] = useState(false);

  const hasExistingLog = Boolean(todayData?.log);

  const handleLog = (status: "taken" | "skipped") => {
    logToday.mutate({
      data: {
        status,
        date: localDate,
        override: hasExistingLog || isEditing,
      },
    });
    setIsEditing(false);
  };

  const today = new Date();
  const log = todayData?.log;

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in duration-500">
        <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      </div>
    );
  }

  const showActions = !log || isEditing;

  return (
    <div className="flex-1 flex flex-col justify-center animate-in slide-in-from-bottom-4 fade-in duration-700 ease-out">
      <div className="flex flex-col items-center text-center space-y-2 mb-16">
        <div className="text-sm font-medium text-primary/80 uppercase tracking-widest mb-2" data-testid="text-today-label">
          Today
        </div>
        <h2 className="text-4xl font-semibold tracking-tight text-foreground" data-testid="text-today-date">
          {format(today, "MMMM d")}
        </h2>
      </div>

      <div className="relative w-full max-w-[280px] mx-auto">
        {showActions ? (
          <div className="flex flex-col gap-4 w-full animate-in zoom-in-95 duration-500">
            <button
              onClick={() => handleLog("taken")}
              disabled={logToday.isPending}
              className="group relative overflow-hidden w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-[2rem] p-8 transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-xl shadow-primary/20"
              data-testid="button-log-taken"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out rounded-[2rem]" />
              <div className="relative z-10 flex flex-col items-center gap-3">
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Check className="w-8 h-8" />
                </div>
                <span className="text-2xl font-medium">Taken</span>
              </div>
            </button>

            <button
              onClick={() => handleLog("skipped")}
              disabled={logToday.isPending}
              className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-[2rem] p-6 transition-all duration-300 hover:scale-[1.02] active:scale-95 border border-border"
              data-testid="button-log-skipped"
            >
              <div className="flex flex-col items-center gap-2 opacity-80">
                <X className="w-6 h-6" />
                <span className="text-lg font-medium">Skipped</span>
              </div>
            </button>
            
            {isEditing && (
              <Button 
                variant="ghost" 
                onClick={() => setIsEditing(false)}
                className="mt-2 text-muted-foreground hover:text-foreground"
                data-testid="button-cancel-edit"
              >
                Cancel
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center w-full animate-in zoom-in-95 duration-500">
            <div 
              className={cn(
                "w-full rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center gap-6 shadow-2xl transition-all",
                log.status === "taken" 
                  ? "bg-primary text-primary-foreground shadow-primary/20" 
                  : "bg-secondary text-secondary-foreground shadow-black/5"
              )}
              data-testid={`status-display-${log.status}`}
            >
              <div className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center",
                log.status === "taken" ? "bg-white/20" : "bg-black/5"
              )}>
                {log.status === "taken" ? (
                  <Check className="w-10 h-10" />
                ) : (
                  <X className="w-10 h-10" />
                )}
              </div>
              
              <div>
                <div className="text-3xl font-medium mb-2 capitalize">
                  {log.status}
                </div>
                <div className="flex items-center justify-center gap-2 opacity-80 text-sm font-mono">
                  <Clock className="w-4 h-4" />
                  <span>{format(new Date(log.loggedAt), "h:mm a")}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsEditing(true)}
              className="mt-8 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors px-4 py-2 rounded-full hover:bg-secondary/50 text-sm font-medium"
              data-testid="button-edit-log"
            >
              <RefreshCw className="w-4 h-4" />
              Change Status
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
