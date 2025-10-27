import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useDataInit } from '../hooks/useDataInit'
import Navbar from '../components/Navbar'
import UserManagement from '../components/admin/UserManagement'
import Analytics from '../components/admin/Analytics'
import DailyTipsManager from '../components/admin/DailyTipsManager'
import toast from 'react-hot-toast'
import './AdminDashboard.css'

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('analytics')
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeToday: 0,
    totalJournals: 0,
    totalProjects: 0,
    pendingApprovals: 0,
  })

  // Initialize all data from API on login
  useDataInit()

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      // Pending approvals
      const { count: pendingApprovals } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('approved', false)

      // Total journals
      const { count: totalJournals } = await supabase
        .from('journal_entries')
        .select('*', { count: 'exact', head: true })

      // Total projects
      const { count: totalProjects } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })

      // Active today
      const today = new Date().toISOString().split('T')[0]
      const { count: activeToday } = await supabase
        .from('journal_entries')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today)

      setStats({
        totalUsers: totalUsers || 0,
        activeToday: activeToday || 0,
        totalJournals: totalJournals || 0,
        totalProjects: totalProjects || 0,
        pendingApprovals: pendingApprovals || 0,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const tabs = [
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'users', label: 'User Management', icon: '👥' },
    { id: 'tips', label: 'Daily Tips', icon: '💡' },
  ]

  return (
    <div className="admin-dashboard">
      <Navbar isAdmin />
      
      <div className="admin-container">
        <motion.div
          className="admin-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1>Admin Dashboard 🛡️</h1>
            <p className="subtitle">Manage your TechJournal community</p>
          </div>
        </motion.div>

        <div className="stats-grid">
          <motion.div
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>{stats.totalUsers}</h3>
              <p>Total Users</p>
            </div>
          </motion.div>

          <motion.div
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>{stats.activeToday}</h3>
              <p>Active Today</p>
            </div>
          </motion.div>

          <motion.div
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="stat-icon">📝</div>
            <div className="stat-content">
              <h3>{stats.totalJournals}</h3>
              <p>Journal Entries</p>
            </div>
          </motion.div>

          <motion.div
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="stat-icon">🚀</div>
            <div className="stat-content">
              <h3>{stats.totalProjects}</h3>
              <p>Total Projects</p>
            </div>
          </motion.div>

          {stats.pendingApprovals > 0 && (
            <motion.div
              className="stat-card alert"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="stat-icon">⚠️</div>
              <div className="stat-content">
                <h3>{stats.pendingApprovals}</h3>
                <p>Pending Approvals</p>
              </div>
            </motion.div>
          )}
        </div>

        <div className="admin-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="admin-content"
          >
            {activeTab === 'analytics' && <Analytics stats={stats} />}
            {activeTab === 'users' && <UserManagement onUpdate={fetchStats} />}
            {activeTab === 'tips' && <DailyTipsManager />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default AdminDashboard

