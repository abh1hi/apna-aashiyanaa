export default {
  mounted(el, binding) {
    if (typeof binding.value.onLongPress !== 'function') {
      console.warn(`[v-long-press]: Expect a function for 'onLongPress' handler, got ${binding.value.onLongPress}`);
      return;
    }
    if (typeof binding.value.onRelease !== 'function') {
      console.warn(`[v-long-press]: Expect a function for 'onRelease' handler, got ${binding.value.onRelease}`);
      return;
    }

    const delay = binding.value.delay || 500; // Default to 500ms
    let pressTimer = null;

    const start = (e) => {
      if (e.type === 'click' && e.button !== 0) {
        return;
      }

      if (pressTimer === null) {
        pressTimer = setTimeout(() => {
          binding.value.onLongPress(e); // Trigger long press action
          pressTimer = null; // Reset timer after triggering
        }, delay);
      }
    };

    const cancel = () => {
      if (pressTimer !== null) {
        clearTimeout(pressTimer);
        pressTimer = null;
      }
      binding.value.onRelease(); // Trigger release action
    };

    // Attach event listeners
    ['mousedown', 'touchstart'].forEach(event => el.addEventListener(event, start));
    ['mouseup', 'touchend', 'touchcancel', 'mouseleave'].forEach(event => el.addEventListener(event, cancel));

    // Store event handlers on the element to clean up later
    el._longPressHandlers = { start, cancel };
  },
  unmounted(el) {
    // Clean up event listeners when the element is unmounted
    if (el._longPressHandlers) {
      const { start, cancel } = el._longPressHandlers;
      ['mousedown', 'touchstart'].forEach(event => el.removeEventListener(event, start));
      ['mouseup', 'touchend', 'touchcancel', 'mouseleave'].forEach(event => el.removeEventListener(event, cancel));
      delete el._longPressHandlers;
    }
  }
};
