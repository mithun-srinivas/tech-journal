import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'
import JournalEntry from '../components/JournalEntry'
import StreakDisplay from '../components/StreakDisplay'
import ProjectShowcase from '../components/ProjectShowcase'
import DailyFeed from '../components/DailyFeed'
import AILinkedInPost from '../components/AILinkedInPost'
import ShareModal from '../components/ShareModal'
import GeminiApiKeyModal from '../components/GeminiApiKeyModal'
import './Dashboard.css'

function Dashboard() {
  const { user, profile } = useAuth()
  const [activeTab, setActiveTab] = useState('journal')
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareData, setShareData] = useState(null)
  const [showApiKeyModal, setShowApiKeyModal] = useState(false)
  const [geminiApiKey, setGeminiApiKey] = useState('')

  useEffect(() => {
    // Load Gemini API key from localStorage
    const savedKey = localStorage.getItem('gemini_api_key')
    if (savedKey) {
      setGeminiApiKey(savedKey)
    }
  }, [])

  const handleShare = (type, data) => {
    setShareData({ type, data })
    setShowShareModal(true)
  }

  const tabs = [
    { id: 'journal', label: 'Journal', icon: '📝' },
    { id: 'projects', label: 'Projects', icon: '🚀' },
    { id: 'feed', label: 'Daily Feed', icon: '📰' },
    { id: 'ai-post', label: 'AI Posts', icon: '🤖' },
  ]

  return (
    <div className="dashboard">
      <Navbar />
      
      <div className="dashboard-container">
        <motion.div
          className="dashboard-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1>Welcome back, {profile?.username || 'Developer'}! 👋</h1>
            <p className="subtitle">Let's make today count</p>
          </div>
          <StreakDisplay onShare={handleShare} />
        </motion.div>

        <div className="dashboard-tabs">
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
            className="dashboard-content"
          >
            {activeTab === 'journal' && <JournalEntry />}
            {activeTab === 'projects' && <ProjectShowcase onShare={handleShare} />}
            {activeTab === 'feed' && <DailyFeed />}
            {activeTab === 'ai-post' && (
              <AILinkedInPost
                geminiApiKey={geminiApiKey}
                onRequestApiKey={() => setShowApiKeyModal(true)}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        data={shareData}
      />

      <GeminiApiKeyModal
        isOpen={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
        onSave={(key) => {
          setGeminiApiKey(key)
          localStorage.setItem('gemini_api_key', key)
        }}
        currentKey={geminiApiKey}
      />
    </div>
  )
}

export default Dashboard

