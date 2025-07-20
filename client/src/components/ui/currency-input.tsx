import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

interface CurrencyInputProps {
  id?: string;
  name?: string;
  value: number;
  onChange: (value: number) => void;
  onBlur?: () => void; 
  placeholder?: string;
  min?: number;
  max?: number;
  className?: string;
  disabled?: boolean;
  required?: boolean;
}

export function CurrencyInput({
  value,
  onChange,
  onBlur,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
  ...props
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      // Handle undefined, null, or NaN values
      const safeValue = typeof value === 'number' && !isNaN(value) ? value : 0;
      const formatted = safeValue.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      setDisplayValue(formatted);
    }
  }, [value, isFocused]); 
  const handleFocus = () => {
    setIsFocused(true);
    // Handle undefined, null, or NaN values
    const safeValue = typeof value === 'number' && !isNaN(value) ? value : 0;
    setDisplayValue(safeValue.toString());
  };

  const handleBlur = () => {
    setIsFocused(false);

    let numericValue = parseFloat(displayValue);

    if (isNaN(numericValue) || numericValue < min) {
      numericValue = min;
    }
    else if (numericValue > max) {
      numericValue = max; 
    }

    onChange(numericValue);

    if (onBlur) {
      onBlur();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayValue(e.target.value);
  };

  return (
    <div className="relative flex items-center">
      <div className="absolute left-0 pl-3 flex items-center pointer-events-none">
        <span className="text-muted-foreground">$</span>
      </div>
      <Input
        {...props}
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={`pl-7 ${props.className || ""}`}
      />
    </div>
  );
}