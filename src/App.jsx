import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/AdminDashboard'
import PublicProject from './pages/PublicProject'
import './App.css'

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  return !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY)
}

function PrivateRoute({ children, adminOnly = false }) {
  const { user, loading, isAdmin, profile } = useAuth()

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  if (!user || !profile) {
    return <Navigate to="/login" replace />
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

function App() {
  // Check if Supabase is configured
  if (!isSupabaseConfigured()) {
    return (
      <div className="loading-container">
        <div style={{ textAlign: 'center', maxWidth: '600px', padding: '2rem' }}>
          <h1 style={{ color: 'var(--accent-orange)', marginBottom: '1rem' }}>⚠️ Setup Required</h1>
          <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
            Supabase environment variables are not configured.
          </p>
          <div style={{ 
            textAlign: 'left', 
            background: 'var(--bg-tertiary)', 
            padding: '1.5rem', 
            borderRadius: '12px',
            border: '1px solid var(--border-color)'
          }}>
            <p style={{ marginBottom: '1rem', fontWeight: 'bold' }}>Follow these steps:</p>
            <ol style={{ paddingLeft: '1.5rem', lineHeight: '1.8' }}>
              <li>Create a <code>.env</code> file in the project root</li>
              <li>Add your Supabase credentials:</li>
            </ol>
            <pre style={{ 
              background: 'var(--bg-secondary)', 
              padding: '1rem', 
              borderRadius: '8px', 
              margin: '1rem 0',
              overflow: 'auto'
            }}>
              {`VITE_SUPABASE_URL=your_supabase_url\nVITE_SUPABASE_ANON_KEY=your_supabase_anon_key`}
            </pre>
            <ol start="3" style={{ paddingLeft: '1.5rem', lineHeight: '1.8' }}>
              <li>Restart the development server</li>
            </ol>
            <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-tertiary)' }}>
              📚 See <strong>QUICKSTART.md</strong> for detailed setup instructions
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
              },
              success: {
                iconTheme: {
                  primary: 'var(--success)',
                  secondary: 'var(--bg-tertiary)',
                },
              },
              error: {
                iconTheme: {
                  primary: 'var(--error)',
                  secondary: 'var(--bg-tertiary)',
                },
              },
            }}
          />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/project/:projectId" element={<PublicProject />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <PrivateRoute adminOnly>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App

