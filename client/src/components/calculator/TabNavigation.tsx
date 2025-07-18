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
export type RenterSubTab = 'summary' | 'cash-flow' | 'income-statement' | 'metrics-explained';

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
  showSubTabs 
}: TabNavigationProps) {
  return (
    <div className="w-full mb-8">
      {/* Main Navigation */}
      <div className="mb-6">
        <div className="border-b border-border">
          <div className="flex w-full">
            <button
              onClick={() => setActiveMainTab('input')}
              className={`px-6 py-3 text-lg font-medium border-b-2 transition-colors ${
                activeMainTab === 'input' 
                  ? 'border-blue-500 text-blue-600 bg-blue-50/50' 
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
              }`}
            >
              Input Parameters
            </button>
            <button
              onClick={() => setActiveMainTab('lender-investor')}
              className={`px-6 py-3 text-lg font-medium border-b-2 transition-colors ${
                activeMainTab === 'lender-investor' 
                  ? 'border-blue-500 text-blue-600 bg-blue-50/50' 
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
              }`}
            >
              Lender / Investor Results
            </button>
            <button
              onClick={() => setActiveMainTab('renter-operator')}
              className={`px-6 py-3 text-lg font-medium border-b-2 transition-colors ${
                activeMainTab === 'renter-operator' 
                  ? 'border-blue-500 text-blue-600 bg-blue-50/50' 
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
              }`}
            >
              Renter / Operator Results
            </button>
          </div>
        </div>
      </div>

      {/* Sub Navigation for Lender/Investor Results */}
      {activeMainTab === 'lender-investor' && showSubTabs && (
        <div className="max-w-4xl mx-auto">
          <div className="border-b border-border">
            <div className="flex w-full">
              <button
                onClick={() => setActiveLenderSubTab('schedule')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeLenderSubTab === 'schedule' 
                    ? 'border-blue-500 text-blue-600 bg-blue-50/30' 
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
                }`}
              >
                Schedule
              </button>
              <button
                onClick={() => setActiveLenderSubTab('investors')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeLenderSubTab === 'investors' 
                    ? 'border-blue-500 text-blue-600 bg-blue-50/30' 
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
                }`}
              >
                Investors
              </button>
              <button
                onClick={() => setActiveLenderSubTab('summary')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeLenderSubTab === 'summary' 
                    ? 'border-blue-500 text-blue-600 bg-blue-50/30' 
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
                }`}
              >
                Summary
              </button>
              <button
                onClick={() => setActiveLenderSubTab('projections')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeLenderSubTab === 'projections' 
                    ? 'border-blue-500 text-blue-600 bg-blue-50/30' 
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
                }`}
              >
                Projections
              </button>
              <button
                onClick={() => setActiveLenderSubTab('reports')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeLenderSubTab === 'reports' 
                    ? 'border-blue-500 text-blue-600 bg-blue-50/30' 
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
                }`}
              >
                Reports
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Renter/Operator Sub-tabs */}
      {activeMainTab === 'renter-operator' && showSubTabs && (
        <div className="max-w-4xl mx-auto">
          <div className="border-b border-border">
            <div className="flex w-full">
              <button
                onClick={() => setActiveRenterSubTab?.('summary')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeRenterSubTab === 'summary' 
                    ? 'border-blue-500 text-blue-600 bg-blue-50/30' 
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
                }`}
              >
                Summary
              </button>
              <button
                onClick={() => setActiveRenterSubTab?.('cash-flow')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeRenterSubTab === 'cash-flow' 
                    ? 'border-blue-500 text-blue-600 bg-blue-50/30' 
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
                }`}
              >
                Cash Flow
              </button>
              <button
                onClick={() => setActiveRenterSubTab?.('income-statement')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeRenterSubTab === 'income-statement' 
                    ? 'border-blue-500 text-blue-600 bg-blue-50/30' 
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
                }`}
              >
                Income Statement (P&L)
              </button>
              <button
                onClick={() => setActiveRenterSubTab?.('metrics-explained')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeRenterSubTab === 'metrics-explained' 
                    ? 'border-blue-500 text-blue-600 bg-blue-50/30' 
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
                }`}
              >
                Financial Metrics Explained
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}