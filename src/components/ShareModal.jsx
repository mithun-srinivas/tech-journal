import { motion, AnimatePresence } from 'framer-motion'
import { X, Twitter, Linkedin, Facebook, Link2, Check, Download } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import './ShareModal.css'

function ShareModal({ isOpen, onClose, data }) {
  const [copied, setCopied] = useState(false)

  if (!data) return null

  const generateShareText = () => {
    if (data.type === 'streak') {
      return `🔥 ${data.data.currentStreak} day coding streak on TechJournal! My longest streak: ${data.data.longestStreak} days. Keep learning, keep building! 💪 #100DaysOfCode #DevLife`
    } else if (data.type === 'project') {
      return `🚀 Check out my project: ${data.data.name}\n${data.data.description}\n\nTech: ${data.data.technologies?.join(', ')}\n#coding #webdev #developer`
    }
    return ''
  }

  const generateShareUrl = () => {
    if (data.type === 'project') {
      // Generate permalink for project
      return `${window.location.origin}/project/${data.data.id}`
    }
    return window.location.origin
  }

  const shareText = generateShareText()
  const shareUrl = generateShareUrl()

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadImage = () => {
    if (data.type === 'streak' && data.data.imageData) {
      const link = document.createElement('a')
      link.download = `techjournal-streak-${data.data.currentStreak}-days.png`
      link.href = data.data.imageData
      link.click()
      toast.success('Image downloaded!')
    }
  }

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
    window.open(url, '_blank', 'width=550,height=420')
  }

  const shareToLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    window.open(url, '_blank', 'width=550,height=420')
  }

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`
    window.open(url, '_blank', 'width=550,height=420')
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
            className="share-modal"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="share-header">
              <h2>
                {data.type === 'project' ? '🚀 Share Project' : 'Share Your Achievement 🎉'}
              </h2>
              <button className="close-btn" onClick={onClose}>
                <X size={20} />
              </button>
            </div>

            <div className="share-preview">
              <p>{shareText}</p>
            </div>

            {data.type === 'streak' && data.data.imageData && (
              <div className="image-preview-box">
                <label>Streak Image:</label>
                <img 
                  src={data.data.imageData} 
                  alt="Streak" 
                  className="streak-preview-image"
                />
                <button 
                  className="btn btn-primary download-image-btn"
                  onClick={downloadImage}
                >
                  <Download size={18} />
                  Download Image
                </button>
              </div>
            )}

            {data.type === 'project' && (
              <div className="permalink-box">
                <label>Public Permalink:</label>
                <div className="permalink-url">
                  <code>{shareUrl}</code>
                </div>
              </div>
            )}

            <div className="share-buttons">
              <button className="share-btn twitter" onClick={shareToTwitter}>
                <Twitter size={20} />
                Twitter
              </button>
              <button className="share-btn linkedin" onClick={shareToLinkedIn}>
                <Linkedin size={20} />
                LinkedIn
              </button>
              <button className="share-btn facebook" onClick={shareToFacebook}>
                <Facebook size={20} />
                Facebook
              </button>
              <button className="share-btn copy" onClick={copyToClipboard}>
                {copied ? <Check size={20} /> : <Link2 size={20} />}
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ShareModal

