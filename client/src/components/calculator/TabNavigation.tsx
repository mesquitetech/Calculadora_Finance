
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
  showSubTabs = false
}: TabNavigationProps) {
  const mainTabs: { id: MainTab; label: string; icon: React.ReactNode }[] = [
    { id: 'input', label: 'Input Parameters', icon: <Calculator className="h-4 w-4 mr-1" /> },
    { id: 'lender-investor', label: 'Lender / Investor Results', icon: <TrendingUp className="h-4 w-4 mr-1" /> },
    { id: 'renter-operator', label: 'Renter / Operator Results', icon: <Users className="h-4 w-4 mr-1" /> },
  ];

  const lenderSubTabs: { id: LenderSubTab; label: string }[] = [
    { id: 'schedule', label: 'Schedule' },
    { id: 'investors', label: 'Investors' },
    { id: 'summary', label: 'Summary' },
    { id: 'projections', label: 'Projections' },
    { id: 'reports', label: 'Reports' },
  ];

  return (
    <div className="mb-6">
      {/* Main Navigation */}
      <div className="border-b border-neutral-lighter dark:border-neutral-dark">
        <nav className="flex flex-wrap -mb-px">
          {mainTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveMainTab(tab.id)}
              className={cn(
                "px-6 py-3 font-medium text-sm border-b-2 flex items-center",
                activeMainTab === tab.id
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-neutral-lighter"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Sub Navigation for Lender/Investor Results */}
      {showSubTabs && activeMainTab === 'lender-investor' && (
        <div className="border-b border-neutral-lighter/50 dark:border-neutral-dark/50 bg-muted/30">
          <nav className="flex flex-wrap -mb-px px-4">
            {lenderSubTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveLenderSubTab?.(tab.id)}
                className={cn(
                  "px-4 py-2 font-medium text-xs border-b-2 transition-colors",
                  activeLenderSubTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-neutral-lighter"
                )}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
