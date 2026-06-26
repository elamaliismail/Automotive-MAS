import { useState, useEffect, useCallback } from 'react';
import { SavedVehicle, VehicleContext } from '../types';

const GARAGE_KEY = 'automotive-mas-garage';

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

export function useVehicleGarage() {
  const [vehicles, setVehicles] = useState<SavedVehicle[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(GARAGE_KEY);
      if (stored) setVehicles(JSON.parse(stored));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(GARAGE_KEY, JSON.stringify(vehicles));
  }, [vehicles]);

  const saveVehicle = useCallback((ctx: VehicleContext) => {
    const entry: SavedVehicle = {
      id: generateId(),
      brand: ctx.brand,
      model: ctx.model,
      year: ctx.year,
      mileage: ctx.mileage,
      savedAt: new Date().toISOString(),
    };
    setVehicles(prev => [entry, ...prev]);
    return entry;
  }, []);

  const removeVehicle = useCallback((id: string) => {
    setVehicles(prev => prev.filter(v => v.id !== id));
  }, []);

  return { vehicles, saveVehicle, removeVehicle };
}
