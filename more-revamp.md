# Dashboard UI & Information Architecture

## Objective

Transform the application into a production-quality dashboard inspired by the official **shadcn/ui Dashboard** example. Every page should feel like a real SaaS/admin product rather than an MVP prototype.

Reference:
https://github.com/shadcn-ui/ui/tree/main/apps/v4/app/(app)/examples/dashboard

Use this dashboard as the benchmark for:

- Information hierarchy
- Card layouts
- Table layouts
- Tabs
- Badges
- Hover states
- Empty states
- Typography
- Spacing
- Density
- Status indicators
- Overall polish

---

# Dashboard Philosophy

Whenever a page needs to display multiple related datasets, **do not stack multiple cards vertically**.

Instead:

- Group related datasets inside **Tabs**.
- Each tab should contain its own shadcn Table, Cards, or appropriate content.
- The experience should feel similar to modern dashboards like Linear, GitHub, Stripe, Vercel, or shadcn's own dashboard example.

---

# Citizen Dashboard

Use Tabs to organize content.

## Tabs

### Reading Complaints

Display a shadcn table containing mock complaint data.

Suggested columns:

- Complaint ID
- Category
- Ward
- Priority
- Status
- Assigned To
- Created
- Last Updated

---

### Your Complaints

Display only the logged-in user's complaints.

Suggested columns:

- Complaint
- Category
- Status
- Created On
- Last Activity
- Estimated Resolution

---

# Admin Dashboard

Instead of stacking several cards underneath one another, organize the dashboard into tabs.

## Tabs

### Recent Complaints

Display the latest complaints submitted.

Suggested columns:

- Complaint ID
- Citizen
- Category
- Ward
- Priority
- Status
- Assigned Officer
- Created

---

### Active Vehicles

Display sanitation vehicles currently operating.

Suggested columns:

- Vehicle
- Driver
- Route
- GPS Status
- Last Seen
- Fuel
- Progress
- Status

Include subtle badges like:

- Active
- Idle
- Maintenance

---

### Top Wards

Display ward performance metrics.

Suggested columns:

- Ward
- Total Complaints
- Resolved
- Pending
- Average Resolution Time
- Satisfaction Score

Add subtle ranking indicators.

---

# Admin → Complaints Page

Organize this page using tabs.

## Tabs

### Filtered Complaints

Display complaints based on currently applied filters.

Table columns:

- Complaint ID
- Category
- Citizen
- Ward
- Priority
- Assigned Officer
- Status
- Created

---

### All Complaints

Display the complete complaint list.

Include:

- Pagination
- Search
- Sorting
- Status badges
- Priority badges
- Row hover interactions
- Empty state

---

# Admin → Routes Page

Use Tabs.

## Tabs

### Active Routes

Display routes currently being serviced.

Suggested columns:

- Route Name
- Assigned Vehicle
- Driver
- Start Time
- Completion
- ETA
- Status

---

### All Routes

Display every available route.

Columns:

- Route
- Ward
- Assigned Vehicle
- Total Stops
- Today's Stops
- Completion %
- Last Updated
- Status

---

# Table Design

Every table should follow the shadcn dashboard style.

Include:

- Compact row height
- Comfortable cell padding
- Sticky table headers (where appropriate)
- Responsive layout
- Hover states
- Selected row styling
- Proper typography hierarchy
- Muted secondary information
- Consistent spacing

---

# Status Badges

Use realistic badge variants.

Examples:

Complaint Status

- Pending
- Under Review
- Assigned
- In Progress
- Resolved
- Closed
- Reopened

Priority

- Low
- Medium
- High
- Critical

Vehicle Status

- Active
- Idle
- Offline
- Maintenance

Route Status

- Running
- Completed
- Delayed
- Scheduled

Badge colors should follow the shadcn design language and avoid overly saturated colors.

---

# Mock Data

Populate every page with realistic mock data.

Requirements:

- 15–30 rows per table
- Multiple statuses
- Multiple priorities
- Realistic citizen names
- Vehicle IDs
- Route names
- Ward numbers
- Different timestamps
- Assigned officers
- Resolution times
- GPS states
- Completion percentages

The dashboard should feel populated enough for stakeholders to evaluate the UI without requiring a backend.

---

# Dashboard Polish

Include subtle production-quality details such as:

- Status badges
- Progress bars
- Relative timestamps (e.g., "5 min ago")
- Avatars or initials where appropriate
- Muted metadata
- Hover animations
- Empty states
- Loading skeletons
- Pagination controls
- Search bars
- Filter dropdowns
- Sortable columns
- Consistent iconography
- Proper spacing between controls

---

# Layout Rules

Maintain a consistent layout throughout the application.

- Use an 8px spacing system.
- Equal spacing between cards.
- Equal spacing between tables.
- Equal spacing between sidebar items.
- Consistent container widths.
- Consistent section padding.
- Consistent border radius.
- Consistent shadows.
- Consistent typography scale.

No arbitrary spacing values should exist.

---

# Sidebar

The sidebar should match the polish of the shadcn dashboard.

Requirements:

- Equal spacing between items.
- Hover state should never overlap the selected state.
- Selected item should have breathing room from neighboring items.
- Smooth transitions.
- Proper active indicator.
- Consistent icon alignment.
- Consistent padding.

---

# Microinteractions

Every interactive element should feel native to shadcn/ui.

Apply consistent behavior for:

- Hover
- Active
- Focus-visible
- Keyboard navigation
- Dropdowns
- Tabs
- Buttons
- Tables
- Cards
- Sidebar
- Menus
- Dialogs

Transitions should be subtle, responsive, and consistent across the application.

---

# Acceptance Criteria

The final application should:

- Closely resemble the official shadcn/ui dashboard.
- Organize related datasets using Tabs instead of stacked sections.
- Use polished shadcn Tables across all dashboard pages.
- Include realistic MVP mock data on every page.
- Feature production-quality status badges, metadata, and table interactions.
- Maintain consistent spacing, typography, and visual hierarchy.
- Feel like a complete SaaS/admin dashboard rather than a wireframe or prototype.