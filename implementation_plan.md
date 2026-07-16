# Implementation Plan — Appwrite Authentication Integration

This plan details the implementation of a full-fledged authentication flow (Signup & Login) using Appwrite Auth and the custom form layouts provided.

---

## Proposed Changes

### Component Layer

#### [NEW] [field.tsx](file:///e:/internal26/components/ui/field.tsx)
Create the missing `@/components/ui/field` components to support the `Field`, `FieldGroup`, `FieldLabel`, and `FieldDescription` structure used in the forms.

```tsx
import * as React from "react";
import { cn } from "@/lib/utils";

export interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {}
export const Field = React.forwardRef<HTMLDivElement, FieldProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("space-y-2 w-full", className)} {...props} />
  )
);
Field.displayName = "Field";

export interface FieldGroupProps extends React.HTMLAttributes<HTMLDivElement> {}
export const FieldGroup = React.forwardRef<HTMLDivElement, FieldGroupProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("space-y-4 w-full", className)} {...props} />
  )
);
FieldGroup.displayName = "FieldGroup";

export interface FieldLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}
export const FieldLabel = React.forwardRef<HTMLLabelElement, FieldLabelProps>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground",
        className
      )}
      {...props}
    />
  )
);
FieldLabel.displayName = "FieldLabel";

export interface FieldDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}
export const FieldDescription = React.forwardRef<HTMLParagraphElement, FieldDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-[0.8rem] text-muted-foreground", className)}
      {...props}
    />
  )
);
FieldDescription.displayName = "FieldDescription";
```

---

### Appwrite Auth Service Integration

#### [MODIFY] [client.ts](file:///e:/internal26/src/services/appwrite/client.ts)
Introduce an `authService` wrapper that interacts with Appwrite's client-side SDK.

```typescript
export const authService = {
  // Check if session exists and return current user + role
  async getCurrentUser() {
    try {
      const user = await account.get();
      
      // Determine user role
      // 1. Try checking the citizen collection first
      try {
        const citizenDoc = await databases.getDocument(DATABASE_ID, 'citizens', user.$id);
        if (citizenDoc) return { user, role: 'CITIZEN' as const };
      } catch (e) {
        // Not a citizen
      }

      // 2. Try checking the workers collection
      try {
        const workerDoc = await databases.getDocument(DATABASE_ID, 'workers', user.$id);
        if (workerDoc) return { user, role: workerDoc.role as 'ADMIN' | 'WORKER' | 'COLLECTOR' };
      } catch (e) {
        // Not a worker
      }

      return { user, role: 'CITIZEN' as const }; // Fallback
    } catch (error) {
      return null;
    }
  },

  // Log in using Email & Password
  async login(email: string, password: string) {
    // Delete any existing session first
    try {
      await account.deleteSession('current');
    } catch (e) {}
    
    await account.createEmailPasswordSession(email, password);
    return this.getCurrentUser();
  },

  // Sign up a new Citizen
  async signupCitizen(email: string, password: string, name: string, wardCode: string = "W01") {
    // 1. Create Appwrite Auth User
    const userId = ID.unique();
    await account.create(userId, email, password, name);
    
    // 2. Log in to create a session immediately
    await account.createEmailPasswordSession(email, password);

    // 3. Create the corresponding profile in citizens collection
    await databases.createDocument(DATABASE_ID, 'citizens', userId, {
      email,
      name,
      phone: "0000000000", // Placeholder to satisfy schema
      ward: "Ward 01 – Shivaji Nagar", // Default/derived ward
      wardCode,
      address: "Registration Address",
      rewardPoints: 0,
      completedSurveys: 0,
      complaintsFiled: 0,
      complianceScore: 100,
      createdAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
    });

    return this.getCurrentUser();
  },

  // Log out current session
  async logout() {
    await account.deleteSession('current');
  }
};
```

---

### Pages & Routes

#### [NEW] [page.tsx](file:///e:/internal26/app/login/page.tsx)
Implement the Login Page. It will house the `LoginForm` component.
- Integrate state tracking for Form inputs.
- Call `authService.login(email, password)`.
- Upon successful login, trigger the Zustand `useUserStore.login(...)` action and redirect to either `/citizen/dashboard` or `/admin/dashboard` depending on user role.
- Handle OAuth callback via `account.createOAuth2Session(Provider.Google, ...)` if Google signup is initiated.

#### [NEW] [page.tsx](file:///e:/internal26/app/signup/page.tsx)
Implement the Signup Page. It will house the `SignupForm` component.
- Validate matching passwords.
- Call `authService.signupCitizen(email, password, name)`.
- Create the Appwrite user + parallel database entry in the `citizens` collection.
- Upon completion, auto-login the user and redirect them to `/citizen/dashboard`.

---

### Protected Route Guards

#### [MODIFY] [layout.tsx](file:///e:/internal26/app/citizen/layout.tsx) & [layout.tsx](file:///e:/internal26/app/admin/layout.tsx)
Remove the hardcoded default mock auto-login triggers and replace them with real session checks:
1. Call `authService.getCurrentUser()` to verify active login.
2. If session exists, call Zustand `useUserStore.login(...)` to sync global state.
3. If no session exists or user role doesn't match, redirect to `/login`.

---

## Open Questions

> [!IMPORTANT]
> 1. **Role Identification**: Appwrite handles roles using either database lookups (which collections the user exists in) or Appwrite Teams (e.g. checking if user is in `admins` team). In this plan, we check databases first. Do you prefer using **Appwrite Teams** instead?
> 2. **OAuth Setup**: Do you want Google OAuth login functional with redirect URIs configured in Appwrite, or should they remain mock buttons for now?
> 3. **Ward Selection on Signup**: Citizens need a `wardCode` in their profile. Should the signup page include a simple dropdown selector for Wards (e.g. W01 - W06), or default to W01?

---

## Verification Plan

### Automated/Manual Validation
1. **Signup Test**: Create a citizen user with name, email, and password. Verify they are added to Appwrite Auth and the `citizens` database collection.
2. **Login Test**: Authenticate as the newly created citizen and verify redirection to `/citizen/dashboard`.
3. **Route Protection Test**: Try visiting `/citizen/dashboard` or `/admin/dashboard` directly in an incognito window. Verify redirection to `/login`.
