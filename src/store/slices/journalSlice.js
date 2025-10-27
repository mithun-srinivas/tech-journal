import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabase } from '../../lib/supabase'

// Async thunks
export const fetchJournalEntries = createAsyncThunk(
  'journal/fetchEntries',
  async (userId, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const createJournalEntry = createAsyncThunk(
  'journal/createEntry',
  async ({ userId, title, content, tags }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .insert([{ user_id: userId, title, content, tags }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const updateJournalEntry = createAsyncThunk(
  'journal/updateEntry',
  async ({ id, title, content, tags }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .update({ title, content, tags, updated_at: new Date().toISOString() })
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

export const deleteJournalEntry = createAsyncThunk(
  'journal/deleteEntry',
  async (id, { rejectWithValue }) => {
    try {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', id)

      if (error) throw error
      return id
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const journalSlice = createSlice({
  name: 'journal',
  initialState: {
    entries: [],
    loading: false,
    error: null,
    lastFetched: null,
  },
  reducers: {
    clearJournal: (state) => {
      state.entries = []
      state.loading = false
      state.error = null
      state.lastFetched = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch entries
      .addCase(fetchJournalEntries.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchJournalEntries.fulfilled, (state, action) => {
        state.loading = false
        state.entries = action.payload
        state.lastFetched = Date.now()
      })
      .addCase(fetchJournalEntries.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Create entry
      .addCase(createJournalEntry.fulfilled, (state, action) => {
        state.entries.unshift(action.payload)
      })
      // Update entry
      .addCase(updateJournalEntry.fulfilled, (state, action) => {
        const index = state.entries.findIndex(e => e.id === action.payload.id)
        if (index !== -1) {
          state.entries[index] = action.payload
        }
      })
      // Delete entry
      .addCase(deleteJournalEntry.fulfilled, (state, action) => {
        state.entries = state.entries.filter(e => e.id !== action.payload)
      })
  },
})

export const { clearJournal } = journalSlice.actions
export default journalSlice.reducer

