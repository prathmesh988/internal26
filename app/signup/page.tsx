'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Truck, Mail, Lock, User, ArrowRight, Eye, EyeOff, Loader2, Sparkles, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldGroup, FieldLabel, FieldDescription } from '@/components/ui/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { authService } from '@/services/appwrite/client';
import { useUserStore } from '@/store';
import { toast } from 'sonner';

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [wardCode, setWardCode] = React.useState('W01');
  
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword || !wardCode) {
      toast.error('Required Fields Missing', {
        description: 'Please fill in all the details.',
      });
      return;
    }

    if (password.length < 8) {
      toast.error('Weak Password', {
        description: 'Password must be at least 8 characters long.',
      });
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords Mismatch', {
        description: 'Password and Confirm Password fields do not match.',
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await authService.signupCitizen(email, password, name, wardCode);
      if (result) {
        useUserStore.getState().login(result.role, result.user.$id, result.user.email);
        toast.success('Welcome to WasteFlow!', {
          description: 'Your account has been registered and initialized successfully.',
        });
        router.push('/citizen/dashboard');
      } else {
        toast.error('Signup Failed', {
          description: 'Unable to retrieve user session after registration.',
        });
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Registration Error', {
        description: err.message || 'An unexpected error occurred during signup.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const wards = [
    { code: 'W01', name: 'Ward 01 – Shivaji Nagar' },
    { code: 'W02', name: 'Ward 02 – Aundh' },
    { code: 'W03', name: 'Ward 03 – Kothrud' },
    { code: 'W04', name: 'Ward 04 – Hadapsar' },
    { code: 'W05', name: 'Ward 05 – Katraj' },
    { code: 'W06', name: 'Ward 06 – Viman Nagar' },
  ];

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
              Empowering Citizens
            </span>
            <h1 className="text-4xl font-extrabold text-white leading-tight mb-4">
              Join WasteFlow & Clean Your Community
            </h1>
            <p className="text-zinc-400 leading-relaxed">
              Create an account to submit cleanup requests, report violations, receive pickup reminders, and earn rewards points for compliance.
            </p>
          </motion.div>
        </div>

        <div className="relative z-10 text-xs text-zinc-500">
          © {new Date().getFullYear()} WasteFlow Inc. All rights reserved.
        </div>
      </div>

      {/* Signup Form Section */}
      <div className="lg:col-span-7 flex flex-col justify-center px-6 py-8 sm:px-12 lg:px-20 relative bg-zinc-50/50 dark:bg-zinc-950/20 overflow-y-auto">
        <div className="mx-auto w-full max-w-md my-auto">
          <div className="lg:hidden flex items-center gap-2 mb-6 justify-center">
            <Truck className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold tracking-tight text-foreground">WasteFlow</span>
          </div>

          <div className="space-y-2 text-center lg:text-left mb-6">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground">Register</h2>
            <p className="text-sm text-muted-foreground">
              Sign up as a citizen to keep your ward clean and earn points.
            </p>
          </div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-card border border-border/60 shadow-xl rounded-2xl p-8 backdrop-blur-md"
          >
            <form onSubmit={handleSignup} className="space-y-5">
              <FieldGroup>
                {/* Full Name */}
                <Field>
                  <FieldLabel htmlFor="name">Full Name</FieldLabel>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                      <User className="w-4 h-4" />
                    </div>
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10 h-10"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </Field>

                {/* Email Address */}
                <Field>
                  <FieldLabel htmlFor="email">Email Address</FieldLabel>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                      <Mail className="w-4 h-4" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-10"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </Field>

                {/* Ward Selection */}
                <Field>
                  <FieldLabel htmlFor="ward">Select Ward</FieldLabel>
                  <div className="relative flex items-center">
                    <div className="absolute left-3 text-muted-foreground z-10">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <Select value={wardCode} onValueChange={setWardCode} disabled={isLoading}>
                      <SelectTrigger className="w-full pl-10 pr-4 h-10 text-left justify-start gap-2 bg-transparent text-sm">
                        <SelectValue placeholder="Select Ward" />
                      </SelectTrigger>
                      <SelectContent>
                        {wards.map((w) => (
                          <SelectItem key={w.code} value={w.code}>
                            {w.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <FieldDescription>
                    Select your primary residency ward for route optimization and tracking.
                  </FieldDescription>
                </Field>

                {/* Password Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
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
                        className="pl-10 pr-10 h-10 text-sm"
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

                  <Field>
                    <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                        <Lock className="w-4 h-4" />
                      </div>
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10 pr-10 h-10 text-sm"
                        disabled={isLoading}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </Field>
                </div>
              </FieldGroup>

              <Button type="submit" className="w-full h-10 font-semibold" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    Sign Up
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </motion.div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-500">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
