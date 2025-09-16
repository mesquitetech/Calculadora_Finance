import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Calculator, DollarSign, Clock, Target, BarChart } from "lucide-react";

export function RenterMetricsExplainedTab() {
  
  const metrics = [
    {
      name: "Net Present Value (NPV)",
      icon: <DollarSign className="h-6 w-6" />,
      definition: "The present value of all future cash flows minus the initial investment.",
      importance: "NPV shows whether an investment will add value to your portfolio. A positive NPV means the investment is expected to generate more money than it costs.",
      interpretation: [
        "NPV > 0: Investment is profitable and should be considered",
        "NPV = 0: Investment breaks even with the required rate of return",
        "NPV < 0: Investment may destroy value and should be avoided"
      ],
      calculation: "NPV = Sum of (Cash Flow / (1 + Discount Rate)^Period) - Initial Investment"
    },
    {
      name: "Internal Rate of Return (IRR)",
      icon: <TrendingUp className="h-6 w-6" />,
      definition: "The discount rate that makes the NPV of an investment equal to zero.",
      importance: "IRR represents the annual rate of return you can expect from the investment. It's useful for comparing different investment opportunities.",
      interpretation: [
        "IRR > Required Return: Investment is attractive",
        "IRR = Required Return: Investment meets minimum requirements",
        "IRR < Required Return: Investment should be rejected"
      ],
      calculation: "The rate where: 0 = Sum of (Cash Flow / (1 + IRR)^Period) - Initial Investment"
    },
    {
      name: "Payback Period",
      icon: <Clock className="h-6 w-6" />,
      definition: "The time it takes to recover the initial investment through cash flows.",
      importance: "This metric shows how quickly you'll get your money back. Shorter payback periods are generally preferred as they reduce risk.",
      interpretation: [
        "Shorter Period: Lower risk, faster capital recovery",
        "Longer Period: Higher risk, but potentially higher returns",
        "Compare with industry standards and personal risk tolerance"
      ],
      calculation: "Payback Period = Initial Investment / Average Annual Cash Flow"
    },
    {
      name: "Return on Investment (ROI)",
      icon: <Target className="h-6 w-6" />,
      definition: "The percentage return relative to the initial investment over the entire investment period.",
      importance: "ROI provides a simple percentage that shows total profitability. It's easy to understand and compare across different investments.",
      interpretation: [
        "Higher ROI: More profitable investment",
        "Compare with other investment opportunities",
        "Consider time factor - longer investments may justify lower ROI"
      ],
      calculation: "ROI = ((Total Return - Initial Investment) / Initial Investment) × 100%"
    },
    {
      name: "Cash Flow",
      icon: <BarChart className="h-6 w-6" />,
      definition: "The net amount of money coming in and going out of the investment each period.",
      importance: "Positive cash flow means the investment pays for itself and generates additional income. Consistent cash flow provides ongoing returns.",
      interpretation: [
        "Positive Cash Flow: Investment generates ongoing income",
        "Negative Cash Flow: Investment requires additional funding",
        "Growing Cash Flow: Investment performance is improving"
      ],
      calculation: "Cash Flow = Revenue - (Loan Payment + Operating Expenses)"
    },
    {
      name: "Break-Even Point",
      icon: <Calculator className="h-6 w-6" />,
      definition: "The revenue level where total income equals total expenses, resulting in zero profit or loss.",
      importance: "Understanding your break-even point helps you set minimum rent requirements and assess risk. Operating above break-even ensures profitability.",
      interpretation: [
        "Revenue > Break-Even: Investment is profitable",
        "Revenue = Break-Even: Investment covers all costs",
        "Revenue < Break-Even: Investment operates at a loss"
      ],
      calculation: "Break-Even Revenue = Fixed Costs + Variable Costs"
    }
  ];

  return (
    <div className="space-y-6 p-6">
      
      {/* Introduction */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Understanding Financial Metrics</CardTitle>
          <p className="text-sm text-muted-foreground">
            These financial metrics help you evaluate the attractiveness and risk of your real estate investment. 
            Each metric provides a different perspective on profitability and should be considered together for a complete analysis.
          </p>
        </CardHeader>
      </Card>

      {/* Metrics Cards */}
      <div className="space-y-6">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                  {metric.icon}
                </div>
                {metric.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Definition */}
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                  Definition
                </h4>
                <p className="text-sm">{metric.definition}</p>
              </div>

              {/* Why It's Important */}
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                  Why It's Important
                </h4>
                <p className="text-sm">{metric.importance}</p>
              </div>

              {/* How to Interpret */}
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                  How to Interpret
                </h4>
                <ul className="text-sm space-y-1">
                  {metric.interpretation.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Calculation */}
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                  How It's Calculated
                </h4>
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                  <code className="text-sm font-mono">{metric.calculation}</code>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle>Best Practices for Financial Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-green-600">Do's</h4>
              <ul className="text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Use multiple metrics together for comprehensive analysis</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Compare with industry benchmarks and similar properties</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Consider sensitivity analysis by adjusting revenue assumptions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Account for all expenses including maintenance and vacancy</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Use realistic discount rates based on your cost of capital</span>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-red-600">Don'ts</h4>
              <ul className="text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">✗</span>
                  <span>Rely on a single metric to make investment decisions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">✗</span>
                  <span>Ignore market conditions and local economic factors</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">✗</span>
                  <span>Assume revenue will remain constant over time</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">✗</span>
                  <span>Forget to factor in taxes and depreciation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">✗</span>
                  <span>Overlook the time value of money in long-term investments</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}