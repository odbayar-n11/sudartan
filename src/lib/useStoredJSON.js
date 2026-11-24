'use client'

import { useMemo, useSyncExternalStore } from 'react'

// Reads a JSON value from localStorage without a server/browser mismatch:
// the server (and the first browser render) see the fallback, then the stored value.
const EVENT = 'sudartan-progress'

function subscribe(cb) {
  window.addEventListener('storage', cb)
  window.addEventListener(EVENT, cb)
  return () => {
    window.removeEventListener('storage', cb)
    window.removeEventListener(EVENT, cb)
  }
}

export function useStoredJSON(key, fallback = '{}') {
  const raw = useSyncExternalStore(
    subscribe,
    () => {
      try {
        return localStorage.getItem(key) ?? fallback
      } catch {
        return fallback
      }
    },
    () => fallback
  )
  return useMemo(() => {
    try {
      return JSON.parse(raw)
    } catch {
      return JSON.parse(fallback)
    }
  }, [raw, fallback])
}

export function saveStoredJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    window.dispatchEvent(new Event(EVENT))
  } catch {}
}
