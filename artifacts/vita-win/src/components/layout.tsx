import { Link, useLocation } from "wouter";
import { CheckCircle2, History, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Today", icon: CheckCircle2 },
    { href: "/history", label: "History", icon: History },
    { href: "/stats", label: "Stats", icon: BarChart3 },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col max-w-md mx-auto relative bg-background shadow-2xl shadow-primary/5 sm:border-x sm:border-border">
      <header className="px-6 pt-10 pb-6 flex items-center justify-center shrink-0">
        <h1 className="text-xl font-medium tracking-tight text-foreground/80" data-testid="text-app-title">
          Vita-Win
        </h1>
      </header>

      <main className="flex-1 px-6 pb-32 flex flex-col relative">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 sm:absolute bg-card/80 backdrop-blur-xl border-t border-border/50 pb-safe z-50">
        <div className="flex items-center justify-around px-2 py-3 max-w-md mx-auto">
          {navItems.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <Link 
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1.5 px-4 py-2 rounded-2xl transition-all duration-300 ease-out",
                  isActive 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )}
                data-testid={`link-nav-${item.label.toLowerCase()}`}
              >
                <Icon className={cn("w-5 h-5", isActive && "stroke-[2.5px]")} />
                <span className="text-[11px] font-medium tracking-wide">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
