<script setup lang="ts">
import { updateUsernameSchema } from "#shared/schemas/profile.schema";

const { fetch: refreshSession, user } = useUserSession()
const toast = useToast();

const state = reactive({
  username: user.value?.username || "",
  email: user.value?.email || "",
  fullname: user.value?.fullname || ""
});

const updateUsername = async () => {
  try {
    await $fetch('/api/profile/username', {
      method: 'POST',
      body: { username: state.username },
    })

    await refreshSession()

    toast.add({
      title: "Nama pengguna berhasil diperbarui.",
      description: "Nama pengguna Anda telah diperbarui.",
      color: "success",
      duration: 3000,
    });
  } catch (err) {
    toast.add({
      title: "Gagal memperbarui nama pengguna.",
      description: err?.data?.data?.errors?.username[0],
      color: "error",
      duration: 3000,
    })

    state.username = user.value?.username || ""
  }
}

const isUsernameChanged = computed(() => state.username !== (user.value?.username || ""))
</script>

<template>
  <UForm :schema="updateUsernameSchema" :state="state" @submit="updateUsername" class="space-y-4">
    <UPageFeature title="Pengaturan Biodata"
      description="Perbarui pengaturan biodata untuk akun Anda. Beberapa data hanya dapat diubah oleh admin." />
    <UFormField label="Nama Pengguna" name="username"
      help="Nama pengguna akan ditampilkan di sidebar Anda. Jika tidak ada, nama pengguna akan diambil dari nama depan Anda.">
      <UInput v-model="state.username" placeholder="Nama Pengguna Anda" class="w-60" />
    </UFormField>
    <div class="flex items-center gap-2">
      <UFormField label="Email">
        <UInput v-model="state.email" icon="i-lucide-at-sign" class="w-60" disabled />
      </UFormField>
      <UFormField label="Nama Lengkap">
        <UInput v-model="state.fullname" placeholder="Nama Lengkap Anda" class="w-60" disabled />
      </UFormField>
    </div>
    <p class="text-sm text-muted -mt-2">
      Email dan Nama Lengkap dikelola oleh admin.
    </p>
    <UButton type="submit" :disabled="!isUsernameChanged">Perbarui Nama Pengguna</UButton>
  </UForm>
</template>
