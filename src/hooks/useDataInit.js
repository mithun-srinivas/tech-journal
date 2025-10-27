import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useAuth } from '../contexts/AuthContext'
import { fetchJournalEntries } from '../store/slices/journalSlice'
import { fetchProjects } from '../store/slices/projectsSlice'
import { fetchDailyTips, fetchAllTips } from '../store/slices/tipsSlice'

/**
 * Hook to initialize all data when user logs in
 * Only fetches once per login session
 */
export const useDataInit = () => {
  const dispatch = useDispatch()
  const { user, profile, isAdmin } = useAuth()

  useEffect(() => {
    if (user && profile) {
      console.log('📊 Initializing data from API...')
      
      // Fetch user's journal entries
      dispatch(fetchJournalEntries(user.id))
      
      // Fetch user's projects
      dispatch(fetchProjects(user.id))
      
      // Fetch daily tips (public feed)
      dispatch(fetchDailyTips())
      
      // If admin, fetch all tips
      if (isAdmin) {
        dispatch(fetchAllTips())
      }

      console.log('✅ Data initialization complete')
    }
  }, [user?.id, profile?.id, isAdmin, dispatch])
}

