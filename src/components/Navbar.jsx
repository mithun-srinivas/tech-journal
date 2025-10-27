import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { motion } from 'framer-motion'
import { Code2, LogOut, Settings, Shield } from 'lucide-react'
import './Navbar.css'

function Navbar({ isAdmin = false }) {
  const { signOut, profile } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
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

          <button onClick={handleSignOut} className="btn btn-secondary">
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </div>
    </motion.nav>
  )
}

export default Navbar

