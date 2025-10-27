import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabase } from '../../lib/supabase'

// Async thunks
export const fetchDailyTips = createAsyncThunk(
  'tips/fetchDailyTips',
  async (_, { rejectWithValue }) => {
    try {
      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timed out')), 10000)
      )

      // Race between query and timeout
      const queryPromise = supabase
        .from('daily_tips')
        .select(`
          *,
          profiles:created_by (username)
        `)
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(20)

      const { data, error } = await Promise.race([queryPromise, timeoutPromise])

      if (error) throw error
      return data || []
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchAllTips = createAsyncThunk(
  'tips/fetchAllTips',
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('daily_tips')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const createTip = createAsyncThunk(
  'tips/createTip',
  async (tipData, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('daily_tips')
        .insert([tipData])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const updateTip = createAsyncThunk(
  'tips/updateTip',
  async ({ id, ...tipData }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('daily_tips')
        .update(tipData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const deleteTip = createAsyncThunk(
  'tips/deleteTip',
  async (id, { rejectWithValue }) => {
    try {
      const { error } = await supabase
        .from('daily_tips')
        .delete()
        .eq('id', id)

      if (error) throw error
      return id
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const tipsSlice = createSlice({
  name: 'tips',
  initialState: {
    tips: [],
    allTips: [], // For admin view
    loading: false,
    error: null,
    lastFetched: null,
  },
  reducers: {
    clearTips: (state) => {
      state.tips = []
      state.allTips = []
      state.loading = false
      state.error = null
      state.lastFetched = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch daily tips (public)
      .addCase(fetchDailyTips.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDailyTips.fulfilled, (state, action) => {
        state.loading = false
        state.tips = action.payload
        state.lastFetched = Date.now()
      })
      .addCase(fetchDailyTips.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch all tips (admin)
      .addCase(fetchAllTips.fulfilled, (state, action) => {
        state.allTips = action.payload
      })
      // Create tip
      .addCase(createTip.fulfilled, (state, action) => {
        state.tips.unshift(action.payload)
        state.allTips.unshift(action.payload)
      })
      // Update tip
      .addCase(updateTip.fulfilled, (state, action) => {
        const updateBoth = (list) => {
          const index = list.findIndex(t => t.id === action.payload.id)
          if (index !== -1) {
            list[index] = action.payload
          }
        }
        updateBoth(state.tips)
        updateBoth(state.allTips)
      })
      // Delete tip
      .addCase(deleteTip.fulfilled, (state, action) => {
        state.tips = state.tips.filter(t => t.id !== action.payload)
        state.allTips = state.allTips.filter(t => t.id !== action.payload)
      })
  },
})

export const { clearTips } = tipsSlice.actions
export default tipsSlice.reducer

