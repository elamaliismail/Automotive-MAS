import { useState, useEffect } from "react";
import { Wrench, PenToolIcon, PackageOpen, Activity, Copy, RefreshCw, Trash2 } from "lucide-react";
import { Message as MessageType, AgentType } from "../types";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface MessageProps {
  message: MessageType;
  onDelete: () => void;
  onRegenerate: () => void;
  searchQuery?: string;
  onTypingComplete?: () => void;
}

const getAgentInfo = (type?: AgentType) => {
  switch (type) {
    case 'Diagnostic': return { icon: <Wrench className="h-4 w-4" />, color: 'bg-warning/20 text-warning border-warning/30' };
    case 'Maintenance': return { icon: <PenToolIcon className="h-4 w-4" />, color: 'bg-success/20 text-success border-success/30' };
    case 'Pieces': return { icon: <PackageOpen className="h-4 w-4" />, color: 'bg-primary/20 text-primary border-primary/30' };
    case 'Telemetrie': return { icon: <Activity className="h-4 w-4" />, color: 'bg-accent/20 text-accent border-accent/30' };
    default: return { icon: <Wrench className="h-4 w-4" />, color: 'bg-muted/20 text-muted-foreground border-border' };
  }
};

const formatTime = (date: Date) => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

const highlightText = (text: string, highlight: string) => {
  if (!highlight.trim()) return text;
  
  const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
  return (
    <>
      {parts.map((part, i) => 
        part.toLowerCase() === highlight.toLowerCase() 
          ? <mark key={i} className="bg-warning/40 text-warning-foreground rounded px-1">{part}</mark> 
          : part
      )}
    </>
  );
};

export function Message({ message, onDelete, onRegenerate, searchQuery, onTypingComplete }: MessageProps) {
  const isUser = message.role === 'user';
  const [displayedText, setDisplayedText] = useState(isUser ? message.content : (message.isTyping ? "" : message.content));
  
  useEffect(() => {
    if (!isUser && message.isTyping) {
      let i = 0;
      setDisplayedText("");
      const interval = setInterval(() => {
        setDisplayedText(message.content.substring(0, i + 1));
        i++;
        if (i >= message.content.length) {
          clearInterval(interval);
          if (onTypingComplete) onTypingComplete();
        }
      }, 15);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [message.content, message.isTyping, isUser, onTypingComplete]);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    toast.success("Copié dans le presse-papier");
  };

  if (isUser) {
    return (
      <div className="flex flex-col items-end gap-1 ml-auto max-w-[85%] group animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="bg-primary text-primary-foreground px-5 py-3 rounded-2xl rounded-tr-sm shadow-sm whitespace-pre-wrap text-sm leading-relaxed">
          {highlightText(message.content, searchQuery || "")}
        </div>
        <div className="text-[10px] text-muted-foreground px-1">{formatTime(message.timestamp)}</div>
      </div>
    );
  }

  const agentInfo = getAgentInfo(message.agentType);

  return (
    <div className="flex gap-4 mr-auto max-w-[90%] group animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center border ${agentInfo.color} shadow-sm`}>
        {agentInfo.icon}
      </div>
      
      <div className="flex flex-col gap-1 w-full min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="outline" className={`text-[10px] uppercase font-mono px-2 py-0 h-5 ${agentInfo.color}`}>
            {message.agentType || 'Diagnostic'}
          </Badge>
          <span className="text-[10px] font-mono text-muted-foreground">{message.correlationId}</span>
        </div>
        
        <div className="bg-card border border-white/5 px-5 py-4 rounded-2xl rounded-tl-sm shadow-md whitespace-pre-wrap text-sm leading-relaxed text-card-foreground">
          {highlightText(displayedText, searchQuery || "")}
          {message.isTyping && displayedText.length < message.content.length && (
            <span className="inline-block w-1.5 h-4 ml-1 bg-primary animate-pulse align-middle" />
          )}
        </div>
        
        <div className="flex items-center justify-between px-1 mt-1">
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
            <span>{formatTime(message.timestamp)}</span>
            {message.responseTime && (
              <>
                <span className="w-1 h-1 rounded-full bg-border" />
                <span>Réponse en {message.responseTime.toFixed(2)}s</span>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={handleCopy}>
              <Copy className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={onRegenerate}>
              <RefreshCw className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-danger" onClick={onDelete}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
