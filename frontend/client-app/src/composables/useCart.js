// useCart.js - Cart composable for global cart state management
import { ref, computed } from 'vue'
import cartService from '../services/cartService'

// Global cart state
const cartItems = ref([])
const isLoading = ref(false)
const error = ref(null)

export const useCart = () => {
  // Computed properties
  const cartCount = computed(() => {
    return cartItems.value.reduce((total, item) => total + (item.quantity || 0), 0)
  })

  const cartTotal = computed(() => {
    return cartItems.value.reduce((total, item) => {
      // Use variant price if available, otherwise use product price
      const price = item.variant?.price || item.product?.price || 0
      return total + (price * (item.quantity || 0))
    }, 0)
  })

  const isEmpty = computed(() => cartItems.value.length === 0)

  // Actions
  const fetchCart = async () => {
    try {
      isLoading.value = true
      error.value = null
      const response = await cartService.getCart()
      cartItems.value = response.items || []
      return response
    } catch (err) {
      error.value = err.message
      console.error('Failed to fetch cart:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const addToCart = async (productData) => {
    try {
      isLoading.value = true
      error.value = null
      
      // Validate and prepare the cart data
      const cartPayload = {
        productId: productData.productId,
        quantity: productData.quantity || 1
      }

      // Handle variant information properly
      if (productData.variantId) {
        // If we have a variant ID, use it
        cartPayload.variantId = productData.variantId
      }

      // Always include variant object if provided for additional context
      if (productData.variant) {
        cartPayload.variant = {
          ...productData.variant
        }

        // Ensure we have the variant ID in the main payload if it exists in variant object
        if (productData.variant._id && !cartPayload.variantId) {
          cartPayload.variantId = productData.variant._id
        }

        // If variant has SKU but no ID, use SKU as fallback identifier
        if (productData.variant.sku && !cartPayload.variantId) {
          cartPayload.variantSku = productData.variant.sku
        }
      }

      console.log('Cart payload being sent:', cartPayload)
      
      const response = await cartService.addToCart(cartPayload)
      
      console.log('Cart service response:', response)
      
      // Update local cart state
      await fetchCart()
      
      return response
    } catch (err) {
      error.value = err.message
      console.error('Failed to add to cart:', err)
      
      // Enhanced error handling
      if (err.message.includes('variant') || err.message.includes('stock')) {
        throw new Error(`Product variant issue: ${err.message}`)
      } else if (err.message.includes('401') || err.message.includes('unauthorized')) {
        throw new Error('Please log in to add items to your cart')
      } else {
        throw new Error('Failed to add item to cart. Please try again.')
      }
    } finally {
      isLoading.value = false
    }
  }

  const removeFromCart = async (itemId) => {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await cartService.removeFromCart(itemId)
      
      // Update local cart state
      cartItems.value = cartItems.value.filter(item => item._id !== itemId)
      
      return response
    } catch (err) {
      error.value = err.message
      console.error('Failed to remove from cart:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateCartItem = async (itemId, quantity) => {
    try {
      isLoading.value = true
      error.value = null
      
      if (quantity <= 0) {
        return await removeFromCart(itemId)
      }
      
      const response = await cartService.updateCartItem(itemId, quantity)
      
      // Update local cart state
      const itemIndex = cartItems.value.findIndex(item => item._id === itemId)
      if (itemIndex !== -1) {
        cartItems.value[itemIndex].quantity = quantity
      }
      
      return response
    } catch (err) {
      error.value = err.message
      console.error('Failed to update cart item:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const clearCart = async () => {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await cartService.clearCart()
      cartItems.value = []
      
      return response
    } catch (err) {
      error.value = err.message
      console.error('Failed to clear cart:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Find cart item by product and variant
  const findCartItem = (productId, variantId = null) => {
    return cartItems.value.find(item => {
      if (item.productId !== productId && item.product?._id !== productId) return false
      
      if (variantId) {
        return item.variantId === variantId || item.variant?._id === variantId
      }
      
      return !item.variantId && !item.variant?._id
    })
  }

  // Check if a specific variant is in cart
  const isInCart = (productId, variantId = null) => {
    return !!findCartItem(productId, variantId)
  }

  // Get quantity of specific item in cart
  const getCartItemQuantity = (productId, variantId = null) => {
    const item = findCartItem(productId, variantId)
    return item?.quantity || 0
  }

  // Initialize cart on first use
  const initializeCart = async () => {
    try {
      await fetchCart()
    } catch (err) {
      // Silently fail if user is not authenticated
      if (!err.message.includes('401') && !err.message.includes('unauthorized')) {
        console.error('Failed to initialize cart:', err)
      }
    }
  }

  // Helper function to format cart items for display
  const getFormattedCartItems = () => {
    return cartItems.value.map(item => ({
      ...item,
      displayName: item.product?.name || 'Unknown Product',
      displayPrice: item.variant?.price || item.product?.price || 0,
      displayImage: item.variant?.images?.[0] || item.product?.images?.[0]?.url || item.product?.images?.[0] || null,
      variantDescription: item.variant?.attributes ? 
        item.variant.attributes.map(attr => `${attr.name}: ${attr.value}`).join(', ') : null
    }))
  }

  return {
    // State
    cartItems: computed(() => cartItems.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    
    // Computed properties
    cartCount,
    cartTotal,
    isEmpty,
    
    // Actions
    fetchCart,
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
    initializeCart,
    
    // Helper functions
    findCartItem,
    isInCart,
    getCartItemQuantity,
    getFormattedCartItems
  }
}