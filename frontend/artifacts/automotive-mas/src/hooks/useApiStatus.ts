import { useState, useEffect } from 'react';

export const useApiStatus = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [lastChecked, setLastChecked] = useState(new Date());

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/healthz'); // or http://localhost:8000/api/healthz based on setup
        setIsOnline(res.ok);
      } catch (err) {
        setIsOnline(false);
      } finally {
        setLastChecked(new Date());
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  return { isOnline, lastChecked };
};
