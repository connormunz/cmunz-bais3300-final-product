import { useState } from "react";
import { useGetLogHistory, getGetLogHistoryQueryKey } from "@workspace/api-client-react";
import { format, parseISO } from "date-fns";
import { CheckCircle2, XCircle, MinusCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function History() {
  const [page, setPage] = useState(0);
  const limit = 30;
  
  const { data, isLoading } = useGetLogHistory(
    { limit, offset: page * limit },
    {
      query: {
        queryKey: getGetLogHistoryQueryKey({ limit, offset: page * limit }),
        enabled: true
      }
    }
  );

  return (
    <div className="flex-1 flex flex-col py-6 animate-in fade-in duration-500">
      <header className="mb-8">
        <h2 className="text-3xl font-semibold tracking-tight text-foreground" data-testid="text-page-title">
          History
        </h2>
        <p className="text-muted-foreground mt-1">Your past logs and activity</p>
      </header>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 bg-secondary/50 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : data?.logs.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground space-y-4">
          <MinusCircle className="w-12 h-12 opacity-20" />
          <p>No history yet. Start logging today!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data?.logs.map((log, index) => (
            <div 
              key={log.id} 
              className="bg-card border border-border p-4 rounded-2xl flex items-center justify-between shadow-sm animate-in slide-in-from-bottom-2 fade-in fill-mode-both"
              style={{ animationDelay: `${index * 50}ms` }}
              data-testid={`row-log-${log.id}`}
            >
              <div className="flex flex-col">
                <span className="font-medium text-foreground">
                  {format(parseISO(log.date), "EEEE, MMMM d")}
                </span>
                <span className="text-xs text-muted-foreground font-mono mt-0.5">
                  {format(new Date(log.loggedAt), "h:mm a")}
                </span>
              </div>
              
              <div className={cn(
                "px-3 py-1.5 rounded-full flex items-center gap-2 text-sm font-medium",
                log.status === "taken" 
                  ? "bg-primary/10 text-primary" 
                  : "bg-secondary text-muted-foreground"
              )}>
                {log.status === "taken" ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                <span className="capitalize">{log.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {data && data.total > limit && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors disabled:opacity-30 disabled:pointer-events-none"
            data-testid="button-prev-page"
          >
            <ChevronLeft className="w-4 h-4" />
            Prev
          </button>
          <span className="text-xs text-muted-foreground" data-testid="text-pagination">
            Page {page + 1} of {Math.ceil(data.total / limit)}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={(page + 1) * limit >= data.total}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors disabled:opacity-30 disabled:pointer-events-none"
            data-testid="button-next-page"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
