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
      <div class="max-w-xl mx-auto py-6 flex flex-col gap-8">
        <!-- Edit Section -->
        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-pencil" class="size-5" />
              <h3 class="text-lg font-semibold">Ubah Nama Kios</h3>
            </div>
          </template>

          <UForm :schema="updateStallSchema" :state="editFormState" class="flex flex-col gap-4" @submit="onEditSubmit">
            <UFormField label="Nama Kios" name="name" required>
              <UInput v-model="editFormState.name" placeholder="Masukkan nama kios" icon="i-lucide-store"
                :disabled="editLoading" class="w-full" />
            </UFormField>

            <div class="flex justify-end">
              <UButton type="submit" label="Simpan Perubahan" icon="i-lucide-check" :loading="editLoading" />
            </div>
          </UForm>
        </UCard>

        <!-- Delete Section -->
        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-triangle-alert" class="text-red-500 size-5" />
              <h3 class="text-lg font-semibold text-red-500">Zona Bahaya</h3>
            </div>
          </template>

          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium">Hapus Kios</p>
              <p class="text-sm text-muted">
                Tindakan ini tidak dapat dibatalkan. Semua data menu, pesanan,
                dan pembayaran terkait kios ini akan ikut dihapus.
              </p>
            </div>
            <UButton label="Hapus Kios" color="error" variant="soft" icon="i-lucide-trash-2"
              @click="showDeleteModal = true" />
          </div>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>

  <!-- Delete Confirmation Modal -->
  <UModal v-model:open="showDeleteModal">
    <template #content>
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-triangle-alert" class="text-red-500 size-5" />
            <h3 class="text-lg font-semibold">Konfirmasi Hapus</h3>
          </div>
        </template>

        <p class="text-sm text-muted">
          Apakah Anda yakin ingin menghapus kios
          <strong>{{ stall?.name }}</strong>? Semua data menu, pesanan, dan pembayaran terkait akan ikut
          dihapus.
        </p>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton label="Batal" color="neutral" variant="outline" :disabled="deleteLoading"
              @click="showDeleteModal = false" />
            <UButton label="Hapus" color="error" icon="i-lucide-trash-2" :loading="deleteLoading" @click="onDelete" />
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>
