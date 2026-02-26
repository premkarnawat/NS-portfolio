# Nirbhava Portfolio – Next.js + Supabase

Instagram-style portfolio with CMS admin panel.

## Tech Stack
- **Next.js 14** (App Router)
- **TypeScript** + **TailwindCSS**
- **Framer Motion** (animations)
- **Supabase** (Auth + Database + Storage)
- **React Hook Form** + **Zod** (form validation)

---

## Setup Guide

### 1. Clone & Install
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.local.example` to `.env.local` and fill in:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Set Up Supabase Database
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Open **SQL Editor**
3. Run the contents of `supabase-schema.sql`

### 4. Create Admin User
1. In Supabase Dashboard → **Authentication → Users**
2. Click **Add User** → **Create New User**
3. Enter your admin email & password
4. **Important:** Disable public signups in Authentication → Settings → Disable "Enable email confirmations" if needed

### 5. Configure Storage (if SQL didn't auto-create)
Go to **Storage** → Create these public buckets:
- `profile-images`
- `post-images`
- `highlight-images`
- `explore-icons`
- `resumes`

### 6. Run Development Server
```bash
npm run dev
```

- **Portfolio:** http://localhost:3000
- **Admin Panel:** http://localhost:3000/admin/login

---

## Project Structure
```
src/
├── app/
│   ├── page.tsx              # Public portfolio
│   ├── admin/
│   │   ├── login/page.tsx    # Admin login
│   │   └── dashboard/page.tsx
├── components/
│   ├── public/               # Public portfolio components
│   └── admin/                # Admin panel components
├── hooks/                    # Supabase data hooks
├── lib/
│   ├── supabase/             # Supabase clients
│   └── storage.ts            # File upload helpers
└── types/
    └── supabase.ts           # TypeScript types
```

---

## Features

### Public Portfolio
- Dynamic profile data from Supabase
- Instagram-style grid posts
- Circular highlights with story viewer
- Glassmorphism explore modal
- Contact form (stores in Supabase)
- Resume viewer with download
- Dark/light theme toggle
- Smooth Framer Motion animations
- Button press micro-interactions
- Story zoom transition
- Modal backdrop blur

### Admin Panel (/admin)
- Secure login via Supabase Auth
- Profile management (image, bio, services, stats)
- Post CRUD with image upload
- Highlights management
- Explore links management
- Message viewer with delete

---

## Deployment (Vercel)
1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy!
