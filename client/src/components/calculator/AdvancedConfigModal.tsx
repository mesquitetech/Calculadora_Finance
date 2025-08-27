
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings } from "lucide-react";

export interface AdvancedConfig {
  residualValueRate: number;
  discountRate: number;
  adminCommissionPct: number;
  securityDepositMonths: number;
}

interface AdvancedConfigModalProps {
  config: AdvancedConfig;
  onConfigChange: (config: AdvancedConfig) => void;
}

export function AdvancedConfigModal({ config, onConfigChange }: AdvancedConfigModalProps) {
  const [tempConfig, setTempConfig] = useState<AdvancedConfig>(config);
  const [isOpen, setIsOpen] = useState(false);

  const handleSave = () => {
    onConfigChange(tempConfig);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setTempConfig(config);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-3 text-xs whitespace-nowrap"
          title="Advanced Configuration"
        >
          <Settings className="w-4 h-4 mr-2" />
          Advanced Config
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Advanced Configuration</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="residual-value-rate">Residual Value Rate (%)</Label>
            <div className="relative">
              <Input
                id="residual-value-rate"
                type="number"
                value={tempConfig.residualValueRate}
                onChange={(e) => setTempConfig({
                  ...tempConfig,
                  residualValueRate: Number(e.target.value) || 0
                })}
                min={0}
                max={100}
                step={1}
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Percentage of asset cost retained at end of lease term
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="discount-rate">Discount Rate (%)</Label>
            <div className="relative">
              <Input
                id="discount-rate"
                type="number"
                value={tempConfig.discountRate}
                onChange={(e) => setTempConfig({
                  ...tempConfig,
                  discountRate: Number(e.target.value) || 0
                })}
                min={0}
                max={50}
                step={0.1}
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Rate used for NPV calculations
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-commission">Opening Commission (%)</Label>
            <div className="relative">
              <Input
                id="admin-commission"
                type="number"
                value={tempConfig.adminCommissionPct}
                onChange={(e) => setTempConfig({
                  ...tempConfig,
                  adminCommissionPct: Number(e.target.value) || 0
                })}
                min={0}
                max={10}
                step={0.1}
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Commission percentage on asset cost
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="security-deposit">Security Deposit (Months)</Label>
            <Input
              id="security-deposit"
              type="number"
              value={tempConfig.securityDepositMonths}
              onChange={(e) => setTempConfig({
                ...tempConfig,
                securityDepositMonths: Number(e.target.value) || 0
              })}
              min={0}
              max={12}
              step={1}
            />
            <p className="text-xs text-muted-foreground">
              Number of months of rent as security deposit
            </p>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
