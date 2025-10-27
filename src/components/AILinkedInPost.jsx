import { useState } from 'react'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { Sparkles, Copy, RefreshCw, Settings } from 'lucide-react'
import toast from 'react-hot-toast'
import './AILinkedInPost.css'

function AILinkedInPost({ geminiApiKey, onRequestApiKey }) {
  const { user, profile } = useAuth()
  const entries = useSelector(state => state.journal.entries)
  const [loading, setLoading] = useState(false)
  const [generatedPost, setGeneratedPost] = useState('')
  
  // Get recent 5 entries from Redux store
  const recentEntries = entries.slice(0, 5)

  const generatePost = async () => {
    if (!geminiApiKey) {
      toast.error('Please set your Gemini API key first')
      onRequestApiKey()
      return
    }

    if (recentEntries.length === 0) {
      toast.error('Please add some journal entries first')
      return
    }

    setLoading(true)
    try {
      // Prepare context from recent entries
      const context = recentEntries
        .map(entry => `${entry.title}: ${entry.content}`)
        .join('\n\n')

      // Call Gemini API
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Based on the following developer journal entries, create an engaging LinkedIn post that highlights achievements, learnings, and progress. Keep it professional, concise (max 300 words), and inspiring. Include relevant hashtags.\n\nJournal Entries:\n${context}\n\nLinkedIn Post:`
              }]
            }]
          })
        }
      )

      if (!response.ok) {
        throw new Error('Failed to generate post')
      }

      const data = await response.json()
      const post = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
      
      if (post) {
        setGeneratedPost(post)
        toast.success('Post generated successfully!')
      } else {
        throw new Error('No content generated')
      }
    } catch (error) {
      console.error('Error generating post:', error)
      toast.error('Failed to generate post. Check your API key.')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPost)
    toast.success('Copied to clipboard!')
  }

  return (
    <div className="ai-linkedin-post">
      <div className="ai-header">
        <div>
          <h2>
            <Sparkles size={24} />
            AI LinkedIn Post Generator
          </h2>
          <p>Generate engaging posts from your journal entries</p>
        </div>
        <button
          className="btn btn-secondary"
          onClick={onRequestApiKey}
        >
          <Settings size={18} />
          {geminiApiKey ? 'Update' : 'Set'} API Key
        </button>
      </div>

      {!geminiApiKey && (
        <motion.div
          className="api-key-notice"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Sparkles size={20} />
          <div>
            <strong>Gemini API Key Required</strong>
            <p>Set your Gemini API key to use AI-powered post generation</p>
          </div>
          <button className="btn btn-primary" onClick={onRequestApiKey}>
            Set API Key
          </button>
        </motion.div>
      )}

      <div className="ai-content">
        <div className="generate-section">
          <h3>Recent Activity Summary</h3>
          {recentEntries.length === 0 ? (
            <div className="empty-state">
              <p>No journal entries found. Start journaling to generate posts! 📝</p>
            </div>
          ) : (
            <div className="entries-summary">
              <p>Based on your last {recentEntries.length} journal entries</p>
              <ul>
                {recentEntries.slice(0, 3).map((entry, idx) => (
                  <li key={entry.id}>
                    {idx + 1}. {entry.title}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            className="btn btn-primary generate-btn"
            onClick={generatePost}
            disabled={loading || !geminiApiKey || recentEntries.length === 0}
          >
            {loading ? (
              <>
                <span className="spinner-small"></span>
                Generating...
              </>
            ) : (
              <>
                <RefreshCw size={18} />
                Generate LinkedIn Post
              </>
            )}
          </button>
        </div>

        {generatedPost && (
          <motion.div
            className="generated-post"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="post-header">
              <h3>Generated Post</h3>
              <div className="post-actions">
                <button
                  className="btn btn-secondary"
                  onClick={generatePost}
                  disabled={loading}
                >
                  <RefreshCw size={16} />
                  Regenerate
                </button>
                <button
                  className="btn btn-primary"
                  onClick={copyToClipboard}
                >
                  <Copy size={16} />
                  Copy
                </button>
              </div>
            </div>
            <div className="post-content">
              <pre>{generatedPost}</pre>
            </div>
          </motion.div>
        )}
      </div>

      <div className="ai-tips">
        <h4>💡 Tips for better posts:</h4>
        <ul>
          <li>Journal regularly to build better context</li>
          <li>Include specific achievements and learnings</li>
          <li>Mention technologies and projects you're working on</li>
          <li>Edit the generated post to add your personal touch</li>
        </ul>
      </div>
    </div>
  )
}

export default AILinkedInPost

