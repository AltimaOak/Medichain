'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Activity, Bot, FileText, Sparkles, Stethoscope, TriangleAlert, Mic, User } from 'lucide-react';
import {
  aiSymptomChecker,
  AISymptomCheckerInput,
  AISymptomCheckerOutput,
} from '@/ai/flows/ai-symptom-checker';
import { symptomCheckerSchema, type SymptomCheckerSchema } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

export default function SymptomCheckerForm() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<AISymptomCheckerOutput | null>(null);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  const { user, reports, addReport } = useAuth();

  const form = useForm<SymptomCheckerSchema>({
    resolver: zodResolver(symptomCheckerSchema),
    defaultValues: {
      symptoms: '',
      medicalHistory: '',
    },
  });

  const onSubmit = (values: SymptomCheckerSchema) => {
    setResult(null);
    setProgress(0);
    startTransition(async () => {
      const interval = setInterval(() => {
        setProgress(prev => (prev >= 90 ? 90 : prev + 10));
      }, 500);

      try {
        const response = await aiSymptomChecker(values);
        setResult(response);
        if (user) {
          addReport({ ...response, date: new Date().toISOString(), symptoms: values.symptoms });
        }
        setProgress(100);
      } catch (e) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'An unexpected error occurred. Please try again.',
        });
        setProgress(0);
      } finally {
        clearInterval(interval);
      }
    });
  };

  const ConfidenceBadge = ({ level }: { level: string }) => {
    let variant: 'default' | 'secondary' | 'destructive' = 'secondary';
    if (level?.toLowerCase() === 'high') {
      variant = 'default';
    } else if (level?.toLowerCase() === 'medium') {
      variant = 'secondary';
    } else if (level) {
      variant = 'destructive';
    }
    return <Badge variant={variant} className="capitalize">{level}</Badge>;
  };

  const ResultSkeleton = () => (
    <Card className="bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-6 w-48" />
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        {progress > 0 && <Progress value={progress} className="w-full" />}
        <div className="space-y-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <Separator />
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
      <Card className="bg-card/50 shadow-lg backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User /> Your Information
          </CardTitle>
          <CardDescription>
            This information will be reviewed by our AI. Please be as detailed as possible.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="symptoms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Symptoms</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Textarea
                          placeholder="e.g., I have a persistent cough, fever, and headache for the last 3 days..."
                          className="min-h-[150px] resize-none pr-10"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute bottom-2 right-2"
                          onClick={() => toast({ title: 'Voice input not yet implemented.' })}
                        >
                          <Mic className="h-4 w-4" />
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="medicalHistory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medical History (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., I have a history of asthma and I'm currently taking an inhaler."
                        className="min-h-[100px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? (
                  <>
                    <Bot className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Get Analysis
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        {isPending && <ResultSkeleton />}
        {result && !isPending && (
          <Card className="animate-in fade-in-50 bg-card/50 shadow-lg backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Bot />
                  AI Analysis Report
                </CardTitle>
                <ConfidenceBadge level={result.confidenceLevel} />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="flex items-center gap-2 font-semibold">
                  <Stethoscope className="text-primary" />
                  Possible Conditions
                </h3>
                <p className="text-muted-foreground">{result.possibleConditions}</p>
              </div>

              <div className="space-y-2">
                <h3 className="flex items-center gap-2 font-semibold">
                  <Activity className="text-primary" />
                  Next Steps
                </h3>
                <p className="text-muted-foreground">{result.nextSteps}</p>
              </div>

              <Separator />

              <div className="rounded-lg border border-amber-300/50 bg-amber-500/10 p-4">
                <h4 className="flex items-center gap-2 font-semibold text-amber-600 dark:text-amber-400">
                  <TriangleAlert />
                  Important Disclaimer
                </h4>
                <p className="mt-2 text-sm text-muted-foreground">{result.disclaimer}</p>
              </div>
            </CardContent>
          </Card>
        )}
        {!result && !isPending && (
            <Card className="flex h-full flex-col items-center justify-center border-dashed bg-card/20 p-8 text-center shadow-none backdrop-blur-sm md:p-16">
                <div className="mb-4 rounded-full bg-primary/10 p-4">
                    <FileText className="h-10 w-10 text-primary"/>
                </div>
                <h3 className="text-lg font-semibold text-foreground">Your report will appear here</h3>
                <p className="mt-1 text-sm text-muted-foreground">Fill out the form to get started.</p>
            </Card>
        )}
      </div>
    </div>
  );
}
