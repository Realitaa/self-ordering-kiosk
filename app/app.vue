<script setup>
useHead({
  meta: [{ name: "viewport", content: "width=device-width, initial-scale=1" }],
  link: [{ rel: "icon", href: "/favicon.ico" }],
  htmlAttrs: {
    lang: "id",
  },
});

const title = "Sistem Pemesanan Makanan";

useSeoMeta({
  title,
  ogTitle: title,
});
</script>

<template>
  <UApp>
    <NuxtLoadingIndicator color="repeating-linear-gradient(
      to right,
      #5eead4 0%,   /* teal-300 */
      #2dd4bf 50%,  /* teal-400 */
      #0f766e 100%  /* teal-700 */
    )" />
    <NuxtLayout>
      <NuxtPage class="bg-slate-50 dark:bg-accented/50" />
    </NuxtLayout>
  </UApp>
</template>
