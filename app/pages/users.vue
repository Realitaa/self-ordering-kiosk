<script setup lang="ts">
import { h, resolveComponent } from "vue";
import type { TableColumn, FormSubmitEvent } from "@nuxt/ui";
import type { Row } from "@tanstack/vue-table";
import type { ButtonProps } from "@nuxt/ui";
import { createUserSchema, updateUserSchema } from "#shared/schemas/user.schema";
import type { CreateUserInput, UpdateUserInput } from "#shared/schemas/user.schema";

definePageMeta({
  middleware: ["auth", "admin"],
});

const UButton = resolveComponent("UButton");
const UBadge = resolveComponent("UBadge");
const UDropdownMenu = resolveComponent("UDropdownMenu");

const toast = useToast();

// ─── Types ───────────────────────────────────────────────────────────
type User = {
  id: number;
  fullname: string;
  username: string | null;
  email: string;
  role: "tenant" | "admin";
  pfp_id: number;
  joinedAt: string;
};

// ─── Fetch Data ──────────────────────────────────────────────────────
const { data: apiResponse, refresh } = await useFetch<{
  success: boolean;
  data: User[];
}>("/api/users");

const users = computed(() => apiResponse.value?.data ?? []);

// ─── Table Columns ───────────────────────────────────────────────────
const columns: TableColumn<User>[] = [
  {
    accessorKey: "id",
    header: "#",
    cell: ({ row }) => `#${row.getValue("id")}`,
  },
  {
    accessorKey: "fullname",
    header: "Nama Lengkap",
  },
  {
    accessorKey: "username",
    header: "Username",
    cell: ({ row }) => row.getValue("username") || "—",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      const color = {
        admin: "error" as const,
        tenant: "info" as const,
      }[role] ?? ("neutral" as const);

      return h(
        UBadge,
        { class: "capitalize", variant: "subtle", color },
        () => role,
      );
    },
  },
  {
    accessorKey: "joinedAt",
    header: "Bergabung",
    cell: ({ row }) => {
      return new Date(row.getValue("joinedAt")).toLocaleString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
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

function getRowItems(row: Row<User>) {
  return [
    {
      type: "label",
      label: "Aksi",
    },
    {
      label: "Edit pengguna",
      icon: "i-lucide-pencil",
      onSelect() {
        openEditModal(row.original);
      },
    },
    {
      type: "separator",
    },
    {
      label: "Hapus pengguna",
      icon: "i-lucide-trash-2",
      color: "error" as const,
      onSelect() {
        openDeleteConfirm(row.original);
      },
    },
  ];
}

// ─── Add User ────────────────────────────────────────────────────────
const showAddModal = ref(false);
const addLoading = ref(false);

const addFormState = reactive<CreateUserInput>({
  fullname: "",
  email: "",
  password: "",
  username: undefined,
  role: "tenant",
});

function resetAddForm() {
  addFormState.fullname = "";
  addFormState.email = "";
  addFormState.password = "";
  addFormState.username = undefined;
  addFormState.role = "tenant";
}

async function onAddSubmit(event: FormSubmitEvent<CreateUserInput>) {
  addLoading.value = true;
  try {
    await $fetch("/api/users", {
      method: "POST",
      body: event.data,
    });

    toast.add({
      title: "Berhasil",
      description: "Pengguna berhasil ditambahkan.",
      color: "success",
      icon: "i-lucide-circle-check",
    });

    showAddModal.value = false;
    resetAddForm();
    await refresh();
  } catch (err: any) {
    toast.add({
      title: "Gagal",
      description: err?.data?.message ?? "Gagal menambahkan pengguna.",
      color: "error",
      icon: "i-lucide-x",
    });
  } finally {
    addLoading.value = false;
  }
}

// ─── Edit User ───────────────────────────────────────────────────────
const showEditModal = ref(false);
const editLoading = ref(false);
const editUserId = ref<number | null>(null);

const editFormState = reactive<UpdateUserInput>({
  fullname: undefined,
  email: undefined,
  username: undefined,
  role: undefined,
  password: undefined,
});

function openEditModal(user: User) {
  editUserId.value = user.id;
  editFormState.fullname = user.fullname;
  editFormState.email = user.email;
  editFormState.username = user.username ?? undefined;
  editFormState.role = user.role;
  editFormState.password = undefined;
  showEditModal.value = true;
}

async function onEditSubmit(event: FormSubmitEvent<UpdateUserInput>) {
  if (!editUserId.value) return;
  editLoading.value = true;

  try {
    const payload = { ...event.data };
    // Don't send empty password
    if (!payload.password) {
      delete payload.password;
    }

    await $fetch(`/api/users/${editUserId.value}`, {
      method: "PUT",
      body: payload,
    });

    toast.add({
      title: "Berhasil",
      description: "Pengguna berhasil diperbarui.",
      color: "success",
      icon: "i-lucide-circle-check",
    });

    showEditModal.value = false;
    await refresh();
  } catch (err: any) {
    toast.add({
      title: "Gagal",
      description: err?.data?.message ?? "Gagal memperbarui pengguna.",
      color: "error",
      icon: "i-lucide-x",
    });
  } finally {
    editLoading.value = false;
  }
}

// ─── Delete User ─────────────────────────────────────────────────────
const showDeleteModal = ref(false);
const deleteLoading = ref(false);
const deleteTarget = ref<User | null>(null);

function openDeleteConfirm(user: User) {
  deleteTarget.value = user;
  showDeleteModal.value = true;
}

async function onDelete() {
  if (!deleteTarget.value) return;
  deleteLoading.value = true;

  try {
    await $fetch(`/api/users/${deleteTarget.value.id}`, {
      method: "DELETE",
    });

    toast.add({
      title: "Berhasil",
      description: "Pengguna berhasil dihapus.",
      color: "success",
      icon: "i-lucide-circle-check",
    });

    showDeleteModal.value = false;
    deleteTarget.value = null;
    await refresh();
  } catch (err: any) {
    toast.add({
      title: "Gagal",
      description: err?.data?.message ?? "Gagal menghapus pengguna.",
      color: "error",
      icon: "i-lucide-x",
    });
  } finally {
    deleteLoading.value = false;
  }
}

// ─── Header Button ───────────────────────────────────────────────────
const addUserBtn = ref<ButtonProps[]>([
  {
    label: "Tambah Pengguna",
    icon: "i-lucide-plus",
    color: "primary",
    variant: "solid",
    onClick() {
      resetAddForm();
      showAddModal.value = true;
    },
  },
]);

// ─── Role Options ────────────────────────────────────────────────────
const roleOptions = [
  { label: "Tenant", value: "tenant" },
  { label: "Admin", value: "admin" },
];
</script>

<template>
  <UDashboardPanel id="users">
    <template #header>
      <UDashboardNavbar title="Daftar Pengguna" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UPageHeader
        title="Tabel Pengguna"
        description="Kelola data pengguna penitipan peliharaan."
        class="pt-0!"
        :links="addUserBtn"
      />
      <UTable :data="users" :columns="columns" class="flex-1" />
    </template>
  </UDashboardPanel>

  <!-- Add User Modal -->
  <UModal v-model:open="showAddModal">
    <template #content>
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">Tambah Pengguna</h3>
            <UButton
              icon="i-lucide-x"
              color="neutral"
              variant="ghost"
              @click="showAddModal = false"
            />
          </div>
        </template>

        <UForm
          :schema="createUserSchema"
          :state="addFormState"
          class="flex flex-col gap-4"
          @submit="onAddSubmit"
        >
          <UFormField label="Nama Lengkap" name="fullname" required>
            <UInput
              v-model="addFormState.fullname"
              placeholder="Masukkan nama lengkap"
              icon="i-lucide-user"
              :disabled="addLoading"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Email" name="email" required>
            <UInput
              v-model="addFormState.email"
              type="email"
              placeholder="Masukkan email"
              icon="i-lucide-mail"
              :disabled="addLoading"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Password" name="password" required>
            <UInput
              v-model="addFormState.password"
              type="password"
              placeholder="Minimal 6 karakter"
              icon="i-lucide-lock"
              :disabled="addLoading"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Username" name="username">
            <UInput
              v-model="addFormState.username"
              placeholder="Opsional"
              icon="i-lucide-at-sign"
              :disabled="addLoading"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Role" name="role">
            <USelect
              v-model="addFormState.role"
              :items="roleOptions"
              value-key="value"
              :disabled="addLoading"
              class="w-full"
            />
          </UFormField>

          <div class="flex justify-end gap-2 pt-2">
            <UButton
              label="Batal"
              color="neutral"
              variant="outline"
              :disabled="addLoading"
              @click="showAddModal = false"
            />
            <UButton
              type="submit"
              label="Simpan"
              icon="i-lucide-check"
              :loading="addLoading"
            />
          </div>
        </UForm>
      </UCard>
    </template>
  </UModal>

  <!-- Edit User Modal -->
  <UModal v-model:open="showEditModal">
    <template #content>
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">Edit Pengguna</h3>
            <UButton
              icon="i-lucide-x"
              color="neutral"
              variant="ghost"
              @click="showEditModal = false"
            />
          </div>
        </template>

        <UForm
          :schema="updateUserSchema"
          :state="editFormState"
          class="flex flex-col gap-4"
          @submit="onEditSubmit"
        >
          <UFormField label="Nama Lengkap" name="fullname">
            <UInput
              v-model="editFormState.fullname"
              placeholder="Masukkan nama lengkap"
              icon="i-lucide-user"
              :disabled="editLoading"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Email" name="email">
            <UInput
              v-model="editFormState.email"
              type="email"
              placeholder="Masukkan email"
              icon="i-lucide-mail"
              :disabled="editLoading"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Password Baru" name="password" hint="Kosongkan jika tidak ingin mengubah">
            <UInput
              v-model="editFormState.password"
              type="password"
              placeholder="Minimal 6 karakter"
              icon="i-lucide-lock"
              :disabled="editLoading"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Username" name="username">
            <UInput
              v-model="editFormState.username"
              placeholder="Opsional"
              icon="i-lucide-at-sign"
              :disabled="editLoading"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Role" name="role">
            <USelect
              v-model="editFormState.role"
              :items="roleOptions"
              value-key="value"
              :disabled="editLoading"
              class="w-full"
            />
          </UFormField>

          <div class="flex justify-end gap-2 pt-2">
            <UButton
              label="Batal"
              color="neutral"
              variant="outline"
              :disabled="editLoading"
              @click="showEditModal = false"
            />
            <UButton
              type="submit"
              label="Perbarui"
              icon="i-lucide-check"
              :loading="editLoading"
            />
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
          Apakah Anda yakin ingin menghapus pengguna
          <strong>{{ deleteTarget?.fullname }}</strong
          >? Tindakan ini tidak dapat dibatalkan dan akan menghapus semua data
          terkait.
        </p>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton
              label="Batal"
              color="neutral"
              variant="outline"
              :disabled="deleteLoading"
              @click="showDeleteModal = false"
            />
            <UButton
              label="Hapus"
              color="error"
              icon="i-lucide-trash-2"
              :loading="deleteLoading"
              @click="onDelete"
            />
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>
