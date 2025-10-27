import { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { fetchJournalEntries } from '../store/slices/journalSlice'
import { Flame, Share2, TrendingUp } from 'lucide-react'
import { format, differenceInDays } from 'date-fns'
import html2canvas from 'html2canvas'
import './StreakDisplay.css'

function StreakDisplay({ onShare }) {
  const { user, profile } = useAuth()
  const dispatch = useDispatch()
  const entries = useSelector(state => state.journal.entries)
  const [streak, setStreak] = useState(0)
  const [longestStreak, setLongestStreak] = useState(0)
  const [recentDays, setRecentDays] = useState([])
  const streakRef = useRef(null)

  useEffect(() => {
    // Recalculate streak whenever entries change
    if (entries.length > 0) {
      calculateStreak()
    }
  }, [entries])

  useEffect(() => {
    // Subscribe to journal entries changes for real-time updates
    if (user && profile) {
      const subscription = supabase
        .channel('journal_entries_changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'journal_entries',
          filter: `user_id=eq.${user.id}`
        }, () => {
          console.log('📊 Journal entry changed, refreshing from API...')
          dispatch(fetchJournalEntries(user.id))
        })
        .subscribe()

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [user, profile, dispatch])

  const calculateStreak = () => {
    try {
      if (!entries || entries.length === 0) {
        setStreak(0)
        setLongestStreak(0)
        setRecentDays([])
        return
      }

      // Get unique dates in local timezone (YYYY-MM-DD format) from Redux store
      const uniqueDates = [...new Set(entries.map(entry => {
        const date = new Date(entry.created_at)
        // Format to YYYY-MM-DD in local timezone
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      }))].sort().reverse()

      console.log('📅 Unique dates found:', uniqueDates)

      // Calculate current streak
      const today = new Date()
      const todayStr = format(today, 'yyyy-MM-dd')
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = format(yesterday, 'yyyy-MM-dd')

      console.log('📅 Today:', todayStr, '| Yesterday:', yesterdayStr)
      console.log('📅 Most recent entry:', uniqueDates[0])

      // Calculate current streak (must start from today or yesterday)
      let currentStreak = 0
      
      // Check if we have an entry today or yesterday to start the streak
      if (uniqueDates[0] === todayStr || uniqueDates[0] === yesterdayStr) {
        currentStreak = 1
        
        // Count backwards through consecutive days
        for (let i = 1; i < uniqueDates.length; i++) {
          const currentDate = new Date(uniqueDates[i])
          const prevDate = new Date(uniqueDates[i - 1])
          const daysBetween = differenceInDays(prevDate, currentDate)
          
          if (daysBetween === 1) {
            currentStreak++
          } else {
            break // Streak is broken
          }
        }
      }

      // Calculate longest streak
      let maxStreak = 0
      let tempStreak = 1
      
      for (let i = 1; i < uniqueDates.length; i++) {
        const currentDate = new Date(uniqueDates[i])
        const prevDate = new Date(uniqueDates[i - 1])
        const daysBetween = differenceInDays(prevDate, currentDate)
        
        if (daysBetween === 1) {
          tempStreak++
        } else {
          maxStreak = Math.max(maxStreak, tempStreak)
          tempStreak = 1
        }
      }
      maxStreak = Math.max(maxStreak, tempStreak, currentStreak)

      console.log('📊 Streak calculated:', { currentStreak, maxStreak, totalEntries: uniqueDates.length })
      setStreak(currentStreak)
      setLongestStreak(maxStreak)

      // Get last 7 days status (in local timezone)
      const last7Days = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const dateStr = `${year}-${month}-${day}`
        
        last7Days.push({
          date: dateStr,
          day: format(date, 'EEE'),
          hasEntry: uniqueDates.includes(dateStr)
        })
      }
      setRecentDays(last7Days)

    } catch (error) {
      console.error('Error calculating streak:', error)
    }
  }

  const captureStreakImage = async () => {
    if (!streakRef.current) return null
    
    try {
      const canvas = await html2canvas(streakRef.current, {
        backgroundColor: '#13131a',
        scale: 2,
        logging: false,
      })
      return canvas.toDataURL('image/png')
    } catch (error) {
      console.error('Error capturing streak image:', error)
      return null
    }
  }

  const handleShare = async () => {
    const imageData = await captureStreakImage()
    onShare('streak', {
      currentStreak: streak,
      longestStreak: longestStreak,
      imageData: imageData
    })
  }

  return (
    <motion.div
      ref={streakRef}
      className="streak-display"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="streak-main">
        <div className="streak-icon">
          <Flame size={32} className={streak > 0 ? 'flame-active' : ''} />
        </div>
        <div className="streak-info">
          <h3>{streak} Day Streak</h3>
          <p>Keep it going! 💪</p>
        </div>
        <button
          className="share-btn"
          onClick={handleShare}
          title="Share your streak"
        >
          <Share2 size={18} />
        </button>
      </div>

      <div className="streak-stats">
        <div className="stat">
          <TrendingUp size={18} />
          <span>Longest: {longestStreak} days</span>
        </div>
      </div>

      <div className="streak-calendar">
        {recentDays.map((day, idx) => (
          <motion.div
            key={day.date}
            className={`day-indicator ${day.hasEntry ? 'active' : ''}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            title={day.date}
          >
            <span className="day-label">{day.day}</span>
            <div className="day-dot"></div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

export default StreakDisplay

