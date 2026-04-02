<script setup lang="ts">
import { h, resolveComponent } from "vue";
import type { TableColumn } from "@nuxt/ui";

definePageMeta({
  middleware: "auth",
});

const UButton = resolveComponent("UButton");
const UBadge = resolveComponent("UBadge");

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
type Payment = {
  id: number;
  order_id: number;
  method: string;
  amount: number;
  status: "pending" | "paid" | "failed";
  paid_at: string | null;
  customer_name: string;
};

// ─── Fetch Payments ──────────────────────────────────────────────────
const { data: paymentsResponse, refresh } = await useFetch<{
  success: boolean;
  data: Payment[];
}>(`/api/stalls/${stallId}/payments`);

const payments = computed(() => paymentsResponse.value?.data ?? []);

// ─── Approve Payment ─────────────────────────────────────────────────
const approveLoading = ref<Record<number, boolean>>({});

async function approvePayment(paymentId: number) {
  approveLoading.value[paymentId] = true;
  try {
    await $fetch(`/api/payments/${paymentId}/approve`, {
      method: "PATCH",
    });

    toast.add({
      title: "Berhasil",
      description: "Pembayaran berhasil disetujui.",
      color: "success",
      icon: "i-lucide-circle-check",
    });

    await refresh();
  } catch (err: any) {
    toast.add({
      title: "Gagal",
      description: err?.data?.message ?? "Gagal menyetujui pembayaran.",
      color: "error",
      icon: "i-lucide-x",
    });
  } finally {
    approveLoading.value[paymentId] = false;
  }
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

// ─── Table Columns ───────────────────────────────────────────────────
const columns: TableColumn<Payment>[] = [
  {
    accessorKey: "id",
    header: "#",
    cell: ({ row }) => `#${row.getValue("id")}`,
  },
  {
    accessorKey: "order_id",
    header: "Pesanan",
    cell: ({ row }) => `#${row.getValue("order_id")}`,
  },
  {
    accessorKey: "customer_name",
    header: "Pelanggan",
  },
  {
    accessorKey: "method",
    header: "Metode",
    cell: ({ row }) => {
      const method = row.getValue("method") as string;
      return h(UBadge, { color: method === "qris" ? "info" : "neutral", variant: "subtle" }, () => method.toUpperCase());
    },
  },
  {
    accessorKey: "amount",
    header: "Jumlah",
    cell: ({ row }) => formatCurrency(Number(row.getValue("amount"))),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const colorMap: Record<string, string> = { pending: "warning", paid: "success", failed: "error" };
      const labelMap: Record<string, string> = { pending: "Menunggu", paid: "Dibayar", failed: "Gagal" };
      return h(UBadge, { color: colorMap[status] ?? "neutral", variant: "subtle" }, () => labelMap[status] ?? status);
    },
  },
  {
    id: "actions",
    header: "Aksi",
    cell: ({ row }) => {
      const payment = row.original;
      if (payment.status === "paid") {
        return h(UBadge, { color: "success", variant: "subtle" }, () => "Dibayar");
      }
      return h(UButton, {
        label: "Setujui",
        icon: "i-lucide-check",
        size: "xs",
        color: "success",
        variant: "soft",
        loading: approveLoading.value[payment.id] ?? false,
        onClick: () => approvePayment(payment.id),
      });
    },
  },
];
</script>

<template>
  <UDashboardPanel :id="`stall-${stallId}-payments`">
    <template #header>
      <UDashboardNavbar :title="stall?.name ?? 'Memuat...'" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton icon="i-lucide-refresh-cw" color="neutral" variant="ghost" @click="refresh()" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UPageHeader title="Pembayaran" description="Kelola pembayaran untuk kios ini." class="pt-0!" />
      <UTable :data="payments" :columns="columns" class="flex-1" />
      <p v-if="payments.length === 0" class="text-center text-muted py-12">Belum ada pembayaran.</p>
    </template>
  </UDashboardPanel>
</template>
