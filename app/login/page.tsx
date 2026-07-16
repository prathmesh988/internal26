'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, Mail, Lock, ArrowRight, Eye, EyeOff, Loader2, Sparkles, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { authService } from '@/services/appwrite/client';
import { useUserStore } from '@/store';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '';

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  // Demo Credentials Helper
  const fillDemo = (role: 'CITIZEN' | 'ADMIN') => {
    if (role === 'CITIZEN') {
      setEmail('aisha.khan@gmail.com');
      setPassword('password123'); // Or mock fallback
    } else {
      setEmail('sandeep.wagh@wasteflow.in');
      setPassword('password123');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Missing Credentials', {
        description: 'Please enter both email and password.',
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await authService.login(email, password);
      if (result) {
        // Sync Zustand store
        useUserStore.getState().login(result.role, result.user.$id, result.user.email);
        toast.success('Welcome back!', {
          description: `Logged in successfully as ${result.role}.`,
        });
        
        // Redirect to intended route or default role-based dashboard
        if (redirectPath) {
          router.push(redirectPath);
        } else if (result.role === 'CITIZEN') {
          router.push('/citizen/dashboard');
        } else {
          router.push('/admin/dashboard');
        }
      } else {
        toast.error('Authentication Failed', {
          description: 'Unable to retrieve user session. Please check your credentials.',
        });
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Login Error', {
        description: err.message || 'An unexpected error occurred during login.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 overflow-hidden bg-background">
      {/* Visual Sidebar Section */}
      <div className="hidden lg:flex lg:col-span-5 relative bg-zinc-950 p-12 flex-col justify-between overflow-hidden">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,#1e3a8a,transparent_60%)] opacity-40" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,#312e81,transparent_50%)] opacity-35" />
        <div className="absolute inset-0 bg-grid-white/[0.02]" />

        <div className="relative z-10 flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Truck className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">WasteFlow</span>
        </div>

        <div className="relative z-10 max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              Next-Gen Municipal Operations
            </span>
            <h1 className="text-4xl font-extrabold text-white leading-tight mb-4">
              Smart Waste Management for Modern Communities
            </h1>
            <p className="text-zinc-400 leading-relaxed">
              Log in to access your dashboard, monitor optimization routes, file cleanup requests, and track compliance metrics.
            </p>
          </motion.div>
        </div>

        <div className="relative z-10 text-xs text-zinc-500">
          © {new Date().getFullYear()} WasteFlow Inc. All rights reserved.
        </div>
      </div>

      {/* Login Form Section */}
      <div className="lg:col-span-7 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-20 relative bg-zinc-50/50 dark:bg-zinc-950/20">
        <div className="mx-auto w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <Truck className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold tracking-tight text-foreground">WasteFlow</span>
          </div>

          <div className="space-y-2 text-center lg:text-left mb-8">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground">Sign In</h2>
            <p className="text-sm text-muted-foreground">
              Enter your credentials or use a demo account to get started.
            </p>
          </div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-card border border-border/60 shadow-xl rounded-2xl p-8 backdrop-blur-md"
          >
            <form onSubmit={handleLogin} className="space-y-6">
              <FieldGroup>
                {/* Email Field */}
                <Field>
                  <FieldLabel htmlFor="email">Email Address</FieldLabel>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                      <Mail className="w-4 h-4" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-10"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </Field>

                {/* Password Field */}
                <Field>
                  <div className="flex justify-between items-center">
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Link
                      href="#"
                      className="text-xs text-blue-600 hover:text-blue-500 font-semibold"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                      <Lock className="w-4 h-4" />
                    </div>
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-10"
                      disabled={isLoading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </Field>
              </FieldGroup>

              <Button type="submit" className="w-full h-10 font-semibold" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-3 text-muted-foreground font-medium">Or continue with</span>
              </div>
            </div>

            {/* Social logins */}
            <Button
              variant="outline"
              type="button"
              className="w-full h-10 font-semibold flex items-center justify-center gap-2"
              onClick={() => {
                toast.info('Google Sign-In Triggered', {
                  description: 'Redirecting to Google OAuth flow...',
                });
                // Invoke Appwrite OAuth Session
                account.createOAuth2Session(
                  'google',
                  window.location.origin + (redirectPath ? `?redirect=${redirectPath}` : ''),
                  window.location.origin + '/login'
                );
              }}
              disabled={isLoading}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </Button>

            {/* Quick Demo Credentials */}
            <div className="mt-8 rounded-xl bg-muted/50 p-4 border border-border/40">
              <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-foreground/80">
                <ShieldAlert className="w-3.5 h-3.5 text-blue-500" />
                Quick Login (Demo Accounts)
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => fillDemo('CITIZEN')}
                  className="px-3 py-1.5 text-xs text-left bg-card hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded border border-border transition-colors font-medium"
                >
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Citizen</p>
                  <span>Aisha Khan</span>
                </button>
                <button
                  type="button"
                  onClick={() => fillDemo('ADMIN')}
                  className="px-3 py-1.5 text-xs text-left bg-card hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded border border-border transition-colors font-medium"
                >
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Operator/Admin</p>
                  <span>Dr. Sandeep</span>
                </button>
              </div>
            </div>
          </motion.div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link href="/signup" className="font-semibold text-blue-600 hover:text-blue-500">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
