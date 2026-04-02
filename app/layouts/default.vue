<script setup lang="ts">
import type { NavigationMenuItem, FormSubmitEvent } from "@nuxt/ui";
import { createStallSchema } from "#shared/schemas/stall.schema";
import type { CreateStallInput } from "#shared/schemas/stall.schema";

const open = ref(false);
const toast = useToast();
const route = useRoute();

// ─── User session ────────────────────────────────────────────────────
const { user } = useUserSession();

// ─── Stalls state (cached via useState) ──────────────────────────────
const { stallsState, stallsLoading, fetchStalls } = useStall();

// Fetch stalls on mount
onMounted(async () => {
  if (stallsState.value.length === 0) {
    await fetchStalls();
  } else {
    stallsLoading.value = false;
  }
});

// ─── Dynamic navigation links ───────────────────────────────────────
const links = computed<NavigationMenuItem[]>(() => {
  const items: NavigationMenuItem[] = [
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
  ];

  // Admin-only: User management
  if (user.value?.role === "admin") {
    items.push({
      label: "Manajemen Pengguna",
      icon: "i-lucide:users",
      to: "/users",
      onSelect: () => (open.value = false),
    });
  }

  // Loading placeholder
  if (stallsLoading.value) {
    items.push({
      label: "Memuat Kios",
      icon: "eos-icons:loading",
    });
  } else {
    // Dynamic stall entries
    for (const stall of stallsState.value) {
      items.push({
        label: stall.name,
        icon: "healthicons:market-stall-outline",
        defaultOpen: stall.id == Number(route.params.id),
        children: [
          {
            label: "Dashboard",
            to: `/stall/${stall.id}/dashboard`,
            onSelect: () => (open.value = false),
          },
          {
            label: "Menu",
            to: `/stall/${stall.id}/menu`,
            onSelect: () => (open.value = false),
          },
          {
            label: "Pesanan",
            to: `/stall/${stall.id}/order`,
            onSelect: () => (open.value = false),
          },
          {
            label: "Pembayaran",
            to: `/stall/${stall.id}/payment`,
            onSelect: () => (open.value = false),
          },
        ],
      });
    }
  }

  // Add stall button
  items.push({
    label: "Tambah Kios",
    icon: "i-lucide:plus",
    onSelect: () => {
      resetAddForm();
      showAddStallModal.value = true;
    },
  });

  return items;
});

// ─── Add Stall Modal ─────────────────────────────────────────────────
const showAddStallModal = ref(false);
const addLoading = ref(false);

const addFormState = reactive<CreateStallInput>({
  name: "",
});

function resetAddForm() {
  addFormState.name = "";
}

async function onAddSubmit(event: FormSubmitEvent<CreateStallInput>) {
  addLoading.value = true;
  try {
    const res = await $fetch<any>("/api/stalls", {
      method: "POST",
      body: event.data,
    });

    toast.add({
      title: "Berhasil",
      description: "Kios berhasil ditambahkan.",
      color: "success",
      icon: "i-lucide-circle-check",
    });

    // Patch cached state directly
    if (res.data) {
      stallsState.value.push(res.data);
    }

    showAddStallModal.value = false;
    resetAddForm();
  } catch (err: any) {
    toast.add({
      title: "Gagal",
      description: err?.data?.message ?? "Gagal menambahkan kios.",
      color: "error",
      icon: "i-lucide-x",
    });
  } finally {
    addLoading.value = false;
  }
}
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

  <!-- Add Stall Modal -->
  <UModal v-model:open="showAddStallModal">
    <template #content>
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">Tambah Kios</h3>
            <UButton icon="i-lucide-x" color="neutral" variant="ghost" @click="showAddStallModal = false" />
          </div>
        </template>

        <UForm :schema="createStallSchema" :state="addFormState" class="flex flex-col gap-4" @submit="onAddSubmit">
          <UFormField label="Nama Kios" name="name" required>
            <UInput v-model="addFormState.name" placeholder="Masukkan nama kios" icon="i-lucide-store"
              :disabled="addLoading" class="w-full" />
          </UFormField>

          <div class="flex justify-end gap-2 pt-2">
            <UButton label="Batal" color="neutral" variant="outline" :disabled="addLoading"
              @click="showAddStallModal = false" />
            <UButton type="submit" label="Simpan" icon="i-lucide-check" :loading="addLoading" />
          </div>
        </UForm>
      </UCard>
    </template>
  </UModal>
</template>
