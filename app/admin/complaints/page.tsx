'use client';

import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { SiteHeader } from '@/components/site-header';
import { StatusBadge, PriorityBadge } from '@/components/shared';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  Zap,
  ArrowUp,
  ArrowDown,
  Search,
} from 'lucide-react';

const statusStyles: Record<string, string> = {
  PENDING: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  UNDER_REVIEW: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  ASSIGNED: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  IN_PROGRESS: 'bg-sky-500/10 text-sky-600 border-sky-500/20',
  RESOLVED: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  CLOSED: 'bg-muted text-muted-foreground border-border',
  REOPENED: 'bg-pink-500/10 text-pink-600 border-pink-500/20',
};

function getPriorityBadgeClass(priority: string) {
  switch (priority.toUpperCase()) {
    case 'LOW':
      return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
    case 'MEDIUM':
      return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
    case 'HIGH':
      return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
    case 'CRITICAL':
      return 'bg-destructive/10 text-destructive border-destructive/20';
    default:
      return 'bg-secondary text-secondary-foreground';
  }
}

// 25+ detailed mock complaints for testing and display
const initialMockComplaints = [
  { id: 'CMP-2094', citizen: 'Aarav Mehta', category: 'Missed Pickup', ward: 'W03', priority: 'MEDIUM', status: 'PENDING', officer: 'Inspector R. Sen', created: '2026-07-10 09:30', desc: 'Garbage truck did not collect waste from block B lane 2 today.' },
  { id: 'CMP-2081', citizen: 'Priya Sharma', category: 'Overflowing Bins', ward: 'W01', priority: 'CRITICAL', status: 'IN_PROGRESS', officer: 'Officer S. Kulkarni', created: '2026-07-09 14:15', desc: 'Main community bin is overflowing, street dog nuisance starting.' },
  { id: 'CMP-2077', citizen: 'Aditya Gupta', category: 'Illegal Dumping', ward: 'W04', priority: 'HIGH', status: 'ASSIGNED', officer: 'Officer J. Roy', created: '2026-07-09 11:00', desc: 'Construction debris dumped next to the playground.' },
  { id: 'CMP-2065', citizen: 'Neha Verma', category: 'Spillage', ward: 'W02', priority: 'LOW', status: 'RESOLVED', officer: 'Inspector M. Kumar', created: '2026-07-09 08:45', desc: 'Sludge spilled from waste collector truck on Deccan road.' },
  { id: 'CMP-2059', citizen: 'Rohan Deshmukh', category: 'Missed Pickup', ward: 'W05', priority: 'MEDIUM', status: 'UNDER_REVIEW', officer: 'Unassigned', created: '2026-07-08 10:20', desc: 'Missed pickup for society composting bin.' },
  { id: 'CMP-2041', citizen: 'Ananya Iyer', category: 'Overflowing Bins', ward: 'W06', priority: 'CRITICAL', status: 'RESOLVED', officer: 'Officer R. Sen', created: '2026-07-08 07:10', desc: 'Large waste overflow near vegetable market.' },
  { id: 'CMP-2032', citizen: 'Kabir Kapoor', category: 'Illegal Dumping', ward: 'W01', priority: 'HIGH', status: 'PENDING', officer: 'Unassigned', created: '2026-07-07 16:30', desc: 'Plastic bags stacked next to drainage line.' },
  { id: 'CMP-2022', citizen: 'Diya Joshi', category: 'Segregation Issue', ward: 'W03', priority: 'LOW', status: 'ASSIGNED', officer: 'Inspector R. Sen', created: '2026-07-07 11:00', desc: 'Commercial shop mixed plastic waste with wet organic waste.' },
  { id: 'CMP-2015', citizen: 'Vikram Malhotra', category: 'Missed Pickup', ward: 'W02', priority: 'MEDIUM', status: 'REOPENED', officer: 'Officer J. Roy', created: '2026-07-07 09:12', desc: 'Third missed pickup in a row for lane 4.' },
  { id: 'CMP-1999', citizen: 'Sanya Pillai', category: 'Spillage', ward: 'W04', priority: 'LOW', status: 'CLOSED', officer: 'Officer S. Kulkarni', created: '2026-07-06 13:00', desc: 'Wet sludge on road near medical shop.' },
  { id: 'CMP-1988', citizen: 'Rahul Bansal', category: 'Overflowing Bins', ward: 'W05', priority: 'HIGH', status: 'RESOLVED', officer: 'Inspector M. Kumar', created: '2026-07-06 10:45', desc: 'Dumping bin at sector 3 park overflowing.' },
  { id: 'CMP-1976', citizen: 'Meera Nair', category: 'Illegal Dumping', ward: 'W06', priority: 'MEDIUM', status: 'RESOLVED', officer: 'Officer R. Sen', created: '2026-07-05 14:00', desc: 'Tree cuttings dumped on main divider.' },
  { id: 'CMP-1955', citizen: 'Arjun Rao', category: 'Segregation Issue', ward: 'W02', priority: 'LOW', status: 'CLOSED', officer: 'Inspector R. Sen', created: '2026-07-05 09:12', desc: 'Segregation guidelines not followed by apartments.' },
  { id: 'CMP-1940', citizen: 'Ishaan Trivedi', category: 'Missed Pickup', ward: 'W01', priority: 'MEDIUM', status: 'RESOLVED', officer: 'Officer J. Roy', created: '2026-07-04 11:30', desc: 'Weekly bulk collection missed.' },
  { id: 'CMP-1933', citizen: 'Avani Patil', category: 'Spillage', ward: 'W03', priority: 'LOW', status: 'RESOLVED', officer: 'Inspector R. Sen', created: '2026-07-04 09:00', desc: 'Garbage bag leakage on pavement.' },
  { id: 'CMP-1920', citizen: 'Zoya Khan', category: 'Missed Pickup', ward: 'W05', priority: 'MEDIUM', status: 'PENDING', officer: 'Unassigned', created: '2026-07-03 16:15', desc: 'Missed collection from house 44.' },
  { id: 'CMP-1911', citizen: 'Karan Singhal', category: 'Overflowing Bins', ward: 'W02', priority: 'CRITICAL', status: 'IN_PROGRESS', officer: 'Officer J. Roy', created: '2026-07-03 12:45', desc: 'Bin overflowing into main road traffic path.' },
  { id: 'CMP-1902', citizen: 'Alisha Sen', category: 'Illegal Dumping', ward: 'W04', priority: 'HIGH', status: 'RESOLVED', officer: 'Officer S. Kulkarni', created: '2026-07-02 11:20', desc: 'Restaurant dumping kitchen waste behind community center.' },
  { id: 'CMP-1899', citizen: 'Manish Pandey', category: 'Segregation Issue', ward: 'W01', priority: 'LOW', status: 'ASSIGNED', officer: 'Officer S. Kulkarni', created: '2026-07-02 09:00', desc: 'No dry waste collection bins provided.' },
  { id: 'CMP-1888', citizen: 'Tara Deshpande', category: 'Missed Pickup', ward: 'W03', priority: 'MEDIUM', status: 'RESOLVED', officer: 'Inspector R. Sen', created: '2026-07-01 10:10', desc: 'Lane 1 collector did not stop.' },
  { id: 'CMP-1877', citizen: 'Gaurav Das', category: 'Spillage', ward: 'W06', priority: 'LOW', status: 'CLOSED', officer: 'Officer R. Sen', created: '2026-06-30 15:40', desc: 'Liquid waste spillage during bin transfer.' },
  { id: 'CMP-1865', citizen: 'Pooja Hegde', category: 'Overflowing Bins', ward: 'W05', priority: 'HIGH', status: 'PENDING', officer: 'Unassigned', created: '2026-06-30 08:30', desc: 'Market bins are completely full.' },
  { id: 'CMP-1854', citizen: 'Kunal Kapoor', category: 'Illegal Dumping', ward: 'W02', priority: 'HIGH', status: 'IN_PROGRESS', officer: 'Officer J. Roy', created: '2026-06-29 11:00', desc: 'Dumping of medical waste boxes behind bus depot.' }
];

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState(initialMockComplaints);
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);

  // Filters State
  const [filters, setFilters] = useState<any>({
    status: 'ALL',
    priority: 'ALL',
    ward: 'ALL',
    category: 'ALL',
  });

  // Search & Pagination States
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  // Filtered dataset computed at runtime
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      if (filters.status !== 'ALL' && c.status !== filters.status) return false;
      if (filters.priority !== 'ALL' && c.priority !== filters.priority) return false;
      if (filters.ward !== 'ALL' && c.ward !== filters.ward) return false;
      if (filters.category !== 'ALL' && c.category.toUpperCase().replace(' ', '_') !== filters.category) return false;
      return true;
    });
  }, [complaints, filters]);

  // All complaints list with text search applied
  const allComplaintsList = useMemo(() => {
    return complaints.filter((c) => {
      const matchText = searchTerm.toLowerCase();
      return (
        c.id.toLowerCase().includes(matchText) ||
        c.citizen.toLowerCase().includes(matchText) ||
        c.category.toLowerCase().includes(matchText) ||
        c.officer.toLowerCase().includes(matchText)
      );
    });
  }, [complaints, searchTerm]);

  // Paginated chunk of the all list
  const paginatedAllComplaints = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return allComplaintsList.slice(startIndex, startIndex + itemsPerPage);
  }, [allComplaintsList, page]);

  const totalPages = Math.ceil(allComplaintsList.length / itemsPerPage);

  // Resolving or Escalating actions for mock flow
  const handleUpdateStatus = (id: string, newStatus: string) => {
    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );
    setSelectedComplaint(null);
  };

  const statCards = [
    { label: 'Total', value: complaints.length, trend: '+12.5%', up: true, icon: AlertCircle },
    { label: 'Pending', value: complaints.filter((c) => c.status === 'PENDING').length, trend: '+5%', up: false, icon: Clock },
    { label: 'In Progress', value: complaints.filter((c) => c.status === 'IN_PROGRESS').length, trend: '+8%', up: true, icon: Zap },
    { label: 'Resolved', value: complaints.filter((c) => c.status === 'RESOLVED').length, trend: '+15%', up: true, icon: CheckCircle },
  ];

  return (
    <>
      <SiteHeader title="Complaint Management" />

      <div className="flex flex-1 flex-col">
        <div className="flex flex-col gap-6 py-6 px-4 lg:px-6">

          {/* Stat cards header */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {statCards.map((card) => (
              <Card key={card.label} className="bg-gradient-to-br from-card to-muted/30">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardDescription className="text-sm font-medium">{card.label}</CardDescription>
                    <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold ${
                      card.up ? 'bg-emerald-500/15 text-emerald-600' : 'bg-destructive/10 text-destructive'
                    }`}>
                      {card.up ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
                      {card.trend}
                    </span>
                  </div>
                  <CardTitle className="text-3xl font-bold tabular-nums mt-2">{card.value}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* Tabular datasets block */}
          <Tabs defaultValue="filtered-complaints" className="w-full space-y-4">
            <TabsList>
              <TabsTrigger value="filtered-complaints">Filtered Complaints</TabsTrigger>
              <TabsTrigger value="all-complaints">All Complaints</TabsTrigger>
            </TabsList>

            {/* Filtered Complaints Tab */}
            <TabsContent value="filtered-complaints" className="space-y-4">
              {/* Filters Box */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-base">Filters</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                      <Label>Status</Label>
                      <Select
                        value={filters.status}
                        onValueChange={(val) => setFilters((prev: any) => ({ ...prev, status: val }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ALL">All Statuses</SelectItem>
                          <SelectItem value="PENDING">Pending</SelectItem>
                          <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                          <SelectItem value="ASSIGNED">Assigned</SelectItem>
                          <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                          <SelectItem value="RESOLVED">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label>Priority</Label>
                      <Select
                        value={filters.priority}
                        onValueChange={(val) => setFilters((prev: any) => ({ ...prev, priority: val }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All Priorities" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ALL">All Priorities</SelectItem>
                          <SelectItem value="LOW">Low</SelectItem>
                          <SelectItem value="MEDIUM">Medium</SelectItem>
                          <SelectItem value="HIGH">High</SelectItem>
                          <SelectItem value="CRITICAL">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label>Ward</Label>
                      <Select
                        value={filters.ward}
                        onValueChange={(val) => setFilters((prev: any) => ({ ...prev, ward: val }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All Wards" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ALL">All Wards</SelectItem>
                          {['W01', 'W02', 'W03', 'W04', 'W05', 'W06'].map((w) => (
                            <SelectItem key={w} value={w}>{w}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label>Category</Label>
                      <Select
                        value={filters.category}
                        onValueChange={(val) => setFilters((prev: any) => ({ ...prev, category: val }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ALL">All Categories</SelectItem>
                          <SelectItem value="MISSED_PICKUP">Missed Pickup</SelectItem>
                          <SelectItem value="OVERFLOWING_BINS">Overflowing Bins</SelectItem>
                          <SelectItem value="SPILLAGE">Spillage</SelectItem>
                          <SelectItem value="ILLEGAL_DUMPING">Illegal Dumping</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFilters({ status: 'ALL', priority: 'ALL', ward: 'ALL', category: 'ALL' })}
                    >
                      Reset Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Filtered list table */}
              <Card>
                <CardHeader>
                  <CardTitle>Filtered Results</CardTitle>
                  <CardDescription>Reviewing {filteredComplaints.length} complaints matching criteria</CardDescription>
                </CardHeader>
                <CardContent>
                  {filteredComplaints.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-2">
                      <Search className="size-8 text-muted-foreground/40" />
                      <p className="text-sm font-medium">No matching complaints</p>
                      <p className="text-xs text-muted-foreground">Adjust filters to broaden search</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Complaint ID</TableHead>
                            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</TableHead>
                            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Citizen</TableHead>
                            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Ward</TableHead>
                            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Priority</TableHead>
                            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Assigned Officer</TableHead>
                            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</TableHead>
                            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Created</TableHead>
                            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider w-[60px]">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredComplaints.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell className="font-mono text-xs font-semibold">{item.id}</TableCell>
                              <TableCell>{item.category}</TableCell>
                              <TableCell className="font-medium">{item.citizen}</TableCell>
                              <TableCell>{item.ward}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className={getPriorityBadgeClass(item.priority)}>
                                  {item.priority}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground">{item.officer}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className={statusStyles[item.status] || ''}>
                                  {item.status.replace(/_/g, ' ')}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground text-xs">{item.created}</TableCell>
                              <TableCell>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button size="sm" variant="outline" onClick={() => setSelectedComplaint(item)}>
                                      <Eye className="size-3.5" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-md">
                                    <DialogHeader>
                                      <DialogTitle>Inspect Complaint</DialogTitle>
                                      <DialogDescription>Review detailed feedback and coordinate officers</DialogDescription>
                                    </DialogHeader>
                                    {selectedComplaint && (
                                      <div className="space-y-4 pt-2">
                                        <div className="space-y-1">
                                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Citizen / Category</p>
                                          <p className="text-sm font-semibold">{selectedComplaint.citizen} · {selectedComplaint.category}</p>
                                        </div>
                                        <div className="space-y-1">
                                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Detailed Description</p>
                                          <p className="text-sm text-muted-foreground leading-normal">{selectedComplaint.desc}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                          <div className="space-y-1">
                                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Assigned Officer</p>
                                            <p className="text-sm">{selectedComplaint.officer}</p>
                                          </div>
                                          <div className="space-y-1">
                                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</p>
                                            <StatusBadge status={selectedComplaint.status} />
                                          </div>
                                        </div>
                                        {selectedComplaint.status !== 'RESOLVED' && (
                                          <div className="flex gap-2 pt-2 border-t">
                                            <Button size="sm" onClick={() => handleUpdateStatus(selectedComplaint.id, 'RESOLVED')}>
                                              Mark Resolved
                                            </Button>
                                            <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(selectedComplaint.id, 'IN_PROGRESS')}>
                                              Start Operations
                                            </Button>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </DialogContent>
                                </Dialog>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* All Complaints Tab */}
            <TabsContent value="all-complaints" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
                  <div>
                    <CardTitle>Master Registry</CardTitle>
                    <CardDescription>Complete registry log of all submitted citizen issues.</CardDescription>
                  </div>
                  <div className="flex items-center gap-2 max-w-xs w-full">
                    <Search className="size-4 text-muted-foreground absolute ml-3" />
                    <Input
                      placeholder="Search complaints..."
                      value={searchTerm}
                      onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                      className="pl-9"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  {paginatedAllComplaints.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-2">
                      <Search className="size-8 text-muted-foreground/40" />
                      <p className="text-sm font-medium">No results found</p>
                      <p className="text-xs text-muted-foreground">Adjust text filters</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Complaint ID</TableHead>
                            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</TableHead>
                            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Citizen</TableHead>
                            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Ward</TableHead>
                            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Priority</TableHead>
                            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Assigned Officer</TableHead>
                            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</TableHead>
                            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Created</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedAllComplaints.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell className="font-mono text-xs font-semibold">{item.id}</TableCell>
                              <TableCell>{item.category}</TableCell>
                              <TableCell className="font-medium">{item.citizen}</TableCell>
                              <TableCell>{item.ward}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className={getPriorityBadgeClass(item.priority)}>
                                  {item.priority}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground">{item.officer}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className={statusStyles[item.status] || ''}>
                                  {item.status.replace(/_/g, ' ')}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground text-xs">{item.created}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {/* Pagination control footer */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-4 border-t">
                      <p className="text-xs text-muted-foreground">Page {page} of {totalPages}</p>
                      <div className="flex gap-1.5">
                        <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
                          Previous
                        </Button>
                        {Array.from({ length: totalPages }).map((_, i) => (
                          <Button key={i} size="sm" variant={page === i + 1 ? 'default' : 'outline'} onClick={() => setPage(i + 1)}>
                            {i + 1}
                          </Button>
                        ))}
                        <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

        </div>
      </div>
    </>
  );
}
