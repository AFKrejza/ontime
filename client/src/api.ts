const API_BASE = '';

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

export async function getAllStops(): Promise<StopSummary[]> {
  const response = await fetch(`${API_BASE}/trieData`);
  if (!response.ok) {
    throw new Error('Failed to fetch stops');
  }
  return response.json();
}

export async function getStopDetails(slug: string): Promise<StopDetails> {
  const response = await fetch(`${API_BASE}/stopGroups/${encodeURIComponent(slug)}`);
  if (!response.ok) {
    throw new Error('Failed to fetch stop details');
  }
  return response.json();
}

export async function addAssignment(data: AssignmentRequest): Promise<void> {
  const response = await fetch(`${API_BASE}/addStop`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to add assignment: ${response.status} ${body}`);
  }
}
