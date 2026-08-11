/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Unique Client ID for this browser tab session to avoid echo duplicate renders
export const CLIENT_SESSION_ID = 'client-' + Math.random().toString(36).substring(2, 9);

const API_BASE = '/api';

export interface SyncPayload {
  usersStore: any[];
  studentsStore: any[];
  facultyStore: any[];
  departmentsStore: any[];
  coursesStore: any[];
  feePaymentsStore: any[];
  feeStructuresStore?: any[];
  booksStore: any[];
  bookIssuesStore?: any[];
  noticesStore: any[];
  timetableStore: any[];
  gradesStore: any[];
  attendanceStore: any[];
  examsStore?: any[];
  assignmentsStore?: any[];
  submissionsStore?: any[];
}

let lastLocalSaveTimestamp = 0;

/**
 * Fetch latest global state from backend server
 */
export async function fetchBackendState(): Promise<SyncPayload | null> {
  try {
    const res = await fetch(`${API_BASE}/state`);
    if (!res.ok) return null;
    const json = await res.json();
    if (json.initialized && json.data) {
      return json.data as SyncPayload;
    }
  } catch (err) {
    console.warn('Backend API server offline or unreachable, using local storage cache.', err);
  }
  return null;
}

/**
 * Send state update to backend server (broadcasts to all other connected devices)
 */
export async function saveBackendState(data: SyncPayload): Promise<boolean> {
  lastLocalSaveTimestamp = Date.now();
  try {
    const res = await fetch(`${API_BASE}/state`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data,
        senderId: CLIENT_SESSION_ID,
      }),
    });
    return res.ok;
  } catch (err) {
    console.warn('Failed to push state update to backend API:', err);
    return false;
  }
}

/**
 * Entity-level REST helpers
 */
export async function saveEntityApi(endpoint: string, item: any): Promise<boolean> {
  lastLocalSaveTimestamp = Date.now();
  try {
    const res = await fetch(`${API_BASE}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    return res.ok;
  } catch (e) {
    return false;
  }
}

export async function deleteEntityApi(endpoint: string, id: string): Promise<boolean> {
  lastLocalSaveTimestamp = Date.now();
  try {
    const res = await fetch(`${API_BASE}/${endpoint}/${id}`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch (e) {
    return false;
  }
}

/**
 * Subscribe to Real-Time SSE (Server-Sent Events) from backend
 * Whenever another device updates data, the callback receives the new state payload.
 */
export function subscribeToRealtimeSync(onUpdate: (newState: SyncPayload) => void): () => void {
  let eventSource: EventSource | null = null;
  let pollingInterval: any = null;

  try {
    eventSource = new EventSource(`${API_BASE}/events`);

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'STATE_UPDATE' && payload.data) {
          // Ignore echo updates sent by this exact browser session
          if (payload.senderId !== CLIENT_SESSION_ID) {
            console.log('⚡ [Realtime Cloud Sync] Received live update from another device!');
            onUpdate(payload.data);
          }
        }
      } catch (err) {
        console.error('Error parsing SSE event:', err);
      }
    };

    eventSource.onerror = () => {
      console.warn('[Realtime Sync] SSE connection dropped. Reconnecting...');
    };
  } catch (e) {
    console.warn('[Realtime Sync] SSE not supported, using polling fallback.');
  }

  // Backup polling mechanism (runs every 5 seconds) to ensure cross-device consistency
  pollingInterval = setInterval(async () => {
    // Skip polling overwrite if local client saved state within last 3 seconds
    if (Date.now() - lastLocalSaveTimestamp < 3000) {
      return;
    }
    const latest = await fetchBackendState();
    if (latest) {
      onUpdate(latest);
    }
  }, 5000);

  // Return unsubscribe cleanup function
  return () => {
    if (eventSource) {
      eventSource.close();
    }
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }
  };
}
