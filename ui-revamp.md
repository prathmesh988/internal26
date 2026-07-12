# UI Polish & Design System Alignment

## Objective

Make the entire application feel indistinguishable from a production-quality **shadcn/ui** application. Use the official shadcn/ui design language as the single source of truth for visual consistency and interactions.

---

# Reference Extraction (Required)

**Do not use screenshots.**

Instead:

1. Crawl the following page.
2. Use **DOM extraction / HTML snapshot** instead of screenshots to minimize token usage.
3. Extract and analyze:
   - DOM structure
   - CSS classes
   - Layout hierarchy
   - Typography scale
   - Spacing scale
   - Design tokens
   - Component composition
   - Hover states
   - Active states
   - Focus states
   - Transition timings
   - Animation curves
4. Reuse the extracted design patterns throughout the application.
5. Do **not** copy the page verbatim. Instead, infer the design system and apply it consistently.

**Reference**

https://ui.shadcn.com/blocks

---

# Theme & Color System

The application should support both Light and Dark themes with consistent behavior.

## Text Selection

The text selection experience should adapt to the active theme.

### Light Mode

- Selected text color should be **black**.
- Selection background should remain accessible and consistent with shadcn.

### Dark Mode

- Selected text color should be **white**.
- Selection background should remain accessible and consistent with shadcn.

Apply this behavior globally across the application.

---

# Microinteractions

Every interactive element should behave like an official shadcn component.

This includes:

- Buttons
- Inputs
- Cards
- Sidebar items
- Dropdowns
- Menus
- Dialogs
- Tooltips
- Navigation items
- Checkboxes
- Switches
- Selects
- Tabs
- Tables
- Links

Ensure consistency for:

- Hover states
- Active states
- Pressed states
- Focus-visible rings
- Keyboard navigation
- Cursor behavior
- Disabled states
- Loading states
- Transition durations
- Animation easing
- Elevation changes
- Opacity transitions
- Color interpolation

No interaction should feel custom or inconsistent.

---

# Layout Consistency

Adopt a single spacing system across the application.

Requirements:

- Use a consistent 4px / 8px spacing scale.
- Maintain equal spacing between cards.
- Maintain equal spacing between sections.
- Maintain equal spacing between sidebar elements.
- Keep internal padding consistent.
- Align content to a common layout grid.
- Maintain consistent vertical rhythm.
- Avoid arbitrary spacing values.

The interface should feel balanced and predictable.

---

# Sidebar

The sidebar should have polished interaction behavior.

Requirements:

- Equal spacing between every sidebar item.
- Active item should remain visually separated from surrounding items.
- Hovered items should never visually merge with the selected item.
- Selected, hovered, and focused states must all remain visually distinct.
- Preserve comfortable breathing room between items.
- Use smooth transitions matching shadcn timing.

---

# Cards

Ensure all cards follow a unified design language.

Requirements:

- Consistent padding.
- Consistent border radius.
- Consistent border color.
- Consistent shadow elevation.
- Equal spacing between cards.
- Consistent hover animations.
- Consistent typography hierarchy.

---

# Typography

Standardize typography across the application.

Ensure consistency for:

- Font sizes
- Font weights
- Line heights
- Letter spacing
- Heading hierarchy
- Paragraph spacing
- Label styling
- Helper text
- Error text

Typography should follow shadcn conventions.

---

# Visual Consistency Audit

Perform a full UI audit and eliminate inconsistencies, including:

- Uneven spacing
- Misaligned elements
- Inconsistent component heights
- Different border radii
- Inconsistent icon sizing
- Uneven padding
- Uneven margins
- Different shadow styles
- Different transition durations
- Inconsistent hover behavior
- Inconsistent focus rings
- Inconsistent disabled states
- Typography inconsistencies

The final interface should feel cohesive and professionally designed.

---

# Acceptance Criteria

The application should satisfy the following:

- Behaves like a native shadcn/ui application.
- Uses a consistent spacing system throughout.
- Maintains consistent typography across all views.
- Maintains consistent component sizing.
- Supports accessible Light and Dark themes.
- Uses theme-aware text selection colors.
- Provides polished and consistent microinteractions.
- Ensures sidebar interactions remain visually separated and easy to understand.
- Eliminates all visual inconsistencies.
- Feels production-ready without requiring additional UI polish.