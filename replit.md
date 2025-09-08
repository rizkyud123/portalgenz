# Overview

A full-stack news portal application built with React, Express, and PostgreSQL. The system provides a modern content management interface for administrators to manage news articles, categories, and users, along with a public-facing news website. The application features role-based access control, rich text editing capabilities, and responsive design optimized for both desktop and mobile users.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript for type safety and modern development experience
- **Routing**: Wouter for lightweight client-side routing with support for both public and admin routes
- **State Management**: TanStack Query (React Query) for server state management, caching, and data synchronization
- **UI Components**: Radix UI primitives with shadcn/ui component library for consistent, accessible design
- **Styling**: Tailwind CSS with CSS variables for theming and responsive design
- **Build Tool**: Vite for fast development and optimized production builds

## Backend Architecture
- **Framework**: Express.js with TypeScript for robust API development
- **Database ORM**: Drizzle ORM for type-safe database operations and schema management
- **Authentication**: Express sessions with bcrypt for password hashing and secure user authentication
- **File Upload**: Multer middleware for handling image uploads with validation and storage
- **API Design**: RESTful endpoints with proper HTTP status codes and error handling

## Database Design
- **Primary Database**: PostgreSQL with Neon serverless hosting for scalability
- **Schema Management**: Drizzle Kit for database migrations and schema synchronization
- **Core Entities**:
  - Users with role-based permissions (admin/editor)
  - Categories with slug-based routing for SEO
  - Articles with rich content, featured images, and publication workflow
  - File uploads tracking for media management

## Authentication & Authorization
- **Session Management**: Express-session with PostgreSQL store for persistent sessions
- **Role-Based Access**: Two-tier permission system (admin/editor) with route protection
- **Password Security**: Bcrypt hashing with configurable salt rounds
- **Session Security**: HTTP-only cookies with secure configuration for production

## Content Management Features
- **Rich Text Editor**: Quill.js integration for WYSIWYG content creation
- **Image Upload System**: File validation, resize handling, and organized storage
- **SEO Optimization**: Automatic slug generation from titles for clean URLs
- **Publication Workflow**: Draft/published status system for content control
- **Category System**: Hierarchical organization with article counting

## Development Environment
- **Hot Reload**: Vite HMR integration with Express for seamless development
- **TypeScript**: Strict typing across frontend, backend, and shared schemas
- **Path Aliases**: Configured import paths for clean code organization
- **Error Handling**: Centralized error management with development overlays

# External Dependencies

## Database & Hosting
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **WebSocket Support**: Custom WebSocket constructor for Neon compatibility

## Authentication & Security
- **bcrypt**: Password hashing and verification
- **express-session**: Session management middleware
- **connect-pg-simple**: PostgreSQL session store

## File Handling
- **multer**: Multipart form data handling for file uploads
- **File System**: Node.js fs module for file operations and directory management

## UI & Styling
- **Radix UI**: Comprehensive set of accessible UI primitives
- **Tailwind CSS**: Utility-first CSS framework with PostCSS processing
- **Lucide React**: Modern icon library with consistent design
- **date-fns**: Date formatting and manipulation with internationalization

## Development Tools
- **Vite**: Build tool with TypeScript support and development server
- **TanStack Query**: Data fetching and caching library
- **React Hook Form**: Form validation with Zod schema integration
- **Wouter**: Lightweight routing library for React applications