import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Key, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'
import './GeminiApiKeyModal.css'

function GeminiApiKeyModal({ isOpen, onClose, onSave, currentKey }) {
  const [apiKey, setApiKey] = useState(currentKey || '')

  const handleSave = () => {
    if (!apiKey.trim()) {
      toast.error('Please enter a valid API key')
      return
    }
    onSave(apiKey.trim())
    toast.success('API key saved!')
    onClose()
  }

  const handleClear = () => {
    setApiKey('')
    onSave('')
    toast.success('API key cleared')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="api-key-modal"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="header-icon">
                <Key size={24} />
              </div>
              <div>
                <h2>Gemini API Key</h2>
                <p>Enter your Google Gemini API key for AI features</p>
              </div>
              <button className="close-btn" onClick={onClose}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="info-box">
                <h4>How to get your API key:</h4>
                <ol>
                  <li>Visit Google AI Studio</li>
                  <li>Sign in with your Google account</li>
                  <li>Click "Get API Key" or "Create API Key"</li>
                  <li>Copy and paste it below</li>
                </ol>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="external-link"
                >
                  Get API Key <ExternalLink size={14} />
                </a>
                <p style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
                  Using Gemini 1.5 Flash model for fast, quality generation
                </p>
              </div>

              <div className="input-group">
                <label htmlFor="apiKey">API Key</label>
                <input
                  id="apiKey"
                  type="password"
                  className="input"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your Gemini API key"
                />
                <small className="input-hint">
                  Your API key is stored locally in your browser
                </small>
              </div>

              <div className="modal-actions">
                {currentKey && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleClear}
                  >
                    Clear Key
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSave}
                >
                  Save API Key
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default GeminiApiKeyModal

