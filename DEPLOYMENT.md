# Deployment Guide for GSTNexus

GSTNexus is built with the Next.js 15 App Router, Drizzle ORM, and PostgreSQL. It is designed to be deployed on Vercel with a Neon PostgreSQL database.

## Prerequisites

1.  **Vercel Account**: For hosting the frontend and serverless functions.
2.  **Neon Account**: For the serverless PostgreSQL database.
3.  **WhatsApp Business API**: (Optional) Meta Developer account for WhatsApp integration.
4.  **Clerk/NextAuth**: (Optional) For authentication.

## Setup Steps

### 1. Database Setup (Neon)
1.  Create a new project on [Neon](https://neon.tech).
2.  Copy the connection string (Connection Details).
3.  Environment Variable: `DATABASE_URL="postgresql://user:pass@ep-hostname.region.aws.neon.tech/neondb?sslmode=require"`

### 2. Drizzle Migrations
Before deploying, push the schema to your database:
```bash
npx drizzle-kit push
```

### 3. Environment Variables
Add the following to your Vercel project settings:
```env
DATABASE_URL=your_neon_url
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
WHATSAPP_TOKEN=your_meta_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_id
```

### 4. Vercel Deployment
1.  Connect your GitHub repository to Vercel.
2.  Vercel will automatically detect Next.js settings.
3.  Click **Deploy**.

## Local Development
1.  Clone the repo.
2.  `npm install`
3.  Update `.env.local` with your database URL.
4.  `npm run dev`

## Tech Stack Summary
- **Framework**: Next.js 15
- **Database**: PostgreSQL (Neon)
- **ORM**: Drizzle
- **Styling**: Tailwind 4 + Shadcn UI
- **Finance**: Double-Entry Bookkeeping Engine
- **Tax**: Indian GST Logic (CGST/SGST/IGST)
