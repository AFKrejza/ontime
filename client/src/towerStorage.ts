import { Line } from "./api";

export interface TowerConfig {
  id: string;
  towerId: string;
  gatewayName: string;
  stopName: string;
  stopId: string;
  slug: string;
  line: Line;
  offset: number;
  createdAt?: string;
  updatedAt?: string;
}

const STORAGE_KEY = "towerConfigs";

function safeParse(value: string | null) {
  if (!value) return [];
  try {
    return JSON.parse(value);
  } catch (error) {
    console.error("Failed to parse tower configs from storage:", error);
    return [];
  }
}

function persist(configs: TowerConfig[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
}

export function getTowerConfigs(): TowerConfig[] {
  if (typeof window === "undefined") return [];
  return safeParse(localStorage.getItem(STORAGE_KEY));
}

export function saveTowerConfig(data: {
  id?: string;
  stopName: string;
  stopId: string;
  line: Line;
  offset: number;
  slug?: string;
  towerId?: string;
  gatewayName?: string;
}): TowerConfig {
  const configs = getTowerConfigs();
  const now = new Date().toISOString();
  const id =
    data.id || `tower-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const existingIndex = configs.findIndex((config) => config.id === id);
  const savedConfig: TowerConfig = {
    id,
    stopName: data.stopName,
    stopId: data.stopId,
    line: data.line,
    offset: data.offset,
    createdAt: existingIndex >= 0 ? configs[existingIndex].createdAt : now,
    updatedAt: now,
    slug: data.slug || "",
    towerId: data.towerId || "",
    gatewayName: data.gatewayName || "Unknown",
  };

  if (existingIndex >= 0) {
    configs[existingIndex] = savedConfig;
  } else {
    configs.push(savedConfig);
  }

  persist(configs);
  return savedConfig;
}

export function clearTowerConfigs() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function deleteTowerConfig(id: string) {
  const configs = getTowerConfigs().filter((config) => config.id !== id);
  persist(configs);
}
