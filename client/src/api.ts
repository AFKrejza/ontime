const API_BASE = '';
const TOKEN_KEY = 'ontime_jwt';

export interface StopSummary {
  id: string;
  slug: string;
  name: string;
}

export interface Line {
  id: number;
  name: string;
  type: string;
  direction: string;
  gtfsId: string;
}

export interface StopDetails {
  id: string;
  slug: string;
  name: string;
  lines: Record<string, Line[]>;
}

export interface AssignmentRequest {
  offset: number;
  stopName: string;
  stopId: string;
  line: Line;
}

function getStoredToken(): string | null {
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return Boolean(getStoredToken());
}
//updates api call
async function authFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getStoredToken();
  const headers = new Headers(options.headers ?? {});

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = `${response.status} ${response.statusText}`;
    try {
      const body = await response.json();
      message = body?.message || body?.error || JSON.stringify(body);
    } catch {
      const text = await response.text();
      if (text) message = text;
    }
    throw new Error(message);
  }
else
  console.log("erorr idk something aint working")

  return response;
}

export async function loginUser(email: string, password: string): Promise<{ token: string }> {
  const response = await authFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (!data.token) {
    throw new Error('Invalid login response');
  }

  setToken(data.token);
  return data;
}

export async function signupUser(email: string, password: string): Promise<{ token: string }> {
  const response = await authFetch('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ userName: email, email, password }),
  });

  const data = await response.json();
  if (!data.token) {
    throw new Error('Invalid signup response');
  }

  setToken(data.token);
  return data;
}

export async function fetchProfile() {
  const response = await authFetch('/auth/profile');
  return response.json();
}

export async function getAllStops(): Promise<StopSummary[]> {
  const response = await authFetch(`${API_BASE}/trieData`);
  return response.json();
}

export async function getStopDetails(slug: string): Promise<StopDetails> {
  const response = await authFetch(`${API_BASE}/stopGroups/${encodeURIComponent(slug)}`);
  return response.json();
}

export async function addAssignment(data: AssignmentRequest): Promise<void> {
  const response = await authFetch(`${API_BASE}/addStop`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to add assignment: ${response.status} ${body}`);
  }
}
