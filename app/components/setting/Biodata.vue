<script setup lang="ts">
const username = ref("");
const email = ref("");
const name = ref("");
</script>

<template>
  <div class="space-y-4">
    <UPageFeature
      title="Pengaturan Biodata"
      description="Perbarui pengaturan biodata untuk akun Anda. Beberapa data hanya dapat diubah oleh admin."
    />
    <UFormField
      label="Nama Pengguna"
      help="Nama pengguna akan ditampilkan di sidebar Anda. Jika tidak ada, nama pengguna akan diambil dari nama depan Anda."
    >
      <UInput
        v-model="username"
        placeholder="Nama Pengguna Anda"
        class="w-60"
      />
    </UFormField>
    <div class="flex items-center gap-2">
      <UFormField label="Email">
        <UInput v-model="email" icon="i-lucide-at-sign" class="w-60" disabled />
      </UFormField>
      <UFormField label="Nama Lengkap">
        <UInput
          v-model="name"
          placeholder="Nama Lengkap Anda"
          class="w-60"
          disabled
        />
      </UFormField>
    </div>
    <p class="text-sm text-muted -mt-2">
      Email dan Nama Lengkap dikelola oleh admin.
    </p>
    <UButton>Perbarui Nama Pengguna</UButton>
  </div>
</template>
