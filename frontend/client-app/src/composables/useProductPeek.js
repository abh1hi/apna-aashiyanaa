// composables/useProductPeek.js
import { ref } from 'vue'

export function useProductPeek() {
  const showPeek = ref(false)
  const peekProduct = ref(null)
  let hoverTimer = null
  let longPressTimer = null
  let touchStartTime = 0
  let touchStartX = 0
  let touchStartY = 0
  const LONG_PRESS_DURATION = 600 // 600ms for long press
  const HOVER_DELAY = 2000 // 2 seconds for hover delay
  const MOVE_THRESHOLD = 10 // pixels

  const openPeek = (product) => {
    peekProduct.value = product
    showPeek.value = true
  }

  const closePeek = () => {
    showPeek.value = false
    peekProduct.value = null
  }

  // Desktop hover handlers
  const handleMouseEnter = (product) => {
    clearTimeout(hoverTimer)
    hoverTimer = setTimeout(() => {
      openPeek(product)
    }, HOVER_DELAY)
  }

  const handleMouseLeave = () => {
    clearTimeout(hoverTimer)
  }

  // Mobile touch handlers
  const handleTouchStart = (event, product) => {
    touchStartTime = Date.now()
    touchStartX = event.touches[0].clientX
    touchStartY = event.touches[0].clientY
    
    longPressTimer = setTimeout(() => {
      openPeek(product)
      // Prevent context menu on long press
      event.preventDefault()
    }, LONG_PRESS_DURATION)
  }

  const handleTouchMove = (event) => {
    const currentX = event.touches[0].clientX
    const currentY = event.touches[0].clientY
    const moveX = Math.abs(currentX - touchStartX)
    const moveY = Math.abs(currentY - touchStartY)

    // Cancel long press if finger moved too much
    if (moveX > MOVE_THRESHOLD || moveY > MOVE_THRESHOLD) {
      clearTimeout(longPressTimer)
    }
  }

  const handleTouchEnd = () => {
    clearTimeout(longPressTimer)
    
    // If it was a quick tap (less than long press duration), don't show peek
    const touchDuration = Date.now() - touchStartTime
    if (touchDuration < LONG_PRESS_DURATION) {
      // Handle normal click/tap
      return false
    }
    return true
  }

  return {
    showPeek,
    peekProduct,
    openPeek,
    closePeek,
    handleMouseEnter,
    handleMouseLeave,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  }
}
