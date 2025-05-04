import React from "react";
import { cn } from "@/lib/utils";

type Tab = 'input' | 'schedule' | 'investors' | 'summary';

interface TabNavigationProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

export function TabNavigation({ activeTab, setActiveTab }: TabNavigationProps) {
  const tabs: { id: Tab; label: string }[] = [
    { id: 'input', label: 'Input Parameters' },
    { id: 'schedule', label: 'Payment Schedule' },
    { id: 'investors', label: 'Investor Returns' },
    { id: 'summary', label: 'Summary' },
  ];

  return (
    <div className="border-b border-neutral-lighter mb-6 dark:border-neutral-dark">
      <nav className="flex -mb-px">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-4 py-2 font-medium text-sm border-b-2",
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-neutral-lighter"
            )}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
