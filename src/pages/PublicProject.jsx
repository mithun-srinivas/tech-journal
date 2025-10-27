import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { ExternalLink, Github, Globe, ArrowLeft, CheckCircle, Clock } from 'lucide-react'
import './PublicProject.css'

function PublicProject() {
  const { projectId } = useParams()
  const [project, setProject] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchProject()
  }, [projectId])

  const fetchProject = async () => {
    try {
      setLoading(true)
      
      // Fetch project details
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single()

      if (projectError) throw projectError

      if (!projectData) {
        setError('Project not found')
        setLoading(false)
        return
      }

      setProject(projectData)

      // Fetch creator profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', projectData.user_id)
        .single()

      setProfile(profileData)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching project:', error)
      setError('Failed to load project')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="public-project-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading project...</p>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="public-project-container">
        <div className="error-container">
          <h1>😕 {error || 'Project not found'}</h1>
          <p>The project you're looking for doesn't exist or has been removed.</p>
          <Link to="/" className="btn btn-primary">
            <ArrowLeft size={18} />
            Go to Homepage
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="public-project-container">
      <motion.div
        className="public-project-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {project.image_url && (
          <div className="project-banner">
            <img src={project.image_url} alt={project.name} />
          </div>
        )}

        <div className="project-details">
          <div className="project-header">
            <h1>{project.name}</h1>
            <div className="badge-group">
              <span className="project-badge">
                <Globe size={16} />
                Public Project
              </span>
              <span className={`status-badge ${project.status}`}>
                {project.status === 'completed' ? (
                  <><CheckCircle size={16} /> Completed</>
                ) : (
                  <><Clock size={16} /> In Progress</>
                )}
              </span>
            </div>
          </div>

          <div className="project-meta">
            <span className="creator">
              Created by <strong>{profile?.username || 'Developer'}</strong>
            </span>
            <span className="date">
              {new Date(project.created_at).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          </div>

          <div className="project-description">
            <h2>About this project</h2>
            <p>{project.description}</p>
          </div>

          {project.technologies && project.technologies.length > 0 && (
            <div className="project-tech">
              <h3>Technologies Used</h3>
              <div className="tech-tags">
                {project.technologies.map((tech, idx) => (
                  <span key={idx} className="tech-tag">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="project-links">
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                <Github size={18} />
                View on GitHub
              </a>
            )}
            {project.demo_url && (
              <a
                href={project.demo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                <ExternalLink size={18} />
                Live Demo
              </a>
            )}
          </div>

          <div className="project-footer">
            <p>
              Want to showcase your projects too?{' '}
              <Link to="/login" className="signup-link">
                Sign up for TechJournal
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default PublicProject

