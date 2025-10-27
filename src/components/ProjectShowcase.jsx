import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Plus, Edit, Trash2, ExternalLink, Share2, CheckCircle, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import './ProjectShowcase.css'

function ProjectShowcase({ onShare }) {
  const { user, profile } = useAuth()
  const [projects, setProjects] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [filter, setFilter] = useState('all') // all, in-progress, completed
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    technologies: '',
    status: 'in-progress',
    github_url: '',
    demo_url: '',
    image_url: ''
  })

  useEffect(() => {
    if (user && profile) {
      fetchProjects()
    }
  }, [user, profile])

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProjects(data || [])
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.description.trim()) {
      toast.error('Please fill in name and description')
      return
    }

    try {
      const techArray = formData.technologies
        .split(',')
        .map(t => t.trim())
        .filter(t => t)

      const projectData = {
        ...formData,
        technologies: techArray,
        user_id: user.id
      }

      if (editingProject) {
        const { error } = await supabase
          .from('projects')
          .update(projectData)
          .eq('id', editingProject.id)

        if (error) throw error
        toast.success('Project updated!')
      } else {
        const { error } = await supabase
          .from('projects')
          .insert([projectData])

        if (error) throw error
        toast.success('Project created!')
      }

      fetchProjects()
      handleCloseModal()
    } catch (error) {
      toast.error('Error saving project: ' + error.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this project?')) return

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Project deleted')
      fetchProjects()
    } catch (error) {
      toast.error('Error deleting project')
    }
  }

  const handleEdit = (project) => {
    setEditingProject(project)
    setFormData({
      name: project.name,
      description: project.description,
      technologies: project.technologies?.join(', ') || '',
      status: project.status,
      github_url: project.github_url || '',
      demo_url: project.demo_url || '',
      image_url: project.image_url || ''
    })
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingProject(null)
    setFormData({
      name: '',
      description: '',
      technologies: '',
      status: 'in-progress',
      github_url: '',
      demo_url: '',
      image_url: ''
    })
  }

  const filteredProjects = projects.filter(project => {
    if (filter === 'all') return true
    return project.status === filter
  })

  return (
    <div className="project-showcase">
      <div className="showcase-header">
        <div>
          <h2>My Projects 🚀</h2>
          <p>Showcase your amazing work</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          <Plus size={18} />
          Add Project
        </button>
      </div>

      <div className="project-filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Projects ({projects.length})
        </button>
        <button
          className={`filter-btn ${filter === 'in-progress' ? 'active' : ''}`}
          onClick={() => setFilter('in-progress')}
        >
          <Clock size={16} />
          In Progress ({projects.filter(p => p.status === 'in-progress').length})
        </button>
        <button
          className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          <CheckCircle size={16} />
          Completed ({projects.filter(p => p.status === 'completed').length})
        </button>
      </div>

      <div className="projects-grid">
        {filteredProjects.length === 0 ? (
          <div className="empty-state">
            <p>No projects yet. Start showcasing your work! 🎨</p>
          </div>
        ) : (
          filteredProjects.map((project) => (
            <motion.div
              key={project.id}
              className="project-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              layout
            >
              {project.image_url && (
                <div className="project-image">
                  <img src={project.image_url} alt={project.name} />
                </div>
              )}
              <div className="project-content">
                <div className="project-header">
                  <h3>{project.name}</h3>
                  <div className="project-actions">
                    <button
                      className="action-btn"
                      onClick={() => onShare('project', project)}
                      title="Share project"
                    >
                      <Share2 size={16} />
                    </button>
                    <button
                      className="action-btn"
                      onClick={() => handleEdit(project)}
                      title="Edit project"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => handleDelete(project.id)}
                      title="Delete project"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <p className="project-description">{project.description}</p>

                {project.technologies && project.technologies.length > 0 && (
                  <div className="technologies">
                    {project.technologies.map((tech, idx) => (
                      <span key={idx} className="badge badge-primary">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}

                <div className="project-footer">
                  <span className={`status-badge ${project.status}`}>
                    {project.status === 'completed' ? (
                      <><CheckCircle size={14} /> Completed</>
                    ) : (
                      <><Clock size={14} /> In Progress</>
                    )}
                  </span>
                  <div className="project-links">
                    {project.github_url && (
                      <a
                        href={project.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link-btn"
                      >
                        GitHub <ExternalLink size={14} />
                      </a>
                    )}
                    {project.demo_url && (
                      <a
                        href={project.demo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link-btn"
                      >
                        Demo <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                </div>
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
              <h2>{editingProject ? 'Edit Project' : 'Add New Project'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="input-group">
                  <label>Project Name *</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="My Awesome Project"
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Description *</label>
                  <textarea
                    className="input"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your project..."
                    rows={4}
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Technologies (comma separated)</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.technologies}
                    onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                    placeholder="React, Node.js, MongoDB"
                  />
                </div>

                <div className="input-group">
                  <label>Status</label>
                  <select
                    className="input"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div className="input-group">
                  <label>GitHub URL</label>
                  <input
                    type="url"
                    className="input"
                    value={formData.github_url}
                    onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                    placeholder="https://github.com/username/repo"
                  />
                </div>

                <div className="input-group">
                  <label>Demo URL</label>
                  <input
                    type="url"
                    className="input"
                    value={formData.demo_url}
                    onChange={(e) => setFormData({ ...formData, demo_url: e.target.value })}
                    placeholder="https://myproject.com"
                  />
                </div>

                <div className="input-group">
                  <label>Image URL</label>
                  <input
                    type="url"
                    className="input"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingProject ? 'Update' : 'Create'} Project
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

export default ProjectShowcase

