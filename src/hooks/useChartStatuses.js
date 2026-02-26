import { useEffect, useRef, useState } from 'react';
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
  const reconnectTimerRef = useRef(null);
  const maxRetries = 5;
  const sessionIdsRef = useRef(sessionIds);
  sessionIdsRef.current = sessionIds;

  // Merge initial status map whenever it changes from the REST call
  useEffect(() => {
    setStatusMap(prev => ({ ...prev, ...initialStatusMap }));
  }, [initialStatusMap]);

  // Derive a stable key so the effect re-runs when the set of IDs changes
  const sessionKey = sessionIds?.length > 0 ? sessionIds.map(String).sort().join(',') : '';

  useEffect(() => {
    if (!sessionKey) {
      // No sessions to watch — close any existing connection
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      return;
    }

    retriesRef.current = 0;

    function connect() {
      // Close stale connection if any
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

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
        // Only reconnect if this ws is still the active one (not replaced by a new effect run)
        if (wsRef.current === ws && retriesRef.current < maxRetries) {
          const delay = Math.min(1000 * 2 ** retriesRef.current, 10000);
          retriesRef.current++;
          reconnectTimerRef.current = setTimeout(connect, delay);
        }
      };

      ws.onerror = () => {
        ws.close();
      };
    }

    connect();

    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [sessionKey]);

  // Re-subscribe when sessionIds change but the WebSocket is already open
  // (e.g. page change within the same dashboard session)
  useEffect(() => {
    if (wsRef.current && wsRef.current.readyState === 1 && sessionIds?.length > 0) {
      wsRef.current.send(JSON.stringify({ type: 'unsubscribe_charts' }));
      wsRef.current.send(JSON.stringify({
        type: 'subscribe_charts',
        sessionIds: sessionIds.map(String)
      }));
    }
  }, [sessionIds]);

  return statusMap;
}
