import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import { useChat } from "../hooks/useChat";
import { VehicleContext } from "../types";

export function SettingsDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const [fontSize, setFontSize] = useState("medium");
  const [animations, setAnimations] = useState(true);
  
  // Need to pass dummy context to access export functions, in a real app these would be in a global store
  const { exportJSON, exportMarkdown } = useChat({ brand: "", model: "", year: "", mileage: "" } as VehicleContext);

  useEffect(() => {
    // Handle font size
    document.documentElement.classList.remove('text-sm', 'text-base', 'text-lg');
    if (fontSize === 'small') document.documentElement.classList.add('text-sm');
    if (fontSize === 'medium') document.documentElement.classList.add('text-base');
    if (fontSize === 'large') document.documentElement.classList.add('text-lg');
    
    // Handle animations
    if (!animations) {
      document.documentElement.classList.add('no-animations');
    } else {
      document.documentElement.classList.remove('no-animations');
    }
  }, [fontSize, animations]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-card border-border text-foreground">
        <DialogHeader>
          <DialogTitle>Paramètres Système</DialogTitle>
          <DialogDescription>
            Configurez l'interface du command center Automotive MAS.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Apparence</h4>
            
            <div className="space-y-3">
              <Label>Taille du texte</Label>
              <RadioGroup value={fontSize} onValueChange={setFontSize} className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="small" id="r1" />
                  <Label htmlFor="r1" className="text-sm">Petit</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="r2" />
                  <Label htmlFor="r2" className="text-sm">Moyen</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="large" id="r3" />
                  <Label htmlFor="r3" className="text-sm">Grand</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex items-center justify-between mt-4">
              <Label htmlFor="animations" className="flex flex-col gap-1">
                <span>Animations</span>
                <span className="font-normal text-xs text-muted-foreground">Activer les effets visuels et transitions</span>
              </Label>
              <Switch id="animations" checked={animations} onCheckedChange={setAnimations} />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-border">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Exportation</h4>
            
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => exportJSON()}>
                <Download className="mr-2 h-4 w-4" />
                Export JSON
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => exportMarkdown()}>
                <Download className="mr-2 h-4 w-4" />
                Export MD
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
