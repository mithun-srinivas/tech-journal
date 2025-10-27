import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { motion } from 'framer-motion'
import { Code2, LogOut, Settings, Shield, Users } from 'lucide-react'
import './Navbar.css'

function Navbar({ isAdmin = false }) {
  const { signOut, profile } = useAuth()
  const navigate = useNavigate()
  const [signingOut, setSigningOut] = useState(false)

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      const success = await signOut()
      if (success) {
        // Small delay to ensure state is cleared
        setTimeout(() => {
          navigate('/login', { replace: true })
        }, 100)
      }
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <motion.nav
      className="navbar"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="navbar-content">
        <Link to={isAdmin ? '/admin' : '/dashboard'} className="navbar-logo">
          <Code2 size={28} />
          <span>TechJournal</span>
          {isAdmin && <Shield size={16} className="admin-badge" />}
        </Link>

        <div className="navbar-actions">
          <a 
            href="https://urbuddy.oscode.co.in/buddy/mithun_s"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary call-btn"
          >
            <Users size={18} />
            <span className="call-text">1:1 Call with Mithun</span>
          </a>

          <div className="user-info">
            <div className="user-avatar">
              {profile?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="username">{profile?.username || 'User'}</span>
          </div>

          {profile?.role === 'admin' && !isAdmin && (
            <Link to="/admin" className="btn btn-secondary">
              <Shield size={18} />
              Admin
            </Link>
          )}

          {isAdmin && (
            <Link to="/dashboard" className="btn btn-secondary">
              Dashboard
            </Link>
          )}

          <button 
            onClick={handleSignOut} 
            className="btn btn-secondary"
            disabled={signingOut}
          >
            {signingOut ? (
              <>
                <span className="spinner-small"></span>
                Signing Out...
              </>
            ) : (
              <>
                <LogOut size={18} />
                Sign Out
              </>
            )}
          </button>
        </div>
      </div>
    </motion.nav>
  )
}

export default Navbar

