'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth.tsx';
import { useRouter } from 'next/navigation';
import { MediChainIcon } from '@/components/icons';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type LoginSchema = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (values: LoginSchema) => {
    setIsLoading(true);
    const user = login(values.email, values.password);
    if (user) {
      toast({ title: 'Login successful!' });
      router.push('/dashboard');
    } else {
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: 'Invalid email or password.',
      });
      setIsLoading(false);
    }
  };
  
  const handleGoogleLogin = () => {
    setIsLoading(true);
    // Simulate Google Login
    setTimeout(() => {
        const user = login('patient@medichain.com', 'password');
        if (user) {
          toast({ title: 'Login successful!' });
          router.push('/dashboard');
        }
    }, 1000)
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>
      </div>
      <Card className="w-full max-w-sm bg-card/60 backdrop-blur-sm">
        <CardHeader className="items-center text-center">
          <Link href="/" className="flex items-center gap-2 mb-4">
            <MediChainIcon className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">MediChain</span>
          </Link>
          <CardTitle>Welcome Back</CardTitle>
          <CardDescription>Enter your credentials to access your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="patient@medichain.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
          </Form>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>
          <Button variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={isLoading}>
            Google
          </Button>
        </CardContent>
        <CardFooter className="justify-center text-sm">
          <p>
            Don't have an account?{' '}
            <Link href="/signup" className="font-semibold text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
