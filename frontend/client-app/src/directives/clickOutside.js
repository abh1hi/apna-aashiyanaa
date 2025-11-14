const vClickOutside = {
  beforeMount(el, binding) {
    el.clickOutsideEvent = function(event) {
      // Check if the click was outside the el and its children
      if (!(el === event.target || el.contains(event.target))) {
        // Call the method provided in the directive's value
        binding.value(event, el);
      }
    };
    document.body.addEventListener('click', el.clickOutsideEvent);
  },
  unmounted(el) {
    document.body.removeEventListener('click', el.clickOutsideEvent);
  },
};

export default vClickOutside;
