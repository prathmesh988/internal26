'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUserStore } from '@/store';
import * as Collapsible from '@radix-ui/react-collapsible';
import {
  LayoutDashboard,
  Navigation,
  AlertCircle,
  MapPin,
  Users,
  Settings,
  HelpCircle,
  Truck,
  BarChart3,
  FileText,
  Award,
  LogOut,
  Sun,
  Moon,
  ChevronDown,
  ChevronRight,
  Store,
  Sparkles,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  children?: NavItem[];
}

const adminNavMain: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
    children: [
      { title: 'Recent Complaints', href: '/admin/dashboard/complaints', icon: AlertCircle },
      { title: 'Fleet Status', href: '/admin/dashboard/fleet', icon: Truck },
      { title: 'Ward Performance', href: '/admin/dashboard/wards', icon: MapPin },
    ],
  },
  { title: 'Fleet Tracking', href: '/admin/tracking', icon: Navigation },
];

const adminNavDocuments: NavItem[] = [
  { title: 'Complaints', href: '/admin/complaints', icon: AlertCircle },
  { title: 'Routes', href: '/admin/routes', icon: MapPin },
  { title: 'Workers', href: '/admin/workers', icon: Users },
];

const adminNavSecondary: NavItem[] = [
  { title: 'Settings', href: '#', icon: Settings },
  { title: 'Help', href: '#', icon: HelpCircle },
];

const citizenNavMain: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/citizen/dashboard',
    icon: LayoutDashboard,
    children: [
      { title: 'Community Complaints', href: '/citizen/dashboard/community', icon: Sparkles },
      { title: 'Your Complaints', href: '/citizen/dashboard/personal', icon: AlertCircle },
    ],
  },
  { title: 'My Complaints', href: '/citizen/my-complaints', icon: AlertCircle },
  { title: 'File Complaint', href: '/citizen/file-complaint', icon: FileText },
  { title: 'Live Tracking', href: '/citizen/tracking', icon: Navigation },
];

const citizenNavDocuments: NavItem[] = [
  { title: 'Rewards', href: '/citizen/rewards', icon: Award },
  { title: 'Scrap Marketplace', href: '/citizen/marketplace', icon: Store },
];

const citizenNavSecondary: NavItem[] = [
  { title: 'Settings', href: '#', icon: Settings },
  { title: 'Help', href: '#', icon: HelpCircle },
];

export function AppSidebarAdmin() {
  return (
    <AppSidebarInner
      navMain={adminNavMain}
      navDocuments={adminNavDocuments}
      navSecondary={adminNavSecondary}
      teamName="WasteFlow Admin"
      userEmail="admin@municipal.gov"
      userName="Admin User"
      userFallback="AD"
    />
  );
}

export function AppSidebarCitizen() {
  return (
    <AppSidebarInner
      navMain={citizenNavMain}
      navDocuments={citizenNavDocuments}
      navSecondary={citizenNavSecondary}
      teamName="WasteFlow Citizen"
      userEmail="citizen@example.com"
      userName="Rajesh Kumar"
      userFallback="RK"
    />
  );
}

function AppSidebarInner({
  navMain,
  navDocuments,
  navSecondary,
  teamName,
  userEmail,
  userName,
  userFallback,
}: {
  navMain: NavItem[];
  navDocuments: NavItem[];
  navSecondary: NavItem[];
  teamName: string;
  userEmail: string;
  userName: string;
  userFallback: string;
}) {
  const pathname = usePathname();
  const { logout } = useUserStore();
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
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

  return (
    <Sidebar variant="inset">
      {/* Header: Team/Logo */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Truck className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{teamName}</span>
                  <span className="truncate text-xs text-sidebar-foreground/60">Municipal Platform</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent>
        {/* Main nav */}
        <SidebarGroup>
          <SidebarGroupLabel>Home</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navMain.map((item) => (
                <CollapsibleNavItem key={`${item.title}-${item.href}`} item={item} pathname={pathname} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Documents/Operations nav */}
        <SidebarGroup>
          <SidebarGroupLabel>Operations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navDocuments.map((item) => (
                <CollapsibleNavItem key={`${item.title}-${item.href}`} item={item} pathname={pathname} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer: Secondary nav + user */}
      <SidebarFooter>
        <SidebarMenu>
          {navSecondary.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title}>
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}

          {/* User dropdown */}
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="size-8 rounded-lg">
                    <AvatarFallback className="rounded-lg text-xs">{userFallback}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{userName}</span>
                    <span className="truncate text-xs text-sidebar-foreground/60">{userEmail}</span>
                  </div>
                  <ChevronDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="size-8 rounded-lg">
                      <AvatarFallback className="rounded-lg text-xs">{userFallback}</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{userName}</span>
                      <span className="truncate text-xs text-muted-foreground">{userEmail}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={toggleTheme} className="cursor-pointer">
                  {isDark ? <Sun className="mr-2 size-4" /> : <Moon className="mr-2 size-4" />}
                  {isDark ? 'Light Mode' : 'Dark Mode'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="mr-2 size-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

// ── Collapsible nav item (with optional children) ─────────────────────────────

function CollapsibleNavItem({ item, pathname }: { item: NavItem; pathname: string }) {
  const isActive = pathname === item.href;
  const hasChildren = item.children && item.children.length > 0;
  const isChildActive = hasChildren && item.children!.some((c) => pathname === c.href);
  const [open, setOpen] = React.useState(isActive || isChildActive);

  // Keep open when navigating to a child
  React.useEffect(() => {
    if (isChildActive) setOpen(true);
  }, [isChildActive]);

  if (!hasChildren) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
          <Link href={item.href}>
            <item.icon />
            <span>{item.title}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    <Collapsible.Root open={open} onOpenChange={setOpen} asChild>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={isActive || isChildActive} tooltip={item.title}>
          <Link href={item.href}>
            <item.icon />
            <span>{item.title}</span>
          </Link>
        </SidebarMenuButton>

        <Collapsible.Trigger asChild>
          <button
            className="absolute right-1 top-1.5 flex size-5 items-center justify-center rounded-md text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            aria-label={open ? 'Collapse' : 'Expand'}
          >
            <ChevronRight
              className={cn(
                'size-3.5 transition-transform duration-200',
                open && 'rotate-90'
              )}
            />
          </button>
        </Collapsible.Trigger>

        <Collapsible.Content className="overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
          <SidebarMenuSub>
            {item.children!.map((child) => {
              const childActive = pathname === child.href;
              return (
                <SidebarMenuSubItem key={child.href}>
                  <SidebarMenuSubButton asChild isActive={childActive} size="sm">
                    <Link href={child.href}>
                      <child.icon />
                      <span>{child.title}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              );
            })}
          </SidebarMenuSub>
        </Collapsible.Content>
      </SidebarMenuItem>
    </Collapsible.Root>
  );
}
