# PH Healthcare System — Backend API

A full-featured RESTful API backend for an online healthcare consultation platform that connects patients with doctors. Patients find doctors, book available time slots, pay via bKash, join video consultations, and receive digital prescriptions — all managed through a secure, role-based system.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Authentication \& Authorization](#authentication--authorization)
- [External Integrations](#external-integrations)
- [Email Templates](#email-templates)
- [NPM Scripts](#npm-scripts)
- [Project Requirements](#project-requirements)
- [License](#license)

---

## Overview

**PH Healthcare System** is a backend API that powers a complete online healthcare consultation workflow. The system supports four user roles — **Super Admin**, **Admin**, **Doctor**, and **Patient** — each with distinct permissions and capabilities.

### How It Works

1. **Patients** register (email/password or Google), find doctors, book today's available time slots, and pay via bKash.
2. **Doctors** apply to join the platform, get approved by admins, create consultation schedules, conduct appointments, and issue digital prescriptions.
3. **Admins/Super Admins** manage the platform — approve doctors, block/unblock users, monitor analytics, and oversee all operations.

### Key Business Rules

- Doctors can only create **one schedule per day** with **20-minute consultation slots**.
- Patients can only book **today's** published schedules — no future or past bookings.
- Appointments require **upfront payment** via bKash before confirmation.
- Cancellations **more than 1 hour** before the schedule start time receive a **full refund**.
- Prescriptions are only created for **completed** appointments and delivered as PDF via email.

---

## Tech Stack

| Layer | Technology | Version |
| --- | --- | --- |
| **Runtime** | Node.js | Latest |
| **Language** | TypeScript (ESM Modules) | ^7.0.2 |
| **Framework** | Express.js | ^5.2.1 |
| **Database** | PostgreSQL | — |
| **ORM** | Prisma (with `@prisma/adapter-pg`) | ^7.9.1 |
| **Cache / OTP Store** | Redis | ^6.2.1 |
| **Validation** | Zod | ^4.4.3 |
| **Authentication** | JWT (Access + Refresh Tokens) | ^9.0.3 |
| **OAuth** | Google OAuth2 | ^11.0.0 |
| **Email** | Nodemailer (Gmail SMTP) | ^9.0.5 |
| **Email Templates** | EJS | ^6.0.1 |
| **PDF Generation** | PDFKit | ^0.20.2 |
| **File Uploads** | Multer + Cloudinary | ^2.2.0 / ^2.10.0 |
| **Payment Gateway** | bKash (Tokenized Checkout) | Sandbox |
| **Scheduling** | node-cron | ^4.6.0 |
| **Linter / Formatter** | Biome | 2.5.7 |
| **Dev Runner** | tsx (watch mode) | ^4.23.1 |

---

## Features

### Patient Features

- Email/password registration with OTP verification
- Google OAuth login (auto-linked to existing account if email matches)
- Browse doctors and view available today's schedules
- Book appointment with bKash payment
- View appointment history and payment records
- Download invoice PDF and prescription PDF
- Cancel appointment (with conditional refund)
- View personal analytics dashboard
- Upload/change profile image

### Doctor Features

- Apply to become a doctor (upload resume + documents)
- Email verification via OTP
- Wait for admin approval before accessing the platform
- Create, update, publish, and delete consultation schedules
- View own schedules and appointments
- Update appointment status (Confirmed → Ongoing → Completed)
- Create prescriptions with findings and medicines (PDF)
- View personal analytics dashboard
- Update profile (bio, consultation fee, contact info)

### Admin Features

- Approve or reject doctor applications (with rejection reason)
- View all doctors, patients, and appointments
- Block/unblock doctors and patients
- Create new Admin accounts
- View all payments and schedules
- View platform-wide analytics dashboard

### Super Admin Features

- All Admin capabilities, plus:
- Create new Super Admin accounts
- Block/unblock Admins and Super Admins
- Full platform control

---

## Project Structure

```
HealthCare/
├── .env                          # Environment variables (secrets, DB, Redis, SMTP, etc.)
├── .gitignore
├── biome.json                    # Biome linter/formatter config
├── package.json
├── package-lock.json
├── prisma.config.ts              # Prisma configuration
├── tsconfig.json                 # TypeScript compiler config
├── Healthcare.postman.json       # Postman API collection
├── Project Requirements.md       # Full product specification
├── README.md
│
├── prisma/
│   ├── schema/
│   │   ├── schema.prisma         # Generator + datasource config
│   │   ├── enums.prisma          # All enums (Role, Status, etc.)
│   │   ├── user.prisma           # User model
│   │   ├── patient.prisma        # Patient profile
│   │   ├── doctor.prisma         # Doctor profile
│   │   ├── appointment.prisma    # Appointment model
│   │   ├── schedule.prisma       # Schedule model
│   │   └── payment.prisma        # Payment model
│   └── migrations/               # Database migration history
│
└── src/
    ├── server.ts                 # Entry point (DB, Redis, SMTP, seeds, cron, listen)
    ├── app.ts                    # Express app setup (CORS, middleware, routes, error handlers)
    │
    └── app/
        ├── config/
        │   └── index.ts          # Centralized environment config
        │
        ├── interfaces/
        │   └── index.ts          # Shared TypeScript interfaces
        │
        ├── middleware/
        │   ├── checkAuth.ts      # JWT auth + role-based access control
        │   ├── validateRequest.ts# Zod validation middleware
        │   ├── globalErrorHandler.ts # Centralized error handler
        │   └── notFound.ts       # 404 handler
        │
        ├── lib/
        │   ├── prisma.ts         # Prisma client singleton
        │   ├── redis.ts          # Redis client singleton
        │   ├── nodemailer.ts     # Gmail SMTP transporter
        │   ├── cloudinary.ts     # Cloudinary config
        │   ├── bkash.ts          # bKash token management
        │   ├── googleAuth.ts     # Google OAuth2 client
        │   ├── multer.ts         # File upload config (memory storage)
        │   └── cron.ts           # Cron: cleanup unverified doctor apps (every 10 min)
        │
        ├── utils/
        │   ├── AppError.ts       # Custom error class with HTTP status codes
        │   ├── catchAsync.ts     # Async error wrapper for Express handlers
        │   ├── jwt.ts            # JWT create/verify utilities
        │   ├── sendResponse.ts   # Standardized API response helper
        │   └── seed.ts           # Seed functions (Super Admin, Tester Admin, Tester Doctor)
        │
        ├── templates/            # EJS email templates
        │   ├── registration-user-otp.ejs
        │   ├── patient-welcome-email.ejs
        │   ├── doctor-application-approved.ejs
        │   ├── doctor-application-rejected.ejs
        │   ├── forgot-password.ejs
        │   └── reset-password-success.ejs
        │
        └── module/
            ├── auth/             # Authentication (register, login, OTP, Google OAuth)
            ├── user/             # User profile management
            ├── doctor/           # Doctor application & management
            ├── schedule/         # Doctor schedule CRUD
            ├── appointment/      # Appointment booking & lifecycle
            ├── payment/          # Payment records
            ├── prescription/     # Prescription generation (PDF)
            └── analytics/        # Dashboard analytics
```

---

## Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **PostgreSQL** database (or a Prisma Postgres instance)
- **Redis** instance (for OTP storage and bKash token caching)

You will also need accounts/credentials for:

- **Cloudinary** (file/image storage)
- **bKash** (payment gateway — sandbox for development)
- **Google Cloud Console** (OAuth2 client ID)
- **Gmail** (app password for SMTP email sending)

---

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd HealthCare
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the project root and fill in the required values (see [Environment Variables](#environment-variables) below).

### 4. Run database migrations

```bash
npx prisma migrate dev
```

### 5. Generate Prisma client

```bash
npx prisma generate
```

### 6. Start the development server

```bash
npm run dev
```

The server will start on `http://localhost:5000`. On first run, it will automatically:

- Connect to PostgreSQL and Redis
- Seed the database with a **Super Admin**, **Tester Admin**, and **Tester Doctor**
- Start a cron job to clean up unverified doctor applications every 10 minutes

### 7. Verify the API

```bash
curl http://localhost:5000/
# Response: "Welcome to PH Healthcare System Backend"
```

---

## Environment Variables

| Variable | Description | Example |
| --- | --- | --- |
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `5000` |
| `DATABASE_URL` | PostgreSQL connection string (Prisma format) | `postgres://user:pass@host:5432/db?sslmode=require` |
| `JWT_ACCESS_SECRET` | Secret key for signing access tokens | Random 64-char hex string |
| `JWT_REFRESH_SECRET` | Secret key for signing refresh tokens | Random 64-char hex string |
| `JWT_ACCESS_EXPIRES_IN` | Access token expiry | `1d` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry | `7d` |
| `BCRYPT_SALT_ROUNDS` | Bcrypt hashing rounds | `10` |
| `BACKEND_URL` | Backend base URL | `http://localhost:5000` |
| `FRONTEND_URL` | Frontend URL (CORS origin) | `http://localhost:3000` |
| `GOOGLE_CLIENT_ID` | Google OAuth2 client ID | From Google Cloud Console |
| `REDIS_USER` | Redis username | `default` |
| `REDIS_PASSWORD` | Redis password | Your Redis password |
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `SMTP_USER` | Gmail address for sending emails | `you@gmail.com` |
| `EMAIL_SENDER` | Sender email address | `you@gmail.com` |
| `SMTP_PASSWORD` | Gmail app password | 16-char app password |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | From Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | Cloudinary API key | From Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | From Cloudinary dashboard |
| `BKASH_BASE_URL` | bKash API base URL | `https://tokenized.sandbox.bka.sh/v1.2.0-beta` |
| `BKASH_USERNAME` | bKash sandbox username | From bKash developer portal |
| `BKASH_PASSWORD` | bKash sandbox password | From bKash developer portal |
| `BKASH_APP_KEY` | bKash app key | From bKash developer portal |
| `BKASH_APP_SECRET` | bKash app secret | From bKash developer portal |
| `BKASH_CALLBACK_URL` | bKash payment callback URL | `http://localhost:5000/api/v1` |

---

## API Endpoints

**Base URL:** `http://localhost:5000/api/v1`

### Auth (`/auth`)

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/register` | Public | Register a new patient (sends OTP email) |
| POST | `/verify-email` | Public | Verify patient/doctor email with OTP |
| POST | `/login` | Public | Login with email/password |
| POST | `/google` | Public | Google OAuth login (patients only) |
| GET | `/me` | All roles | Get current user profile |
| POST | `/refresh-token` | Public | Refresh access token |
| POST | `/forgot-password` | Public | Send password reset OTP |
| POST | `/reset-password` | Public | Reset password with OTP |

### User (`/user`)

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| PATCH | `/profile-image` | All roles | Upload/change profile image |

### Doctor (`/doctor`)

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/apply-as-doctor` | Public | Apply as doctor (multipart: resume + files) |
| POST | `/apply-as-doctor/verify-email` | Public | Verify doctor email with OTP |
| POST | `/approve-doctor` | Admin, Super Admin | Approve/reject doctor application |
| GET | `/all-doctors` | Admin, Super Admin | List all doctors (paginated) |
| PATCH | `/update-my-profile` | Doctor | Update own profile |
| GET | `/public/available-today` | Public | Doctors available today |
| GET | `/public/all-doctors` | Public | List all approved doctors |
| GET | `/public/:doctorId` | Public | Single doctor public profile |

### Schedule (`/schedule`)

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/create-schedule` | Doctor | Create a new schedule (DRAFT) |
| GET | `/my-schedules` | Doctor | Doctor's own schedules |
| GET | `/all-schedules` | Admin, Super Admin | All schedules |
| GET | `/todays-schedule` | Public | Today's published schedules for a doctor |
| PATCH | `/update-schedule/:scheduleId` | Doctor | Update a schedule |
| PATCH | `/publish-schedule/:scheduleId` | Doctor | Publish a DRAFT schedule |
| GET | `/:scheduleId` | Doctor, Admin, Super Admin | Single schedule with appointments |
| DELETE | `/:scheduleId` | Doctor | Soft-delete a schedule |

### Appointment (`/appointment`)

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/book-appointment` | Patient | Book an appointment (initiates bKash payment) |
| POST | `/pay-appointment` | Patient | Re-initiate payment for a pending appointment |
| POST | `/cancel-appointment` | Patient, Admin, Super Admin | Cancel appointment (conditional refund) |
| GET | `/book-appointment/payment/callback` | Public | bKash payment callback URL |
| PATCH | `/update-status/:appointmentId` | Doctor | Update status (Ongoing/Completed) |
| GET | `/my-appointments` | Patient | Patient's own appointments |
| GET | `/doctor-appointments` | Doctor | Doctor's own appointments |
| GET | `/all-appointments` | Admin, Super Admin | All appointments |
| GET | `/:appointmentId` | All roles | Single appointment details |

### Payment (`/payment`)

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/my-payments` | Patient | Patient's payment history |
| GET | `/all-payments` | Admin, Super Admin | All payments |
| GET | `/:paymentId` | Patient, Admin, Super Admin | Single payment details |

### Prescription (`/prescription`)

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/create-prescription` | Doctor | Create prescription PDF for completed appointment |
| GET | `/:appointmentId` | All roles | Get prescription for an appointment |

### Analytics (`/analytics`)

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/patient-analytics` | Patient | Patient's personal analytics |
| GET | `/doctor-analytics` | Doctor | Doctor's personal analytics |
| GET | `/admin-analytics` | Admin, Super Admin | Platform-wide analytics |

---

## Database Schema

The database consists of **6 models** with the following relationships:

### Enums

| Enum | Values |
| --- | --- |
| `Role` | SUPER_ADMIN, ADMIN, DOCTOR, PATIENT |
| `UserStatus` | ACTIVE, BLOCKED, DELETED |
| `AuthProvider` | GOOGLE, CREDENTIALS |
| `AppointmentStatus` | PENDING, CONFIRMED, CANCELLED, ONGOING, COMPLETED |
| `PaymentStatus` | UNPAID, PAID, FAILED, CANCELLED, REFUNDED |
| `DoctorVerificationStatus` | PENDING, APPROVED, REJECTED |
| `ScheduleStatus` | DRAFT, PUBLISHED |

### Models

| Model | Description | Key Relationships |
| --- | --- | --- |
| **User** | Shared identity for all roles. Contains email, password (nullable for Google-only), role, status, email verification flag. | Has one optional Patient, Has one optional Doctor |
| **Patient** | Patient profile linked 1:1 to User. Contains name, email, contact, address. | Belongs to User, Has many Appointments |
| **Doctor** | Doctor profile linked 1:1 to User. Contains specialization, license number, qualifications, experience, consultation fee, verification status, resume (Cloudinary URL). | Belongs to User, Has many Schedules, Has many Appointments |
| **Schedule** | Consultation time slots created by a Doctor. 20-minute slots, DRAFT or PUBLISHED status. | Belongs to Doctor, Has many Appointments |
| **Appointment** | Links Patient, Doctor, and Schedule. Contains status, serial number, joining time, record/prescription URLs. | Belongs to Patient, Doctor, Schedule; Has one Payment |
| **Payment** | bKash payment record linked 1:1 to Appointment. Contains amount, status, transaction IDs, refund details. | Belongs to Appointment |

### Relationships Diagram

```
User (1) ──── (1) Patient ──── (N) Appointment (N) ──── (1) Doctor ──── (1) User
                 │                    │
                 │                    ├── (1) Payment
                 │                    │
                 └── (N) Appointment ─┘
                                      │
                                      └── (1) Schedule ──── (1) Doctor
```

---

## Authentication & Authorization

### JWT Token System

- **Access Token:** Signed with `JWT_ACCESS_SECRET`, expires in `1d`, stored as HTTP-only cookie
- **Refresh Token:** Signed with `JWT_REFRESH_SECRET`, expires in `7d`, stored as HTTP-only cookie
- Tokens are also supported via `Authorization: Bearer <token>` header

### Token Payload

```json
{
  "userId": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "PATIENT"
}
```

### Auth Middleware Flow

1. Extract token from cookies or `Authorization` header
2. Verify JWT signature
3. Check user exists in database
4. Verify user status is not `BLOCKED`
5. Validate user role against required roles for the endpoint

### Role-Based Access Control

| Role | Permissions |
| --- | --- |
| **SUPER_ADMIN** | Full platform access. Create admins/super admins. Block/unblock any user. |
| **ADMIN** | Approve/reject doctors. Manage patients and doctors. Create admins. |
| **DOCTOR** | Manage own profile and schedules. Update appointment status. Create prescriptions. |
| **PATIENT** | Book/cancel appointments. Make payments. View own data. |

### Registration Flows

| Flow | Steps |
| --- | --- |
| **Patient (Email)** | Register → OTP email → Verify → Auto-login → Welcome email |
| **Patient (Google)** | Google OAuth → Auto-create account → Welcome email |
| **Doctor** | Apply (with documents) → OTP email → Verify → Admin approval → Welcome email |
| **Admin/Super Admin** | Created by existing admin → Credentials sent to personal email → Forced password change |

---

## External Integrations

### bKash Payment Gateway

- **Mode:** Tokenized Checkout (Sandbox)
- **Flow:** Create payment → Redirect to bKash → Execute payment → Callback confirms appointment
- **Refund:** Automatic bKash refund on cancellation (if >1 hour before schedule start)
- **Token caching:** bKash API tokens cached in Redis (1-hour TTL)

### Cloudinary

- **Purpose:** File/image storage
- **Used for:** Profile images, doctor resumes, additional documents, prescription PDFs, invoice PDFs
- **Cleanup:** Previous files deleted from Cloudinary when replaced

### Google OAuth2

- **Purpose:** Patient login via Google Sign-In
- **Account linking:** If a patient exists with matching email + CREDENTIALS provider, Google ID is linked to the existing account
- **Auto-verification:** Google-registered patients have `emailVerified: true` by default

### Nodemailer (Gmail SMTP)

- **Purpose:** Transactional email delivery
- **Templates:** 6 EJS templates for different email types
- **TTL:** OTP emails have 5-minute expiry (doctor OTPs have 1-hour expiry)

### PDFKit

- **Purpose:** Server-side PDF generation
- **Used for:** Appointment invoices (sent after payment) and medical prescriptions (sent after completion)

---

## Email Templates

| Template | Trigger | Contents |
| --- | --- | --- |
| `registration-user-otp.ejs` | Patient registration / Doctor application | OTP code for email verification |
| `patient-welcome-email.ejs` | After email verification / Google registration | Welcome message and getting started info |
| `doctor-application-approved.ejs` | Admin approves doctor | Approval notification and login instructions |
| `doctor-application-rejected.ejs` | Admin rejects doctor | Rejection reason and next steps |
| `forgot-password.ejs` | Password reset request | OTP code for password reset |
| `reset-password-success.ejs` | After successful password reset | Confirmation of password change |

---

## NPM Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start development server with hot reload (tsx watch) |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Run compiled JavaScript in production |
| `npm run formet:check` | Check code formatting with Biome |
| `npm run formet:fix` | Auto-fix code formatting with Biome |
| `npm run lint:check` | Check code linting with Biome |
| `npm run lint:fix` | Auto-fix linting issues with Biome |

---

## API Documentation

A comprehensive **Postman collection** is included at `Healthcare.postman.json` with:

- Every endpoint documented with request/response examples
- Auto-saved tokens as collection variables
- Variable definitions for `baseUrl`, `accessToken`, `refreshToken`, and resource IDs
- Descriptions explaining expected status codes and business logic

---

## Project Requirements

### 1. Overview

PH Healthcare System connects patients with doctors for online consultations. A patient finds a doctor, books an open slot on a published schedule, pays for it, and joins a video call at the scheduled time. The doctor runs the consultation and afterward sends back a digital prescription. Admins and super admins keep the platform running: they approve doctors, manage accounts, and handle the people side of the platform so doctors and patients only have to deal with appointments.

This document is the product spec — what the system must do and the exact rules it must follow.

### 2. User Roles

Four roles exist: **Super Admin**, **Admin**, **Doctor**, **Patient**.

| Role | How they join the platform | How they log in |
| --- | --- | --- |
| **Patient** | Registers directly — email/password or Google | Email/password or Google |
| **Doctor** | Applies directly, then waits for an Admin or Super Admin to approve them | Email/password only |
| **Admin** | Created by a Super Admin or an existing Admin — cannot self-register | Email/password only |
| **Super Admin** | Created by another Super Admin — cannot self-register | Email/password only |

Google login is a **patient-only** feature. Doctors, Admins, and Super Admins always use email and password.

#### 2.1 Who Can Manage Whom

Admin and Super Admin have the same day-to-day powers — approving doctors, managing patients, creating new admins — with two exceptions reserved for Super Admin:

| Action | Admin | Super Admin |
| --- | --- | --- |
| Approve or reject a doctor application | Yes | Yes |
| Block or unblock a Doctor | Yes | Yes |
| Block or unblock a Patient | Yes | Yes |
| Create a new Admin | Yes | Yes |
| Create a new Super Admin | No | Yes |
| Block or unblock an Admin | No | Yes |
| Block or unblock a Super Admin | No | Yes |

In short: Admin can act on doctors and patients freely, but only a Super Admin can act on another Admin or Super Admin — including blocking one.

These actions live behind three management screens: **Doctor Management** (approve/reject applications, block/unblock doctors), **Patient Management** (block/unblock patients), and **Admin Management** (create and, where allowed, block admins and super admins).

### 3. Accounts and Authentication

#### 3.1 Registration

- **Patient** registers with name, email, and password — or with Google. Either way, they land in the system as a Patient; there is no way to register directly as anything else.
- **Doctor** applies through a separate "apply to become a doctor" flow. They don't land in the system as a working Doctor until an Admin or Super Admin approves them.
- **Admin** and **Super Admin** are never self-registered. They only come into existence when an existing Admin or Super Admin creates them.

#### 3.2 Email OTP Verification

Every registration that a person fills in themselves — patient credential registration and doctor application — must be verified with a one-time password (OTP) sent to their email before the account is usable. Google registration doesn't need this, since Google has already verified the email. Admin and Super Admin accounts skip OTP entirely, because they're created by someone else, not self-registered.

#### 3.3 Login

- Patients log in with email/password or with Google — and it's the same account either way. A patient who originally registered with email/password can also log in with Google afterward (matched by email), and vice versa; the system doesn't treat these as two separate patients.
- Doctors, Admins, and Super Admins log in with email/password only — always.

#### 3.4 Forgot Password / Reset Password

Two-step flow, available to anyone who logs in with a password:

1. **Forgot password** — patient submits their email; system emails them an OTP.
2. **Reset password** — patient submits the OTP plus a new password; system verifies the OTP and updates the password.

#### 3.5 Change Password (Logged In)

A logged-in user submits their **current password** and a **new password**. This is different from reset: it's for someone who remembers their current password and just wants to change it. Someone who's forgotten their current password uses forgot-password/reset-password instead — change-password is not a substitute for that flow.

#### 3.6 Set Password (Patients Only)

A patient who first signed up through Google doesn't have a password yet — Google login never asks for one. **Set Password** lets that patient choose one, so afterward they can log in either way: with Google or with email/password. This feature exists only for patients, since Doctors, Admins, and Super Admins never use Google login and always have a password from the moment their account is created.

#### 3.7 Tokens and Sessions

Every successful login or registration — credential or Google, any role — issues an **access token** and a **refresh token**, both set as cookies.

#### 3.8 Welcome Emails

| Event | Recipient | Contains |
| --- | --- | --- |
| Patient's first registration, right after auto-login | Patient's email | Welcome message |
| Doctor's application gets approved | Doctor's email | Welcome message |
| Admin or Super Admin gets created | Their **personal** email | Their new **organization** email (their login), their generated password, and a prompt to change that password after logging in |

### 4. Admin and Super Admin Management

Only a Super Admin or an Admin can create a new Admin (a Super Admin can also create a new Super Admin). The creator fills in two email addresses for the new account:

- **Organization email** — the account's login identity going forward, assigned by whoever creates the account (e.g. a company email).
- **Personal email** — the actual person's own inbox, used only to deliver the welcome message.

The system generates a password for the new account and sends it to the **personal** email inside the welcome email, along with the organization email and a prompt to change the password on first login. There is no self-registration and no OTP step for Admin or Super Admin accounts — the invite-and-generated-password flow, plus the forced password change, is what secures them instead.

### 5. Doctor Application and Approval

1. A prospective doctor applies through a public "apply to become a doctor" endpoint.
2. As part of applying, they verify their email with an OTP — the same requirement as patient registration.
3. Their application then sits pending in **Doctor Management**, reviewed by an Admin or Super Admin, who approves or rejects it.
4. On approval, the doctor account becomes active, and a welcome email goes out. Only from this point can the doctor log in and use the platform — an unapproved application cannot log in at all.

### 6. Doctor Schedules

A schedule is what a doctor publishes to say "I'm available on this date, during this time range, book me." Each schedule is for **one calendar date** and belongs to **one doctor**.

#### 6.1 Creating a Schedule

| Rule | Detail |
| --- | --- |
| One schedule per day | A doctor can have at most one schedule per calendar date. |
| Time range length | Minimum 3 hours, maximum 8 hours. |
| Must stay within one day | Start and end time must be on the same calendar date — e.g. `9:00 AM–5:00 PM` or `3:00 PM–11:00 PM` are fine, but a range like `9:00 PM–3:00 AM` (crossing into the next day) is not allowed. |
| Meet link | The doctor provides a video call link — from whichever video call tool they use — as part of creating the schedule. Every appointment booked into that schedule uses this same link. |
| Status | A schedule starts as **draft**. Patients cannot see it at all until the doctor **publishes** it. |
| Total slots | Calculated automatically: the whole time range divided into 20-minute slots. Example: a `3:00 PM–9:00 PM` schedule is 6 hours (360 minutes), giving 18 slots of 20 minutes each. |

#### 6.2 Editing a Published Schedule

Once published, different parts of a schedule lock at different points:

| Field | Can it still be changed? |
| --- | --- |
| **Date** | No — locked as soon as the schedule is published. |
| **Time range** | Yes, but only until the first appointment is booked into it. Once one slot is booked, the time range is locked (since re-slotting would break already-booked serial numbers). |
| **Status, meet link, and everything else** | Yes, any time — booking a slot doesn't lock these. |

### 7. Patient Appointment Booking

#### 7.1 What a Patient Can See

Patients only ever see **today's** schedules — never a future date, and never a past one. Within today, a schedule is visible (and bookable) only up until its own start time:

> Example: a schedule runs `3:00 PM–9:00 PM`. Before 3:00 PM, patients can see it and book into it. At 3:00 PM the schedule disappears from patient view — no more bookings, even though the consultations are still happening — and it will never reappear (it's not a future schedule anymore, it's today's, and today's window has closed).

A schedule that's fully booked (every slot taken) also stops being shown, for the same reason — there's nothing left to book.

#### 7.2 Booking

1. Patient picks an open slot on a visible schedule.
2. Patient pays for it upfront.
3. Once payment succeeds, the appointment is created with status **booked**, and it's given a **serial number** — its position among bookings in that schedule (the 1st person to book gets serial 1, the 2nd gets serial 2, and so on).
4. An invoice PDF — meet link, date, time, and payment details — is emailed to the patient right after payment.

### 8. Appointment Lifecycle

An appointment moves through three statuses:

```
booked  →  ongoing  →  completed
```

- **Booked** — set automatically once payment succeeds.
- **Ongoing** — the doctor sets this manually when they start the consultation.
- **Completed** — the doctor sets this manually when the consultation is finished.

### 9. Prescriptions

Once an appointment is **completed**, the doctor can write a prescription for it: key findings plus prescribed medicines. As soon as it's submitted, the system generates a PDF and emails it to the patient. A prescription can't be written for an appointment that isn't completed yet.

### 10. Cancellation and Refunds

Whether a patient gets their money back depends on how close to the schedule's start time they cancel:

| When the patient cancels | Refund? |
| --- | --- |
| More than 1 hour before the schedule's start time | Yes — cancel and refund |
| From 1 hour before the start time, through the running schedule, or after it's over | Cancellation still allowed — no refund |

> Example: schedule runs `3:00 PM–9:00 PM`. Cancelling any time before 2:00 PM refunds the payment. Cancelling from 2:00 PM onward — including during the 3–9 PM window itself, or even after 9 PM — still cancels the appointment, but without a refund.

### 11. Data Models (Conceptual)

- **User** — the shared identity for every role: email, password (nullable — a Google-only patient has none until they set one), linked Google account, role (`SUPER_ADMIN` / `ADMIN` / `DOCTOR` / `PATIENT`), account status (active/blocked), email-verified flag, and a "must change password" flag (used right after an Admin/Super Admin is created). Every account is exactly one User, linked to exactly one of the profiles below based on its role.
- **Patient profile** — personal info plus medical info.
- **Doctor profile** — personal info plus professional/expertise info (e.g. specialization).
- **Admin profile** — personal info, plus the organization email assigned at creation. Shared shape for both Admin and Super Admin; the User's `role` field is what tells them apart.

---

## License

ISC
