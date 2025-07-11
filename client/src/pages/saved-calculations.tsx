import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatCurrency, formatDate, formatPercentage } from "@/lib/finance";
import { useToast } from "@/hooks/use-toast";
import { Trash2, LayoutGrid, List, Search } from "lucide-react";

// Interface for calculation data
interface Calculation {
  id: number;
  loanName: string;
  amount: number;
  interestRate: number;
  termMonths: number;
  startDate: string;
  paymentFrequency: string;
  createdAt: string;
}

// API call to delete a calculation
async function deleteCalculation(id: number): Promise<void> {
  const response = await fetch(`/api/calculations/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "Network error" }));
    throw new Error(errorData.message || "Failed to delete calculation");
  }
}

export default function SavedCalculations() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State for view mode ('grid' or 'table') and search term
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetching data with React Query
  const { data: calculations, isLoading, error } = useQuery<Calculation[]>({
    queryKey: ["/api/calculations"],
  });

  // Mutation for deleting a calculation
  const deleteMutation = useMutation({
    mutationFn: deleteCalculation,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Calculation deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/calculations"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: (error as Error).message || "Could not delete the calculation.",
        variant: "destructive",
      });
    },
  });

  // Filter calculations based on the search term
  const filteredCalculations = useMemo(() => {
    if (!calculations) return [];
    if (!searchTerm) return calculations;

    return calculations.filter(calc => 
      calc.loanName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(calc.amount).includes(searchTerm)
    );
  }, [calculations, searchTerm]);

  if (isLoading) {
    return <div className="text-center p-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-500">Error loading calculations. Please try again later.</div>;
  }

  return (
    <TooltipProvider>
      <div className="sticky top-0 z-10 w-full border-b bg-background">
        <div className="container mx-auto flex items-center justify-between py-4 px-6">
          <h1 className="text-3xl font-bold">Saved Calculations</h1>
          <div className="flex items-center gap-3">
            <Button onClick={() => setLocation("/")}>Home</Button>
            <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('grid')}>
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button variant={viewMode === 'table' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('table')}>
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-10 px-6">
        <div className="mb-6">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder="Search by loan name or amount..."
                    className="w-full pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        {filteredCalculations.length === 0 ? (
          <Card>
            <CardContent className="py-10">
              <div className="space-y-4 text-center">
                <h2 className="text-xl font-semibold">No Calculations Found</h2>
                <p className="text-muted-foreground">
                  {searchTerm ? "Your search returned no results." : "You haven't created any loan calculations yet."}
                </p>
                { !searchTerm && <Button onClick={() => setLocation("/")}>Create New Calculation</Button> }
              </div>
            </CardContent>
          </Card>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {filteredCalculations.map((calculation) => (
              <Card key={calculation.id} className="transition-all hover:shadow-md">
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                  <div className="min-w-0">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <CardTitle className="truncate">{calculation.loanName}</CardTitle>
                      </TooltipTrigger>
                      <TooltipContent><p>{calculation.loanName}</p></TooltipContent>
                    </Tooltip>
                    <CardDescription>Created on {new Date(calculation.createdAt).toLocaleDateString()}</CardDescription>
                  </div>
                  <AlertDialog>
                      <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive flex-shrink-0"><Trash2 className="h-4 w-4" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                          <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>This action cannot be undone. This will permanently delete "{calculation.loanName}".</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteMutation.mutate(calculation.id)} disabled={deleteMutation.isPending}>
                                  {deleteMutation.isPending ? "Deleting..." : "Delete"}
                              </AlertDialogAction>
                          </AlertDialogFooter>
                      </AlertDialogContent>
                  </AlertDialog>
                </CardHeader>
                <CardContent>
                  {/* CORREGIDO: Se han añadido los campos que faltaban en la vista de tarjeta */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Amount:</span><span className="font-medium">{formatCurrency(calculation.amount)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Interest Rate:</span><span className="font-medium">{formatPercentage(calculation.interestRate)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Term:</span><span className="font-medium">{calculation.termMonths} months</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Start Date:</span><span className="font-medium">{formatDate(new Date(calculation.startDate))}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Frequency:</span><span className="font-medium capitalize">{calculation.paymentFrequency}</span></div>
                  </div>
                </CardContent>
                <CardFooter className="border-t p-4">
                  <Button className="w-full" onClick={() => setLocation(`/calculation/${calculation.id}`)}>View Details</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                {/* CORREGIDO: Se han añadido más columnas a la tabla */}
                <TableRow>
                  <TableHead>Loan Name</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Interest</TableHead>
                  <TableHead>Term</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCalculations.map((calculation) => (
                  <TableRow key={calculation.id}>
                    <TableCell className="font-medium">{calculation.loanName}</TableCell>
                    <TableCell>{formatCurrency(calculation.amount)}</TableCell>
                    {/* CORREGIDO: Se han añadido las celdas de datos correspondientes */}
                    <TableCell>{formatPercentage(calculation.interestRate)}</TableCell>
                    <TableCell>{calculation.termMonths} months</TableCell>
                    <TableCell>{formatDate(new Date(calculation.startDate))}</TableCell>
                    <TableCell className="text-right">
                       <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => setLocation(`/calculation/${calculation.id}`)}>View</Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>This action cannot be undone. This will permanently delete "{calculation.loanName}".</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => deleteMutation.mutate(calculation.id)} disabled={deleteMutation.isPending}>
                                            {deleteMutation.isPending ? "Deleting..." : "Delete"}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                       </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </TooltipProvider>
  );
}
