<script setup lang="ts">
definePageMeta({
  layout: false,
  middleware: "auth",
});

const route = useRoute();
const toast = useToast();

// ─── Auto-load from query param ──────────────────────────────────────
const orderIdInput = ref(String(route.query.order ?? ""));
const orderLoading = ref(false);
const approveLoading = ref(false);

type OrderDetail = {
  order: { id: number; customer_name: string; stall_name: string; total_price: number; status: string };
  items: { id: number; menu_name: string; qty: number; price: number }[];
  payment: { id: number; method: string; amount: number; status: string; paid_at: string | null } | null;
};

const orderDetail = ref<OrderDetail | null>(null);

async function loadOrder() {
  const id = orderIdInput.value.trim();
  if (!id) return;

  orderLoading.value = true;
  try {
    const res = await $fetch<{ success: boolean; data: OrderDetail }>(`/api/public/orders/${id}`);
    orderDetail.value = res.data;
  } catch (err: any) {
    toast.add({
      title: "Gagal",
      description: err?.data?.message ?? "Pesanan tidak ditemukan.",
      color: "error",
      icon: "i-lucide-x",
    });
    orderDetail.value = null;
  } finally {
    orderLoading.value = false;
  }
}

async function approvePayment() {
  if (!orderDetail.value?.payment) return;
  approveLoading.value = true;
  try {
    await $fetch(`/api/payments/${orderDetail.value.payment.id}/approve`, {
      method: "PATCH",
    });

    toast.add({
      title: "Berhasil",
      description: "Pembayaran berhasil disetujui.",
      color: "success",
      icon: "i-lucide-circle-check",
    });

    // Reload order to reflect updated status
    await loadOrder();
  } catch (err: any) {
    toast.add({
      title: "Gagal",
      description: err?.data?.message ?? "Gagal menyetujui pembayaran.",
      color: "error",
      icon: "i-lucide-x",
    });
  } finally {
    approveLoading.value = false;
  }
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
}

// Auto-load if order query param present
onMounted(() => {
  if (orderIdInput.value) {
    loadOrder();
  }
});
</script>

<template>
  <div class="min-h-screen bg-default flex flex-col">
    <!-- Header -->
    <header class="sticky top-0 z-50 bg-elevated border-b border-default px-4 py-3 flex items-center justify-between">
      <h1 class="text-lg font-bold">Verifikasi Pembayaran</h1>
      <UButton icon="i-lucide-arrow-left" label="Kembali" variant="ghost" color="neutral" to="/home" />
    </header>

    <div class="max-w-lg mx-auto p-6 w-full flex-1">
      <!-- Search -->
      <UCard class="mb-6">
        <template #header>
          <p class="font-semibold">Cari Pesanan</p>
        </template>
        <div class="flex gap-2">
          <UInput v-model="orderIdInput" placeholder="Masukkan ID Pesanan" icon="i-lucide-search" class="flex-1"
            type="number" @keyup.enter="loadOrder" />
          <UButton label="Cari" icon="i-lucide-search" :loading="orderLoading" @click="loadOrder" />
        </div>
      </UCard>

      <!-- Order Detail -->
      <UCard v-if="orderDetail">
        <template #header>
          <div class="flex items-center justify-between">
            <p class="font-semibold text-lg">Pesanan #{{ orderDetail.order.id }}</p>
            <UBadge :color="orderDetail.payment?.status === 'paid' ? 'success' : 'warning'" variant="subtle">
              {{ orderDetail.payment?.status === 'paid' ? 'Dibayar' : 'Menunggu' }}
            </UBadge>
          </div>
        </template>

        <div class="flex flex-col gap-3">
          <div class="grid grid-cols-2 text-sm gap-y-1">
            <span class="text-muted">Pelanggan</span>
            <span class="font-medium">{{ orderDetail.order.customer_name }}</span>
            <span class="text-muted">Kios</span>
            <span class="font-medium">{{ orderDetail.order.stall_name }}</span>
            <span class="text-muted">Metode</span>
            <span class="font-medium uppercase">{{ orderDetail.payment?.method ?? '-' }}</span>
          </div>

          <USeparator class="my-2" />

          <div v-for="item in orderDetail.items" :key="item.id" class="flex justify-between text-sm">
            <span>{{ item.menu_name }} × {{ item.qty }}</span>
            <span class="font-medium">{{ formatCurrency(item.price * item.qty) }}</span>
          </div>

          <USeparator class="my-2" />

          <div class="flex justify-between font-semibold">
            <span>Total</span>
            <span class="text-primary">{{ formatCurrency(orderDetail.order.total_price) }}</span>
          </div>
        </div>

        <template #footer>
          <div v-if="orderDetail.payment?.status === 'pending'">
            <UButton label="Setujui Pembayaran" icon="i-lucide-check" color="success" block size="lg"
              :loading="approveLoading" @click="approvePayment" />
          </div>
          <div v-else class="text-center">
            <div class="flex items-center justify-center gap-2 text-green-500">
              <UIcon name="i-lucide-circle-check" class="size-5" />
              <p class="font-medium">Pembayaran sudah disetujui</p>
            </div>
          </div>
        </template>
      </UCard>

      <p v-if="!orderDetail && !orderLoading" class="text-center text-muted py-12">
        Scan QR code atau masukkan ID pesanan untuk memverifikasi pembayaran.
      </p>
    </div>
  </div>
</template>
