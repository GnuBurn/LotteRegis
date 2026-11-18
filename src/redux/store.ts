import { combineReducers, configureStore } from '@reduxjs/toolkit'
import workshopFilterReducer from './features/workshopFilterSlice'

// Built once at module load: combineReducers probes each reducer with a random
// action type, and Next.js forbids Math.random() while prerendering a render
const rootReducer = combineReducers({
  workshopFilter: workshopFilterReducer,
})

// A new store per request on the server; ReduxProvider keeps one per browser tab
export function makeStore() {
  return configureStore({ reducer: rootReducer })
}

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<typeof rootReducer>
export type AppDispatch = AppStore['dispatch']
