import { useState, useEffect } from "react";
import { Search, Settings, Maximize, Minimize, Menu } from "lucide-react";
import { useApiStatus } from "../hooks/useApiStatus";
import { SettingsDialog } from "./SettingsDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  messageCount: number;
  onMenuToggle: () => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
}

export function Header({ messageCount, onMenuToggle, isSearchOpen, setIsSearchOpen }: HeaderProps) {
  const { isOnline } = useApiStatus();
  const [time, setTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  return (
    <>
      <header className="h-16 shrink-0 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30 bg-card/60 backdrop-blur-md border-b border-border shadow-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuToggle}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-white tracking-tight">AUTOMOTIVE MAS</h1>
            <span className="text-xs text-muted-foreground hidden sm:inline-block">Multi-Agent Automotive Intelligence</span>
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-4">
          <Badge variant="outline" className="hidden sm:flex bg-card/50 text-muted-foreground border-border gap-1 font-mono text-[10px]">
            {messageCount} msgs
          </Badge>

          <div className="hidden lg:flex items-center gap-2 mr-2">
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-success shadow-[0_0_8px_hsl(var(--success))]' : 'bg-danger shadow-[0_0_8px_hsl(var(--danger))]'}`} />
            <span className="text-xs text-muted-foreground font-medium">{isOnline ? 'Connecté' : 'Hors ligne'}</span>
          </div>

          <div className="hidden sm:flex items-center text-xs font-mono text-muted-foreground tabular-nums">
            {time.toLocaleTimeString()}
          </div>

          <div className="w-[1px] h-6 bg-border mx-1 hidden sm:block"></div>

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className={isSearchOpen ? 'bg-secondary' : ''}
          >
            <Search className="h-4 w-4" />
          </Button>
          
          <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="hidden sm:inline-flex">
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>
          
          <Button variant="ghost" size="icon" onClick={() => setSettingsOpen(true)}>
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}
