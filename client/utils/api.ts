import storage from './storage';

// Server URL - configurable via environment or storage
const SERVER_URL = 'http://localhost:3000';

// Types for API responses
export interface StopSummary {
  name: string;
  id: string;
}

export interface Line {
  id: number;
  name: string;
  type: string;
  direction: string;
  gtfsId: string;
}

export interface StopDetails {
  name: string;
  id: string;
  lines: {
    tram?: Line[];
    bus?: Line[];
    metro?: Line[];
    train?: Line[];
  };
}

export interface SelectedStop {
  stopName: string;
  stopId: string;
  line: {
    id: number;
    name: string;
    type: string;
    direction: string;
    gtfsId: string;
  };
  offset: number; // walking distance in minutes
}

/**
 * Fetch trie data (stop names and IDs) for autocomplete search
 * Endpoint: GET /trieData
 */
export async function fetchTrieData(): Promise<StopSummary[]> {
  try {
    const response = await fetch(`${SERVER_URL}/trieData`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching trieData:', error);
    throw error;
  }
}

/**
 * Fetch all lines for a specific stop
 * Endpoint: GET /stopGroups/:id
 */
export async function fetchStopLines(stopId: string): Promise<StopDetails> {
  try {
    const response = await fetch(`${SERVER_URL}/stopGroups/${stopId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching lines for stop ${stopId}:`, error);
    throw error;
  }
}

/**
 * Save selected stop configuration to server
 * Endpoint: PUT /addStop
 * 
 * @param selectedStop - The stop configuration including walking offset
 */
export async function addStop(selectedStop: SelectedStop): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${SERVER_URL}/addStop`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(selectedStop),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error adding stop:', error);
    throw error;
  }
}

/**
 * Search stops by prefix (client-side filtering using trie data)
 * This uses the trie data to filter stops client-side for fast autocomplete
 * 
 * @param stops - Array of all stops from trieData
 * @param query - Search query
 * @returns Filtered stops matching the query
 */
export function searchStops(stops: StopSummary[], query: string): StopSummary[] {
  if (!query.trim()) {
    return [];
  }
  
  const normalizedQuery = query.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
  
  return stops.filter(stop => {
    const normalizedName = stop.name.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
    return normalizedName.includes(normalizedQuery);
  }).slice(0, 20); // Limit to 20 results for performance
}

/**
 * Get current tower config from local storage
 */
export async function getStoredTowerConfig(): Promise<SelectedStop | null> {
  try {
    const saved = await storage.getItem('towerConfig');
    if (saved) {
      return JSON.parse(saved);
    }
    return null;
  } catch (error) {
    console.error('Error getting stored tower config:', error);
    return null;
  }
}

/**
 * Save tower config to local storage
 */
export async function saveTowerConfigLocally(config: SelectedStop): Promise<void> {
  try {
    await storage.setItem('towerConfig', JSON.stringify(config));
  } catch (error) {
    console.error('Error saving tower config:', error);
    throw error;
  }
}
