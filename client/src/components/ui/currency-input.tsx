import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

interface CurrencyInputProps {
  id?: string;
  name?: string;
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  min?: number;
  className?: string;
  disabled?: boolean;
  required?: boolean;
}

export function CurrencyInput({
  id,
  name,
  value,
  onChange,
  placeholder = "0.00",
  min = 0,
  className = "",
  disabled = false,
  required = false,
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState("");

  // Format the numeric value to display value with commas
  useEffect(() => {
    if (value !== undefined) {
      // Convert to string with 2 decimal places
      const formatted = value.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      setDisplayValue(formatted);
    } else {
      setDisplayValue("");
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;
    
    // Remove non-numeric characters except decimal point
    inputValue = inputValue.replace(/[^0-9.]/g, "");
    
    // Ensure only one decimal point
    const decimalCount = (inputValue.match(/\./g) || []).length;
    if (decimalCount > 1) {
      const firstDecimalIndex = inputValue.indexOf(".");
      inputValue = 
        inputValue.substring(0, firstDecimalIndex + 1) + 
        inputValue.substring(firstDecimalIndex + 1).replace(/\./g, "");
    }
    
    // Convert to number
    const numericValue = parseFloat(inputValue) || 0;
    
    // Validate min value
    if (numericValue >= min) {
      onChange(numericValue);
    } else if (inputValue === "" || inputValue === "0" || inputValue === "0.") {
      onChange(0);
    }
  };

  return (
    <div className="relative flex items-center">
      <div className="absolute left-0 pl-3 flex items-center pointer-events-none">
        <span className="text-muted-foreground">$</span>
      </div>
      <Input
        id={id}
        name={name}
        value={displayValue}
        onChange={handleChange}
        className={`pl-7 ${className}`}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
      />
    </div>
  );
}
