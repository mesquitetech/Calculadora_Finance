import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings } from "lucide-react";

export interface RenterConfig {
  discountRate: number;
  residualValueRate: number;
}

interface RenterConfigModalProps {
  config: RenterConfig;
  onConfigChange: (config: RenterConfig) => void;
}

export function RenterConfigModal({ config, onConfigChange }: RenterConfigModalProps) {
  const [tempConfig, setTempConfig] = useState<RenterConfig>(config);
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
          title="Advanced Options"
        >
          Parameters
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Advanced Parameters</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
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
              Rate used for NPV calculations (default: 4%)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="residual-value">Residual Value Rate (%)</Label>
            <div className="relative">
              <Input
                id="residual-value"
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
              Percentage of asset cost retained at end of loan term
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