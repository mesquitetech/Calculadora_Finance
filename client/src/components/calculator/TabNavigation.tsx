import React from "react";
import { cn } from "@/lib/utils";
import { 
  FileText, 
  Calculator, 
  TrendingUp, 
  Users
} from "lucide-react";

// Export the Tab type to be reused in other components
export type MainTab = 'input' | 'lender-investor' | 'renter-operator';
export type LenderSubTab = 'schedule' | 'investors' | 'summary' | 'projections' | 'reports';
export type RenterSubTab = 'dashboard' | 'lessee-quote' | 'summary' | 'cash-flow' | 'income-statement' | 'metrics-explained';

interface TabNavigationProps {
  activeMainTab: MainTab;
  setActiveMainTab: (tab: MainTab) => void;
  activeLenderSubTab?: LenderSubTab;
  setActiveLenderSubTab?: (tab: LenderSubTab) => void;
  activeRenterSubTab?: RenterSubTab;
  setActiveRenterSubTab?: (tab: RenterSubTab) => void;
  showSubTabs?: boolean;
}

export function TabNavigation({ 
  activeMainTab, 
  setActiveMainTab, 
  activeLenderSubTab, 
  setActiveLenderSubTab,
  activeRenterSubTab,
  setActiveRenterSubTab,
  showSubTabs = false 
}: TabNavigationProps) {
  return (
    <div className="w-full mb-8">
      {/* Main Navigation */}
      <div className="mb-6">
        <div className="flex w-full bg-muted rounded-lg p-1">
          <button
            onClick={() => setActiveMainTab('input')}
            className={`flex-1 px-4 py-4 text-lg font-medium rounded-md transition-colors ${
              activeMainTab === 'input' 
                ? 'bg-background text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
            }`}
          >
            Input Parameters
          </button>
          <button
            onClick={() => setActiveMainTab('lender-investor')}
            className={`flex-1 px-4 py-4 text-lg font-medium rounded-md transition-colors ${
              activeMainTab === 'lender-investor' 
                ? 'bg-background text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
            }`}
          >
            Lender / Investor Results
          </button>
          <button
            onClick={() => setActiveMainTab('renter-operator')}
            className={`flex-1 px-4 py-4 text-lg font-medium rounded-md transition-colors ${
              activeMainTab === 'renter-operator' 
                ? 'bg-background text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
            }`}
          >
            Renter / Operator Results
          </button>
        </div>
      </div>

      {/* Sub Navigation for Lender/Investor Results */}
      {activeMainTab === 'lender-investor' && showSubTabs && (
        <div className="max-w-4xl mx-auto">
          <div className="flex w-full bg-muted/50 rounded-lg p-1">
            <button
              onClick={() => setActiveLenderSubTab?.('schedule')}
              className={`flex-1 px-3 py-3 text-base font-medium rounded-md transition-colors ${
                activeLenderSubTab === 'schedule' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              }`}
            >
              Schedule
            </button>
            <button
              onClick={() => setActiveLenderSubTab?.('investors')}
              className={`flex-1 px-3 py-3 text-base font-medium rounded-md transition-colors ${
                activeLenderSubTab === 'investors' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              }`}
            >
              Investors
            </button>
            <button
              onClick={() => setActiveLenderSubTab?.('summary')}
              className={`flex-1 px-3 py-3 text-base font-medium rounded-md transition-colors ${
                activeLenderSubTab === 'summary' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              }`}
            >
              Summary
            </button>
            <button
              onClick={() => setActiveLenderSubTab?.('projections')}
              className={`flex-1 px-3 py-3 text-base font-medium rounded-md transition-colors ${
                activeLenderSubTab === 'projections' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              }`}
            >
              Projections
            </button>
            <button
              onClick={() => setActiveLenderSubTab?.('reports')}
              className={`flex-1 px-3 py-3 text-base font-medium rounded-md transition-colors ${
                activeLenderSubTab === 'reports' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              }`}
            >
              Reports
            </button>
          </div>
        </div>
      )}

      {/* Renter/Operator Sub-tabs */}
      {activeMainTab === 'renter-operator' && showSubTabs && (
        <div className="max-w-6xl mx-auto">
          <div className="flex w-full bg-muted/50 rounded-lg p-1 overflow-x-auto">
            <button
              onClick={() => setActiveRenterSubTab?.('dashboard')}
              className={`flex-none px-3 py-3 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                activeRenterSubTab === 'dashboard' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              }`}
            >
              Operator Panel
            </button>
            <button
              onClick={() => setActiveRenterSubTab?.('lessee-quote')}
              className={`flex-none px-3 py-3 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                activeRenterSubTab === 'lessee-quote' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              }`}
            >
              Customer Quote
            </button>
            {/*  
            <button
              onClick={() => setActiveRenterSubTab?.('summary')}
              className={`flex-none px-3 py-3 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                ['summary', 'cash-flow', 'income-statement'].includes(activeRenterSubTab || '') 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              }`}
            >
              Financial Analysis
            </button>
            <button
              onClick={() => setActiveRenterSubTab?.('metrics-explained')}
              className={`flex-none px-3 py-3 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                activeRenterSubTab === 'metrics-explained' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              }`}
            >
              Metrics Explained
            </button>
            */}
          </div>
        </div>
      )}
    </div>
  );
}