import { useCallback, useEffect, useState } from 'react'
import { initLiff, liff } from './liffClient.js'

const initialState = {
  loading: true,
  error: null,
  profile: null, // { lineUserId, displayName, pictureUrl } once logged in
  idToken: null,
  isInClient: false,
}

export function useLiffProfile() {
  const [state, setState] = useState(initialState)

  useEffect(() => {
    let cancelled = false

    initLiff()
      .then(async () => {
        if (cancelled) return
        const isInClient = liff.isInClient()

        if (!liff.isLoggedIn()) {
          setState({ ...initialState, loading: false, isInClient })
          return
        }

        const rawProfile = await liff.getProfile()
        const idToken = liff.getIDToken()
        if (cancelled) return

        setState({
          loading: false,
          error: null,
          isInClient,
          idToken,
          profile: {
            lineUserId: rawProfile.userId,
            displayName: rawProfile.displayName,
            pictureUrl: rawProfile.pictureUrl,
          },
        })
      })
      .catch((err) => {
        if (!cancelled) setState({ ...initialState, loading: false, error: err.message })
      })

    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(() => {
    liff.login({ redirectUri: window.location.href })
  }, [])

  const logout = useCallback(() => {
    liff.logout()
    window.location.reload()
  }, [])

  return { ...state, login, logout }
}
