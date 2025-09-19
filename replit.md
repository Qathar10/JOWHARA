# E-commerce Beauty Store Application

## Overview
This is a React-based e-commerce application for a beauty and grooming products store. The application features a modern interface with product catalog, categories, brands, and admin functionality.

## Project Architecture
- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Icons**: Lucide React

## Current State
- ✅ Project dependencies installed
- ✅ TypeScript compilation working
- ✅ Development server configured for Replit (0.0.0.0:5000)
- ✅ Workflow set up for development server
- ✅ Supabase integration configured with fallback for missing credentials
- 🔄 Application running successfully

## Project Structure
```
src/
├── components/         # React components
│   ├── admin/         # Admin-specific components
│   ├── Footer.tsx
│   ├── Header.tsx
│   ├── ProductCard.tsx
│   └── WhatsAppButton.tsx
├── data/              # Data layer
│   ├── mockData.ts    # Mock data for development
│   └── supabaseData.ts # Supabase data hooks
├── hooks/             # Custom React hooks
├── lib/               # Library configurations
│   ├── auth.ts        # Authentication utilities
│   └── supabase.ts    # Supabase client setup
├── pages/             # Page components
├── types/             # TypeScript type definitions
├── App.tsx            # Main application component
└── main.tsx           # Application entry point
```

## Features
- Product catalog with categories and brands
- Shopping cart functionality
- Admin dashboard for product management
- Responsive design with mobile support
- Real-time updates via Supabase
- Image optimization and lazy loading

## Database Schema
The application uses a comprehensive database schema with tables for:
- Products (with categories, brands, inventory)
- Categories and Brands
- Orders and Customers
- Admin users and activity logging
- Banners for marketing
- Inventory tracking

## Environment Setup
The application requires Supabase credentials:
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key

Placeholder values are used when environment variables are missing to prevent application crashes.

## Recent Changes
- Configured Vite dev server for Replit environment (port 5000, host 0.0.0.0)
- Added graceful fallback for missing Supabase credentials
- Fixed TypeScript compilation errors
- Set up development workflow

## Architecture Decisions
- Used Vite instead of Create React App for faster builds and better development experience
- Implemented custom hooks for data fetching with Supabase
- Structured components for reusability and maintainability
- Used TypeScript for type safety
- Configured TailwindCSS for consistent styling

## User Preferences
- Not specified yet