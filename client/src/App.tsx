import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import SavedCalculations from "@/pages/saved-calculations";
import CalculationDetails from "@/pages/calculation-details";
import { ThemeProvider } from "./components/calculator/ThemeProvider";
import { CalculationProvider } from "./contexts/CalculationContext";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/saved-calculations" component={SavedCalculations} />
      <Route path="/calculation/:id" component={CalculationDetails} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <CalculationProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </CalculationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
