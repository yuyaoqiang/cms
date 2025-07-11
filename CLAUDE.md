# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Build for development environment
npm run build:dev

# Run linter
npm run lint

# Format code with prettier
npm run prettier

# Preview production build
npm run preview
```

## Architecture Overview

This is a React 18 + TypeScript financial management application built with Vite. The app focuses on user profile analysis and data visualization.

### Core Technology Stack
- **Frontend**: React 18, TypeScript, Vite
- **UI Library**: Ant Design 5.x + Ant Design Pro Components
- **State Management**: Zustand for global state
- **Routing**: React Router DOM v6
- **Styling**: Tailwind CSS + Ant Design
- **HTTP Client**: Axios with custom interceptors
- **Build Tool**: Vite with ESM modules

### Project Structure

```
src/
├── api/                    # API layer with axios interceptors
├── hooks/                  # Custom React hooks (useApi, usePaginationApi)
├── layouts/               # Layout components (AppLayout)
├── pages/                 # Route-based page components
│   ├── analysis/          # User profile analysis tools
│   └── my/               # Personal profile management
├── routes/               # Route configurations
├── stores/               # Zustand stores
└── utils/                # Utility functions
```

### Key Architectural Patterns

#### API Layer (`src/api/`)
- **Centralized request handling**: Uses axios instance with automatic token injection
- **Response interceptors**: Automatic error handling and response transformation
- **RESTful helpers**: Provides `get`, `post`, `put`, `del` methods
- **Security**: JWT token management via cookies (yabo-auth-token)

#### State Management (`src/stores/`)
- **Zustand**: Lightweight state management with persistence
- **Local storage integration**: Compressed storage using lz-string
- **Token management**: Automatic token persistence and retrieval

#### Custom Hooks (`src/hooks/`)
- **useApi**: Generic API calling hook with loading states
- **usePaginationApi**: Specialized hook for paginated data
- **useSubmit**: Form submission hook with success handling

#### Component Organization
- **Page-based routing**: Each major feature has its own page directory
- **Co-located components**: Feature-specific components live near their pages
- **Shared layouts**: Common layout structure with sidebar navigation

### API Integration Patterns

#### Authentication
- Uses JWT tokens with automatic injection via axios interceptors
- Fallback token system with cookie-based storage
- Authorization header: `yabo-Auth: bearer {token}`

#### Data Fetching
```typescript
// Standard API call pattern
import { get, post } from '@/api'

// GET request
const { data, loading, error } = useApi(() => get('/endpoint'))

// POST request with form data
const { submit, loading } = useSubmit((data) => post('/endpoint', data))
```

#### Local Storage
- **Compressed storage**: All localStorage operations use lz-string compression
- **Type-safe helpers**: `getLocalStorage()` and `setLocalStorage()` utilities
- **Automatic JSON parsing**: Handles object/array serialization

### Development Workflow

#### Component Development
- Use functional components with TypeScript
- Leverage Ant Design Pro components for forms and tables
- Co-locate components with their parent pages when feature-specific

#### API Development
- All API calls should use the centralized `src/api` layer
- Use custom hooks (`useApi`, `useSubmit`) for consistent loading states
- Handle errors through axios interceptors for consistent UX

#### State Management
- Use Zustand for global state (user info, auth tokens)
- Prefer local component state for UI-specific data
- Use local storage for persistence when needed

#### Styling
- Primary: Ant Design component library
- Secondary: Tailwind CSS for custom styling
- Avoid CSS modules or styled-components

### Key Configuration

#### Vite Configuration
- **Proxy setup**: Development API proxy to `http://172.31.152.17`
- **Path aliases**: `@/*` maps to `src/*`
- **Build optimization**: Lodge tree-shaking, console removal in production

#### TypeScript Configuration
- **Strict mode**: Enabled with unused variable detection
- **Path mapping**: Configured for `@/*` imports
- **Project references**: Split between app and node configurations

### Data Flow Patterns

#### User Profile Analysis
1. **Tag Selection**: Users select analysis tags from API-provided options
2. **Data Fetching**: Dynamic tag values loaded on-demand with caching
3. **Analysis Generation**: Mock data generation for visualization
4. **Visualization**: Pie charts and tables for data presentation
5. **Persistence**: Save analysis profiles to local storage

#### State Flow
- **Global State**: User authentication, basic user info
- **Local State**: Component-specific UI state, form data
- **Server State**: API responses cached in component state
- **Persistent State**: Analysis profiles, user preferences in localStorage

### Security Considerations

#### Token Management
- JWT tokens stored securely in cookies
- Automatic token refresh handling
- Request interceptors inject auth headers
- No sensitive data in localStorage (only compressed non-sensitive data)

#### API Security
- All requests include proper authorization headers
- CORS handling through Vite proxy configuration
- Environment-based API URL configuration