import React from "react";
import { cn } from "@/lib/utils";
import { FileText, Calculator, Calendar, PieChart, BarChart } from "lucide-react";

// Export the Tab type to be reused in other components
export type Tab = 'input' | 'schedule' | 'investors' | 'summary' | 'reports';

interface TabNavigationProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

export function TabNavigation({ activeTab, setActiveTab }: TabNavigationProps) {
  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'input', label: 'Input Parameters', icon: <Calculator className="h-4 w-4 mr-1" /> },
    { id: 'schedule', label: 'Payment Schedule', icon: <Calendar className="h-4 w-4 mr-1" /> },
    { id: 'investors', label: 'Investor Returns', icon: <PieChart className="h-4 w-4 mr-1" /> },
    { id: 'summary', label: 'Summary', icon: <BarChart className="h-4 w-4 mr-1" /> },
    { id: 'reports', label: 'Reports & Documents', icon: <FileText className="h-4 w-4 mr-1" /> },
  ];

  return (
    <div className="border-b border-neutral-lighter mb-6 dark:border-neutral-dark">
      <nav className="flex flex-wrap -mb-px">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-4 py-2 font-medium text-sm border-b-2 flex items-center",
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-neutral-lighter"
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
