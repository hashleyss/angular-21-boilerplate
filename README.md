Angular 21 Auth Boilerplate - Sign Up with Verification, Login and Forgot Password

Tutorial built with Angular 21.2.7

This is a detailed tutorial on how to implement a full-featured boilerplate sign up and authentication system in Angular 21.

Angular Boilerplate App Overview
The auth boilerplate is one of the most comprehensive Angular examples included here. It implements:
- Email sign up and verification
- JWT authentication with refresh tokens
- Role based authorization with support for two roles (User & Admin)
- Forgot password and reset password functionality
- View and update my profile section
- Admin section with subsection for managing all accounts (restricted to the Admin role)
- Fake backend API (enabled by default)

Fake backend and emails
The app runs with a fake backend API by default so it can run entirely in the browser without a real backend. To disable the fake backend remove the fake backend registration in the app module. The fake backend displays "email" messages on screen for testing — after registration a verification email is displayed with a link to verify the account; click the link to verify and then log in.

First account is an Admin
The first account registered is assigned to the Admin role; subsequent accounts are created as regular Users. Admins can access the admin section and manage accounts; regular users can only update their own profile.

JWT authentication with refresh tokens
On successful authentication the API (or fake backend) returns a short-lived JWT access token (expires after ~15 minutes) and a refresh token (expires after 7 days) stored in a cookie. The Angular app refreshes the access token automatically (it starts a timer and refreshes ~1 minute before expiry) so the user stays logged in.

Styling
Styled with Bootstrap 5.2. For details about Bootstrap, see https://getbootstrap.com/docs/5.2/getting-started/introduction/.

Project structure & conventions
- Each feature has its own folder (account, admin, home, profile).
- Shared/common code (components, services, models, helpers) is grouped in folders prefixed with an underscore (`_`) for clarity.
- Feature modules are lazy-loaded via the main app routing module.
- Barrel files (`index.ts`) are used to simplify imports for grouped exports.
- TypeScript path aliases `@app` and `@environments` are configured in `tsconfig.json`.

Getting started
1. Install dependencies: `npm install`
2. Run development server: `npm start` or `ng serve`

License
This project is licensed under the MIT License — see the LICENSE file for details.

Author
Adapted for this workspace

The Angular Code
Below are descriptions of the main project files that contain the boilerplate application logic. Some generated Angular CLI files are omitted for brevity.

Alert Component Template
Path: /src/app/_components/alert.component.html
The alert component template contains the HTML for displaying alert messages at the top of the page, rendering a notification for each alert in the alerts array.

Alert Component
Path: /src/app/_components/alert.component.ts
The alert component controls adding & removing alerts in the UI and subscribes to the `AlertService` via `alertService.onAlert()` in `ngOnInit`. It clears alerts on route changes and unsubscribes in `ngOnDestroy` to avoid memory leaks. `removeAlert()` removes a specific alert; `cssClasses()` returns Bootstrap alert classes.

App Initializer
Path: /src/app/_helpers/app.initializer.ts
Runs before app startup and attempts silent authentication by calling `accountService.refreshToken()` to obtain a new JWT using the refresh token cookie. The initializer is registered with the `APP_INITIALIZER` provider.

Auth Guard
Path: /src/app/_helpers/auth.guard.ts
Implements `CanActivate` to protect routes. It checks the current account via `AccountService` and redirects unauthorized users to `/login` (with `returnUrl`) or home when roles mismatch.

Error Interceptor
Path: /src/app/_helpers/error.interceptor.ts
Intercepts HTTP responses to handle errors globally. On 401/403 responses it logs out the user; other errors are re-thrown so callers can display alerts.

Fake Backend API
Path: /src/app/_helpers/fake-backend.ts
A fake backend `HttpInterceptor` that handles selected request URLs and methods, returning mock responses for auth, account management, and other flows. It displays "email" messages via `AlertService` for verification/reset flows.

JWT Interceptor
Path: /src/app/_helpers/jwt.interceptor.ts
Adds the JWT `Authorization` header for API requests when the user is authenticated and the request URL targets the configured API URL.

Must Match Validator
Path: /src/app/_helpers/must-match.validator.ts
A reactive-forms validator that ensures two form controls (e.g., password and confirmPassword) match.

Account Model
Path: /src/app/_models/account.ts
Defines the properties for an `Account` object used across the app.

Alert Models
Path: /src/app/_models/alert.ts
Contains `Alert`, `AlertType`, and `AlertOptions` model definitions used by the alert system.

Role Enum
Path: /src/app/_models/role.ts
Defines supported roles such as `User` and `Admin`.

Account Service
Path: /src/app/_services/account.service.ts
Handles all account-related API interactions (register, verify, login, refresh token, forgot/reset password, CRUD). Publishes account state via an RxJS `BehaviorSubject` and manages the silent refresh token timer. `logout()` revokes the refresh token, stops the refresh timer, publishes `null`, and redirects to `/login`.

Alert Service
Path: /src/app/_services/alert.service.ts
Publishes and clears alert messages and exposes `onAlert()` for components to subscribe. Convenience methods: `success()`, `error()`, `info()`, and `warn()` with options like `id`, `autoClose`, and `keepAfterRouteChange`.

Account Routing & Module
Path: /src/app/account/account-routing.module.ts, /src/app/account/account.module.ts
Defines routes and feature module metadata for the account section (login, register, forgot/reset, verify). The module is lazy-loaded from the main routing configuration.

Forgot Password Component
Path: /src/app/account/forgot-password.component.ts and .html
Provides a form to request a password reset. On submit calls `accountService.forgotPassword()`; the fake backend displays reset instructions as an on-screen "email".

Account Layout Component
Path: /src/app/account/layout.component.ts and .html
Root layout and router outlet for the account section; redirects to home if already authenticated.

Login Component
Path: /src/app/account/login.component.ts and .html
Reactive form for email/password login. On success redirects to `returnUrl` or `/`. Uses `AccountService.login()`.

Register Component
Path: /src/app/account/register.component.ts and .html
Registration form with validators (title, firstName, lastName, email, password, confirmPassword, ts&cs). On success shows a message and redirects to `/login`; fake backend shows verification email instructions.

Reset Password Component
Path: /src/app/account/reset-password.component.ts and .html
Validates the reset token from URL params and renders one of: validating, invalid, or form to set a new password. Uses `accountService.resetPassword()` on submit.

Verify Email Component
Path: /src/app/account/verify-email.component.ts and .html
Validates email verification token from URL params via `accountService.verifyEmail()` and redirects to `/login` on success.

Admin: Accounts Feature
Path: /src/app/admin/accounts/**
Routes and components for listing, adding, and editing accounts. `AddEditComponent` is reused for both add and edit flows depending on route params. The accounts list shows create/edit/delete actions and the delete button shows a spinner while deleting.

Admin Feature and Subcomponents
Path: /src/app/admin/**
Defines the admin routing, layout, overview, and subnav components. Admin routes are lazy-loaded and secured to `Role.Admin`.

Home Component
Path: /src/app/home/home.component.ts and .html
Displays a welcome message including the first name of the logged-in account.

Profile Feature
Path: /src/app/profile/**
Includes profile details, update, layout, routing and module. `UpdateComponent` allows changing details, changing password, or deleting the account.

App Routing Module
Path: /src/app/app-routing.module.ts
Top-level routes: `/` -> home, `/account` -> account feature, `/profile` -> profile feature, `/admin` -> admin feature (all lazy-loaded). Home, profile, and admin routes are protected with `AuthGuard`; admin additionally checks `Role.Admin`.

App Component
Path: /src/app/app.component.ts and .html
Root component. Shows main nav (when authenticated), a global alert component, a named router-outlet for subnav, and main router-outlet for content. `logout()` calls `AccountService.logout()`.

App Module
Path: /src/app/app.module.ts
Root Angular module where providers (interceptors, fake backend provider) and the `APP_INITIALIZER` are registered. To use a real backend remove the `fakeBackendProvider`.

Environment Configs
Paths: /src/environments/environment.ts, /src/environments/environment.prod.ts
Contain environment-specific variables such as `apiUrl`. The Angular build replaces `environment.ts` with `environment.prod.ts` in production builds.

Index, Main, Polyfills, Styles
Paths: /src/index.html, /src/main.ts, /src/polyfills.ts, /src/styles.less
Standard Angular entry points and global styles for the app.

Package and TypeScript Config
Paths: /package.json, /tsconfig.json
`package.json` contains dependencies and scripts; `tsconfig.json` includes compiler options and path aliases for `@app` and `@environments`.
