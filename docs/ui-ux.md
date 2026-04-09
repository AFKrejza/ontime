# OnTime Web App UI/UX Documentation

## Overview
The OnTime web app provides a comprehensive interface for managing tower devices, scheduling assignments, and monitoring system status. This document outlines the user interface design, screen flows, and interaction patterns.

## Design System
- **Theme**: Matte black/gray/red color scheme with white backgrounds
- **Typography**: Clean, modern fonts with clear hierarchy
- **Components**: Card-based layouts, consistent button styles, form inputs
- **Navigation**: Top navigation bar with breadcrumbs, bottom action buttons

## Screens

### Welcome Screen (`/`)
**Purpose**: Introduce the app and guide new users to get started
**Elements**:
- Hero section with app branding
- Feature cards highlighting key capabilities
- Call-to-action buttons for Login/Sign Up
**Actions**:
- Navigate to Login or Sign Up
**Navigation**: Links to authentication flows

### Login Screen (`/login`)
**Purpose**: Authenticate existing users
**Elements**:
- Email/password input fields
- Remember me checkbox
- Login button
- Link to Sign Up
**Actions**:
- Validate credentials
- Navigate to Device Connect on success
**Navigation**: To Sign Up, back to Welcome

### Sign Up Screen (`/signup`)
**Purpose**: Register new user accounts
**Elements**:
- Name, email, password fields
- Password confirmation
- Terms acceptance
- Sign Up button
- Link to Login
**Actions**:
- Validate input, create account
- Navigate to Device Connect
**Navigation**: To Login, back to Welcome

### Device Connect Screen (`/device-connect`)
**Purpose**: Link physical tower device to user account
**Elements**:
- Instructions for device setup
- Device code input field
- Connect/Skip buttons
**Actions**:
- Validate device code
- Establish device connection
- Navigate to Dashboard
**Navigation**: To Dashboard (skip), back to previous

### Dashboard Screen (`/dashboard`)
**Purpose**: Main overview of devices and system status
**Elements**:
- Device summary cards
- Quick action buttons
- Status indicators
- Navigation to detailed views
**Actions**:
- View device details
- Navigate to Tower or Settings
**Navigation**: To Tower management, Settings

### Tower Screen (`/tower`)
**Purpose**: Manage individual tower device operations
**Elements**:
- Device status display
- Assignment scheduling
- Stop management
- Control buttons
**Actions**:
- Create/edit assignments
- Monitor device status
- Update configurations
**Navigation**: Back to Dashboard

### Settings Screen (`/settings`)
**Purpose**: User account and app preferences
**Elements**:
- Account information
- Device preferences
- App settings
- About section
**Actions**:
- Update profile
- Configure preferences
- View app information
**Navigation**: Back to Dashboard

## User Flows

### New User Onboarding
1. Welcome → Sign Up → Device Connect → Dashboard

### Existing User Login
1. Welcome → Login → Device Connect (if needed) → Dashboard

### Device Management
1. Dashboard → Tower → Configure assignments/stops

### Account Management
1. Dashboard → Settings → Update preferences

## Interaction Patterns
- **Forms**: Real-time validation, clear error messages
- **Navigation**: Consistent back buttons, breadcrumb trails
- **Feedback**: Loading states, success/error notifications
- **Accessibility**: Keyboard navigation, screen reader support

## Mobile Responsiveness
- Responsive grid layouts
- Touch-friendly button sizes
- Optimized for mobile browsers
- Consistent with Expo mobile app design