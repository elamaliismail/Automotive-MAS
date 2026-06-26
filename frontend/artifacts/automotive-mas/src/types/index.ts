export type AgentType = 'Diagnostic' | 'Maintenance' | 'Pieces' | 'Telemetrie';

export interface VehicleContext {
  brand: string;
  model: string;
  year: number | '';
  mileage: number | '';
}

export interface SavedVehicle {
  id: string;
  brand: string;
  model: string;
  year: number | '';
  mileage: number | '';
  savedAt: string;
}

export interface ChatSession {
  id: string;
  title: string;
  vehicle: string;
  messages: Message[];
  savedAt: string;
}

export interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  agentType?: AgentType;
  correlationId?: string;
  timestamp: Date;
  responseTime?: number;
  isTyping?: boolean;
}
