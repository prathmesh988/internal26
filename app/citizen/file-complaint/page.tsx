'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import { SiteHeader } from '@/components/site-header';
import { AlertBanner } from '@/components/shared';
import { useAsyncAction, useWards } from '@/hooks';
import { complaintService } from '@/services/appwrite/client';
import { FileText, AlertCircle, CheckCircle2 } from 'lucide-react';

const categories = [
  { label: 'Missed Pickup', value: 'MISSED_PICKUP' },
  { label: 'Overflow/Overflowing Bins', value: 'OVERFLOW' },
  { label: 'Spillage', value: 'SPILL' },
  { label: 'Illegal Dumping', value: 'ILLEGAL_DUMPING' },
  { label: 'Segregation Issue', value: 'SEGREGATION' },
  { label: 'Vehicle/Equipment Issue', value: 'VEHICLE_ISSUE' }
];

const priorities = [
  { label: 'Low (within 72 hours)', value: 'LOW' },
  { label: 'Medium (within 48 hours)', value: 'MEDIUM' },
  { label: 'High (within 24 hours)', value: 'HIGH' },
  { label: 'Critical (within 4 hours)', value: 'CRITICAL' }
];

import { useUserStore } from '@/store';

export default function FileComplaintPage() {
  const router = useRouter();
  const { data: wardsData } = useWards();
  const { userId } = useUserStore();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'MISSED_PICKUP',
    wardCode: '',
    location: '',
    priority: 'MEDIUM',
  });

  const [submitted, setSubmitted] = useState(false);
  const { execute: submitComplaint, loading, error } = useAsyncAction(
    (data: any) => {
      const selectedWard = (wardsData || []).find((w: any) => w.code === data.wardCode);
      const citizenId = userId || 'citizen-001';
      const now = new Date().toISOString();
      return complaintService.create({
        ...data,
        ward: selectedWard ? selectedWard.name : `Ward ${data.wardCode}`,
        citizenId,
        filedByCitizenId: citizenId,
        status: 'OPEN',
        escalationCount: 0,
        createdAt: now,
        updatedAt: now,
      });
    },
    {
      onSuccess: () => {
        setSubmitted(true);
        setTimeout(() => router.push('/citizen/my-complaints'), 2000);
      },
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.wardCode) {
      alert('Please fill all required fields');
      return;
    }
    submitComplaint(formData);
  };

  if (submitted) {
    return (
      <>
        <SiteHeader title="File a Complaint" />
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="max-w-md w-full border-emerald-500/20 bg-emerald-500/5">
            <CardContent className="pt-8 text-center space-y-4">
              <div className="mx-auto size-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="size-6 text-emerald-600" />
              </div>
              <div className="space-y-1.5">
                <CardTitle className="text-xl">Complaint Submitted!</CardTitle>
                <CardDescription>
                  Your report has been successfully recorded. Redirecting to your list...
                </CardDescription>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  const selectedCategory = categories.find(c => c.value === formData.category) || categories[0];
  const selectedPriority = priorities.find(p => p.value === formData.priority) || priorities[1];

  return (
    <>
      <SiteHeader title="File a Complaint" />

      <div className="flex flex-1 flex-col">
        <div className="max-w-2xl w-full mx-auto flex flex-col gap-6 py-6 px-4">

          {/* Tips Info Alert */}
          <div className="flex gap-3 rounded-lg border border-blue-500/15 bg-blue-500/5 px-4 py-3.5">
            <AlertCircle className="size-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-300">Tips for Filing a Complaint</p>
              <ul className="text-xs text-blue-800/80 dark:text-blue-400/80 space-y-1 list-disc pl-4">
                <li>Provide clear and specific details about the issue</li>
                <li>Include exact location details (street name/landmark)</li>
                <li>Select the appropriate category for faster dispatch</li>
              </ul>
            </div>
          </div>

          {/* Form Card */}
          <Card>
            <CardHeader>
              <CardTitle>Complaint Details</CardTitle>
              <CardDescription>Fields marked with * are mandatory</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Title */}
                <div className="space-y-1.5">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Brief summary of the issue (e.g. Overflowing garbage bin)"
                    maxLength={100}
                    required
                  />
                  <div className="flex justify-end">
                    <span className="text-[10px] text-muted-foreground">{formData.title.length}/100</span>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Provide detailed description of the issue..."
                    rows={4}
                    maxLength={500}
                    required
                  />
                  <div className="flex justify-end">
                    <span className="text-[10px] text-muted-foreground">{formData.description.length}/500</span>
                  </div>
                </div>

                {/* Ward */}
                <div className="space-y-1.5">
                  <Label>Ward *</Label>
                  <Select
                    value={formData.wardCode}
                    onValueChange={(val) => setFormData(prev => ({ ...prev, wardCode: val }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your ward" />
                    </SelectTrigger>
                    <SelectContent>
                      {wardsData && wardsData.length > 0 ? (
                        wardsData.map(w => (
                          <SelectItem key={w.code} value={w.code}>
                            {w.code} - {w.name}
                          </SelectItem>
                        ))
                      ) : (
                        ['W01', 'W02', 'W03', 'W04', 'W05', 'W06'].map(w => (
                          <SelectItem key={w} value={w}>{w}</SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Location */}
                <div className="space-y-1.5">
                  <Label htmlFor="location">Location Details</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Street name, landmark, or nearby shop"
                  />
                </div>

                {/* Category (Rebuilt with shadcn Combobox) */}
                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <Combobox
                    items={categories}
                    itemToStringValue={(cat) => cat.label}
                    value={selectedCategory}
                    onValueChange={(val) => {
                      if (val) setFormData(prev => ({ ...prev, category: val.value }));
                    }}
                  >
                    <ComboboxInput placeholder="Select Category" />
                    <ComboboxContent>
                      <ComboboxEmpty>No categories found.</ComboboxEmpty>
                      <ComboboxList>
                        {(cat) => (
                          <ComboboxItem key={cat.value} value={cat}>
                            {cat.label}
                          </ComboboxItem>
                        )}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                </div>

                {/* Priority (Rebuilt with shadcn Combobox) */}
                <div className="space-y-1.5">
                  <Label>Priority Level</Label>
                  <Combobox
                    items={priorities}
                    itemToStringValue={(pri) => pri.label}
                    value={selectedPriority}
                    onValueChange={(val) => {
                      if (val) setFormData(prev => ({ ...prev, priority: val.value }));
                    }}
                  >
                    <ComboboxInput placeholder="Select Priority" />
                    <ComboboxContent>
                      <ComboboxEmpty>No priorities found.</ComboboxEmpty>
                      <ComboboxList>
                        {(pri) => (
                          <ComboboxItem key={pri.value} value={pri}>
                            {pri.label}
                          </ComboboxItem>
                        )}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                </div>

                {/* Error message banner */}
                {error && (
                  <AlertBanner
                    type="error"
                    title="Submission Failed"
                    message={error instanceof Error ? error.message : String(error)}
                  />
                )}

                {/* Buttons */}
                <div className="flex gap-3 pt-3 border-t">
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit Complaint'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

        </div>
      </div>
    </>
  );
}
