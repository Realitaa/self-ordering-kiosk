<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const route = useRoute();

const open = ref(false);

// role user yang sedang login diakses dari sini dengan user.role
const { user } = useUserSession()

const links = [
  {
    label: "Beranda",
    icon: "i-lucide-house",
    to: "/home",
    onSelect: () => {
      open.value = false;
    },
  },
  {
    label: "Dashboard",
    icon: "lucide:chart-no-axes-combined",
    to: "/dashboard",
    onSelect: () => {
      open.value = false;
    },
  },
  ...(user.role === "admin"
    ? [
      {
        label: "Manajemen Pengguna",
        icon: "i-lucide:users",
        to: "/users",
        onSelect: () => (open.value = false),
      },
    ]
    : []),
  {
    label: 'Kios',
    icon: 'healthicons:market-stall-outline',
    defaultOpen: true,
    children: [
      {
        label: 'Menu'
      },
      {
        label: 'Pesanan',
        badge: '4'
      },
      {
        label: 'Pembayaran',
      }
    ]
  },
  {
    label: "Tambah Kios",
    icon: "i-lucide:plus",
    to: "/kios/add",
    onSelect: () => {
      open.value = false;
    },
  },
] satisfies NavigationMenuItem[];
</script>

<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar id="default" v-model:open="open" collapsible resizable class="bg-elevated/25" :minSize="16"
      :ui="{ footer: 'lg:border-t lg:border-default' }">
      <template #header="{ collapsed }">
        <DashboardSidebarTime :collapsed="collapsed" />
      </template>

      <template #default="{ collapsed }">
        <UNavigationMenu :collapsed="collapsed" :items="links" orientation="vertical" tooltip popover />
      </template>

      <template #footer="{ collapsed }">
        <SidebarCardUser :collapsed="collapsed" />
      </template>
    </UDashboardSidebar>

    <slot />

  </UDashboardGroup>
</template>
