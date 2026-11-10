import { useState, useEffect, useCallback } from 'react';

export interface NetworkStatus {
  isOnline: boolean;
  isWeakConnection: boolean;
  connectionType: string;
  downlinkSpeed?: number;
  rtt?: number;
  simulatedWeakConnection: boolean;
  setSimulatedWeakConnection: (enabled: boolean) => void;
  recheckConnection: () => Promise<boolean>;
}

export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [isWeakConnection, setIsWeakConnection] = useState<boolean>(false);
  const [connectionType, setConnectionType] = useState<string>('4g');
  const [downlinkSpeed, setDownlinkSpeed] = useState<number | undefined>(undefined);
  const [rtt, setRtt] = useState<number | undefined>(undefined);
  const [simulatedWeakConnection, setSimulatedWeakConnection] = useState<boolean>(false);

  const checkNetworkQuality = useCallback(() => {
    if (typeof navigator === 'undefined') return;

    const nav = navigator as any;
    const conn = nav.connection || nav.mozConnection || nav.webkitConnection;

    if (!navigator.onLine) {
      setIsOnline(false);
      setIsWeakConnection(true);
      return;
    }

    setIsOnline(true);

    if (conn) {
      setConnectionType(conn.effectiveType || '4g');
      setDownlinkSpeed(conn.downlink);
      setRtt(conn.rtt);

      // Flag weak if 2g/slow-2g or RTT > 800ms or downlink < 0.5 Mbps
      const isSlow =
        conn.effectiveType === 'slow-2g' ||
        conn.effectiveType === '2g' ||
        (conn.rtt && conn.rtt > 800) ||
        (conn.downlink && conn.downlink < 0.4);

      setIsWeakConnection(isSlow);
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      checkNetworkQuality();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsWeakConnection(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const nav = navigator as any;
    const conn = nav.connection || nav.mozConnection || nav.webkitConnection;
    if (conn) {
      conn.addEventListener('change', checkNetworkQuality);
    }

    checkNetworkQuality();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (conn) {
        conn.removeEventListener('change', checkNetworkQuality);
      }
    };
  }, [checkNetworkQuality]);

  const recheckConnection = useCallback(async (): Promise<boolean> => {
    try {
      // Ping a reliable lightweight endpoint or timestamp fetch
      const startTime = performance.now();
      const res = await fetch(`/?ping=${Date.now()}`, { method: 'HEAD', cache: 'no-store' });
      const elapsed = performance.now() - startTime;
      const online = res.ok;
      setIsOnline(online);
      setIsWeakConnection(elapsed > 1200);
      return online;
    } catch {
      setIsOnline(false);
      setIsWeakConnection(true);
      return false;
    }
  }, []);

  return {
    isOnline: simulatedWeakConnection ? false : isOnline,
    isWeakConnection: simulatedWeakConnection ? true : isWeakConnection,
    connectionType: simulatedWeakConnection ? 'slow-2g (simulated)' : connectionType,
    downlinkSpeed,
    rtt,
    simulatedWeakConnection,
    setSimulatedWeakConnection,
    recheckConnection,
  };
}
