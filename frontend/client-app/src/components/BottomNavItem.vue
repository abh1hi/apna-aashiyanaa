<template>
  <router-link :to="to" class="flex flex-col items-center justify-center w-full h-16 text-xs transition-colors" :class="isActive ? 'text-primary' : 'text-secondary'">
    <slot :isActive="isActive"></slot>
    <span>{{ label }}</span>
  </router-link>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const props = defineProps({
  to: {
    type: [String, Object],
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  activeCondition: {
    type: Function,
    default: (route) => route.path === props.to,
  },
});

const route = useRoute();
const isActive = computed(() => props.activeCondition(route));
</script>
