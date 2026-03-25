<template>
  <UDashboardPanel id="settings">
    <template #header>
      <UDashboardNavbar title="Pengaturan" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UDropdownMenu :items="items">
            <UButton icon="i-lucide-plus" size="md" class="rounded-full" />
          </UDropdownMenu>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UPageHeader
        title="Pengaturan"
        description="Kelola pengaturan aplikasi secara personal."
        class="pt-0!"
      />
      <div class="space-y-10">
        <SettingAppearance />
        <SettingProfilePicture />
        <SettingBiodata />
      </div>
    </template>
  </UDashboardPanel>
</template>
