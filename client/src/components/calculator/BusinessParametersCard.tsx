
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";

export interface BusinessParameters {
  vehicleCount: number;
  averageDailyRate: number;
  occupancyRate: number;
  monthlyOperatingExpenses: number;
  maintenanceCostPerVehicle: number;
  insuranceCostPerVehicle: number;
}

interface BusinessParametersCardProps {
  businessParams: BusinessParameters;
  setBusinessParams: React.Dispatch<React.SetStateAction<BusinessParameters>>;
  isCalculating: boolean;
}

export function BusinessParametersCard({
  businessParams,
  setBusinessParams,
  isCalculating
}: BusinessParametersCardProps) {

  const handleVehicleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 1 && value <= 1000) {
      setBusinessParams(prev => ({ ...prev, vehicleCount: value }));
    } else if (e.target.value === '') {
      setBusinessParams(prev => ({ ...prev, vehicleCount: 0 }));
    }
  };

  const handleDailyRateChange = (value: number) => {
    setBusinessParams(prev => ({ ...prev, averageDailyRate: value }));
  };

  const handleOccupancyRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0 && value <= 100) {
      setBusinessParams(prev => ({ ...prev, occupancyRate: value }));
    } else if (e.target.value === '') {
      setBusinessParams(prev => ({ ...prev, occupancyRate: 0 }));
    }
  };

  const handleOperatingExpensesChange = (value: number) => {
    setBusinessParams(prev => ({ ...prev, monthlyOperatingExpenses: value }));
  };

  const handleMaintenanceChange = (value: number) => {
    setBusinessParams(prev => ({ ...prev, maintenanceCostPerVehicle: value }));
  };

  const handleInsuranceChange = (value: number) => {
    setBusinessParams(prev => ({ ...prev, insuranceCostPerVehicle: value }));
  };

  return (
    <Card className="col-span-1">
      <CardContent className="pt-6">
        <h2 className="text-lg font-bold mb-4 text-foreground">Business Parameters</h2>
        <div className="space-y-4">
          <div className="form-group">
            <Label htmlFor="vehicle-count">Number of Vehicles</Label>
            <Input
              id="vehicle-count"
              name="vehicle-count"
              type="number"
              value={businessParams.vehicleCount.toString()}
              onChange={handleVehicleCountChange}
              min={1}
              max={1000}
              placeholder="Enter number of vehicles"
              disabled={isCalculating}
            />
            <p className="text-xs text-muted-foreground mt-1">Number of vehicles in your fleet</p>
          </div>

          <div className="form-group">
            <Label htmlFor="daily-rate">Average Daily Rate</Label>
            <CurrencyInput
              id="daily-rate"
              name="daily-rate"
              value={businessParams.averageDailyRate}
              onChange={handleDailyRateChange}
              min={0}
              max={10000}
              disabled={isCalculating}
            />
            <p className="text-xs text-muted-foreground mt-1">Average rental rate per vehicle per day</p>
          </div>

          <div className="form-group">
            <Label htmlFor="occupancy-rate">Occupancy Rate (%)</Label>
            <div className="relative">
              <Input
                id="occupancy-rate"
                name="occupancy-rate"
                type="number"
                value={businessParams.occupancyRate.toString()}
                onChange={handleOccupancyRateChange}
                min={0}
                max={100}
                step={0.1}
                className="pr-12"
                placeholder="0.0"
                disabled={isCalculating}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-muted-foreground">%</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Expected occupancy rate (0-100%)</p>
          </div>

          <div className="form-group">
            <Label htmlFor="operating-expenses">Monthly Operating Expenses</Label>
            <CurrencyInput
              id="operating-expenses"
              name="operating-expenses"
              value={businessParams.monthlyOperatingExpenses}
              onChange={handleOperatingExpensesChange}
              min={0}
              max={1000000}
              disabled={isCalculating}
            />
            <p className="text-xs text-muted-foreground mt-1">Total monthly operating expenses</p>
          </div>

          <div className="form-group">
            <Label htmlFor="maintenance-cost">Maintenance Cost per Vehicle</Label>
            <CurrencyInput
              id="maintenance-cost"
              name="maintenance-cost"
              value={businessParams.maintenanceCostPerVehicle}
              onChange={handleMaintenanceChange}
              min={0}
              max={10000}
              disabled={isCalculating}
            />
            <p className="text-xs text-muted-foreground mt-1">Monthly maintenance cost per vehicle</p>
          </div>

          <div className="form-group">
            <Label htmlFor="insurance-cost">Insurance Cost per Vehicle</Label>
            <CurrencyInput
              id="insurance-cost"
              name="insurance-cost"
              value={businessParams.insuranceCostPerVehicle}
              onChange={handleInsuranceChange}
              min={0}
              max={10000}
              disabled={isCalculating}
            />
            <p className="text-xs text-muted-foreground mt-1">Monthly insurance cost per vehicle</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
