import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "@/components/ui/tooltip"; // 1. Importar componentes de Tooltip
import { formatCurrency, formatDate, formatPercentage } from "@/lib/finance";
import { useToast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";

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

  const { data: calculations, isLoading, error } = useQuery<Calculation[]>({
    queryKey: ["/api/calculations"],
  });

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
        description: error.message || "Could not delete the calculation.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error || !calculations) {
    return <div>Error loading calculations.</div>;
  }

  return (
    // 2. Envolver el contenido con TooltipProvider para habilitar los tooltips
    <TooltipProvider>
      <div className="sticky top-0 z-10 w-full border-b bg-background">
        <div className="container mx-auto flex items-center justify-between py-4 px-6">
          <h1 className="text-3xl font-bold">Saved Calculations</h1>
          <div className="flex gap-3">
            <Button onClick={() => setLocation("/")}>Home</Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-10 px-6">
        {calculations.length === 0 ? (
          <Card>
            <CardContent className="py-10">
              <div className="space-y-4 text-center">
                <h2 className="text-xl font-semibold">No saved calculations</h2>
                <p className="text-muted-foreground">
                  You haven't created any loan calculations yet.
                </p>
                <Button onClick={() => setLocation("/")}>Create New Calculation</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {calculations.map((calculation) => (
              <Card key={calculation.id} className="transition-all hover:shadow-md">
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                  <div className="min-w-0">
                    {/* 3. Implementar el componente Tooltip */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <CardTitle className="truncate">
                          {calculation.loanName}
                        </CardTitle>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{calculation.loanName}</p>
                      </TooltipContent>
                    </Tooltip>
                    <CardDescription>
                      Created on {new Date(calculation.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive flex-shrink-0">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the
                          calculation for "{calculation.loanName}".
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteMutation.mutate(calculation.id)}
                          disabled={deleteMutation.isPending}
                        >
                          {deleteMutation.isPending ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="font-medium">{formatCurrency(calculation.amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Interest Rate:</span>
                      <span className="font-medium">{formatPercentage(calculation.interestRate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Term:</span>
                      <span className="font-medium">{calculation.termMonths} months</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Start Date:</span>
                      <span className="font-medium">{formatDate(new Date(calculation.startDate))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment Frequency:</span>
                      <span className="font-medium capitalize">{calculation.paymentFrequency}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t p-4">
                  <Button
                    className="w-full"
                    onClick={() => setLocation(`/calculation/${calculation.id}`)}
                  >
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
