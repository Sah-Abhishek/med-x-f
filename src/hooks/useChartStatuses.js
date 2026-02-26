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
  // Track which sessionIds have received a live WS update — don't overwrite these with stale REST data
  const wsUpdatedRef = useRef(new Set());

  // Merge initial status map whenever it changes from the REST call,
  // but do NOT overwrite keys that already have a fresher WebSocket value
  useEffect(() => {
    if (!initialStatusMap || Object.keys(initialStatusMap).length === 0) return;
    console.log('[useChartStatuses] REST initialStatusMap received:', initialStatusMap);
    setStatusMap(prev => {
      const merged = { ...prev };
      for (const [key, value] of Object.entries(initialStatusMap)) {
        // Only apply REST value if WS hasn't sent a fresher update for this key
        if (!wsUpdatedRef.current.has(String(key))) {
          merged[String(key)] = value;
        } else {
          console.log(`[useChartStatuses] Skipping REST overwrite for ${key} — WS already has fresher value: ${prev[String(key)]}`);
        }
      }
      return merged;
    });
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

    // Reset WS-updated tracking when the page of charts changes
    wsUpdatedRef.current = new Set();
    retriesRef.current = 0;

    function connect() {
      // Close stale connection if any
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      console.log('[useChartStatuses] Connecting WebSocket to', MEDX_WS_URL);
      const ws = new WebSocket(MEDX_WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[useChartStatuses] WebSocket OPEN — subscribing to', sessionIdsRef.current.length, 'charts');
        retriesRef.current = 0;
        ws.send(JSON.stringify({
          type: 'subscribe_charts',
          sessionIds: sessionIdsRef.current.map(String)
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('[useChartStatuses] WS message received:', data);
          if (data.type === 'chart_status_update' && data.sessionId) {
            wsUpdatedRef.current.add(String(data.sessionId));
            setStatusMap(prev => ({ ...prev, [String(data.sessionId)]: data.aiStatus }));
          }
        } catch {
          // ignore malformed messages
        }
      };

      ws.onclose = (e) => {
        console.log('[useChartStatuses] WebSocket CLOSED, code:', e.code, 'reason:', e.reason);
        // Only reconnect if this ws is still the active one
        if (wsRef.current === ws && retriesRef.current < maxRetries) {
          const delay = Math.min(1000 * 2 ** retriesRef.current, 10000);
          retriesRef.current++;
          console.log(`[useChartStatuses] Reconnecting in ${delay}ms (attempt ${retriesRef.current}/${maxRetries})`);
          reconnectTimerRef.current = setTimeout(connect, delay);
        }
      };

      ws.onerror = (err) => {
        console.error('[useChartStatuses] WebSocket ERROR:', err);
        ws.close();
      };
    }

    connect();

    return () => {
      console.log('[useChartStatuses] Cleanup — closing WebSocket');
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
  useEffect(() => {
    if (wsRef.current && wsRef.current.readyState === 1 && sessionIds?.length > 0) {
      console.log('[useChartStatuses] Re-subscribing with updated sessionIds:', sessionIds.length);
      wsRef.current.send(JSON.stringify({ type: 'unsubscribe_charts' }));
      wsRef.current.send(JSON.stringify({
        type: 'subscribe_charts',
        sessionIds: sessionIds.map(String)
      }));
    }
  }, [sessionIds]);

  return statusMap;
}
