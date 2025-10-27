import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { createTip, updateTip, deleteTip } from '../../store/slices/tipsSlice'
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import './DailyTipsManager.css'

function DailyTipsManager() {
  const { user, profile } = useAuth()
  const dispatch = useDispatch()
  const tips = useSelector(state => state.tips.allTips)
  const [showModal, setShowModal] = useState(false)
  const [editingTip, setEditingTip] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
    published: true
  })

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Please fill in title and content')
      return
    }

    try {
      const tagArray = formData.tags
        .split(',')
        .map(t => t.trim())
        .filter(t => t)

      const tipData = {
        title: formData.title,
        content: formData.content,
        tags: tagArray,
        published: formData.published,
        created_by: user.id
      }

      if (editingTip) {
        await dispatch(updateTip({
          id: editingTip.id,
          ...tipData
        })).unwrap()
        
        toast.success('Tip updated!')
      } else {
        await dispatch(createTip(tipData)).unwrap()
        toast.success('Tip created!')
      }

      handleCloseModal()
    } catch (error) {
      toast.error('Error saving tip: ' + error)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this tip?')) return

    try {
      await dispatch(deleteTip(id)).unwrap()
      toast.success('Tip deleted')
    } catch (error) {
      toast.error('Error deleting tip: ' + error)
    }
  }

  const handleTogglePublish = async (id, currentStatus) => {
    try {
      const tip = tips.find(t => t.id === id)
      if (!tip) return
      
      await dispatch(updateTip({
        id,
        published: !currentStatus
      })).unwrap()
      
      toast.success(currentStatus ? 'Tip unpublished' : 'Tip published')
    } catch (error) {
      toast.error('Error updating tip: ' + error)
    }
  }

  const handleEdit = (tip) => {
    setEditingTip(tip)
    setFormData({
      title: tip.title,
      content: tip.content,
      tags: tip.tags?.join(', ') || '',
      published: tip.published
    })
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingTip(null)
    setFormData({
      title: '',
      content: '',
      tags: '',
      published: true
    })
  }

  return (
    <div className="daily-tips-manager">
      <div className="tips-header">
        <div>
          <h3>Daily Developer Tips</h3>
          <p>Share valuable insights with your community</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          <Plus size={18} />
          New Tip
        </button>
      </div>

      <div className="tips-list">
        {tips.length === 0 ? (
          <div className="empty-state">
            <p>No tips yet. Create your first tip! 💡</p>
          </div>
        ) : (
          tips.map((tip) => (
            <motion.div
              key={tip.id}
              className="tip-item"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="tip-main">
                <div>
                  <div className="tip-title-row">
                    <h4>{tip.title}</h4>
                    <span className={`status-indicator ${tip.published ? 'published' : 'draft'}`}>
                      {tip.published ? (
                        <>
                          <Eye size={12} />
                          Published
                        </>
                      ) : (
                        <>
                          <EyeOff size={12} />
                          Draft
                        </>
                      )}
                    </span>
                  </div>
                  <p className="tip-content-preview">{tip.content}</p>
                  {tip.tags && tip.tags.length > 0 && (
                    <div className="tip-tags">
                      {tip.tags.map((tag, idx) => (
                        <span key={idx} className="badge badge-primary">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <span className="tip-date">
                    {format(new Date(tip.created_at), 'MMM dd, yyyy')}
                  </span>
                </div>
              </div>
              <div className="tip-actions">
                <button
                  className="action-btn"
                  onClick={() => handleTogglePublish(tip.id, tip.published)}
                  title={tip.published ? 'Unpublish' : 'Publish'}
                >
                  {tip.published ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button
                  className="action-btn"
                  onClick={() => handleEdit(tip)}
                  title="Edit tip"
                >
                  <Edit size={16} />
                </button>
                <button
                  className="action-btn delete"
                  onClick={() => handleDelete(tip.id)}
                  title="Delete tip"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseModal}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2>{editingTip ? 'Edit Tip' : 'Create New Tip'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="input-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Tip title..."
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Content *</label>
                  <textarea
                    className="input"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Share your developer tip..."
                    rows={6}
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Tags (comma separated)</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="javascript, react, best-practices"
                  />
                </div>

                <div className="input-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.published}
                      onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    />
                    <span>Publish immediately</span>
                  </label>
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingTip ? 'Update' : 'Create'} Tip
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default DailyTipsManager

