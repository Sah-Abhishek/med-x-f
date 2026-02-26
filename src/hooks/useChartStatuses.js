import { useEffect, useRef, useState, useCallback } from 'react';
import { MEDX_WS_URL } from '../utils/constants';

/**
 * Hook that subscribes to real-time chart AI status updates via WebSocket.
 * Used on the dashboard to show live processing indicators.
 *
 * @param {string[]} sessionIds - Array of chart session IDs to watch
 * @param {Object} initialStatusMap - Initial status map from the REST batch-status call
 * @returns {Object} statusMap - { [sessionId]: aiStatus }
 */
export function useChartStatuses(sessionIds, initialStatusMap = {}) {
  const [statusMap, setStatusMap] = useState(initialStatusMap);
  const wsRef = useRef(null);
  const retriesRef = useRef(0);
  const maxRetries = 5;
  const sessionIdsRef = useRef(sessionIds);
  sessionIdsRef.current = sessionIds;

  // Merge initial status map whenever it changes from the REST call
  useEffect(() => {
    setStatusMap(prev => ({ ...prev, ...initialStatusMap }));
  }, [initialStatusMap]);

  const connect = useCallback(() => {
    if (!sessionIdsRef.current || sessionIdsRef.current.length === 0) return;

    const ws = new WebSocket(MEDX_WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      retriesRef.current = 0;
      ws.send(JSON.stringify({
        type: 'subscribe_charts',
        sessionIds: sessionIdsRef.current.map(String)
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'chart_status_update' && data.sessionId) {
          setStatusMap(prev => ({ ...prev, [data.sessionId]: data.aiStatus }));
        }
      } catch {
        // ignore malformed messages
      }
    };

    ws.onclose = () => {
      if (retriesRef.current < maxRetries) {
        const delay = Math.min(1000 * 2 ** retriesRef.current, 10000);
        retriesRef.current++;
        setTimeout(connect, delay);
      }
    };

    ws.onerror = () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    if (!sessionIds || sessionIds.length === 0) {
      setStatusMap({});
      return;
    }

    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);

  // Re-subscribe when the session IDs change (e.g. page change)
  useEffect(() => {
    if (wsRef.current && wsRef.current.readyState === 1 && sessionIds?.length > 0) {
      // Unsubscribe old, subscribe new
      wsRef.current.send(JSON.stringify({ type: 'unsubscribe_charts' }));
      wsRef.current.send(JSON.stringify({
        type: 'subscribe_charts',
        sessionIds: sessionIds.map(String)
      }));
    }
  }, [sessionIds]);

  return statusMap;
}
