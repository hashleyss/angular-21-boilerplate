# IPT 2026 Frontend - Angular 21 Boilerplate

An Angular 21 Single Page Application featuring email sign up with verification, JWT authentication, and role-based access control.

## Live Links
- Live Application: https://ipt-2026-frontend-hashleyss.vercel.app/account/login
- Backend API Docs: https://ipt-2026-backend-hashleyss.onrender.com/api-docs/

## Author
Ashley Saramosing - https://github.com/hashleyss

## Tech Stack
- Angular 21
- TypeScript
- Reactive Forms
- JWT Authentication
- HTTP Interceptors
- Route Guards
- Fake Backend (for local development)

## Setup Instructions

### Prerequisites
- Node.js v18+
- Angular CLI v21
- Git

### Installation

1. Clone the repository
   git clone https://github.com/hashleyss/ipt-2026-frontend.git
   cd ipt-2026-frontend

2. Install dependencies
   npm install

3. Run in development mode (uses fake backend)
   ng serve

4. Run in production mode (uses real API)
   ng build --configuration production

### Environment Configuration

Development (src/environments/environment.ts)
- production: false
- apiUrl: http://localhost:4000
- Fake backend is automatically enabled

Production (src/environments/environment.prod.ts)
- production: true
- apiUrl: https://ipt-2026-backend-hashleyss.onrender.com
- Fake backend is automatically disabled

## Features
- User Registration with Email Verification
- JWT + Refresh Token Authentication
- Role-Based Access Control (Admin / User)
- Fake Backend for local testing (Stage A)
- Live API integration (Stage B)
- Protected routes via Angular Guards
- HTTP Interceptors for token management

## Deployment
- Hosted on Vercel as a Static Site
- Rewrite rule configured: /* → /index.html (fixes deep link 404s)
- Built with: ng build --configuration production