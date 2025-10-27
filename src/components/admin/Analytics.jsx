import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, Users, BookOpen, Rocket } from 'lucide-react'
import './Analytics.css'

function Analytics({ stats }) {
  const [activityData, setActivityData] = useState([])
  const [projectStats, setProjectStats] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)

      // Get last 7 days activity
      const last7Days = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        
        const { count } = await supabase
          .from('journal_entries')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', dateStr)
          .lt('created_at', new Date(dateStr + 'T23:59:59').toISOString())

        last7Days.push({
          date: date.toLocaleDateString('en-US', { weekday: 'short' }),
          entries: count || 0
        })
      }
      setActivityData(last7Days)

      // Get project status distribution
      const { data: projects } = await supabase
        .from('projects')
        .select('status')

      const statusCount = projects?.reduce((acc, project) => {
        acc[project.status] = (acc[project.status] || 0) + 1
        return acc
      }, {})

      const projectStatsData = [
        { name: 'In Progress', value: statusCount?.['in-progress'] || 0, color: '#fbbf24' },
        { name: 'Completed', value: statusCount?.['completed'] || 0, color: '#4ade80' }
      ]
      setProjectStats(projectStatsData)

    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="analytics">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="analytics">
      <div className="analytics-grid">
        <motion.div
          className="chart-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3>
            <TrendingUp size={20} />
            Daily Activity (Last 7 Days)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="date" stroke="var(--text-secondary)" />
              <YAxis stroke="var(--text-secondary)" />
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)'
                }}
              />
              <Bar dataKey="entries" fill="var(--accent-orange)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          className="chart-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3>
            <Rocket size={20} />
            Project Status Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={projectStats}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                fill="var(--accent-orange)"
                paddingAngle={5}
                dataKey="value"
                label={(entry) => entry.name}
              >
                {projectStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          className="insights-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3>
            <BookOpen size={20} />
            Key Insights
          </h3>
          <div className="insights-list">
            <div className="insight-item">
              <div className="insight-icon">📊</div>
              <div>
                <strong>Engagement Rate</strong>
                <p>
                  {stats.totalUsers > 0
                    ? Math.round((stats.activeToday / stats.totalUsers) * 100)
                    : 0}% of users active today
                </p>
              </div>
            </div>
            <div className="insight-item">
              <div className="insight-icon">📝</div>
              <div>
                <strong>Average Entries</strong>
                <p>
                  {stats.totalUsers > 0
                    ? Math.round(stats.totalJournals / stats.totalUsers)
                    : 0} entries per user
                </p>
              </div>
            </div>
            <div className="insight-item">
              <div className="insight-icon">🚀</div>
              <div>
                <strong>Project Activity</strong>
                <p>
                  {stats.totalUsers > 0
                    ? (stats.totalProjects / stats.totalUsers).toFixed(1)
                    : 0} projects per user
                </p>
              </div>
            </div>
            {stats.pendingApprovals > 0 && (
              <div className="insight-item warning">
                <div className="insight-icon">⚠️</div>
                <div>
                  <strong>Action Required</strong>
                  <p>{stats.pendingApprovals} users waiting for approval</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Analytics

