'use client'

import { useState } from 'react'
import { Provider } from 'react-redux'
import { makeStore } from './store'

export default function ReduxProvider({ children }: { children: React.ReactNode }) {
  // Created once per mount, so the store survives client-side navigation
  const [store] = useState(makeStore)
  return <Provider store={store}>{children}</Provider>
}
