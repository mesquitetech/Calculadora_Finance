
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  TrendingUp, 
  DollarSign, 
  Calculator, 
  BarChart3,
  PieChart,
  Target
} from "lucide-react";

export function RenterMetricsExplainedTab() {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Financial Metrics Explained</h2>
        <p className="text-muted-foreground">
          Understanding key financial indicators for rental and leasing operations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* NPV Card */}
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-3">
            <DollarSign className="h-5 w-5 text-green-600 mr-2" />
            <div>
              <CardTitle className="text-lg">Net Present Value (NPV)</CardTitle>
              <Badge variant="secondary" className="mt-1">Profitability Indicator</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              NPV calculates the present value of all future cash flows minus the initial investment.
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-green-600">Positive NPV:</span>
                <span>Profitable investment</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-red-600">Negative NPV:</span>
                <span>Loss-making investment</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-yellow-600">Zero NPV:</span>
                <span>Break-even point</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* IRR Card */}
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-3">
            <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
            <div>
              <CardTitle className="text-lg">Internal Rate of Return (IRR)</CardTitle>
              <Badge variant="secondary" className="mt-1">Return Rate</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              IRR is the discount rate that makes NPV equal to zero. It represents the annualized return rate.
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>High IRR (>15%):</span>
                <span className="text-green-600">Excellent return</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Medium IRR (8-15%):</span>
                <span className="text-yellow-600">Good return</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Low IRR (<8%):</span>
                <span className="text-red-600">Poor return</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cash Flow Card */}
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-3">
            <BarChart3 className="h-5 w-5 text-purple-600 mr-2" />
            <div>
              <CardTitle className="text-lg">Cash Flow Analysis</CardTitle>
              <Badge variant="secondary" className="mt-1">Liquidity Indicator</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Monthly cash flow shows the net income after all expenses and loan payments.
            </p>
            <div className="space-y-2">
              <div className="text-sm">
                <strong>Formula:</strong> Revenue - Loan Payment - Operating Expenses
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-green-600">Positive Cash Flow:</span>
                <span>Surplus funds</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-red-600">Negative Cash Flow:</span>
                <span>Additional funding needed</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ROI Card */}
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-3">
            <Target className="h-5 w-5 text-orange-600 mr-2" />
            <div>
              <CardTitle className="text-lg">Return on Investment (ROI)</CardTitle>
              <Badge variant="secondary" className="mt-1">Efficiency Metric</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              ROI measures the efficiency of an investment relative to its cost.
            </p>
            <div className="space-y-2">
              <div className="text-sm">
                <strong>Formula:</strong> (Total Return - Investment Cost) / Investment Cost × 100%
              </div>
              <Separator />
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>ROI > 20%:</span>
                  <span className="text-green-600">Excellent</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>ROI 10-20%:</span>
                  <span className="text-yellow-600">Good</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>ROI < 10%:</span>
                  <span className="text-red-600">Poor</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payback Period Card */}
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-3">
            <Calculator className="h-5 w-5 text-indigo-600 mr-2" />
            <div>
              <CardTitle className="text-lg">Payback Period</CardTitle>
              <Badge variant="secondary" className="mt-1">Risk Indicator</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Time required to recover the initial investment through cash flows.
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Short Payback (<2 years):</span>
                <span className="text-green-600">Low risk</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Medium Payback (2-4 years):</span>
                <span className="text-yellow-600">Moderate risk</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Long Payback (>4 years):</span>
                <span className="text-red-600">High risk</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Break-even Analysis Card */}
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-3">
            <PieChart className="h-5 w-5 text-teal-600 mr-2" />
            <div>
              <CardTitle className="text-lg">Break-even Analysis</CardTitle>
              <Badge variant="secondary" className="mt-1">Cost Coverage</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Revenue level needed to cover all costs without profit or loss.
            </p>
            <div className="space-y-2">
              <div className="text-sm">
                <strong>Break-even Revenue:</strong> Fixed Costs + Variable Costs
              </div>
              <Separator />
              <div className="text-sm space-y-1">
                <div>• Fixed Costs: Loan payments, insurance, taxes</div>
                <div>• Variable Costs: Maintenance, utilities, repairs</div>
                <div>• Safety Margin: Typically 10-20% above break-even</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Best Practices Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-xl">Best Practices for Financial Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-green-700 mb-2">✓ Do's</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Use conservative revenue estimates</li>
                <li>• Include a contingency fund (5-10%)</li>
                <li>• Regular monitoring of actual vs projected</li>
                <li>• Consider market fluctuations</li>
                <li>• Update calculations quarterly</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-red-700 mb-2">✗ Don'ts</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Ignore inflation effects</li>
                <li>• Overlook tax implications</li>
                <li>• Use overly optimistic projections</li>
                <li>• Neglect maintenance costs</li>
                <li>• Ignore market competition</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
