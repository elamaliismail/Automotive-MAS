import { useState, useEffect, useCallback } from 'react';
import { Message, VehicleContext } from '../types';
import { queryApi } from '../lib/api';

const STORAGE_KEY = 'automotive-mas-history';

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

function determineAgent(content: string) {
  const lower = content.toLowerCase();
  if (lower.includes('p0') || lower.includes('p1') || lower.includes('diagnostic') || lower.includes('erreur') || lower.includes('code')) return 'Diagnostic';
  if (lower.includes('entretien') || lower.includes('maintenance') || lower.includes('révision') || lower.includes('huile')) return 'Maintenance';
  if (lower.includes('pièce') || lower.includes('plaquette') || lower.includes('filtre') || lower.includes('composant')) return 'Pieces';
  if (lower.includes('capteur') || lower.includes('télémétrie') || lower.includes('sensor') || lower.includes('donnée')) return 'Telemetrie';
  return 'Diagnostic';
}

export const useChat = (vehicleContext: VehicleContext) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored).map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }));
        setMessages(parsed);
      } catch (e) {
        console.error('Failed to parse chat history', e);
      }
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: generateId(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await queryApi(text, vehicleContext);
      
      const aiMsg: Message = {
        id: generateId(),
        role: 'ai',
        content: response.content,
        timestamp: new Date(),
        correlationId: `corr-${Math.random().toString(16).substring(2, 10)}`,
        agentType: determineAgent(response.content),
        responseTime: response.responseTime,
        isTyping: true,
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [vehicleContext]);

  const clearChat = useCallback(() => {
    setMessages([]);
    sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  const deleteMessage = useCallback((id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id));
  }, []);

  const regenerate = useCallback(async () => {
    const lastUser = [...messages].reverse().find(m => m.role === 'user');
    if (lastUser) {
      await sendMessage(lastUser.content);
    }
  }, [messages, sendMessage]);

  const exportJSON = useCallback(() => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(messages, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = "automotive-mas-conversation.json";
    a.click();
  }, [messages]);

  const exportMarkdown = useCallback(() => {
    const md = "# Automotive MAS Conversation\n\n" + messages.map(m => `**${m.role === 'user' ? 'User' : 'AI'}:** ${m.content}`).join('\n\n');
    const dataStr = "data:text/markdown;charset=utf-8," + encodeURIComponent(md);
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = "automotive-mas-conversation.md";
    a.click();
  }, [messages]);

  const markMessageTyped = useCallback((id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, isTyping: false } : m));
  }, []);

  const restoreMessages = useCallback((msgs: Message[]) => {
    const restored = msgs.map((m: any) => ({
      ...m,
      timestamp: new Date(m.timestamp),
      isTyping: false,
    }));
    setMessages(restored);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(restored));
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearChat,
    deleteMessage,
    regenerate,
    exportJSON,
    exportMarkdown,
    markMessageTyped,
    restoreMessages,
  };
};
