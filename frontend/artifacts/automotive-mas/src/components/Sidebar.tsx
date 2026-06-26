import { useState, useRef } from "react";
import { Car, UploadCloud, X, RefreshCw, BookmarkPlus, Trash2, Clock, ChevronDown, ChevronRight, CarFront } from "lucide-react";
import { VehicleContext, SavedVehicle, ChatSession } from "../types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface SidebarProps {
  vehicleContext: VehicleContext;
  onContextChange: (ctx: VehicleContext) => void;
  onReset: () => void;
  onClose?: () => void;
  savedVehicles: SavedVehicle[];
  onSaveVehicle: () => void;
  onLoadVehicle: (v: SavedVehicle) => void;
  onRemoveVehicle: (id: string) => void;
  chatSessions: ChatSession[];
  onLoadSession: (s: ChatSession) => void;
  onRemoveSession: (id: string) => void;
  onSaveSession: () => void;
}

export function Sidebar({
  vehicleContext,
  onContextChange,
  onReset,
  onClose,
  savedVehicles,
  onSaveVehicle,
  onLoadVehicle,
  onRemoveVehicle,
  chatSessions,
  onLoadSession,
  onRemoveSession,
  onSaveSession,
}: SidebarProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [showVehicles, setShowVehicles] = useState(true);
  const [showHistory, setShowHistory] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isComplete = Boolean(
    vehicleContext.brand &&
    vehicleContext.model &&
    vehicleContext.year &&
    vehicleContext.mileage !== ''
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (file.type !== "application/json") {
      toast.error("Fichier JSON requis");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.brand || json.model || json.year || json.mileage) {
          onContextChange({
            brand: json.brand || vehicleContext.brand,
            model: json.model || vehicleContext.model,
            year: json.year || vehicleContext.year,
            mileage: json.mileage !== undefined ? json.mileage : vehicleContext.mileage,
          });
          toast.success("Contexte véhicule importé");
        }
      } catch {
        toast.error("Fichier JSON invalide");
      }
    };
    reader.readAsText(file);
  };

  const handleChange = (field: keyof VehicleContext, value: string) => {
    let parsedValue: string | number = value;
    if (field === 'year' || field === 'mileage') {
      parsedValue = value === '' ? '' : Number(value);
    }
    onContextChange({ ...vehicleContext, [field]: parsedValue });
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-thin">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-card z-10">
        <div className="flex items-center gap-2 text-primary">
          <Car className="h-5 w-5" />
          <h2 className="font-semibold tracking-tight text-foreground">Contexte Véhicule</h2>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" className="md:hidden" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="p-4 flex flex-col gap-5">
        {/* Form */}
        <div className="flex flex-col gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="brand" className="text-xs text-muted-foreground uppercase tracking-wider">Marque</Label>
            <Input
              id="brand"
              placeholder="Ex: Tesla"
              value={vehicleContext.brand}
              onChange={(e) => handleChange('brand', e.target.value)}
              className="bg-background/50 border-border focus-visible:ring-primary"
              data-testid="input-brand"
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="model" className="text-xs text-muted-foreground uppercase tracking-wider">Modèle</Label>
            <Input
              id="model"
              placeholder="Ex: Model 3"
              value={vehicleContext.model}
              onChange={(e) => handleChange('model', e.target.value)}
              className="bg-background/50 border-border focus-visible:ring-primary"
              data-testid="input-model"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="year" className="text-xs text-muted-foreground uppercase tracking-wider">Année</Label>
              <Input
                id="year"
                type="number"
                placeholder="2023"
                value={vehicleContext.year}
                onChange={(e) => handleChange('year', e.target.value)}
                className="bg-background/50 border-border focus-visible:ring-primary"
                data-testid="input-year"
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="mileage" className="text-xs text-muted-foreground uppercase tracking-wider">Kilométrage</Label>
              <div className="relative">
                <Input
                  id="mileage"
                  type="number"
                  placeholder="45000"
                  value={vehicleContext.mileage}
                  onChange={(e) => handleChange('mileage', e.target.value)}
                  className="bg-background/50 border-border focus-visible:ring-primary pr-8"
                  data-testid="input-mileage"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">km</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 mt-1">
            <Button
              variant="outline"
              className="flex-1 border-border bg-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              onClick={onReset}
              data-testid="button-reset-vehicle"
            >
              <RefreshCw className="mr-2 h-3.5 w-3.5" />
              Nouveau
            </Button>
            <Button
              className="flex-1 bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 hover:border-primary/60 transition-all"
              disabled={!isComplete}
              onClick={() => {
                onSaveVehicle();
                toast.success(`${vehicleContext.brand} ${vehicleContext.model} ajouté au garage`);
              }}
              data-testid="button-save-vehicle"
            >
              <BookmarkPlus className="mr-2 h-3.5 w-3.5" />
              Ajouter
            </Button>
          </div>
        </div>

        {/* Vehicle summary */}
        {isComplete && (
          <div className="relative rounded-xl p-[1px] bg-gradient-to-b from-primary/40 to-border animate-in fade-in zoom-in duration-300">
            <div className="bg-card rounded-[10px] p-3 flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <CarFront className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-mono text-primary uppercase tracking-wider">Véhicule Actif</div>
                <div className="font-semibold text-sm truncate">{vehicleContext.brand} {vehicleContext.model}</div>
                <div className="text-xs text-muted-foreground">{vehicleContext.year} · {Number(vehicleContext.mileage).toLocaleString()} km</div>
              </div>
            </div>
          </div>
        )}

        {/* Saved Vehicles Garage */}
        {savedVehicles.length > 0 && (
          <div>
            <button
              className="flex items-center gap-1.5 w-full text-left mb-2 group"
              onClick={() => setShowVehicles(v => !v)}
            >
              {showVehicles ? (
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              )}
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">
                Mes Véhicules
              </span>
              <span className="ml-auto text-[10px] bg-secondary text-muted-foreground rounded-full px-1.5 py-0.5">
                {savedVehicles.length}
              </span>
            </button>

            {showVehicles && (
              <div className="flex flex-col gap-1.5">
                {savedVehicles.map(v => (
                  <div
                    key={v.id}
                    className="group flex items-center gap-2 p-2.5 rounded-lg bg-background/60 border border-border hover:border-primary/30 hover:bg-secondary/50 transition-all cursor-pointer"
                    onClick={() => {
                      onLoadVehicle(v);
                      toast.success(`${v.brand} ${v.model} chargé`);
                    }}
                    data-testid={`vehicle-saved-${v.id}`}
                  >
                    <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Car className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{v.brand} {v.model}</div>
                      <div className="text-xs text-muted-foreground">{v.year} · {Number(v.mileage).toLocaleString()} km</div>
                    </div>
                    <button
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive p-1 rounded"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveVehicle(v.id);
                        toast.info("Véhicule supprimé");
                      }}
                      data-testid={`button-remove-vehicle-${v.id}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Chat History */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <button
              className="flex items-center gap-1.5 flex-1 text-left group"
              onClick={() => setShowHistory(h => !h)}
            >
              {showHistory ? (
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              )}
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">
                Historique
              </span>
              {chatSessions.length > 0 && (
                <span className="ml-auto text-[10px] bg-secondary text-muted-foreground rounded-full px-1.5 py-0.5">
                  {chatSessions.length}
                </span>
              )}
            </button>
            <button
              className="text-[10px] text-primary/70 hover:text-primary transition-colors font-medium"
              onClick={() => {
                onSaveSession();
                toast.success("Conversation sauvegardée");
              }}
              data-testid="button-save-session"
              title="Sauvegarder la conversation actuelle"
            >
              + Sauvegarder
            </button>
          </div>

          {showHistory && (
            <div className="flex flex-col gap-1.5">
              {chatSessions.length === 0 ? (
                <div className="text-xs text-muted-foreground text-center py-4 border border-dashed border-border rounded-lg">
                  <Clock className="h-4 w-4 mx-auto mb-1 opacity-40" />
                  Aucune session sauvegardée
                </div>
              ) : (
                chatSessions.map(s => (
                  <div
                    key={s.id}
                    className="group flex items-start gap-2 p-2.5 rounded-lg bg-background/60 border border-border hover:border-primary/30 hover:bg-secondary/50 transition-all cursor-pointer"
                    onClick={() => {
                      onLoadSession(s);
                      toast.success("Session restaurée");
                    }}
                    data-testid={`session-${s.id}`}
                  >
                    <Clock className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-foreground truncate">{s.title}</div>
                      <div className="text-[10px] text-muted-foreground">{s.vehicle}</div>
                      <div className="text-[10px] text-muted-foreground/60">{formatDate(s.savedAt)}</div>
                    </div>
                    <button
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive p-1 rounded flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveSession(s.id);
                        toast.info("Session supprimée");
                      }}
                      data-testid={`button-remove-session-${s.id}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* JSON Drop Zone */}
        <div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="application/json"
            onChange={(e) => e.target.files && processFile(e.target.files[0])}
          />
          <div
            className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center gap-2 text-center transition-all cursor-pointer ${isDragging ? 'border-primary bg-primary/10' : 'border-border bg-background/50 hover:bg-secondary/50 hover:border-primary/50'}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            data-testid="dropzone-json"
          >
            <UploadCloud className={`h-7 w-7 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
            <div className="text-xs font-medium">Glissez un fichier JSON</div>
            <div className="text-[10px] text-muted-foreground">ou cliquez pour importer</div>
          </div>
        </div>
      </div>
    </div>
  );
}
