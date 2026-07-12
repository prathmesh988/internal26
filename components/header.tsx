'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUserStore } from '@/store';
import { cn } from '@/lib/utils';
import {
  Truck,
  Sun,
  Moon,
  LogOut,
  Settings,
  User,
  Search,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { userType, userId, userEmail, logout } = useUserStore();
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    if (html.classList.contains('dark')) {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Define navigation based on userType
  const adminNavItems = [
    { label: 'Overview', href: '/admin/dashboard' },
    { label: 'Fleet Tracking', href: '/admin/tracking' },
    { label: 'Complaints', href: '/admin/complaints' },
    { label: 'Routes', href: '/admin/routes' },
    { label: 'Workers', href: '/admin/workers' },
  ];

  const citizenNavItems = [
    { label: 'Overview', href: '/citizen/dashboard' },
    { label: 'My Complaints', href: '/citizen/my-complaints' },
    { label: 'File Complaint', href: '/citizen/file-complaint' },
    { label: 'Rewards', href: '/citizen/rewards' },
  ];

  const navItems = userType === 'ADMIN' ? adminNavItems : citizenNavItems;
  const portalName = userType === 'ADMIN' ? 'Admin Portal' : 'Citizen Portal';
  const userName = userType === 'ADMIN' ? 'Admin User' : 'Rajesh Kumar';
  const userFallback = userType === 'ADMIN' ? 'AD' : 'RK';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="flex h-16 items-center px-6 gap-6">
        {/* Brand/Switcher */}
        <div className="flex items-center gap-2 font-bold shrink-0">
          <Truck className="size-5 text-primary" />
          <span className="text-lg tracking-tight">WasteFlow</span>
          <span className="text-xs font-normal text-muted-foreground px-2 py-0.5 rounded-full bg-muted">
            {portalName}
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && item.href !== '/citizen/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-foreground',
                  isActive ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="ml-auto flex items-center gap-4">
          {/* Search Box */}
          <div className="relative hidden sm:block w-48 md:w-64">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search..."
              className="w-full bg-muted/50 pl-8 pr-3 py-1.5 text-sm rounded-md border border-input focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          {/* Theme Toggle */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="size-9 rounded-md"
              title={isDark ? 'Light Mode' : 'Dark Mode'}
            >
              {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
          )}

          {/* User Nav Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative size-8 rounded-full p-0">
                <Avatar className="size-8">
                  <AvatarFallback className="text-xs bg-muted font-medium text-foreground">
                    {userFallback}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium leading-none">{userName}</p>
                  <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  href={userType === 'ADMIN' ? '/admin/settings' : '/citizen/settings'}
                  className="w-full flex items-center cursor-pointer"
                >
                  <Settings className="size-4 mr-2" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              {userType === 'CITIZEN' && (
                <DropdownMenuItem asChild>
                  <Link href="/citizen/rewards" className="w-full flex items-center cursor-pointer">
                    <Award className="size-4 mr-2" />
                    <span>Rewards</span>
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                <LogOut className="size-4 mr-2" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
