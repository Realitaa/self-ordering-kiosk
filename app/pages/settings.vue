<script setup lang="ts">
definePageMeta({
  middleware: "auth",
});
</script>

<template>
  <UDashboardPanel id="settings">
    <template #header>
      <UDashboardNavbar title="Pengaturan" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UPageHeader title="Pengaturan" description="Kelola pengaturan aplikasi secara personal." class="pt-0!" />
      <div class="space-y-10">
        <SettingAppearance />
        <SettingProfilePicture />
        <SettingBiodata />
      </div>
    </template>
  </UDashboardPanel>
</template>
