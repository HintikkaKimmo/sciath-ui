"use client"

import { useCallback, useEffect, useState } from "react"

type Status = "affected" | "not_affected" | "under_investigation" | "fixed"

interface UseKeyboardTriageOptions {
  itemCount: number
  onStatusChange?: (index: number, status: Status) => void
  onSelect?: (index: number) => void
}

export function useKeyboardTriage({
  itemCount,
  onStatusChange,
  onSelect,
}: UseKeyboardTriageOptions) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set())
  const [isSelecting, setIsSelecting] = useState(false)

  const clamp = useCallback(
    (i: number) => Math.max(0, Math.min(i, itemCount - 1)),
    [itemCount]
  )

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't capture when typing in inputs
      const tag = (e.target as HTMLElement).tagName
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return

      switch (e.key) {
        case "j":
          e.preventDefault()
          setActiveIndex((i) => {
            const next = clamp(i + 1)
            if (e.shiftKey) {
              setSelectedIndices((s) => new Set(s).add(next))
              setIsSelecting(true)
            }
            return next
          })
          break
        case "k":
          e.preventDefault()
          setActiveIndex((i) => {
            const next = clamp(i - 1)
            if (e.shiftKey) {
              setSelectedIndices((s) => new Set(s).add(next))
              setIsSelecting(true)
            }
            return next
          })
          break
        case "a":
          e.preventDefault()
          onStatusChange?.(activeIndex, "affected")
          break
        case "n":
          e.preventDefault()
          onStatusChange?.(activeIndex, "not_affected")
          break
        case "f":
          e.preventDefault()
          onStatusChange?.(activeIndex, "fixed")
          break
        case "u":
          e.preventDefault()
          onStatusChange?.(activeIndex, "under_investigation")
          break
        case "Enter":
          e.preventDefault()
          onSelect?.(activeIndex)
          break
        case "Escape":
          e.preventDefault()
          setSelectedIndices(new Set())
          setIsSelecting(false)
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [activeIndex, clamp, onStatusChange, onSelect])

  return {
    activeIndex,
    setActiveIndex,
    selectedIndices,
    isSelecting,
    clearSelection: () => {
      setSelectedIndices(new Set())
      setIsSelecting(false)
    },
  }
}
