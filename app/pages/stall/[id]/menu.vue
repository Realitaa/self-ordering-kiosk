<script setup lang="ts">
import { h, resolveComponent } from "vue";
import type { TableColumn, FormSubmitEvent } from "@nuxt/ui";
import type { Row } from "@tanstack/vue-table";
import type { ButtonProps } from "@nuxt/ui";
import { createMenuSchema, updateMenuSchema } from "#shared/schemas/menu.schema";
import type { CreateMenuInput, UpdateMenuInput } from "#shared/schemas/menu.schema";

definePageMeta({
  middleware: "auth",
});

const UButton = resolveComponent("UButton");
const UBadge = resolveComponent("UBadge");
const UDropdownMenu = resolveComponent("UDropdownMenu");
const UInput = resolveComponent("UInput");

const route = useRoute();
const toast = useToast();
const stallId = route.params.id as string;

// ─── Fetch stall data ───────────────────────────────────────────────
const { data: stallResponse } = await useFetch<{
  success: boolean;
  data: { id: number; name: string; owner_id: number };
}>(`/api/stalls/${stallId}`);

const stall = computed(() => stallResponse.value?.data ?? null);

// ─── Types ───────────────────────────────────────────────────────────
type Menu = {
  id: number;
  tenant_id: number;
  name: string;
  price: number;
  stock: number;
  createdAt: string;
};

// ─── Fetch Menus ─────────────────────────────────────────────────────
const { data: menuResponse, refresh } = await useFetch<{
  success: boolean;
  data: Menu[];
}>(`/api/stalls/${stallId}/menus`);

const menus = computed(() => menuResponse.value?.data ?? []);

// ─── Inline Stock Update ─────────────────────────────────────────────
const stockLoadingMap = ref<Record<number, boolean>>({});
const draftStockMap = ref<Record<number, string>>({});

async function onStockUpdate(menuId: number, newStock: number) {
  if (isNaN(newStock) || newStock < 0) return;

  stockLoadingMap.value[menuId] = true;
  try {
    await $fetch(`/api/stalls/${stallId}/menus/${menuId}/stock`, {
      method: "PATCH",
      body: { stock: newStock },
    });

    delete draftStockMap.value[menuId];
    await refresh();
  } catch (err: any) {
    toast.add({
      title: "Gagal",
      description: err?.data?.message ?? "Gagal memperbarui stok.",
      color: "error",
      icon: "i-lucide-x",
    });
  } finally {
    stockLoadingMap.value[menuId] = false;
  }
}

// ─── Table Columns ───────────────────────────────────────────────────
const columns: TableColumn<Menu>[] = [
  {
    accessorKey: "id",
    header: "#",
    cell: ({ row }) => `#${row.getValue("id")}`,
  },
  {
    accessorKey: "name",
    header: "Nama Menu",
  },
  {
    accessorKey: "price",
    header: "Harga",
    cell: ({ row }) => {
      const price = Number(row.getValue("price"));
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(price);
    },
  },
  {
    accessorKey: "stock",
    header: "Stok",
    cell: ({ row }) => {
      const menuItem = row.original;
      const isLoading = stockLoadingMap.value[menuItem.id] ?? false;
      const displayStock = draftStockMap.value[menuItem.id] ?? String(menuItem.stock);
      const currentVal = parseInt(displayStock, 10);

      return h("div", { class: "flex items-center gap-1 w-28" }, [
        h(UInput, {
          modelValue: displayStock,
          type: "number",
          size: "xs",
          class: "w-14 text-center",
          ui: { base: "text-center" },
          disabled: isLoading,
          "onUpdate:modelValue": (val: string) => {
            draftStockMap.value[menuItem.id] = val;
          },
          onKeyup: (e: KeyboardEvent) => {
            if (e.key === "Enter") {
              if (!isNaN(currentVal) && currentVal >= 0 && currentVal !== menuItem.stock) {
                onStockUpdate(menuItem.id, currentVal);
              }
            }
          },
        })
      ]);
    },
  },
  {
    id: "actions",
    meta: {
      class: {
        td: "text-right",
      },
    },
    cell: ({ row }) => {
      return h(
        UDropdownMenu,
        {
          content: { align: "end" },
          items: getRowItems(row),
          "aria-label": "Actions dropdown",
        },
        () =>
          h(UButton, {
            icon: "i-lucide-ellipsis-vertical",
            color: "neutral",
            variant: "ghost",
            "aria-label": "Actions dropdown",
          }),
      );
    },
  },
];

function getRowItems(row: Row<Menu>) {
  return [
    {
      type: "label",
      label: "Aksi",
    },
    {
      label: "Edit menu",
      icon: "i-lucide-pencil",
      onSelect() {
        openEditModal(row.original);
      },
    },
    {
      type: "separator",
    },
    {
      label: "Hapus menu",
      icon: "i-lucide-trash-2",
      color: "error" as const,
      onSelect() {
        openDeleteConfirm(row.original);
      },
    },
  ];
}

// ─── Add Menu ────────────────────────────────────────────────────────
const showAddModal = ref(false);
const addLoading = ref(false);

const addFormState = reactive<CreateMenuInput>({
  name: "",
  price: 0,
  stock: 0,
});

function resetAddForm() {
  addFormState.name = "";
  addFormState.price = 0;
  addFormState.stock = 0;
}

async function onAddSubmit(event: FormSubmitEvent<CreateMenuInput>) {
  addLoading.value = true;
  try {
    await $fetch(`/api/stalls/${stallId}/menus`, {
      method: "POST",
      body: event.data,
    });

    toast.add({
      title: "Berhasil",
      description: "Menu berhasil ditambahkan.",
      color: "success",
      icon: "i-lucide-circle-check",
    });

    showAddModal.value = false;
    resetAddForm();
    await refresh();
  } catch (err: any) {
    toast.add({
      title: "Gagal",
      description: err?.data?.message ?? "Gagal menambahkan menu.",
      color: "error",
      icon: "i-lucide-x",
    });
  } finally {
    addLoading.value = false;
  }
}

// ─── Edit Menu ───────────────────────────────────────────────────────
const showEditModal = ref(false);
const editLoading = ref(false);
const editMenuId = ref<number | null>(null);

const editFormState = reactive<UpdateMenuInput>({
  name: undefined,
  price: undefined,
  stock: undefined,
});

function openEditModal(menu: Menu) {
  editMenuId.value = menu.id;
  editFormState.name = menu.name;
  editFormState.price = menu.price;
  editFormState.stock = menu.stock;
  showEditModal.value = true;
}

async function onEditSubmit(event: FormSubmitEvent<UpdateMenuInput>) {
  if (!editMenuId.value) return;
  editLoading.value = true;

  try {
    await $fetch(`/api/stalls/${stallId}/menus/${editMenuId.value}`, {
      method: "PUT",
      body: event.data,
    });

    toast.add({
      title: "Berhasil",
      description: "Menu berhasil diperbarui.",
      color: "success",
      icon: "i-lucide-circle-check",
    });

    showEditModal.value = false;
    await refresh();
  } catch (err: any) {
    toast.add({
      title: "Gagal",
      description: err?.data?.message ?? "Gagal memperbarui menu.",
      color: "error",
      icon: "i-lucide-x",
    });
  } finally {
    editLoading.value = false;
  }
}

// ─── Delete Menu ─────────────────────────────────────────────────────
const showDeleteModal = ref(false);
const deleteLoading = ref(false);
const deleteTarget = ref<Menu | null>(null);

function openDeleteConfirm(menu: Menu) {
  deleteTarget.value = menu;
  showDeleteModal.value = true;
}

async function onDelete() {
  if (!deleteTarget.value) return;
  deleteLoading.value = true;

  try {
    await $fetch(`/api/stalls/${stallId}/menus/${deleteTarget.value.id}`, {
      method: "DELETE",
    });

    toast.add({
      title: "Berhasil",
      description: "Menu berhasil dihapus.",
      color: "success",
      icon: "i-lucide-circle-check",
    });

    showDeleteModal.value = false;
    deleteTarget.value = null;
    await refresh();
  } catch (err: any) {
    toast.add({
      title: "Gagal",
      description: err?.data?.message ?? "Gagal menghapus menu.",
      color: "error",
      icon: "i-lucide-x",
    });
  } finally {
    deleteLoading.value = false;
  }
}

// ─── Header Button ───────────────────────────────────────────────────
const addMenuBtn = ref<ButtonProps[]>([
  {
    label: "Tambah Menu",
    icon: "i-lucide-plus",
    color: "primary",
    variant: "solid",
    onClick() {
      resetAddForm();
      showAddModal.value = true;
    },
  },
]);
</script>

<template>
  <UDashboardPanel :id="`stall-${stallId}-menu`">
    <template #header>
      <UDashboardNavbar :title="stall?.name ?? 'Memuat...'" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UPageHeader :title="`Menu Kios ${stall?.name ?? ''}`" description="Kelola menu kios." class="pt-0!"
        :links="addMenuBtn" />
      <UTable :data="menus" :columns="columns" class="flex-1" />
    </template>
  </UDashboardPanel>

  <!-- Add Menu Modal -->
  <UModal v-model:open="showAddModal">
    <template #content>
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">Tambah Menu</h3>
            <UButton icon="i-lucide-x" color="neutral" variant="ghost" @click="showAddModal = false" />
          </div>
        </template>

        <UForm :schema="createMenuSchema" :state="addFormState" class="flex flex-col gap-4" @submit="onAddSubmit">
          <UFormField label="Nama Menu" name="name" required>
            <UInput v-model="addFormState.name" placeholder="Masukkan nama menu" icon="i-lucide-utensils"
              :disabled="addLoading" class="w-full" />
          </UFormField>

          <UFormField label="Harga" name="price" required>
            <UInput v-model.number="addFormState.price" type="number" placeholder="Masukkan harga"
              icon="i-lucide-banknote" :disabled="addLoading" class="w-full" />
          </UFormField>

          <UFormField label="Stok Awal" name="stock">
            <UInput v-model.number="addFormState.stock" type="number" placeholder="0" icon="i-lucide-package"
              :disabled="addLoading" class="w-full" />
          </UFormField>

          <div class="flex justify-end gap-2 pt-2">
            <UButton label="Batal" color="neutral" variant="outline" :disabled="addLoading"
              @click="showAddModal = false" />
            <UButton type="submit" label="Simpan" icon="i-lucide-check" :loading="addLoading" />
          </div>
        </UForm>
      </UCard>
    </template>
  </UModal>

  <!-- Edit Menu Modal -->
  <UModal v-model:open="showEditModal">
    <template #content>
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">Edit Menu</h3>
            <UButton icon="i-lucide-x" color="neutral" variant="ghost" @click="showEditModal = false" />
          </div>
        </template>

        <UForm :schema="updateMenuSchema" :state="editFormState" class="flex flex-col gap-4" @submit="onEditSubmit">
          <UFormField label="Nama Menu" name="name">
            <UInput v-model="editFormState.name" placeholder="Masukkan nama menu" icon="i-lucide-utensils"
              :disabled="editLoading" class="w-full" />
          </UFormField>

          <UFormField label="Harga" name="price">
            <UInput v-model.number="editFormState.price" type="number" placeholder="Masukkan harga"
              icon="i-lucide-banknote" :disabled="editLoading" class="w-full" />
          </UFormField>

          <UFormField label="Stok" name="stock">
            <UInput v-model.number="editFormState.stock" type="number" placeholder="0" icon="i-lucide-package"
              :disabled="editLoading" class="w-full" />
          </UFormField>

          <div class="flex justify-end gap-2 pt-2">
            <UButton label="Batal" color="neutral" variant="outline" :disabled="editLoading"
              @click="showEditModal = false" />
            <UButton type="submit" label="Perbarui" icon="i-lucide-check" :loading="editLoading" />
          </div>
        </UForm>
      </UCard>
    </template>
  </UModal>

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
          Apakah Anda yakin ingin menghapus menu
          <strong>{{ deleteTarget?.name }}</strong>? Tindakan ini tidak dapat dibatalkan.
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
