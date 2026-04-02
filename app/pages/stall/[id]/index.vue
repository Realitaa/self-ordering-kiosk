<script setup lang="ts">
definePageMeta({
  middleware: "auth",
});

const route = useRoute();
const id = route.params.id;

navigateTo(`/stall/${id}/dashboard`, { replace: true });
</script>

<template>
  <div />
</template>
