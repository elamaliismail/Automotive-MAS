import { useEffect, useRef, useState } from "react";
import { SendHorizontal, Paperclip, ChevronDown } from "lucide-react";
import { Message as MessageComponent } from "./Message";
import { QuickActions } from "./QuickActions";
import { ThinkingLoader } from "./ThinkingLoader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ChatArea({ chatProps, searchQuery, onSearchChange, isSearchOpen }: any) {
  const { messages, isLoading, sendMessage, deleteMessage, regenerate } = chatProps;
  const [input, setInput] = useState("");
  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 100;
    setShowScrollButton(!isAtBottom);
  };

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Just a visual representation for now, real file parsing could be added
    if (e.target.files && e.target.files.length > 0) {
      setInput((prev) => prev + ` [Fichier: ${e.target.files![0].name}]`);
    }
  };

  const filteredMessages = messages.filter((m: any) => 
    searchQuery ? m.content.toLowerCase().includes(searchQuery.toLowerCase()) : true
  );

  return (
    <div className="flex flex-col h-full bg-background relative w-full max-w-4xl mx-auto">
      
      {isSearchOpen && (
        <div className="p-3 border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10 animate-in slide-in-from-top-2">
          <Input 
            placeholder="Rechercher dans la conversation..." 
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="bg-background border-primary/30 focus-visible:ring-primary h-9"
            autoFocus
          />
        </div>
      )}

      <div 
        className="flex-1 overflow-y-auto p-4 md:p-6 pb-32"
        onScroll={handleScroll}
        ref={scrollAreaRef}
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto py-12">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">Comment puis-je vous aider ?</h3>
              <p className="text-muted-foreground">Sélectionnez une action rapide ou posez une question.</p>
            </div>
            <QuickActions onSelect={sendMessage} />
          </div>
        ) : (
          <div className="flex flex-col gap-6 max-w-3xl mx-auto pb-4">
            {filteredMessages.map((message: any) => (
              <MessageComponent 
                key={message.id} 
                message={message} 
                onDelete={() => deleteMessage(message.id)}
                onRegenerate={regenerate}
                searchQuery={searchQuery}
                onTypingComplete={() => chatProps.markMessageTyped?.(message.id)}
              />
            ))}
            
            {isLoading && (
              <div className="max-w-3xl mr-auto w-full max-w-[80%]">
                <ThinkingLoader />
              </div>
            )}
            
            <div ref={endOfMessagesRef} className="h-1" />
          </div>
        )}
      </div>

      {showScrollButton && (
        <Button 
          variant="secondary" 
          size="icon" 
          className="absolute bottom-24 right-6 rounded-full shadow-lg h-10 w-10 z-20 border border-border"
          onClick={scrollToBottom}
        >
          <ChevronDown className="h-5 w-5" />
        </Button>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent pt-10">
        <div className="max-w-3xl mx-auto flex items-end gap-2 bg-card border border-border rounded-2xl p-2 shadow-xl relative focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
          <input 
            type="file" 
            ref={fileInputRef}
            className="hidden" 
            onChange={handleFileUpload}
          />
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10 shrink-0 rounded-xl text-muted-foreground hover:text-foreground mb-[2px]"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          
          <textarea
            className="flex-1 max-h-32 min-h-[44px] bg-transparent resize-none outline-none py-3 px-2 text-sm leading-relaxed"
            placeholder="Posez une question sur votre véhicule..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            rows={Math.min(5, Math.max(1, input.split('\n').length))}
          />
          
          <Button 
            size="icon" 
            className="h-10 w-10 shrink-0 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground mb-[2px] shadow-md"
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
          >
            <SendHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
