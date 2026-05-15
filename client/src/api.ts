const CLOUD = true; // set to false for local dev

const API_BASE = CLOUD ? "https://ontime-production-aa3e.up.railway.app" : "http://localhost:3000";
const TOKEN_KEY = "ontime_jwt";
const USER_ID_KEY = "ontime_user_id";
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
export interface userProfile {
  username: string;
  email: string;
  createdAt: string;
  id: number;
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
export function getUserId(): string | null {
  return window.localStorage.getItem(USER_ID_KEY);
}

export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_ID_KEY);
}

export function isAuthenticated(): boolean {
  return Boolean(getStoredToken());
}
//updates api call
export async function authFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const token = getStoredToken();
  const headers = new Headers(options.headers ?? {});

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
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
  } else console.log("erorr idk something aint working");

  return response;
}

export async function loginUser(
  email: string,
  password: string,
): Promise<{ token: string }> {
  const response = await authFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (!data.token) {
    throw new Error("Invalid login response");
  }

  setToken(data.token);
  return data;
}

export async function signupUser(
  userName: string,
  email: string,
  password: string,
): Promise<{ token: string }> {
  const response = await authFetch("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ userName, email, password }),
  });
  const data = await response.json();
  if (!data.token) {
    throw new Error("Invalid signup response");
  }
  setToken(data.token);
  return data;
}

export async function fetchProfile(): Promise<userProfile> {
  const response = await authFetch("/users/profile");
  return response.json();
}

export async function getAllStops(): Promise<StopSummary[]> {
  const response = await authFetch(`/trieData`);
  return response.json();
}

export async function getStopDetails(slug: string): Promise<StopDetails> {
  const response = await authFetch(`/stopGroups/${encodeURIComponent(slug)}`);
  return response.json();
}

//
export async function addAssignment(
  towerId: string,
  data: AssignmentRequest,
): Promise<void> {
  const body = {
    assignment: {
      departureOffset: -data.offset,
      lineId: Number(data.line.id),
      stopId: Number(data.stopId),
    },
  };
  const response = await authFetch(`/towers/${towerId}/addAssignment`, {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Failed to add assignment: ${response.status} ${errorData}`,
    );
  }
  return response.json();
}

export async function getTowerStatus(towerId: string) {
  const response = await authFetch(`/towers/${towerId}`);
  return response.json();
}

export async function deleteAssignment(
  towerId: string,
  assignmentId: string | number,
) {
  const response = await authFetch(
    `/towers/${towerId}/assignments/${assignmentId}`,
    {
      method: "DELETE",
    },
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData || "Failed to delete assignment");
  }
  return true;
}

export async function deleteAllAssignments(towerId: string) {
  const response = await authFetch(`/towers/${towerId}/assignments/deleteAll`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData || "Failed to delete assignment");
  }
  return true;
}

export async function registerGateway(data: {
  gatewayId: string;
  gatewayName: string;
}) {
  const response = await authFetch("/gateways/register", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData || "Failed to delete assignment");
  }
  return response.json();
}
export function getUserIdFromToken(): string | null {
  const token = getStoredToken();
  if (!token) return null;

  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join(""),
    );
    const payload = JSON.parse(jsonPayload);
    return payload.id || payload.userId || null;
  } catch (e) {
    return null;
  }
}

export async function getUserGateways() {
  const userId = getUserIdFromToken();
  if (!userId) {
    throw new Error("User is not authorized or invalid token");
  }

  const response = await authFetch(`/users/${userId}/gateways/list`);
  return response.json();
}
