# 🚀 Quick Start Guide

Get your TechJournal app up and running in 5 minutes!

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Supabase

### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in project details and click "Create new project"
4. Wait for the project to be ready (about 2 minutes)

### Get Your API Credentials

1. Go to **Project Settings** (gear icon in sidebar)
2. Click on **API** in the settings menu
3. Copy the following:
   - **Project URL** (under "Project URL")
   - **anon public** key (under "Project API keys")

### Configure Environment Variables

Create a `.env` file in the project root:

```bash
# Copy from .env.example
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 3: Set Up Database

1. In your Supabase dashboard, click on **SQL Editor** in the sidebar
2. Click "New query"
3. Copy the entire content from `SUPABASE_SETUP.sql`
4. Paste it into the SQL editor
5. Click **Run** (or press Cmd/Ctrl + Enter)
6. You should see success messages

## Step 4: Create Admin Account

### Option A: Through the App (Recommended)

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open http://localhost:3000 in your browser

3. Click "Sign Up" and create an account with:
   - Username: `admin`
   - Email: Your email
   - Password: `admin` (or your preferred password)

4. Go back to Supabase SQL Editor and run:
   ```sql
   UPDATE profiles 
   SET role = 'admin', approved = true 
   WHERE email = 'your-email@example.com';
   ```

5. Now you can log in with username `admin` and your password

### Option B: Through Supabase Dashboard

1. In Supabase, go to **Authentication** > **Users**
2. Click **Add user** > **Create new user**
3. Enter:
   - Email: `admin@techjournal.com`
   - Password: `admin123`
   - Auto Confirm User: ✅ (enabled)
4. Click **Create user**

5. Go to **SQL Editor** and run:
   ```sql
   INSERT INTO profiles (id, username, email, role, approved)
   VALUES (
     (SELECT id FROM auth.users WHERE email = 'admin@techjournal.com'),
     'admin',
     'admin@techjournal.com',
     'admin',
     true
   );
   ```

## Step 5: Start the App

```bash
npm run dev
```

Open http://localhost:3000 and log in with:
- **Username**: `admin`
- **Password**: `admin` (or what you set)

## 🎉 You're Ready!

### What to do next:

1. **Explore the Dashboard** - Check out the different tabs
2. **Create a Journal Entry** - Start tracking your dev journey
3. **Add a Project** - Showcase your work
4. **Check Admin Panel** - Go to `/admin` to see admin features
5. **Approve Users** - Invite friends and approve their signups
6. **Post Daily Tips** - Share knowledge with your community

## 🤖 Optional: Set Up AI Features

1. Get a free API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. In the app, go to **AI Posts** tab
3. Click **Set API Key** and enter your Gemini API key
4. Generate LinkedIn posts based on your journal entries!

## ⚡ Common Issues

### Port 3000 Already in Use

```bash
# Use a different port
npm run dev -- --port 3001
```

### Supabase Connection Error

- Double-check your `.env` file has the correct values
- Make sure there are no trailing spaces
- Restart the dev server after changing `.env`

### Admin Login Not Working

- Verify the profile was created in Supabase
- Check that `role = 'admin'` and `approved = true`
- Try logging in with the email instead of username

### Database Errors

- Ensure all SQL from `SUPABASE_SETUP.sql` was executed
- Check Supabase logs in Dashboard > Logs
- Verify RLS policies are enabled

## 📚 Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check out the database schema in [SUPABASE_SETUP.sql](SUPABASE_SETUP.sql)
- Customize the colors in `src/index.css` (CSS variables)
- Deploy to Vercel, Netlify, or your preferred hosting

## 🆘 Need Help?

- Check the [README.md](README.md) troubleshooting section
- Look at Supabase logs in the dashboard
- Verify your environment variables
- Open an issue on GitHub

---

Happy journaling! 🎉

