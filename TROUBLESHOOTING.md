# 🔧 Troubleshooting Guide

## Issue: Loading Screen Stuck Forever

### Step 1: Check Browser Console

Open your browser's Developer Tools (F12 or Cmd+Option+I on Mac) and look at the Console tab.

#### What you should see:

If everything is working:
```
🔍 Checking user session...
ℹ️ No user session found
```

If Supabase is not configured:
```
⚠️ Missing Supabase environment variables!
Please create a .env file with:
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

If there's an authentication issue:
```
❌ Error getting session: [error details]
```

### Step 2: Verify Environment Variables

1. Check if `.env` file exists in project root:
```bash
ls -la | grep .env
```

2. Check the contents (should NOT be committed to git):
```bash
cat .env
```

It should contain:
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

3. **Important**: Vite requires restart after changing `.env` file:
```bash
# Stop the server (Ctrl+C)
# Then start again
npm run dev
```

### Step 3: Clear Browser Cache

Sometimes old authentication tokens can cause issues:

1. Open DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

Or clear localStorage:
```javascript
// In browser console
localStorage.clear()
location.reload()
```

### Step 4: Check Supabase Configuration

If you see network errors, verify your Supabase setup:

1. Go to your Supabase project dashboard
2. Check that the project is active (not paused)
3. Verify the URL and keys match your `.env` file
4. Go to SQL Editor and verify tables exist:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

You should see:
- profiles
- journal_entries
- projects
- daily_tips

### Step 5: Test Supabase Connection

Add this to your browser console:
```javascript
// Test if Supabase client exists
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL)

// This should show your Supabase URL (not undefined)
```

### Common Scenarios and Solutions

#### Scenario 1: "No network requests"
**Cause**: Environment variables not loaded  
**Solution**: 
1. Ensure `.env` file exists in project root (same level as `package.json`)
2. Restart the dev server
3. Check file is named exactly `.env` (not `.env.txt`)

#### Scenario 2: "Loading forever after login"
**Cause**: Profile not created in database  
**Solution**:
1. Check Supabase logs for errors
2. Verify RLS policies are set up
3. Manually create profile in Supabase dashboard

#### Scenario 3: "Setup Required" screen shows
**Cause**: Environment variables missing or incorrect  
**Solution**: Follow the on-screen instructions to set up `.env` file

#### Scenario 4: "Blank white screen"
**Cause**: JavaScript error  
**Solution**: Check browser console for errors

#### Scenario 5: "CORS error" in console
**Cause**: Incorrect Supabase URL  
**Solution**: Verify URL in `.env` matches your Supabase project

### Quick Fix Checklist

- [ ] `.env` file exists in project root
- [ ] `.env` contains valid `VITE_SUPABASE_URL`
- [ ] `.env` contains valid `VITE_SUPABASE_ANON_KEY`
- [ ] Development server was restarted after creating/editing `.env`
- [ ] Browser cache cleared
- [ ] No errors in browser console
- [ ] Supabase project is active (not paused)
- [ ] Database tables created (ran `SUPABASE_SETUP.sql`)

### Still Stuck?

If you've tried everything above:

1. **Check browser console** - Copy any error messages
2. **Check terminal** - Look for Vite/build errors
3. **Check Supabase logs** - Dashboard > Logs > Error logs
4. **Verify file structure**:
```
tech-journal/
├── .env                 ← Should exist here
├── package.json
├── vite.config.js
└── src/
    └── ...
```

### Debug Mode

To see detailed logs, you can temporarily modify `src/lib/supabase.js`:

```javascript
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    debug: true  // Add this line
  }
})
```

This will show all Supabase operations in the console.

### Network Tab

If you want to see actual network requests:

1. Open DevTools (F12)
2. Go to **Network** tab
3. Refresh the page
4. Filter by "supabase"
5. You should see requests to your Supabase URL

If you see NO requests, environment variables are not loaded.

---

## Getting Help

If none of this helps, please share:
1. Console errors (screenshot or text)
2. Your `.env` file structure (hide actual values)
3. Browser and OS version
4. Output of `npm run dev`

