<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";

defineProps({
  collapsed: {
    type: Boolean,
  },
});

const showLogoutConfirm = ref(false);

const items = computed<DropdownMenuItem[]>(() => [
  {
    label: "Settings",
    icon: "i-lucide-cog",
    to: "/settings",
    onSelect: () => {
      showLogoutConfirm.value = false;
    },
  },
  {
    label: "Logout",
    icon: "i-lucide-log-out",
    color: "error",
    onClick: () => {
      showLogoutConfirm.value = true;
    },
    onSelect: (e) => e.preventDefault(),
    class: showLogoutConfirm.value ? "hidden" : undefined,
  },
  ...(showLogoutConfirm.value
    ? [
        {
          slot: "logout" as const,
          onSelect: (e) => e.preventDefault(),
        },
      ]
    : []),
]);

function logout() {
  // another logout logic
  navigateTo("/logout");
}
</script>

<template>
  <UDropdownMenu
    :items="items"
    :content="{
      align: collapsed ? 'end' : 'center',
      side: collapsed ? 'right' : 'top',
      sideOffset: 4,
    }"
    :ui="{
      content: collapsed ? 'w-full' : 'w-(--reka-dropdown-menu-trigger-width)',
    }"
  >
    <div class="w-full">
      <UAvatar
        src="https://github.com/benjamincanac.png"
        v-if="collapsed"
        class="mb-3 hover:bg-accented hover:cursor-pointer"
      />
      <UCard
        :ui="{ body: 'p-1.5 sm:p-3' }"
        class="w-full hover:bg-accented group hover:cursor-pointer"
        v-else
      >
        <div class="flex items-center gap-2 w-full">
          <UAvatar src="https://github.com/benjamincanac.png" />
          <p class="font-bold overflow-hidden text-ellipsis">Realitaa</p>
        </div>
      </UCard>
    </div>

    <template #logout v-if="showLogoutConfirm">
      <div class="w-full text-start">
        <p class="text-md font-bold">Konfirmasi Keluar</p>
        <p class="text-sm">Apakah Anda yakin ingin keluar dari akun?</p>
        <div class="flex gap-2 mt-2 w-full justify-end">
          <UButton @click="showLogoutConfirm = false">Batal</UButton>
          <UButton color="error" @click="logout">Keluar</UButton>
        </div>
      </div>
    </template>
  </UDropdownMenu>
</template>
