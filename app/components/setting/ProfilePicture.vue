<script setup lang="ts">
const { currentPicture, profilePicture, updateProfilePicture } =
  useProfilePicture();
</script>

<template>
  <div class="space-y-4">
    <UPageFeature title="Pengaturan Foto Profil"
      description="Perbarui pengaturan foto profil untuk akun Anda dari set foto yang tersedia." />
    <div class="flex gap-4">
      <UAvatar v-for="pict in profilePicture" :src="`/img/${pict.src}`" size="2xl" class="ring-3 cursor-pointer" :class="pict.id === currentPicture
        ? 'ring-primary'
        : 'ring-slate-300 dark:ring-slate-700 hover:ring-slate-500'
        " @click="updateProfilePicture(pict.id)" />
    </div>
  </div>
</template>
