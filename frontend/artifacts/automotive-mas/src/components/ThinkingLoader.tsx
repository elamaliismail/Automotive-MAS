import { Bot } from "lucide-react";

export function ThinkingLoader() {
  return (
    <div className="flex gap-4 mr-auto max-w-[90%] animate-in fade-in slide-in-from-bottom-2">
      <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center border bg-muted/20 text-muted-foreground border-border shadow-sm">
        <Bot className="h-4 w-4 animate-pulse" />
      </div>
      
      <div className="flex flex-col gap-2 w-full min-w-0">
        <div className="bg-card border border-white/5 px-5 py-4 rounded-2xl rounded-tl-sm shadow-md relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
          
          <div className="flex items-center gap-3 relative z-10">
            <div className="text-sm text-muted-foreground font-medium">Automotive MAS analyse votre demande...</div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
