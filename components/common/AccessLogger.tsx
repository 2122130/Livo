'use client'

import { useEffect, useRef } from 'react'

export function AccessLogger({ screenId }: { screenId: string }) {
  const logIdRef = useRef<string | null>(null)
  const sentLeaveRef = useRef(false)

  useEffect(() => {
    let active = true

    // 入室記録
    fetch('/api/access-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ screen_id: screenId, device_info: navigator.userAgent }),
    })
      .then((r) => r.json())
      .then((d) => { if (active && d.log_id) logIdRef.current = d.log_id })
      .catch(() => {})

    // 退室記録(sendBeaconで確実に送る)
    const sendLeave = () => {
      if (sentLeaveRef.current || !logIdRef.current) return
      sentLeaveRef.current = true
      const body = JSON.stringify({ log_id: logIdRef.current })
      // sendBeaconはPATCHを送れないので、退室用に専用POSTを使う(下記API側で判定)
      navigator.sendBeacon('/api/access-log/leave', body)
    }

    // タブが隠れた/ページを離れるタイミングで退室記録
    const onHidden = () => { if (document.visibilityState === 'hidden') sendLeave() }
    document.addEventListener('visibilitychange', onHidden)
    window.addEventListener('pagehide', sendLeave)

    return () => {
      active = false
      document.removeEventListener('visibilitychange', onHidden)
      window.removeEventListener('pagehide', sendLeave)
      sendLeave() // コンポーネントのアンマウント(画面遷移)時にも記録
    }
  }, [screenId])

  return null
}   