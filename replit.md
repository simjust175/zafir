# Billio - Invoice Management System

## Overview
Billio is an enterprise-grade invoice management application with a Vue.js/Vuetify frontend and a Node.js/Express backend. The system includes email integration for automatic invoice processing, real-time updates via Socket.io, and a MySQL database.

## Project Structure
```
.
├── front/                 # Vue.js Frontend (Vite + Vuetify)
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/    # AppShell, ModernAppBar, ModernSidebar, RightPanel
│   │   │   ├── ui/        # Reusable components (StatCard, LoadingState, EmptyState, GlobalToast)
│   │   │   ├── MainPage/  # Dashboard components
│   │   │   ├── Projects/  # ProjectCard, ProjectDash, AddNewProject
│   │   │   └── Utilities/ # DataTable, ManageUsers, other utilities
│   │   ├── pages/         # Page views (analytics, projects, users, table, etc.)
│   │   ├── stores/        # Pinia stores (invoiceState, loginState)
│   │   ├── plugins/       # Vue plugins (vuetify, i18n)
│   │   ├── styles/        # Global SCSS styles and design system
│   │   └── router/        # Vue Router config with dev mode bypass
│   └── vite.config.mjs    # Vite configuration
│
├── Server/                # Express.js Backend
│   ├── Controllers/       # Route controllers
│   ├── Database/          # MySQL database config
│   ├── email-service/     # Email processing (IMAP)
│   ├── Login_system/      # Authentication
│   ├── Routers/           # API routes
│   ├── Services/          # Business logic
│   └── app.js             # Main entry point
│
└── email-service/         # Email downloads storage
```

## Running the Application

### Frontend
- Port: 5000
- Command: `cd front && npm run dev`
- Framework: Vue 3 + Vuetify 3 + Vite + ApexCharts

### Backend  
- Port: 3001
- Command: `cd Server && npm start`
- Framework: Express.js + Socket.io

## Environment Variables (Backend)
The backend requires the following environment variables:
- `DB_HOST` - MySQL database host
- `DB_USER` - Database username
- `DB_PASSWORD` - Database password
- `DB_DATABASE` - Database name
- `DB_PORT` - Database port
- `PORT` - Backend server port (defaults to 3001)

## Design System

### Color Palette
- **Primary**: Indigo (#6366F1) - Used for primary actions, links, and active states
- **Secondary**: Purple (#8B5CF6) - Used for secondary accents and highlights
- **Success**: Green (#22C55E) - Positive states, payments received
- **Warning**: Amber (#F59E0B) - Pending items, attention needed
- **Error**: Red (#EF4444) - Overdue, errors
- **Background**: Light gray (Slate 50-100) - Clean, professional backdrop
- **Surface**: White - Cards, dialogs, and elevated surfaces
- **Grays**: Slate scale from 50-900 for text and borders

### Typography
- **Font Family**: Inter, system-ui fallback
- **Headings**: 600-700 weight, Slate 900
- **Body**: 400 weight, Slate 600-700
- **Scale**: 12px to 30px with consistent hierarchy

### Components
- **Cards**: 16-20px border radius, subtle borders, elevation on hover
- **Buttons**: Rounded-lg (12px), clear hierarchy (primary/secondary/ghost)
- **Inputs**: Clean borders, focus rings, consistent padding
- **Tables**: Modern headers, hover states, responsive design
- **Charts**: ApexCharts with gradient fills and smooth curves
- **Transitions**: 150-300ms ease for smooth interactions

## Pages

### Dashboard (/)
- KPI cards with trend indicators
- Recent invoices list
- Alerts section
- Quick actions

### Analytics (/analytics)
- Revenue metrics with trend badges
- Total invoiced/payments/outstanding cards
- Revenue overview area chart
- Payment status donut chart
- Top projects by revenue
- Recent transactions list
- Date range filters (Week/Month/Year)

### Projects (/projects)
- Project cards with progress tracking
- Payment percentage and status
- Invoice count per project
- Empty state for new users
- Add project dialog

### Invoices (/table)
- Split-view with project sidebar
- Invoice data table per project
- Search and filter functionality
- Export/Print options

### Team Management (/users)
- Searchable user table
- User status indicators
- Add/Edit/Delete user functionality
- Modern dialog forms

## Recent Changes
- 2026-01-12: Production Readiness Audit
  - **Demo/Mock Data Removal:**
    - Removed hardcoded revenue chart data in analytics (now uses real data from store)
    - Removed hardcoded trend percentages from dashboard stat cards
    - Fixed invoice upload to use actual backend extraction instead of mock data
    - Replaced "Sample Supplier BV" mock data with real API extraction
  - **UI/Messaging Polish:**
    - Changed "Btw" label to "VAT Rate" for clarity
    - Changed "Thanks for double checking!" to "Invoice verified successfully"
    - Changed "Not all invoices are double-checked" to "Invoices Pending Verification"
    - Removed emoji prefixes from warning dialogs for professional appearance
    - Cleaned up debug console.log statements throughout components
  - **Calculation Verification:**
    - Verified margin calculation: amount * (1 + margin/100) per invoice
    - Verified VAT handling: btwPercent stored per invoice, net amount recalculated when VAT changes
    - Verified totals: sum of individual invoice amounts with margin applied
    - Outstanding calculation: totalInvoiced - totalPayments
    - Payment progress: (paid / invoiced) * 100

- 2026-01-11: Full-Stack Stability Audit
  - **Server-side crash prevention:**
    - Fixed SQL injection vulnerability in Amount.getPayments() with table whitelist
    - Fixed geMultipleFiltered controller method signature (missing req parameter)
    - Added proper destructuring guards for database results in amountService
    - Fixed missing await in registerService.patchUser()
    - Fixed undefined error reference in registerService.patchUser()
    - Added timeout and error handling to email verification route
  - **Client-side stability:**
    - Added try/catch and null guards to getActiveEmails in invoiceState
    - Added null safety to login function in loginState for payload.info.email
    - Fixed ProjectCard edge cases with optional chaining for project arrays
    - Fixed ManageUsers form validation (async validate method)
    - Added error handling to realtimeStore loadInitialData
    - Added graceful degradation for AddNewProject email fetching
  - **Edge case handling:**
    - All fetch calls now handle network errors gracefully
    - Database queries safely handle empty result arrays
    - Components gracefully handle undefined/null props
  - **Security fixes:**
    - Removed password exposure from /invoice/freeEmails API response
    - Sanitized activeEmails response to strip passwords before sending to client
    - Server-side password fields only available to internal IMAP processing

- 2026-01-11: Full-Screen Layout Fix
  - Fixed AppShell to use proper flex layout with fill-height
  - Fixed v-main and v-layout to fill viewport correctly
  - Updated all page components with min-height: 100%
  - Removed fixed height calculations that caused layout issues
  - Applied proper flex-grow and overflow handling
  - Dashboard, Analytics, Projects, Invoices, Team pages all fill screen properly
  - Responsive layout works on laptop and external monitors

- 2026-01-11: Full UI/UX Quality Pass
  - Fixed routing stability with dev mode auth bypass
  - Created new Analytics page with modern charts and metrics
  - Redesigned ProjectCard with progress tracking
  - Modernized ProjectDash with grid layout
  - Updated ManageUsers with searchable table
  - Polished MainDisplayTabs with split-view
  - Fixed ApexCharts double registration warning
  - Resolved EmptyState component naming conflict
  - Consistent design system across all pages

- 2026-01-11: Enterprise UI/UX Modernization
  - Created comprehensive design system with Slate/Indigo palette
  - Built new layout architecture: AppShell, ModernAppBar, ModernSidebar
  - Added right-side panel for announcements and widgets
  - Created reusable UI components: StatCard, LoadingState, EmptyState, GlobalToast
  - Redesigned dashboard with modern KPI cards and charts
  - Updated login page with feature highlights
  - Added graceful error handling for backend unavailability

## User Preferences
- Enterprise-grade, premium design aesthetic (similar to Monday.com, Notion, Linear)
- Clean, modern UI with professional color palette
- Consistent component styling across all pages
- Graceful error handling and loading states
- Dev mode bypasses authentication for easier development

## Notes
- The backend uses MySQL (mysql2) - requires external MySQL database configuration
- Real-time updates handled via Socket.io
- Email processing via IMAP for automatic invoice imports
- Frontend is fully functional without backend (graceful degradation)
- Routing in dev mode bypasses authentication guards for development workflow
