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

interface TabNavigationProps {
  activeMainTab: MainTab;
  setActiveMainTab: (tab: MainTab) => void;
  activeLenderSubTab?: LenderSubTab;
  setActiveLenderSubTab?: (tab: LenderSubTab) => void;
  showSubTabs?: boolean;
}

export function TabNavigation({ 
  activeMainTab, 
  setActiveMainTab, 
  activeLenderSubTab, 
  setActiveLenderSubTab,
  showSubTabs 
}: TabNavigationProps) {
  return (
    <div className="w-full mb-8">
      {/* Main Navigation */}
      <div className="flex justify-center mb-6">
        <div className="flex space-x-2 bg-muted p-2 rounded-xl">
          <button
            onClick={() => setActiveMainTab('input')}
            className={`px-8 py-3 text-lg font-medium rounded-lg transition-colors ${
              activeMainTab === 'input' 
                ? 'bg-background text-foreground shadow-md' 
                : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
            }`}
          >
            Input Parameters
          </button>
          <button
            onClick={() => setActiveMainTab('lender-investor')}
            className={`px-8 py-3 text-lg font-medium rounded-lg transition-colors ${
              activeMainTab === 'lender-investor' 
                ? 'bg-background text-foreground shadow-md' 
                : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
            }`}
          >
            Lender / Investor Results
          </button>
          <button
            onClick={() => setActiveMainTab('renter-operator')}
            className={`px-8 py-3 text-lg font-medium rounded-lg transition-colors ${
              activeMainTab === 'renter-operator' 
                ? 'bg-background text-foreground shadow-md' 
                : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
            }`}
          >
            Renter / Operator Results
          </button>
        </div>
      </div>

      {/* Sub Navigation for Lender/Investor Results */}
      {activeMainTab === 'lender-investor' && showSubTabs && (
        <div className="flex justify-center">
          <div className="flex space-x-2 bg-muted/50 p-2 rounded-lg">
            <button
              onClick={() => setActiveLenderSubTab('schedule')}
              className={`px-6 py-2 text-base font-medium rounded-md transition-colors ${
                activeLenderSubTab === 'schedule' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              }`}
            >
              Schedule
            </button>
            <button
              onClick={() => setActiveLenderSubTab('investors')}
              className={`px-6 py-2 text-base font-medium rounded-md transition-colors ${
                activeLenderSubTab === 'investors' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              }`}
            >
              Investors
            </button>
            <button
              onClick={() => setActiveLenderSubTab('summary')}
              className={`px-6 py-2 text-base font-medium rounded-md transition-colors ${
                activeLenderSubTab === 'summary' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              }`}
            >
              Summary
            </button>
            <button
              onClick={() => setActiveLenderSubTab('projections')}
              className={`px-6 py-2 text-base font-medium rounded-md transition-colors ${
                activeLenderSubTab === 'projections' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              }`}
            >
              Projections
            </button>
            <button
              onClick={() => setActiveLenderSubTab('reports')}
              className={`px-6 py-2 text-base font-medium rounded-md transition-colors ${
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
    </div>
  );
}