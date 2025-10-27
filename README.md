# TechJournal 📝

A scalable tech journaling application where developers can track their daily activities, maintain streaks, showcase projects, and generate AI-powered LinkedIn posts.

## ✨ Features

### User Features
- **Daily Journaling**: Document your software development activities
- **Streak Tracking**: Visualize and maintain your coding streak
- **Project Showcase**: Display both in-progress and completed projects
- **Social Sharing**: Share your streaks and projects on social media
- **AI LinkedIn Posts**: Generate engaging LinkedIn posts using Gemini AI based on your journal entries
- **Daily Developer Feed**: Receive daily tips and insights from admins

### Admin Features
- **Analytics Dashboard**: Comprehensive insights into user activity and engagement
- **User Management**: Approve/reject user registrations and manage roles
- **Daily Tips Manager**: Create and publish developer tips for the community
- **Real-time Statistics**: Monitor platform health and user engagement

## 🚀 Tech Stack

- **Frontend**: React 18 with Vite
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Styling**: Custom CSS with dark theme and orange accent
- **Animations**: Framer Motion
- **AI**: Google Gemini API
- **Charts**: Recharts
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account
- Google Gemini API key (optional, for AI features)

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd tech-journal
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API
3. Copy your project URL and anon key
4. Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Database Setup

Run the following SQL in your Supabase SQL Editor:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create journal_entries table
CREATE TABLE journal_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create projects table
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  technologies TEXT[],
  status TEXT DEFAULT 'in-progress' CHECK (status IN ('in-progress', 'completed')),
  github_url TEXT,
  demo_url TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create daily_tips table
CREATE TABLE daily_tips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[],
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_tips ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" 
  ON profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Journal entries policies
CREATE POLICY "Users can view own journal entries" 
  ON journal_entries FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own journal entries" 
  ON journal_entries FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journal entries" 
  ON journal_entries FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own journal entries" 
  ON journal_entries FOR DELETE 
  USING (auth.uid() = user_id);

-- Projects policies
CREATE POLICY "Projects are viewable by everyone" 
  ON projects FOR SELECT 
  USING (true);

CREATE POLICY "Users can create own projects" 
  ON projects FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" 
  ON projects FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" 
  ON projects FOR DELETE 
  USING (auth.uid() = user_id);

-- Daily tips policies
CREATE POLICY "Published tips are viewable by everyone" 
  ON daily_tips FOR SELECT 
  USING (published = true OR auth.uid() = created_by);

CREATE POLICY "Admins can create tips" 
  ON daily_tips FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update tips" 
  ON daily_tips FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete tips" 
  ON daily_tips FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX idx_journal_entries_created_at ON journal_entries(created_at);
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_daily_tips_published ON daily_tips(published);
CREATE INDEX idx_daily_tips_created_at ON daily_tips(created_at);
```

### 5. Create Admin Account

After setting up the database, you need to manually create the admin account:

1. Sign up through the app with email and any username
2. In Supabase, go to the SQL Editor and run:

```sql
-- Update the user to be admin and approved
-- Replace 'admin@example.com' with the email you used to sign up
UPDATE profiles 
SET role = 'admin', 
    username = 'admin',
    approved = true 
WHERE email = 'admin@example.com';
```

3. Now you can log in with username: `admin` and your password

Alternatively, you can use the Supabase dashboard to:
1. Go to Authentication > Users
2. Create a new user with email `admin@example.com` and password `admin123`
3. Run the SQL above to set the role

### 6. Run the Application

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 🔑 Default Admin Credentials

- **Username**: admin
- **Password**: admin (or the password you set when creating the admin account)

## 🎨 Features Guide

### For Users

1. **Sign Up**: Create an account (requires admin approval)
2. **Journal Daily**: Track your development activities and learnings
3. **Build Streak**: Maintain your coding streak by journaling daily
4. **Add Projects**: Showcase your work with project cards
5. **Generate AI Posts**: Set your Gemini API key and generate LinkedIn posts
6. **Share**: Share your achievements on social media

### For Admins

1. **Approve Users**: Review and approve user registrations
2. **View Analytics**: Monitor user engagement and platform statistics
3. **Post Daily Tips**: Share developer tips that appear in users' feeds
4. **Manage Roles**: Promote users to admin or change roles

## 🤖 AI Features

To use AI-powered LinkedIn post generation:

1. Get a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. In the app, go to AI Posts tab
3. Click "Set API Key" and enter your key
4. The key is stored locally in your browser
5. Generate posts based on your journal entries

**Note:** Uses Gemini 1.5 Flash for fast, high-quality content generation.

## 🎨 Design Features

- **Dark Theme**: Eye-friendly dark interface
- **Orange Accent**: Vibrant orange color scheme
- **Smooth Animations**: Framer Motion powered transitions
- **Responsive Design**: Works on all screen sizes
- **Modern UI**: Clean, professional interface

## 📱 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- User authentication via Supabase Auth
- API keys stored locally in browser
- Admin-only routes protected

## 🐛 Troubleshooting

### "Missing Supabase environment variables"
- Ensure `.env` file exists with correct values
- Restart the dev server after creating `.env`

### "Account pending approval"
- Contact admin or manually approve in Supabase dashboard
- Admin accounts bypass approval

### "AI generation failed"
- Verify your Gemini API key is correct
- Ensure you have journal entries to base the post on
- Check your internet connection

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues or questions, please open an issue on GitHub.

---

Built with ❤️ for developers who want to track their journey and grow their online presence.

