/* @flow */
import { useEffect } from 'react'

function syncShortcutActiveClass (selectedShortcutIndex: number): void {
  const items = document.querySelectorAll('.pt-daterangepicker-shortcuts .pt-menu-item')
  if (!items || items.length === 0) return

  items.forEach((item, index) => {
    if (index === selectedShortcutIndex) {
      item.classList.add('active')
      return
    }
    item.classList.remove('active')
  })
}

export function useDateRangeShortcutClassSync (selectedShortcutIndex: number): void {
  useEffect(() => {
    syncShortcutActiveClass(selectedShortcutIndex)

    const timeoutId = window.setTimeout(
      () => syncShortcutActiveClass(selectedShortcutIndex),
      0
    )

    const observer = typeof window.MutationObserver === 'function'
      ? new window.MutationObserver(() => syncShortcutActiveClass(selectedShortcutIndex))
      : null

    if (observer) {
      observer.observe(document.body, { childList: true, subtree: true })
    }

    return () => {
      window.clearTimeout(timeoutId)
      if (observer) observer.disconnect()
    }
  }, [selectedShortcutIndex])
}

export default useDateRangeShortcutClassSync
