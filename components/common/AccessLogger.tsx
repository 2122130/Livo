'use client'

import { useEffect } from 'react'

export function AccessLogger({ screenId }: { screenId: string }) {
  // useEffect(() => {
  //   // クライアント側でlog_idを生成(サーバーの応答を待たない)
  //   const logId = crypto.randomUUID()
  //   const enteredAt = new Date().toISOString()
  //   let sentLeave = false

  //   // 入室記録(sendBeaconで投げっぱなし)
  //   navigator.sendBeacon(
  //     '/api/access-log/enter',
  //     JSON.stringify({ log_id: logId, screen_id: screenId, device_info: navigator.userAgent, entered_at: enteredAt })
  //   )

  //   // 退室記録
  //   const sendLeave = () => {
  //     if (sentLeave) return
  //     sentLeave = true
  //     navigator.sendBeacon(
  //       '/api/access-log/leave',
  //       JSON.stringify({ log_id: logId, left_at: new Date().toISOString() })
  //     )
  //   }

  //   const onHidden = () => { if (document.visibilityState === 'hidden') sendLeave() }
  //   document.addEventListener('visibilitychange', onHidden)
  //   window.addEventListener('pagehide', sendLeave)

  //   return () => {
  //     document.removeEventListener('visibilitychange', onHidden)
  //     window.removeEventListener('pagehide', sendLeave)
  //     sendLeave()
  //   }
  // }, [screenId])

  return null
}