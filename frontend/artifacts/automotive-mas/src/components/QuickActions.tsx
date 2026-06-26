import { motion } from "framer-motion";
import { Wrench, Calendar, Disc, Activity } from "lucide-react";

interface QuickActionsProps {
  onSelect: (query: string) => void;
}

const actions = [
  {
    id: 1,
    title: "Code P0300",
    subtitle: "Moteur qui vibre",
    icon: <Wrench className="h-6 w-6 text-warning" />,
    query: "Analyser le code erreur P0300, moteur qui vibre",
    color: "from-warning/20 to-warning/5 border-warning/20",
  },
  {
    id: 2,
    title: "Prochain Entretien",
    subtitle: "Révision planifiée",
    icon: <Calendar className="h-6 w-6 text-success" />,
    query: "Quand est le prochain entretien recommandé?",
    color: "from-success/20 to-success/5 border-success/20",
  },
  {
    id: 3,
    title: "Plaquettes Frein",
    subtitle: "Pièces compatibles",
    icon: <Disc className="h-6 w-6 text-primary" />,
    query: "Quelles plaquettes de frein sont compatibles avec mon véhicule?",
    color: "from-primary/20 to-primary/5 border-primary/20",
  },
  {
    id: 4,
    title: "Analyse Capteurs",
    subtitle: "Télémétrie live",
    icon: <Activity className="h-6 w-6 text-accent" />,
    query: "Analyser tous les capteurs du véhicule",
    color: "from-accent/20 to-accent/5 border-accent/20",
  }
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

export function QuickActions({ onSelect }: QuickActionsProps) {
  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full"
    >
      {actions.map((action) => (
        <motion.button
          key={action.id}
          variants={item}
          onClick={() => onSelect(action.query)}
          className={`relative overflow-hidden flex flex-col items-start text-left p-4 rounded-2xl bg-card border ${action.color} group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-background/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background`}
        >
          <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }} />
          
          <div className="bg-background/80 p-2 rounded-xl mb-3 shadow-sm relative z-10 group-hover:scale-110 transition-transform duration-300">
            {action.icon}
          </div>
          
          <div className="relative z-10">
            <h4 className="font-semibold text-sm text-foreground mb-0.5">{action.title}</h4>
            <p className="text-xs text-muted-foreground">{action.subtitle}</p>
          </div>
        </motion.button>
      ))}
    </motion.div>
  );
}
