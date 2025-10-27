import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Calendar, Save, Edit, Trash2, Plus } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import './JournalEntry.css'

function JournalEntry() {
  const { user, profile } = useAuth()
  const [entries, setEntries] = useState([])
  const [todayEntry, setTodayEntry] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [tags, setTags] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Only fetch when we have both user and profile (authentication is complete)
    if (user && profile) {
      fetchEntries()
      checkTodayEntry()
    }
  }, [user, profile])

  const fetchEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      setEntries(data || [])
    } catch (error) {
      console.error('Error fetching entries:', error)
    }
  }

  const checkTodayEntry = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', today)
        .maybeSingle()  // Use maybeSingle() instead of single() to handle 0 results gracefully

      if (error) {
        console.error('Error checking today entry:', error)
        setTodayEntry(null)
        return
      }

      if (data) {
        setTodayEntry(data)
        setTitle(data.title)
        setContent(data.content)
        setTags(data.tags?.join(', ') || '')
      } else {
        // No entry for today
        setTodayEntry(null)
      }
    } catch (error) {
      console.error('Error in checkTodayEntry:', error)
      setTodayEntry(null)
    }
  }

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error('Please fill in title and content')
      return
    }

    setLoading(true)
    try {
      const tagArray = tags.split(',').map(t => t.trim()).filter(t => t)
      
      if (todayEntry) {
        // Update existing entry
        const { error } = await supabase
          .from('journal_entries')
          .update({
            title,
            content,
            tags: tagArray,
            updated_at: new Date().toISOString()
          })
          .eq('id', todayEntry.id)

        if (error) throw error
        toast.success('Journal entry updated!')
      } else {
        // Create new entry
        const { error } = await supabase
          .from('journal_entries')
          .insert([{
            user_id: user.id,
            title,
            content,
            tags: tagArray
          }])

        if (error) throw error
        toast.success('Journal entry saved!')
      }

      fetchEntries()
      checkTodayEntry()
      setIsEditing(false)
    } catch (error) {
      toast.error('Error saving entry: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this entry?')) return

    try {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Entry deleted')
      fetchEntries()
      if (todayEntry?.id === id) {
        setTodayEntry(null)
        setTitle('')
        setContent('')
        setTags('')
      }
    } catch (error) {
      toast.error('Error deleting entry')
    }
  }

  const handleNewEntry = () => {
    setTodayEntry(null)
    setTitle('')
    setContent('')
    setTags('')
    setIsEditing(true)
  }

  return (
    <div className="journal-entry-container">
      <div className="journal-editor">
        <div className="editor-header">
          <h2>
            <Calendar size={24} />
            Today's Entry
          </h2>
          {todayEntry && !isEditing ? (
            <button
              className="btn btn-primary"
              onClick={() => setIsEditing(true)}
            >
              <Edit size={18} />
              Edit
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={loading}
            >
              <Save size={18} />
              {loading ? 'Saving...' : 'Save'}
            </button>
          )}
        </div>

        {isEditing || !todayEntry ? (
          <motion.div
            className="editor-form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="input-group">
              <label>Title</label>
              <input
                type="text"
                className="input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What did you work on today?"
              />
            </div>

            <div className="input-group">
              <label>Content</label>
              <textarea
                className="input"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Describe your development activities, learnings, challenges..."
                rows={8}
              />
            </div>

            <div className="input-group">
              <label>Tags (comma separated)</label>
              <input
                type="text"
                className="input"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="react, nodejs, bug-fix"
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            className="entry-preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h3>{todayEntry.title}</h3>
            <p className="entry-content">{todayEntry.content}</p>
            {todayEntry.tags && todayEntry.tags.length > 0 && (
              <div className="tags">
                {todayEntry.tags.map((tag, idx) => (
                  <span key={idx} className="badge badge-primary">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>

      <div className="journal-history">
        <div className="history-header">
          <h3>Recent Entries</h3>
          <button className="btn btn-secondary" onClick={handleNewEntry}>
            <Plus size={18} />
            New Entry
          </button>
        </div>

        <div className="entries-list">
          {entries.length === 0 ? (
            <div className="empty-state">
              <p>No entries yet. Start journaling today! 📝</p>
            </div>
          ) : (
            entries.map((entry) => (
              <motion.div
                key={entry.id}
                className="entry-card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="entry-header">
                  <div>
                    <h4>{entry.title}</h4>
                    <span className="entry-date">
                      {format(new Date(entry.created_at), 'MMM dd, yyyy')}
                    </span>
                  </div>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(entry.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <p className="entry-excerpt">
                  {entry.content.substring(0, 100)}
                  {entry.content.length > 100 && '...'}
                </p>
                {entry.tags && entry.tags.length > 0 && (
                  <div className="tags">
                    {entry.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="badge badge-primary">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default JournalEntry

