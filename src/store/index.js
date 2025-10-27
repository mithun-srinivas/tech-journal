import { configureStore } from '@reduxjs/toolkit'
import journalReducer from './slices/journalSlice'
import projectsReducer from './slices/projectsSlice'
import tipsReducer from './slices/tipsSlice'

export const store = configureStore({
  reducer: {
    journal: journalReducer,
    projects: projectsReducer,
    tips: tipsReducer,
  },
})

