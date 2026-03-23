import { createContext, useContext, useState, ReactNode } from 'react';

interface OnboardingContextType {
  isInOnboarding: boolean;
  setIsInOnboarding: (value: boolean) => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [isInOnboarding, setIsInOnboarding] = useState(true);

  return (
    <OnboardingContext.Provider value={{ isInOnboarding, setIsInOnboarding }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
}
