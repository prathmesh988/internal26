'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Truck,
  AlertCircle,
  BarChart3,
  Users,
  Map,
  Zap,
  TrendingUp,
  Shield,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Navigation */}
      <nav className="border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-slate-900 dark:text-white">WasteFlow</span>
          </div>
          <div className="flex gap-4">
            <Link href="/citizen/dashboard">
              <Button variant="ghost">Citizen Portal</Button>
            </Link>
            <Link href="/admin/dashboard">
              <Button>Admin Dashboard</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl font-bold tracking-tight text-slate-900 dark:text-white mb-6">
              Smart Waste Management for Modern Cities
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
              Automate complaint resolution, optimize collection routes, and engage citizens in building cleaner communities. 
              Real-time operational visibility for municipal waste management.
            </p>
            <div className="flex gap-4">
              <Link href="/citizen/dashboard">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  File a Complaint
                </Button>
              </Link>
              <Link href="/admin/dashboard">
                <Button size="lg" variant="outline">
                  Operations Dashboard
                </Button>
              </Link>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg h-96 flex items-center justify-center">
            <Truck className="w-32 h-32 text-white opacity-50" />
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="bg-slate-50 dark:bg-slate-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12 text-slate-900 dark:text-white">
            Core Features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Complaint Automation */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <AlertCircle className="w-8 h-8 text-red-500 mb-3" />
                <CardTitle>Complaint Automation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-400">
                  AI-powered routing, automatic escalation, and real-time status tracking for citizen complaints.
                </p>
              </CardContent>
            </Card>

            {/* Route Optimization */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Map className="w-8 h-8 text-green-500 mb-3" />
                <CardTitle>Route Monitoring</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-400">
                  Real-time GPS tracking, route deviation alerts, and checkpoint monitoring for all vehicles.
                </p>
              </CardContent>
            </Card>

            {/* Operational Dashboards */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <BarChart3 className="w-8 h-8 text-blue-500 mb-3" />
                <CardTitle>Live Dashboards</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-400">
                  Real-time analytics, compliance monitoring, and worker performance metrics at a glance.
                </p>
              </CardContent>
            </Card>

            {/* Citizen Engagement */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="w-8 h-8 text-purple-500 mb-3" />
                <CardTitle>Citizen Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-400">
                  Reward points, segregation tracking, and community participation scoring system.
                </p>
              </CardContent>
            </Card>

            {/* Workflow Automation */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Zap className="w-8 h-8 text-yellow-500 mb-3" />
                <CardTitle>Workflow Automation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-400">
                  N8n-style workflow triggers, escalations, notifications, and automated actions.
                </p>
              </CardContent>
            </Card>

            {/* Compliance Tracking */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Shield className="w-8 h-8 text-orange-500 mb-3" />
                <CardTitle>Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-400">
                  Ward-wise compliance scores, violation tracking, and enforcement audits.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Key Metrics */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl font-bold text-center mb-12 text-slate-900 dark:text-white">
          System Capabilities
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">150+</div>
            <div className="text-slate-600 dark:text-slate-400">Active Complaints</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">6</div>
            <div className="text-slate-600 dark:text-slate-400">Ward Coverage</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">50+</div>
            <div className="text-slate-600 dark:text-slate-400">Active Workers</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-600 mb-2">25</div>
            <div className="text-slate-600 dark:text-slate-400">Vehicles</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Modernize Your Waste Management?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join hundreds of municipalities using WasteFlow to automate operations and improve citizen satisfaction.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/citizen/dashboard">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                Citizen Dashboard
              </Button>
            </Link>
            <Link href="/admin/dashboard">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-blue-700">
                Admin Portal
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white">Integration</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white">API</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white">Terms</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-200 dark:border-slate-800 pt-8 flex items-center justify-between">
            <p className="text-sm text-slate-600 dark:text-slate-400">© 2026 WasteFlow. All rights reserved.</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Made for Smart Cities</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
