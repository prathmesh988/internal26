'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertBanner } from '@/components/shared';
import { PageTransition, AnimatedSuccess, AnimatedButton, AnimatedFormInput } from '@/components/animated';
import { toast } from '@/components/toast-provider';
import { useAsyncAction, useWards } from '@/hooks';
import { complaintService } from '@/services/appwrite/client';
import { FileText, MapPin, AlertCircle, Send } from 'lucide-react';

export default function FileComplaintPage() {
  const router = useRouter();
  const { data: wardsData } = useWards();
  const wards = wardsData || [];

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
    (data: any) => complaintService.create({
      ...data,
      filedByCitizenId: 'citizen-001',
      status: 'OPEN',
      escalationCount: 0,
    }),
    {
      onSuccess: () => {
        setSubmitted(true);
        setTimeout(() => router.push('/citizen/my-complaints'), 2000);
      },
    }
  );

  const handleChange = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

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
      <PageTransition>
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <motion.div
                    className="mb-4 flex justify-center"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.6, repeat: 2 }}
                  >
                    <motion.div
                      className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center"
                      initial={{ rotate: -180, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      transition={{ duration: 0.6 }}
                    >
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                      >
                        <FileText className="w-8 h-8 text-green-600" />
                      </motion.div>
                    </motion.div>
                  </motion.div>
                  <motion.h2
                    className="text-2xl font-bold text-slate-900 mb-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    Complaint Submitted!
                  </motion.h2>
                  <motion.p
                    className="text-slate-600 mb-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    Thank you for reporting this issue. Your complaint has been received and assigned a reference number.
                  </motion.p>
                  <motion.p
                    className="text-sm text-slate-500"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    Redirecting to your complaints...
                  </motion.p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">File a Complaint</h1>
        <p className="text-slate-600">Help us keep your ward clean by reporting issues</p>
      </div>

      {/* Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Tips for Filing a Complaint</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Provide clear and specific details about the issue</li>
                <li>• Include the exact location of the problem</li>
                <li>• Select the appropriate category</li>
                <li>• Higher priority complaints are addressed faster</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Complaint Details</CardTitle>
          <CardDescription>All fields marked with * are required</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Brief summary of the issue"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={100}
              />
              <p className="text-xs text-slate-500 mt-1">{formData.title.length}/100</p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Provide detailed information about the issue"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-slate-500 mt-1">{formData.description.length}/500</p>
            </div>

            {/* Ward */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Ward *
              </label>
              <select
                name="wardCode"
                value={formData.wardCode}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select your ward</option>
                {['W01', 'W02', 'W03', 'W04', 'W05', 'W06'].map(w => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Location Details
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Street name, landmark, or nearby location"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="MISSED_PICKUP">Missed Pickup</option>
                <option value="OVERFLOW">Overflow/Overflowing Bins</option>
                <option value="SPILL">Spillage</option>
                <option value="ILLEGAL_DUMPING">Illegal Dumping</option>
                <option value="SEGREGATION">Segregation Issue</option>
                <option value="VEHICLE_ISSUE">Vehicle/Equipment Issue</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Priority Level
              </label>
              <div className="flex gap-3">
                {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, priority: p }))}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      formData.priority === p
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {formData.priority === 'CRITICAL' && 'Will be addressed within 4 hours'}
                {formData.priority === 'HIGH' && 'Will be addressed within 24 hours'}
                {formData.priority === 'MEDIUM' && 'Will be addressed within 48 hours'}
                {formData.priority === 'LOW' && 'Will be addressed within 72 hours'}
              </p>
            </div>

            {/* Error */}
            {error && (
              <AlertBanner
                type="error"
                title="Error"
                message={error as string}
              />
            )}

            {/* Submit */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Submitting...' : 'Submit Complaint'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
    </PageTransition>
  );
}
