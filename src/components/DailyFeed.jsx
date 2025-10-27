import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { MessageSquare, Sparkles, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import './DailyFeed.css'

function DailyFeed() {
  const [tips, setTips] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDailyTips()
    
    // Subscribe to new tips
    const subscription = supabase
      .channel('daily_tips_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'daily_tips'
      }, () => {
        fetchDailyTips()
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetchDailyTips = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('daily_tips')
        .select(`
          *,
          profiles:created_by (username)
        `)
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error
      setTips(data || [])
    } catch (error) {
      console.error('Error fetching daily tips:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="daily-feed">
        <div className="feed-header">
          <h2>
            <MessageSquare size={24} />
            Daily Developer Feed
          </h2>
          <p>Tips and insights from the community</p>
        </div>
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading feed...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="daily-feed">
      <div className="feed-header">
        <h2>
          <MessageSquare size={24} />
          Daily Developer Feed
        </h2>
        <p>Tips and insights from the community</p>
      </div>

      <div className="feed-list">
        {tips.length === 0 ? (
          <div className="empty-state">
            <Sparkles size={48} />
            <p>No tips yet. Check back soon! ✨</p>
          </div>
        ) : (
          tips.map((tip, index) => (
            <motion.div
              key={tip.id}
              className="tip-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="tip-icon">
                <Sparkles size={24} />
              </div>
              <div className="tip-content">
                <h3>{tip.title}</h3>
                <p>{tip.content}</p>
                {tip.tags && tip.tags.length > 0 && (
                  <div className="tip-tags">
                    {tip.tags.map((tag, idx) => (
                      <span key={idx} className="badge badge-primary">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="tip-footer">
                  <span className="tip-author">
                    By {tip.profiles?.username || 'Admin'}
                  </span>
                  <span className="tip-date">
                    <Calendar size={14} />
                    {format(new Date(tip.created_at), 'MMM dd, yyyy')}
                  </span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}

export default DailyFeed

