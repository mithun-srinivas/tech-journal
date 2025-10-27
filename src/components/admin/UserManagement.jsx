import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import { Check, X, Shield, User, Mail, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import './UserManagement.css'

function UserManagement({ onUpdate }) {
  const [users, setUsers] = useState([])
  const [filter, setFilter] = useState('all') // all, pending, approved
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (userId) => {
    try {
      console.log('✅ Approving user:', userId)
      
      const { data, error } = await supabase
        .from('profiles')
        .update({ approved: true })
        .eq('id', userId)
        .select()

      if (error) {
        console.error('❌ Approval error:', error)
        throw error
      }
      
      console.log('✅ Approval successful:', data)
      
      // Update local state immediately for instant feedback
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, approved: true } : user
        )
      )
      
      toast.success('User approved!')
      
      // Refresh stats in background
      if (onUpdate) onUpdate()
    } catch (error) {
      console.error('❌ Failed to approve user:', error)
      toast.error('Failed to approve user: ' + (error.message || error))
      // Refresh to show correct state
      fetchUsers()
    }
  }

  const handleReject = async (userId) => {
    if (!confirm('Are you sure you want to reject this user?')) return

    try {
      console.log('❌ Rejecting user:', userId)
      
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)

      if (error) {
        console.error('❌ Rejection error:', error)
        throw error
      }
      
      console.log('✅ User rejected successfully')
      
      // Update local state immediately
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId))
      
      toast.success('User rejected')
      
      // Refresh stats in background
      if (onUpdate) onUpdate()
    } catch (error) {
      console.error('❌ Failed to reject user:', error)
      toast.error('Failed to reject user: ' + (error.message || error))
      fetchUsers()
    }
  }

  const handleToggleAdmin = async (userId, currentRole) => {
    try {
      const newRole = currentRole === 'admin' ? 'user' : 'admin'
      console.log('🔄 Toggling role for user:', userId, 'from', currentRole, 'to', newRole)
      
      const { data, error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)
        .select()

      if (error) {
        console.error('❌ Role update error:', error)
        throw error
      }
      
      console.log('✅ Role updated successfully:', data)
      
      // Update local state immediately
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, role: newRole } : user
        )
      )
      
      toast.success(`User role updated to ${newRole}`)
    } catch (error) {
      console.error('❌ Failed to update user role:', error)
      toast.error('Failed to update user role: ' + (error.message || error))
      fetchUsers()
    }
  }

  const filteredUsers = users.filter(user => {
    if (filter === 'pending') return !user.approved
    if (filter === 'approved') return user.approved
    return true
  })

  if (loading) {
    return (
      <div className="user-management">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="user-management">
      <div className="management-header">
        <h3>User Management</h3>
        <div className="user-filters">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({users.length})
          </button>
          <button
            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending ({users.filter(u => !u.approved).length})
          </button>
          <button
            className={`filter-btn ${filter === 'approved' ? 'active' : ''}`}
            onClick={() => setFilter('approved')}
          >
            Approved ({users.filter(u => u.approved).length})
          </button>
        </div>
      </div>

      <div className="users-table">
        {filteredUsers.length === 0 ? (
          <div className="empty-state">
            <p>No users found</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Status</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar-small">
                        {user.username?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <span>{user.username || 'Unknown'}</span>
                    </div>
                  </td>
                  <td>
                    <div className="email-cell">
                      <Mail size={14} />
                      {user.email}
                    </div>
                  </td>
                  <td>
                    {user.approved ? (
                      <span className="badge badge-success">
                        <Check size={12} />
                        Approved
                      </span>
                    ) : (
                      <span className="badge badge-warning">
                        <X size={12} />
                        Pending
                      </span>
                    )}
                  </td>
                  <td>
                    <button
                      className={`role-badge ${user.role === 'admin' ? 'admin' : ''}`}
                      onClick={() => handleToggleAdmin(user.id, user.role)}
                      title="Click to toggle role"
                    >
                      {user.role === 'admin' ? (
                        <>
                          <Shield size={12} />
                          Admin
                        </>
                      ) : (
                        <>
                          <User size={12} />
                          User
                        </>
                      )}
                    </button>
                  </td>
                  <td>
                    <div className="date-cell">
                      <Calendar size={14} />
                      {format(new Date(user.created_at), 'MMM dd, yyyy')}
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      {!user.approved && (
                        <>
                          <button
                            className="action-btn approve"
                            onClick={() => handleApprove(user.id)}
                            title="Approve user"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            className="action-btn reject"
                            onClick={() => handleReject(user.id)}
                            title="Reject user"
                          >
                            <X size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default UserManagement

