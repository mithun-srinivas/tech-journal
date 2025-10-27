import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { motion } from 'framer-motion'
import { Code2, Sparkles } from 'lucide-react'
import './Login.css'

function Login() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isSignUp) {
        const { data, error } = await signUp(email, password, username)
        if (!error) {
          setIsSignUp(false)
          setEmail('')
          setPassword('')
          setUsername('')
        }
      } else {
        const { data, error } = await signIn(email, password)
        if (!error && data) {
          navigate('/dashboard')
        }
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      <motion.div
        className="login-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="login-header">
          <div className="logo">
            <Code2 size={40} className="logo-icon" />
            <Sparkles size={20} className="sparkle" />
          </div>
          <h1>TechJournal</h1>
          <p>Track your developer journey, one day at a time</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {isSignUp && (
            <motion.div
              className="input-group"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                className="input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required={isSignUp}
              />
            </motion.div>
          )}

          <div className="input-group">
            <label htmlFor="email">Email / Username</label>
            <input
              id="email"
              type="text"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={isSignUp ? "Enter your email" : "Enter your email or username"}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary login-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-small"></span>
                {isSignUp ? 'Creating Account...' : 'Signing In...'}
              </>
            ) : (
              <>{isSignUp ? 'Sign Up' : 'Sign In'}</>
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            <button
              className="toggle-btn"
              onClick={() => setIsSignUp(!isSignUp)}
              type="button"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default Login

