<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { updateStallSchema } from "#shared/schemas/stall.schema";
import type { UpdateStallInput } from "#shared/schemas/stall.schema";

definePageMeta({
  middleware: "auth",
});

const route = useRoute();
const toast = useToast();
const stallId = route.params.id as string;

// ─── Fetch stall data ───────────────────────────────────────────────
const { data: apiResponse, refresh } = await useFetch<{
  success: boolean;
  data: { id: number; name: string; owner_id: number };
}>(`/api/stalls/${stallId}`);

const stall = computed(() => apiResponse.value?.data ?? null);

// ─── Cached stalls in sidebar — injected from layout ─────────────────
const { stallsState, refreshStalls } = useStall();

// ─── Edit Stall ──────────────────────────────────────────────────────
const editLoading = ref(false);

const editFormState = reactive<UpdateStallInput>({
  name: stall.value?.name ?? "",
});

// Keep form in sync when stall data loads
watch(stall, (val) => {
  if (val) editFormState.name = val.name;
});

async function onEditSubmit(event: FormSubmitEvent<UpdateStallInput>) {
  editLoading.value = true;
  try {
    await $fetch(`/api/stalls/${stallId}`, {
      method: "PUT",
      body: event.data,
    });

    toast.add({
      title: "Berhasil",
      description: "Nama kios berhasil diperbarui.",
      color: "success",
      icon: "i-lucide-circle-check",
    });

    await refresh();

    // Patch cached sidebar stalls
    if (stallsState.value) {
      const idx = stallsState.value.findIndex((s) => s.id === Number(stallId));
      if (idx !== -1 && event.data.name) {
        stallsState.value[idx].name = event.data.name;
      }
    }
  } catch (err: any) {
    toast.add({
      title: "Gagal",
      description: err?.data?.message ?? "Gagal memperbarui kios.",
      color: "error",
      icon: "i-lucide-x",
    });
  } finally {
    editLoading.value = false;
  }
}

// ─── Delete Stall ────────────────────────────────────────────────────
const showDeleteModal = ref(false);
const deleteLoading = ref(false);

async function onDelete() {
  deleteLoading.value = true;
  try {
    await $fetch(`/api/stalls/${stallId}`, {
      method: "DELETE",
    });

    toast.add({
      title: "Berhasil",
      description: "Kios berhasil dihapus.",
      color: "success",
      icon: "i-lucide-circle-check",
    });

    // Refresh state using the composable
    await refreshStalls();

    await navigateTo("/home");
  } catch (err: any) {
    toast.add({
      title: "Gagal",
      description: err?.data?.message ?? "Gagal menghapus kios.",
      color: "error",
      icon: "i-lucide-x",
    });
  } finally {
    deleteLoading.value = false;
  }
}
</script>

<template>
  <UDashboardPanel :id="`stall-${stallId}`">
    <template #header>
      <UDashboardNavbar :title="stall?.name ?? 'Memuat...'" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UPageHeader :title="`Menu Kios ${stall?.name}`" description="Kelola menu kios." class="pt-0!" />
    </template>
  </UDashboardPanel>
</template>
