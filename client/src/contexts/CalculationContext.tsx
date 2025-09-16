import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LeaseInput, CreditInput } from '@shared/schema';

interface LeaseResults {
  monthlyPayment: number;
  totalInterest: number;
  totalAmount: number;
  residualValue: number;
  endDate: Date;
}

interface CreditResults {
  monthlyPayment: number;
  totalInterest: number;
  paymentSchedule: any[];
  endDate: Date;
}

interface InvestorData {
  id: number;
  name: string;
  investmentAmount: number;
  percentage: number;
}

interface CalculationContextType {
  // Leasing data
  leaseInput: LeaseInput | null;
  setLeaseInput: (input: LeaseInput | null) => void;
  leaseResults: LeaseResults | null;
  setLeaseResults: (results: LeaseResults | null) => void;
  
  // Credit data
  creditInput: CreditInput | null;
  setCreditInput: (input: CreditInput | null) => void;
  creditResults: CreditResults | null;
  setCreditResults: (results: CreditResults | null) => void;
  
  // Investor data
  investors: InvestorData[];
  setInvestors: (investors: InvestorData[]) => void;
  investorReturns: any[];
  setInvestorReturns: (returns: any[]) => void;
  
  // Navigation state
  currentStep: 'leasing' | 'lease-results' | 'credit' | 'investors';
  setCurrentStep: (step: 'leasing' | 'lease-results' | 'credit' | 'investors') => void;
  
  // Helper methods
  clearAllData: () => void;
  isStepCompleted: (step: string) => boolean;
}

const CalculationContext = createContext<CalculationContextType | undefined>(undefined);

const STORAGE_KEY = 'calculation-context';

export function CalculationProvider({ children }: { children: ReactNode }) {
  const [leaseInput, setLeaseInputState] = useState<LeaseInput | null>(null);
  const [leaseResults, setLeaseResultsState] = useState<LeaseResults | null>(null);
  const [creditInput, setCreditInputState] = useState<CreditInput | null>(null);
  const [creditResults, setCreditResultsState] = useState<CreditResults | null>(null);
  const [investors, setInvestorsState] = useState<InvestorData[]>([]);
  const [investorReturns, setInvestorReturnsState] = useState<any[]>([]);
  const [currentStep, setCurrentStepState] = useState<'leasing' | 'lease-results' | 'credit' | 'investors'>('leasing');

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        
        if (data.leaseInput) {
          // Convert date strings back to Date objects
          const leaseInput = {
            ...data.leaseInput,
            startDate: new Date(data.leaseInput.startDate)
          };
          setLeaseInputState(leaseInput);
        }
        
        if (data.leaseResults) {
          const leaseResults = {
            ...data.leaseResults,
            endDate: new Date(data.leaseResults.endDate)
          };
          setLeaseResultsState(leaseResults);
        }
        
        if (data.creditInput) {
          const creditInput = {
            ...data.creditInput,
            startDate: new Date(data.creditInput.startDate)
          };
          setCreditInputState(creditInput);
        }
        
        if (data.creditResults) {
          const creditResults = {
            ...data.creditResults,
            endDate: new Date(data.creditResults.endDate)
          };
          setCreditResultsState(creditResults);
        }
        
        if (data.investors) setInvestorsState(data.investors);
        if (data.investorReturns) setInvestorReturnsState(data.investorReturns);
        if (data.currentStep) setCurrentStepState(data.currentStep);
      }
    } catch (error) {
      console.error('Error loading calculation context from localStorage:', error);
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    const dataToSave = {
      leaseInput,
      leaseResults,
      creditInput,
      creditResults,
      investors,
      investorReturns,
      currentStep,
    };
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Error saving calculation context to localStorage:', error);
    }
  }, [leaseInput, leaseResults, creditInput, creditResults, investors, investorReturns, currentStep]);

  const setLeaseInput = (input: LeaseInput | null) => {
    setLeaseInputState(input);
    // Clear dependent data when lease input changes
    if (!input) {
      setLeaseResultsState(null);
      setCreditInputState(null);
      setCreditResultsState(null);
      setInvestorsState([]);
      setInvestorReturnsState([]);
    }
  };

  const setLeaseResults = (results: LeaseResults | null) => {
    setLeaseResultsState(results);
    // Clear dependent data when lease results change
    if (!results) {
      setCreditInputState(null);
      setCreditResultsState(null);
      setInvestorReturnsState([]);
    }
  };

  const setCreditInput = (input: CreditInput | null) => {
    setCreditInputState(input);
    // Clear dependent data when credit input changes
    if (!input) {
      setCreditResultsState(null);
      setInvestorReturnsState([]);
    }
  };

  const setCreditResults = (results: CreditResults | null) => {
    setCreditResultsState(results);
    // Clear dependent data when credit results change
    if (!results) {
      setInvestorReturnsState([]);
    }
  };

  const setInvestors = (newInvestors: InvestorData[]) => {
    setInvestorsState(newInvestors);
    // Clear investor returns when investors change
    setInvestorReturnsState([]);
  };

  const setInvestorReturns = (returns: any[]) => {
    setInvestorReturnsState(returns);
  };

  const setCurrentStep = (step: 'leasing' | 'lease-results' | 'credit' | 'investors') => {
    setCurrentStepState(step);
  };

  const clearAllData = () => {
    setLeaseInputState(null);
    setLeaseResultsState(null);
    setCreditInputState(null);
    setCreditResultsState(null);
    setInvestorsState([]);
    setInvestorReturnsState([]);
    setCurrentStepState('leasing');
    localStorage.removeItem(STORAGE_KEY);
  };

  const isStepCompleted = (step: string): boolean => {
    switch (step) {
      case 'leasing':
        return leaseInput !== null;
      case 'lease-results':
        return leaseResults !== null;
      case 'credit':
        return creditInput !== null;
      case 'investors':
        return investors.length > 0 && investorReturns.length > 0;
      default:
        return false;
    }
  };

  const value: CalculationContextType = {
    leaseInput,
    setLeaseInput,
    leaseResults,
    setLeaseResults,
    creditInput,
    setCreditInput,
    creditResults,
    setCreditResults,
    investors,
    setInvestors,
    investorReturns,
    setInvestorReturns,
    currentStep,
    setCurrentStep,
    clearAllData,
    isStepCompleted,
  };

  return (
    <CalculationContext.Provider value={value}>
      {children}
    </CalculationContext.Provider>
  );
}

export function useCalculation() {
  const context = useContext(CalculationContext);
  if (!context) {
    throw new Error('useCalculation must be used within a CalculationProvider');
  }
  return context;
}