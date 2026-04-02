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
type Order = {
  id: number;
  customer_name: string;
  tenant_id: number;
  status: "waiting" | "processing" | "done";
  total_price: number;
  createdAt: string;
};

// ─── Fetch Orders ────────────────────────────────────────────────────
const { data: ordersResponse, refresh } = await useFetch<{
  success: boolean;
  data: Order[];
}>(`/api/stalls/${stallId}/orders`);

const orders = computed(() => ordersResponse.value?.data ?? []);

// ─── Mark Complete ───────────────────────────────────────────────────
const completeLoading = ref<Record<number, boolean>>({});

async function markComplete(orderId: number) {
  completeLoading.value[orderId] = true;
  try {
    await $fetch(`/api/orders/${orderId}/complete`, {
      method: "PATCH",
    });

    toast.add({
      title: "Berhasil",
      description: "Pesanan berhasil diselesaikan.",
      color: "success",
      icon: "i-lucide-circle-check",
    });

    await refresh();
  } catch (err: any) {
    toast.add({
      title: "Gagal",
      description: err?.data?.message ?? "Gagal menyelesaikan pesanan.",
      color: "error",
      icon: "i-lucide-x",
    });
  } finally {
    completeLoading.value[orderId] = false;
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
const columns: TableColumn<Order>[] = [
  {
    accessorKey: "id",
    header: "#",
    cell: ({ row }) => `#${row.getValue("id")}`,
  },
  {
    accessorKey: "customer_name",
    header: "Pelanggan",
  },
  {
    accessorKey: "total_price",
    header: "Total",
    cell: ({ row }) => formatCurrency(Number(row.getValue("total_price"))),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const colorMap: Record<string, string> = {
        waiting: "warning",
        processing: "info",
        done: "success",
      };
      const labelMap: Record<string, string> = {
        waiting: "Menunggu",
        processing: "Diproses",
        done: "Selesai",
      };
      return h(UBadge, { color: colorMap[status] ?? "neutral", variant: "subtle" }, () => labelMap[status] ?? status);
    },
  },
  {
    id: "actions",
    header: "Aksi",
    cell: ({ row }) => {
      const order = row.original;
      if (order.status === "done") {
        return h(UBadge, { color: "success", variant: "subtle" }, () => "Selesai");
      }
      return h(UButton, {
        label: "Selesai",
        icon: "i-lucide-check",
        size: "xs",
        color: "success",
        variant: "soft",
        loading: completeLoading.value[order.id] ?? false,
        onClick: () => markComplete(order.id),
      });
    },
  },
];
</script>

<template>
  <UDashboardPanel :id="`stall-${stallId}-orders`">
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
      <UPageHeader title="Pesanan" description="Daftar pesanan untuk kios ini." class="pt-0!" />
      <UTable :data="orders" :columns="columns" class="flex-1" />
      <p v-if="orders.length === 0" class="text-center text-muted py-12">Belum ada pesanan.</p>
    </template>
  </UDashboardPanel>
</template>
