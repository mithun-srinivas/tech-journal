import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { 
  Code2, 
  Sparkles, 
  TrendingUp, 
  Rocket, 
  MessageSquare, 
  Shield,
  CheckCircle,
  Zap,
  Users,
  Calendar,
  Share2
} from 'lucide-react'
import './Landing.css'

function Landing() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user && profile) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, profile, navigate])
  const features = [
    {
      icon: <Calendar size={32} />,
      title: 'Daily Journaling',
      description: 'Document your coding journey and track your daily progress with detailed journal entries.'
    },
    {
      icon: <TrendingUp size={32} />,
      title: 'Streak Tracking',
      description: 'Build and maintain your coding streak. Visualize your consistency with our beautiful streak display.'
    },
    {
      icon: <Rocket size={32} />,
      title: 'Project Showcase',
      description: 'Display your projects with images, links, and detailed descriptions. Share your work with the world.'
    },
    {
      icon: <Sparkles size={32} />,
      title: 'AI-Powered Posts',
      description: 'Generate engaging LinkedIn posts from your journal entries using Google Gemini AI.'
    },
    {
      icon: <MessageSquare size={32} />,
      title: 'Daily Developer Feed',
      description: 'Get daily tips and insights from the admin team. Stay updated with the latest best practices.'
    },
    {
      icon: <Share2 size={32} />,
      title: 'Social Sharing',
      description: 'Share your achievements, streaks, and projects on Twitter, LinkedIn, and Facebook.'
    }
  ]

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <div className="landing-hero">
        <div className="hero-background">
          <div className="gradient-orb orb-1"></div>
          <div className="gradient-orb orb-2"></div>
          <div className="gradient-orb orb-3"></div>
        </div>

        <motion.nav 
          className="landing-nav"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="nav-logo">
            <Code2 size={32} />
            <span>TechJournal</span>
          </div>
          <div className="nav-actions">
            <a 
              href="https://urbuddy.oscode.co.in/buddy/mithun_s"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary call-btn"
            >
              <Users size={18} />
              1:1 Call with Mithun
            </a>
            <Link to="/login" className="btn btn-secondary">
              Sign In
            </Link>
            <Link to="/login" className="btn btn-primary">
              Get Started
            </Link>
          </div>
        </motion.nav>

        <div className="hero-content">
          <motion.div
            className="hero-text"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1>
              Track Your Developer Journey
              <Sparkles className="sparkle-icon" size={40} />
            </h1>
            <p className="hero-subtitle">
              Build streaks, showcase projects, and grow your career with AI-powered insights.
              Join thousands of developers documenting their coding journey.
            </p>
            <div className="hero-buttons">
              <Link to="/login" className="btn btn-primary btn-large">
                <Zap size={20} />
                Become a Member
              </Link>
              <a href="#features" className="btn btn-secondary btn-large">
                Learn More
              </a>
            </div>
          </motion.div>

          <motion.div
            className="hero-visual"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="preview-card">
              <div className="preview-glow"></div>
              <div className="preview-header">
                <div className="preview-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span className="preview-title">TechJournal Dashboard</span>
              </div>
              <div className="preview-content">
                <div className="preview-streak-modern">
                  <div className="flame-container">
                    🔥
                  </div>
                  <div className="streak-info">
                    <div className="streak-number-modern">42</div>
                    <div className="streak-label-modern">Day Streak</div>
                    <div className="streak-motivation">Keep it going! 💪</div>
                  </div>
                </div>
                
                <div className="preview-stats-grid">
                  <div className="stat-box">
                    <div className="stat-icon-box">📝</div>
                    <div className="stat-details">
                      <span className="stat-value">127</span>
                      <span className="stat-label">Journal Entries</span>
                    </div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-icon-box">🚀</div>
                    <div className="stat-details">
                      <span className="stat-value">5</span>
                      <span className="stat-label">Projects</span>
                    </div>
                  </div>
                </div>

                <div className="activity-dots">
                  <span className="dot-label">Last 7 days</span>
                  <div className="dots-row">
                    {[true, true, false, true, true, true, true].map((active, i) => (
                      <div
                        key={i}
                        className={`activity-dot ${active ? 'active' : ''}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="features-section">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2>Everything You Need to Grow</h2>
          <p>Powerful features to track your journey and share your success</p>
        </motion.div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="feature-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <motion.div
          className="cta-content"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2>Ready to Start Your Journey?</h2>
          <p>Join developers worldwide who are building better habits and growing their careers.</p>
          <Link to="/login" className="btn btn-primary btn-large">
            <Sparkles size={20} />
            Become a Member
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <Code2 size={24} />
            <span>TechJournal</span>
          </div>
          <p>Built with ❤️ for developers who want to track their journey and grow their online presence.</p>
        </div>
      </footer>
    </div>
  )
}

export default Landing

