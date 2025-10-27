import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { store } from '../store'
import { clearJournal } from '../store/slices/journalSlice'
import { clearProjects } from '../store/slices/projectsSlice'
import { clearTips } from '../store/slices/tipsSlice'
import toast from 'react-hot-toast'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const shouldIgnoreSignedIn = useRef(false)

  useEffect(() => {
    // Check if Supabase is properly configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey || 
        supabaseUrl === 'your_supabase_url_here' || 
        supabaseKey === 'your_supabase_anon_key_here') {
      console.error('❌ Supabase not configured - clearing any stale auth data')
      localStorage.clear()
      setLoading(false)
      return
    }

    // Check if we have a session in localStorage synchronously
    // This prevents the SIGNED_IN event from being handled before checkUser completes
    const hasSessionInStorage = Object.keys(localStorage).some(key => 
      key.startsWith('sb-') && key.includes('-auth-token')
    )
    
    if (hasSessionInStorage) {
      console.log('🔍 Detected session in localStorage, will ignore first SIGNED_IN')
      shouldIgnoreSignedIn.current = true
    }

    checkUser()
    
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.email || 'no user', '| shouldIgnore:', shouldIgnoreSignedIn.current)
        
        // Handle SIGNED_IN events:
        // - If we had an initial session, the first SIGNED_IN is from session restore, ignore it
        // - If we didn't have an initial session, handle all SIGNED_IN events (they're from actual logins)
        if (event === 'SIGNED_IN') {
          if (shouldIgnoreSignedIn.current) {
            console.log('⏭️ Ignoring SIGNED_IN (session was restored from initial check)')
            // Reset the flag so future logins work
            shouldIgnoreSignedIn.current = false
          } else {
            // This is from an actual login
            if (session?.user) {
              console.log('📱 Handling SIGNED_IN event for:', session.user.email)
              setUser(session.user)
              await fetchProfile(session.user.id)
            }
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('👋 User signed out')
          setUser(null)
          setProfile(null)
          setIsAdmin(false)
          setLoading(false)
          shouldIgnoreSignedIn.current = false
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('🔄 Token refreshed, updating user')
          // Just update the user object, don't re-fetch profile
          if (session?.user) {
            setUser(session.user)
          }
        }
      }
    )

    return () => {
      authListener?.subscription?.unsubscribe()
    }
  }, [])

  const checkUser = async () => {
    try {
      console.log('🔍 Checking user session...')
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('❌ Error getting session:', error)
        // Clear any stale session data on error
        const keys = Object.keys(localStorage)
        keys.forEach(key => {
          if (key.startsWith('sb-')) {
            localStorage.removeItem(key)
          }
        })
        setLoading(false)
        shouldIgnoreSignedIn.current = false
        return
      }
      
      if (session?.user) {
        console.log('✅ User session found:', session.user.email)
        
        // Check if token is expired
        const expiresAt = session.expires_at
        const now = Math.floor(Date.now() / 1000)
        
        if (expiresAt && expiresAt < now) {
          console.warn('⚠️ Token expired, clearing session')
          await supabase.auth.signOut()
          setLoading(false)
          shouldIgnoreSignedIn.current = false
          toast.error('Session expired. Please log in again.')
          return
        }
        
        setUser(session.user)
        await fetchProfile(session.user.id)
      } else {
        console.log('ℹ️ No user session found')
        // No session found, so any SIGNED_IN events will be from actual logins
        shouldIgnoreSignedIn.current = false
        setLoading(false)
      }
    } catch (error) {
      console.error('❌ Error checking user:', error)
      setLoading(false)
      shouldIgnoreSignedIn.current = false
    }
  }

  const fetchProfile = async (userId) => {
    try {
      console.log('👤 Fetching profile for user:', userId)
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('❌ Error fetching profile:', error.message, error)
        throw error
      }
      
      if (!data) {
        console.error('❌ No profile data returned')
        throw new Error('Profile not found')
      }
      
      console.log('✅ Profile loaded:', data.username, '- Role:', data.role)
      setProfile(data)
      setIsAdmin(data?.role === 'admin')
      setLoading(false)
      return true
    } catch (error) {
      console.error('❌ Profile fetch failed:', error.message || error, error)
      
      // Always set loading to false first to unblock UI
      setLoading(false)
      setUser(null)
      setProfile(null)
      setIsAdmin(false)
      
      // Clear the bad session
      try {
        console.log('🧹 Clearing bad session...')
        await supabase.auth.signOut()
        // Clear all Supabase-related localStorage
        const keys = Object.keys(localStorage)
        keys.forEach(key => {
          if (key.startsWith('sb-')) {
            localStorage.removeItem(key)
          }
        })
      } catch (signOutError) {
        console.error('Error signing out:', signOutError)
      }
      
      // Show user-friendly message
      if (error.message?.includes('JWT') || error.message?.includes('expired')) {
        toast.error('Session expired. Please log in again.')
      } else if (error.message?.includes('not found') || error.code === 'PGRST116') {
        toast.error('User profile not found. Please contact admin.')
      } else {
        toast.error('Failed to load profile. Please try logging in again.')
      }
      
      return false
    }
  }

  const signUp = async (email, password, username) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          }
        }
      })

      if (error) throw error

      // Create profile
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              username,
              email,
              approved: false,
              role: 'user'
            }
          ])

        if (profileError) throw profileError
      }

      toast.success('Account created! Waiting for admin approval.')
      return { data, error: null }
    } catch (error) {
      toast.error(error.message)
      return { data: null, error }
    }
  }

  const signIn = async (email, password) => {
    try {
      // Check for admin credentials
      if (email === 'admin' && password === 'admin') {
        // Admin login - check if admin account exists
        const { data: adminData, error: adminCheckError } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'admin')
          .eq('username', 'admin')
          .single()

        if (adminCheckError || !adminData) {
          toast.error('Admin account not found. Please set up Supabase first.')
          return { data: null, error: adminCheckError }
        }

        // Sign in with admin email
        const { data, error } = await supabase.auth.signInWithPassword({
          email: adminData.email,
          password: 'admin123' // Admin password
        })

        if (error) throw error
        toast.success('Welcome back, Admin!')
        return { data, error: null }
      }

      // Regular user login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Check if user is approved
      const { data: profileData } = await supabase
        .from('profiles')
        .select('approved')
        .eq('id', data.user.id)
        .single()

      if (!profileData?.approved) {
        await supabase.auth.signOut()
        toast.error('Your account is pending admin approval.')
        return { data: null, error: new Error('Account not approved') }
      }

      toast.success('Welcome back!')
      return { data, error: null }
    } catch (error) {
      toast.error(error.message)
      return { data: null, error }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      // Clear Redux store
      store.dispatch(clearJournal())
      store.dispatch(clearProjects())
      store.dispatch(clearTips())
      
      toast.success('Signed out successfully')
    } catch (error) {
      toast.error(error.message)
    }
  }

  const value = {
    user,
    profile,
    loading,
    isAdmin,
    signUp,
    signIn,
    signOut,
    refreshProfile: () => user && fetchProfile(user.id)
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

