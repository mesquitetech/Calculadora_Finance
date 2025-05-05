import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertCircle, 
  Code, 
  FileCode, 
  Globe, 
  Heart, 
  Info, 
  Library, 
  Link2, 
  Share2, 
  Star, 
  Zap 
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export function AboutFooter() {
  const [expanded, setExpanded] = useState(false);
  
  const libraries = [
    { name: "React", category: "UI", description: "JavaScript library for building user interfaces" },
    { name: "TypeScript", category: "Language", description: "Typed JavaScript for safer code" },
    { name: "Express", category: "Backend", description: "Fast, unopinionated web framework for Node.js" },
    { name: "Drizzle ORM", category: "Database", description: "Lightweight TypeScript ORM for SQL databases" },
    { name: "jsPDF", category: "PDF", description: "Client-side JavaScript PDF generation" },
    { name: "Recharts", category: "Visualization", description: "Redefined chart library built with React and D3" },
    { name: "TanStack Query", category: "Data", description: "Powerful asynchronous state management" },
    { name: "Shadcn UI", category: "Components", description: "Beautifully designed components built with Radix UI and Tailwind CSS" },
    { name: "Tailwind CSS", category: "Styling", description: "A utility-first CSS framework" },
    { name: "date-fns", category: "Utility", description: "Modern JavaScript date utility library" },
    { name: "Zod", category: "Validation", description: "TypeScript-first schema validation library" },
    { name: "Lucide React", category: "Icons", description: "Beautiful & consistent icon set" }
  ];
  
  const modules = [
    { id: "core", name: "Financial Calculation Core", description: "Core calculation engine for loan amortization and investment returns" },
    { id: "metrics", name: "Advanced Metrics", description: "Investment metrics including IRR, NPV, ROI, and risk assessment" },
    { id: "reports", name: "Report Generation", description: "PDF report generation for financial statements and contracts" },
    { id: "projections", name: "Business Projections", description: "Quarterly business performance projections and analytics" },
    { id: "banking", name: "Banking Reports", description: "Professional reports for financial institutions and banking services" }
  ];
  
  return (
    <div className="w-full">
      <div className="flex justify-center my-8">
        <Button variant="ghost" onClick={() => setExpanded(!expanded)}>
          {expanded ? "Hide Details" : "About This Software"}
          <Info className="ml-2 h-4 w-4" />
        </Button>
      </div>
      
      {expanded && (
        <Card className="mb-8">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
              Mesquite & Rigel Open Lab 2025
            </CardTitle>
            <CardDescription>
              Advanced Financial Analytics & Projection Platform
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="about">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="tech">Technology</TabsTrigger>
                <TabsTrigger value="integration">Integration</TabsTrigger>
                <TabsTrigger value="development">Development</TabsTrigger>
              </TabsList>
              
              {/* About Tab */}
              <TabsContent value="about" className="space-y-4">
                <div className="py-4">
                  <h3 className="text-lg font-semibold mb-2 flex items-center">
                    <Info className="mr-2 h-5 w-5 text-blue-600" />
                    Overview
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    This advanced financial analytics platform was developed by Mesquite & Rigel Open Lab to provide comprehensive 
                    investment analysis, loan amortization, and business projections. It enables financial professionals to model complex 
                    financing scenarios with multiple investors and generate detailed reports.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <h4 className="text-md font-medium mb-2 flex items-center">
                        <Star className="mr-2 h-4 w-4 text-amber-500" />
                        Key Features
                      </h4>
                      <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
                        <li>Multi-investor loan tracking and return calculation</li>
                        <li>Advanced financial metrics (IRR, NPV, ROI, etc.)</li>
                        <li>Business projection modeling with quarterly performance</li>
                        <li>Risk assessment and sensitivity analysis</li>
                        <li>Professional banking and investment reports</li>
                        <li>PDF report generation for financial statements</li>
                        <li>Interactive data visualization and analytics</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-md font-medium mb-2 flex items-center">
                        <Heart className="mr-2 h-4 w-4 text-red-500" />
                        Benefits
                      </h4>
                      <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
                        <li>Save time with automated calculations and projections</li>
                        <li>Enhance decision-making with detailed financial analysis</li>
                        <li>Present professional reports to stakeholders and investors</li>
                        <li>Model complex financial scenarios with multiple variables</li>
                        <li>Track individual investor returns with precision</li>
                        <li>Generate regulatory-compliant documentation</li>
                        <li>Visualize financial data through interactive charts</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-md font-medium">Contact Information</h4>
                        <p className="text-sm text-muted-foreground">For more information about this software</p>
                      </div>
                      <a 
                        href="https://miniurl.com/mesquitelab" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        <Globe className="mr-2 h-4 w-4" />
                        Visit Website
                      </a>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              {/* Technology Tab */}
              <TabsContent value="tech" className="space-y-4">
                <div className="py-4">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Library className="mr-2 h-5 w-5 text-blue-600" />
                    Libraries & Technologies
                  </h3>
                  
                  <div className="mb-4 flex flex-wrap gap-2">
                    {libraries.map((lib, index) => (
                      <Badge key={index} variant="outline" className="py-1">
                        {lib.name}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="space-y-3 mt-6">
                    <h4 className="text-md font-medium">Core Components</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {libraries.map((lib, index) => (
                        <div key={index} className="p-3 border rounded-md">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium">{lib.name}</span>
                            <Badge variant="secondary" className="text-xs">
                              {lib.category}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {lib.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t">
                    <h4 className="text-md font-medium mb-2">Architecture Overview</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-md">
                        <h5 className="font-medium text-blue-700 dark:text-blue-300 mb-1">Frontend</h5>
                        <p className="text-muted-foreground">React, TypeScript, Tailwind CSS, and Shadcn UI components for a responsive and interactive user interface.</p>
                      </div>
                      
                      <div className="p-3 bg-green-50 dark:bg-green-950 rounded-md">
                        <h5 className="font-medium text-green-700 dark:text-green-300 mb-1">Backend</h5>
                        <p className="text-muted-foreground">Express server with TypeScript providing RESTful API endpoints for data processing and persistence.</p>
                      </div>
                      
                      <div className="p-3 bg-purple-50 dark:bg-purple-950 rounded-md">
                        <h5 className="font-medium text-purple-700 dark:text-purple-300 mb-1">Database</h5>
                        <p className="text-muted-foreground">PostgreSQL with Drizzle ORM for type-safe database operations and schema management.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              {/* Integration Tab */}
              <TabsContent value="integration" className="space-y-4">
                <div className="py-4">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Link2 className="mr-2 h-5 w-5 text-blue-600" />
                    Integration Options
                  </h3>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-md font-medium mb-2 flex items-center">
                        <Code className="mr-2 h-4 w-4 text-green-600" />
                        REST API Integration
                      </h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        The platform provides a comprehensive RESTful API that allows external systems to access its financial 
                        calculation capabilities. All functionality is exposed through standard HTTP endpoints.
                      </p>
                      
                      <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-md text-sm font-mono">
                        <p className="mb-1"><span className="text-blue-600">POST</span> /api/calculate</p>
                        <p className="text-slate-500 dark:text-slate-400 text-xs ml-5 mb-3">Calculates loan amortization schedule and investor returns</p>
                        
                        <p className="mb-1"><span className="text-green-600">GET</span> /api/calculations/:id</p>
                        <p className="text-slate-500 dark:text-slate-400 text-xs ml-5 mb-3">Retrieves a saved calculation by ID</p>
                        
                        <p className="mb-1"><span className="text-orange-600">PUT</span> /api/calculations/:id</p>
                        <p className="text-slate-500 dark:text-slate-400 text-xs ml-5 mb-3">Updates a saved calculation</p>
                        
                        <p className="mb-1"><span className="text-blue-600">POST</span> /api/metrics</p>
                        <p className="text-slate-500 dark:text-slate-400 text-xs ml-5 mb-3">Calculates advanced financial metrics on provided data</p>
                        
                        <p className="mb-1"><span className="text-blue-600">POST</span> /api/reports/generate</p>
                        <p className="text-slate-500 dark:text-slate-400 text-xs ml-5">Generates a specific type of financial report</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-md font-medium mb-2 flex items-center">
                        <FileCode className="mr-2 h-4 w-4 text-purple-600" />
                        Modular Components
                      </h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        The system is designed with modular architecture, allowing specific components to be integrated into other applications.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {modules.map((module) => (
                          <div key={module.id} className="border p-3 rounded-md">
                            <h5 className="font-medium mb-1">{module.name}</h5>
                            <p className="text-sm text-muted-foreground">{module.description}</p>
                            <div className="mt-2 text-xs">
                              <span className="text-blue-600 font-mono">import {'{'} {module.id} {'}'} from '@mesquite-financial/core'</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-md font-medium mb-2 flex items-center">
                        <Share2 className="mr-2 h-4 w-4 text-amber-600" />
                        Data Exchange Formats
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        All API endpoints accept and return data in the following formats:
                      </p>
                      
                      <div className="flex space-x-4 mb-4">
                        <Badge>JSON</Badge>
                        <Badge variant="outline">CSV (export only)</Badge>
                        <Badge variant="outline">PDF (reports)</Badge>
                      </div>
                      
                      <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-md">
                        <h5 className="text-sm font-medium mb-2">Sample Integration Code</h5>
                        <pre className="text-xs overflow-x-auto">
{`// Example API usage
async function calculateInvestment(data) {
  const response = await fetch('/api/calculate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  return response.json();
}`}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              {/* Development Tab */}
              <TabsContent value="development" className="space-y-4">
                <div className="py-4">
                  <h3 className="text-lg font-semibold mb-2 flex items-center">
                    <Zap className="mr-2 h-5 w-5 text-blue-600" />
                    Development Process
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    This platform was developed using modern software engineering practices and tools at Mesquite & Rigel Open Lab.
                  </p>
                  
                  <div className="space-y-6 mt-4">
                    <div>
                      <h4 className="text-md font-medium mb-2">Technology Stack & Development Approach</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        The application was built using a fullstack JavaScript approach with modern web technologies:
                      </p>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start">
                          <span className="bg-blue-100 text-blue-800 rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">1</span>
                          <div>
                            <span className="font-medium">Frontend Development</span>
                            <p className="text-muted-foreground">React with TypeScript for type-safe component development, leveraging Shadcn UI for accessible and responsive interfaces</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <span className="bg-blue-100 text-blue-800 rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">2</span>
                          <div>
                            <span className="font-medium">Backend Architecture</span>
                            <p className="text-muted-foreground">Express.js server handling RESTful API endpoints, with clear separation of concerns using service-oriented architecture</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <span className="bg-blue-100 text-blue-800 rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">3</span>
                          <div>
                            <span className="font-medium">Database Integration</span>
                            <p className="text-muted-foreground">PostgreSQL database with Drizzle ORM for type-safe database operations and schema management</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <span className="bg-blue-100 text-blue-800 rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">4</span>
                          <div>
                            <span className="font-medium">Financial Calculations</span>
                            <p className="text-muted-foreground">Core financial algorithms implemented with precision, including amortization schedules, IRR calculations, and investment returns</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <span className="bg-blue-100 text-blue-800 rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">5</span>
                          <div>
                            <span className="font-medium">Report Generation</span>
                            <p className="text-muted-foreground">PDF generation using client-side jsPDF library with custom rendering of financial statements and visualizations</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="text-md font-medium mb-2">Development Timeline</h4>
                      <div className="relative border-l border-gray-200 dark:border-gray-700 ml-3">
                        <div className="mb-8 ml-6">
                          <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-3 ring-8 ring-white dark:ring-gray-900 dark:bg-blue-900">
                            <span className="text-xs font-semibold">1</span>
                          </span>
                          <h5 className="flex items-center mb-1 text-sm font-semibold">Initial Requirements & Design</h5>
                          <p className="mb-2 text-xs font-normal text-muted-foreground">
                            Requirements gathering and architecture planning for a comprehensive financial calculator
                          </p>
                        </div>
                        
                        <div className="mb-8 ml-6">
                          <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-3 ring-8 ring-white dark:ring-gray-900 dark:bg-blue-900">
                            <span className="text-xs font-semibold">2</span>
                          </span>
                          <h5 className="flex items-center mb-1 text-sm font-semibold">Core Functionality Development</h5>
                          <p className="mb-2 text-xs font-normal text-muted-foreground">
                            Implementation of financial calculation logic and data modeling for investments
                          </p>
                        </div>
                        
                        <div className="mb-8 ml-6">
                          <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-3 ring-8 ring-white dark:ring-gray-900 dark:bg-blue-900">
                            <span className="text-xs font-semibold">3</span>
                          </span>
                          <h5 className="flex items-center mb-1 text-sm font-semibold">User Interface Implementation</h5>
                          <p className="mb-2 text-xs font-normal text-muted-foreground">
                            Creation of a responsive and intuitive interface with data visualization
                          </p>
                        </div>
                        
                        <div className="mb-8 ml-6">
                          <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-3 ring-8 ring-white dark:ring-gray-900 dark:bg-blue-900">
                            <span className="text-xs font-semibold">4</span>
                          </span>
                          <h5 className="flex items-center mb-1 text-sm font-semibold">Advanced Features Development</h5>
                          <p className="mb-2 text-xs font-normal text-muted-foreground">
                            Implementation of complex financial metrics, projections, and report generation
                          </p>
                        </div>
                        
                        <div className="ml-6">
                          <span className="absolute flex items-center justify-center w-6 h-6 bg-green-100 rounded-full -left-3 ring-8 ring-white dark:ring-gray-900 dark:bg-green-900">
                            <span className="text-xs font-semibold">5</span>
                          </span>
                          <h5 className="flex items-center mb-1 text-sm font-semibold">Release & Integration</h5>
                          <p className="mb-2 text-xs font-normal text-muted-foreground">
                            Final testing, documentation, and API integration capabilities
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
      
      <div className="w-full border-t border-border py-4">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground text-center md:text-left mb-2 md:mb-0">
            © 2025 Mesquite & Rigel Open Lab. All rights reserved.
          </p>
          
          <div className="flex items-center space-x-6">
            <a href="https://miniurl.com/mesquitelab" target="_blank" rel="noreferrer" className="text-sm text-muted-foreground hover:text-foreground">
              About
            </a>
            <a href="https://miniurl.com/mesquitelab" target="_blank" rel="noreferrer" className="text-sm text-muted-foreground hover:text-foreground">
              Documentation
            </a>
            <a href="https://miniurl.com/mesquitelab" target="_blank" rel="noreferrer" className="text-sm text-muted-foreground hover:text-foreground">
              API
            </a>
            <a href="https://miniurl.com/mesquitelab" target="_blank" rel="noreferrer" className="text-sm text-muted-foreground hover:text-foreground">
              Contact
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}