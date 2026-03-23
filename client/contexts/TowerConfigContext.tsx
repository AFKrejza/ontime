import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import storage from '@/utils/storage';

interface TowerConfig {
  stop: string;
  line: string;
  type: string;
  walkingOffset: number;
}

interface TowerConfigContextType {
  isOnboardingComplete: boolean;
  towerConfig: TowerConfig | null;
  isLoading: boolean;
  saveTowerConfig: (config: TowerConfig) => Promise<void>;
  clearTowerConfig: () => Promise<void>;
}

const TowerConfigContext = createContext<TowerConfigContextType | undefined>(undefined);

export function TowerConfigProvider({ children }: { children: ReactNode }) {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [towerConfig, setTowerConfig] = useState<TowerConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if tower config exists (onboarding complete)
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const saved = await storage.getItem('towerConfig');
        if (saved) {
          setTowerConfig(JSON.parse(saved));
          setIsOnboardingComplete(true);
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboardingStatus();
  }, []);

  const saveTowerConfig = async (config: TowerConfig) => {
    try {
      await storage.setItem('towerConfig', JSON.stringify(config));
      setTowerConfig(config);
      setIsOnboardingComplete(true);
    } catch (error) {
      console.error('Error saving tower config:', error);
      throw error;
    }
  };

  const clearTowerConfig = async () => {
    try {
      await storage.removeItem('towerConfig');
      setTowerConfig(null);
      setIsOnboardingComplete(false);
    } catch (error) {
      console.error('Error clearing tower config:', error);
      throw error;
    }
  };

  return (
    <TowerConfigContext.Provider
      value={{ isOnboardingComplete, towerConfig, isLoading, saveTowerConfig, clearTowerConfig }}
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
