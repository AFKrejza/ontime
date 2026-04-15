import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import storage from '@/utils/storage';

interface TowerConfig {
  id: string;
  name: string;
  stop: string;
  stopId: string;
  line: string;
  type: string;
  walkingOffset: number;
  createdAt: string;
  updatedAt: string;
}

interface TowerConfigContextType {
  isOnboardingComplete: boolean;
  towerConfigs: TowerConfig[];
  activeTowerId: string | null;
  activeTowerConfig: TowerConfig | null;
  isLoading: boolean;
  saveTowerConfig: (config: {
    id?: string;
    name?: string;
    stop: string;
    stopId: string;
    line: string;
    type: string;
    walkingOffset: number;
  }) => Promise<void>;
  setActiveTower: (id: string) => Promise<void>;
  deleteTowerConfig: (id: string) => Promise<void>;
  clearTowerConfigs: () => Promise<void>;
}

const TowerConfigContext = createContext<TowerConfigContextType | undefined>(undefined);

const TOWER_CONFIGS_KEY = 'towerConfigs';
const ACTIVE_TOWER_KEY = 'activeTowerId';
const LEGACY_TOWER_KEY = 'towerConfig';

function createId() {
  return `tower-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function buildTowerConfig(
  partial: {
    id?: string;
    name?: string;
    stop: string;
    stopId: string;
    line: string;
    type: string;
    walkingOffset: number;
  },
  createdAt?: string
): TowerConfig {
  const now = new Date().toISOString();
  return {
    id: partial.id || createId(),
    name: partial.name || `${partial.stop} ${partial.line}`,
    stop: partial.stop,
    stopId: partial.stopId,
    line: partial.line,
    type: partial.type,
    walkingOffset: partial.walkingOffset,
    createdAt: createdAt || now,
    updatedAt: now,
  };
}

export function TowerConfigProvider({ children }: { children: ReactNode }) {
  const [towerConfigs, setTowerConfigs] = useState<TowerConfig[]>([]);
  const [activeTowerId, setActiveTowerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadConfigs = async () => {
      try {
        const savedConfigs = await storage.getItem(TOWER_CONFIGS_KEY);
        let configs: TowerConfig[] = [];

        if (savedConfigs) {
          configs = JSON.parse(savedConfigs);
        } else {
          const legacy = await storage.getItem(LEGACY_TOWER_KEY);
          if (legacy) {
            const legacyConfig = JSON.parse(legacy);
            configs = [
              buildTowerConfig({
                stop: legacyConfig.stop,
                stopId: legacyConfig.stopId,
                line: legacyConfig.line,
                type: legacyConfig.type,
                walkingOffset: legacyConfig.walkingOffset,
                name: `${legacyConfig.stop} ${legacyConfig.line}`,
              }),
            ];
            await storage.setItem(TOWER_CONFIGS_KEY, JSON.stringify(configs));
            await storage.removeItem(LEGACY_TOWER_KEY);
          }
        }

        setTowerConfigs(configs);

        if (configs.length > 0) {
          const savedActiveTowerId = await storage.getItem(ACTIVE_TOWER_KEY);
          const activeId = configs.some((config) => config.id === savedActiveTowerId)
            ? savedActiveTowerId
            : configs[0].id;

          setActiveTowerId(activeId);
          await storage.setItem(ACTIVE_TOWER_KEY, activeId);
        }
      } catch (error) {
        console.error('Error loading tower configs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadConfigs();
  }, []);

  const activeTowerConfig = towerConfigs.find((config) => config.id === activeTowerId) ?? null;
  const isOnboardingComplete = towerConfigs.length > 0;

  const persistConfigs = async (configs: TowerConfig[]) => {
    await storage.setItem(TOWER_CONFIGS_KEY, JSON.stringify(configs));
    setTowerConfigs(configs);
  };

  const saveTowerConfig = async (configData: {
    id?: string;
    name?: string;
    stop: string;
    stopId: string;
    line: string;
    type: string;
    walkingOffset: number;
  }) => {
    try {
      const now = new Date().toISOString();
      let configs = [...towerConfigs];
      let updatedConfig: TowerConfig;

      if (configData.id) {
        const existingIndex = configs.findIndex((config) => config.id === configData.id);
        if (existingIndex >= 0) {
          updatedConfig = {
            ...configs[existingIndex],
            name: configData.name || `${configData.stop} ${configData.line}`,
            stop: configData.stop,
            stopId: configData.stopId,
            line: configData.line,
            type: configData.type,
            walkingOffset: configData.walkingOffset,
            updatedAt: now,
          };
          configs[existingIndex] = updatedConfig;
        } else {
          updatedConfig = buildTowerConfig(configData, now);
          configs.push(updatedConfig);
        }
      } else {
        updatedConfig = buildTowerConfig(configData, now);
        configs.push(updatedConfig);
      }

      await persistConfigs(configs);
      setActiveTowerId(updatedConfig.id);
      await storage.setItem(ACTIVE_TOWER_KEY, updatedConfig.id);
    } catch (error) {
      console.error('Error saving tower config:', error);
      throw error;
    }
  };

  const setActiveTower = async (id: string) => {
    try {
      if (!towerConfigs.some((config) => config.id === id)) {
        return;
      }
      setActiveTowerId(id);
      await storage.setItem(ACTIVE_TOWER_KEY, id);
    } catch (error) {
      console.error('Error setting active tower:', error);
      throw error;
    }
  };

  const deleteTowerConfig = async (id: string) => {
    try {
      const configs = towerConfigs.filter((config) => config.id !== id);
      await persistConfigs(configs);

      if (activeTowerId === id) {
        const nextActive = configs[0]?.id ?? null;
        setActiveTowerId(nextActive);
        if (nextActive) {
          await storage.setItem(ACTIVE_TOWER_KEY, nextActive);
        } else {
          await storage.removeItem(ACTIVE_TOWER_KEY);
        }
      }
    } catch (error) {
      console.error('Error deleting tower config:', error);
      throw error;
    }
  };

  const clearTowerConfigs = async () => {
    try {
      await storage.removeItem(TOWER_CONFIGS_KEY);
      await storage.removeItem(ACTIVE_TOWER_KEY);
      setTowerConfigs([]);
      setActiveTowerId(null);
    } catch (error) {
      console.error('Error clearing tower configs:', error);
      throw error;
    }
  };

  return (
    <TowerConfigContext.Provider
      value={{
        isOnboardingComplete,
        towerConfigs,
        activeTowerId,
        activeTowerConfig,
        isLoading,
        saveTowerConfig,
        setActiveTower,
        deleteTowerConfig,
        clearTowerConfigs,
      }}
    >
      {children}
    </TowerConfigContext.Provider>
  );
}

export function useTowerConfig() {
  const context = useContext(TowerConfigContext);
  if (!context) {
    throw new Error('useTowerConfig must be used within TowerConfigProvider');
  }
  return context;
}
