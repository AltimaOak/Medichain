'use client';
import { MediChainIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth.tsx';
import Link from 'next/link';
import { ModeToggle } from './mode-toggle';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 flex">
          <Link className="mr-6 flex items-center space-x-2" href="/">
            <MediChainIcon className="h-6 w-6 text-primary" />
            <span className="font-bold sm:inline-block">MediChain</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <ModeToggle />
          {user ? (
            <>
              <Button variant="ghost" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <Button onClick={logout}>Logout</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
