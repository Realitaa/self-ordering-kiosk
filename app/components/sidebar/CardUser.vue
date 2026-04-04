<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";

defineProps({
  collapsed: {
    type: Boolean,
  },
});

const { currentPictureData } = useProfilePicture();
const { logout } = useAuth();
const { user } = useUserSession()

const showLogoutConfirm = ref(false);

const items = computed<DropdownMenuItem[]>(() => [
  {
    label: "Pengaturan",
    icon: "i-lucide-cog",
    to: "/settings",
    onSelect: () => {
      showLogoutConfirm.value = false;
    },
  },
  {
    label: "Keluar",
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

async function authLogout() {
  await logout();
  return navigateTo("/");
}
</script>

<template>
  <UDropdownMenu :items="items" :content="{
    align: collapsed ? 'end' : 'center',
    side: collapsed ? 'right' : 'top',
    sideOffset: 4,
  }" :ui="{
    content: collapsed ? 'w-full' : 'w-(--reka-dropdown-menu-trigger-width)',
  }">
    <div class="w-full">
      <UAvatar :src="`/${currentPictureData?.src}`" v-if="collapsed"
        class="mb-3 hover:bg-accented hover:cursor-pointer" />
      <UCard :ui="{ body: 'p-1.5 sm:p-3' }" class="w-full hover:bg-accented group hover:cursor-pointer" v-else>
        <div class="flex items-center gap-2 w-full">
          <UAvatar :src="`/img/${currentPictureData?.src}`" />
          <p class="font-bold overflow-hidden text-ellipsis">{{ user?.username || user?.fullname.split(" ")[0] }}</p>
        </div>
      </UCard>
    </div>

    <template #logout v-if="showLogoutConfirm">
      <div class="w-full text-start">
        <p class="text-md font-bold">Konfirmasi Keluar</p>
        <p class="text-sm">Apakah Anda yakin ingin keluar dari akun?</p>
        <div class="flex gap-2 mt-2 w-full justify-end">
          <UButton @click="showLogoutConfirm = false">Batal</UButton>
          <UButton color="error" @click="authLogout">Keluar</UButton>
        </div>
      </div>
    </template>
  </UDropdownMenu>
</template>
