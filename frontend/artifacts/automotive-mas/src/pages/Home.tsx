import { useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { Header } from "../components/Header";
import { ChatArea } from "../components/ChatArea";
import { VehicleContext } from "../types";
import { useChat } from "../hooks/useChat";
import { useVehicleGarage } from "../hooks/useVehicleGarage";
import { useChatSessions } from "../hooks/useChatSessions";

export default function Home() {
  const [vehicleContext, setVehicleContext] = useState<VehicleContext>({
    brand: "",
    model: "",
    year: "",
    mileage: ""
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const chatProps = useChat(vehicleContext);
  const { vehicles, saveVehicle, removeVehicle } = useVehicleGarage();
  const { sessions, saveSession, removeSession } = useChatSessions();

  const handleReset = () => {
    setVehicleContext({ brand: "", model: "", year: "", mileage: "" });
    chatProps.clearChat();
  };

  const handleLoadVehicle = (v: { brand: string; model: string; year: number | ''; mileage: number | '' }) => {
    setVehicleContext({ brand: v.brand, model: v.model, year: v.year, mileage: v.mileage });
  };

  const handleLoadSession = (s: { messages: any[]; vehicle: string }) => {
    chatProps.restoreMessages(s.messages);
  };

  return (
    <div className="flex h-[100dvh] w-full bg-background text-foreground overflow-hidden font-sans">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className={`fixed inset-y-0 left-0 z-50 w-[300px] transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 bg-card border-r border-border ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar
          vehicleContext={vehicleContext}
          onContextChange={setVehicleContext}
          onReset={handleReset}
          onClose={() => setIsSidebarOpen(false)}
          savedVehicles={vehicles}
          onSaveVehicle={() => saveVehicle(vehicleContext)}
          onLoadVehicle={handleLoadVehicle}
          onRemoveVehicle={removeVehicle}
          chatSessions={sessions}
          onLoadSession={handleLoadSession}
          onRemoveSession={removeSession}
          onSaveSession={() => saveSession(chatProps.messages, vehicleContext)}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        <Header
          messageCount={chatProps.messages.length}
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          isSearchOpen={isSearchOpen}
          setIsSearchOpen={setIsSearchOpen}
        />

        <main className="flex-1 flex flex-col relative overflow-hidden h-full">
          <ChatArea
            chatProps={chatProps}
            searchQuery={isSearchOpen ? searchQuery : ""}
            onSearchChange={setSearchQuery}
            isSearchOpen={isSearchOpen}
          />
        </main>
      </div>
    </div>
  );
}
