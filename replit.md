# Investment Financing Calculator

## Overview

This is a full-stack web application for calculating investment financing scenarios, loan amortization schedules, and investor returns. The application provides comprehensive financial analysis tools with professional PDF report generation capabilities, specifically designed for banking and investment fund use cases.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript for type safety
- **Styling**: Tailwind CSS with Shadcn/ui component library for consistent UI design
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Charts**: Recharts for data visualization and financial graphs
- **PDF Generation**: jsPDF with autoTable plugin for client-side report generation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL with Neon serverless adapter
- **API Design**: RESTful API with proper error handling and validation
- **Session Management**: Express sessions with PostgreSQL store

### Build System
- **Bundler**: Vite for fast development and optimized production builds
- **Development**: Hot module replacement with Vite dev server
- **Production**: ESBuild for server bundling, static file serving

## Key Components

### Database Schema
- **Users**: Authentication and user management
- **Loans**: Core loan parameters (amount, interest rate, term, frequency)
- **Investors**: Individual investor participation records
- **Payments**: Payment schedule tracking and history

### Financial Calculation Engine
- **Core Calculations**: Monthly payment computation using compound interest formulas
- **Payment Schedules**: Complete amortization schedules with principal/interest breakdown
- **Investor Returns**: Proportional return calculations based on investment amounts
- **Advanced Metrics**: IRR, NPV, ROI, payback periods, and risk assessments

### Report Generation System
- **Payment Reports**: Detailed payment schedules with loan summaries
- **Investor Reports**: Individual investor return statements
- **Banking Reports**: Professional credit analysis, underwriting, and regulatory compliance documents
- **Business Projections**: Quarterly performance forecasts and financial projections

### UI Components
- **Tabbed Interface**: Input parameters, payment schedules, investor returns, summaries, projections, banking reports
- **Setup Wizard**: Guided loan and investor configuration
- **Interactive Charts**: Visual representation of payment schedules and investor returns
- **Responsive Design**: Mobile-friendly interface with adaptive layouts

## Data Flow

1. **Input Phase**: Users enter loan parameters (amount, rate, term) and investor details
2. **Calculation Phase**: Frontend performs real-time financial calculations using utility functions
3. **Validation Phase**: Zod schemas validate all inputs before processing
4. **Storage Phase**: Valid calculations are saved to PostgreSQL via Drizzle ORM
5. **Reporting Phase**: PDF reports are generated client-side using jsPDF
6. **Display Phase**: Results are visualized through charts and tables

## External Dependencies

### Core Libraries
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **jspdf & jspdf-autotable**: PDF generation
- **recharts**: Data visualization
- **zod**: Schema validation
- **date-fns**: Date manipulation utilities

### UI Libraries
- **@radix-ui/***: Accessible component primitives
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **class-variance-authority**: Component variant management

## Deployment Strategy

### Development Environment
- **Hot Reload**: Vite development server with HMR
- **Database**: Neon PostgreSQL with connection pooling
- **Environment Variables**: DATABASE_URL for database connection

### Production Build
- **Frontend**: Static assets built with Vite and served by Express
- **Backend**: Node.js server bundled with ESBuild
- **Database**: Drizzle migrations for schema management
- **Static Files**: Optimized and served from dist/public directory

### Key Features
- **Real-time Calculations**: Instant financial computations without server round-trips
- **Professional Reports**: Bank-grade PDF documentation
- **Multi-investor Support**: Support for 3+ investors per loan
- **Financial Projections**: Advanced business forecasting tools
- **Responsive Design**: Works across desktop and mobile devices
- **Type Safety**: Full TypeScript coverage for reliability