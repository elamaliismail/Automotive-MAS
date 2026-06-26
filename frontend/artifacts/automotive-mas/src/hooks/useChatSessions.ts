import { useState, useEffect, useCallback } from 'react';
import { ChatSession, Message, VehicleContext } from '../types';

const SESSIONS_KEY = 'automotive-mas-sessions';

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

export function useChatSessions() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SESSIONS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored).map((s: any) => ({
          ...s,
          messages: s.messages.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp),
          })),
        }));
        setSessions(parsed);
      }
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  }, [sessions]);

  const saveSession = useCallback((messages: Message[], vehicle: VehicleContext) => {
    if (messages.length === 0) return null;
    const firstUserMsg = messages.find(m => m.role === 'user');
    const title = firstUserMsg
      ? firstUserMsg.content.slice(0, 40) + (firstUserMsg.content.length > 40 ? '…' : '')
      : 'Session sans titre';
    const vehicleLabel = vehicle.brand && vehicle.model
      ? `${vehicle.brand} ${vehicle.model}`
      : 'Véhicule inconnu';
    const session: ChatSession = {
      id: generateId(),
      title,
      vehicle: vehicleLabel,
      messages,
      savedAt: new Date().toISOString(),
    };
    setSessions(prev => [session, ...prev.slice(0, 19)]);
    return session;
  }, []);

  const removeSession = useCallback((id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  }, []);

  return { sessions, saveSession, removeSession };
}
