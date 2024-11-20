import { useCallback } from 'react'
import { track } from '@vercel/analytics'
import { useSession } from 'next-auth/react'
import { log } from './logger'

export function useAnalytics() {
  const { data: session, status } = useSession()

  const trackEvent = useCallback(async (eventName: string, properties?: Record<string, any>) => {
    // Client-side tracking
    track(eventName, properties)

    // Server-side tracking
    if (status === 'authenticated' && session) {
      try {
        const response = await fetch('/api/log-event', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ event: eventName, properties }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          log.error(`Server responded with an error: ${response.status}`, errorData)
        }
      } catch (error) {
        log.error('Failed to log event to server:', error)
      }
    } else if (status === 'unauthenticated') {
      log.info('User not authenticated. Server-side event logging skipped.')
    } else {
      log.info('Session not ready. Server-side event logging skipped.')
    }
  }, [session, status])

  return { trackEvent }
}