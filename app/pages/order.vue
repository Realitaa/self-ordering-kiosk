<script setup lang="ts">
definePageMeta({
  layout: false,
});

const toast = useToast();
const { cart, cartCount, cartTotal, setStall, addItem, removeItem, getItemQty, clearCart } = useCart();

// ─── Types ───────────────────────────────────────────────────────────
type Stall = { id: number; name: string; owner_id: number };
type Menu = { id: number; tenant_id: number; name: string; price: number; stock: number; createdAt: string };

// ─── Views: stalls → menu → payment → receipt ───────────────────────
const currentView = ref<"stalls" | "menu" | "payment" | "receipt">("stalls");
const selectedStallId = ref<number | null>(null);
const selectedStallName = ref("");

// ─── Stalls ──────────────────────────────────────────────────────────
const { data: stallsResponse } = await useFetch<{ success: boolean; data: Stall[] }>("/api/public/stalls");
const stalls = computed(() => stallsResponse.value?.data ?? []);

function selectStall(stall: Stall) {
  if (cart.value.stallId !== null && cart.value.stallId !== stall.id && cartCount.value > 0) {
    if (!confirm(`Keranjang berisi item dari "${cart.value.stallName}". Ganti kios akan mengosongkan keranjang. Lanjutkan?`)) {
      return;
    }
  }
  selectedStallId.value = stall.id;
  selectedStallName.value = stall.name;
  setStall(stall.id, stall.name);
  currentView.value = "menu";
}

// ─── Menus ───────────────────────────────────────────────────────────
const menuData = ref<Menu[]>([]);
const menuLoading = ref(false);

watch(selectedStallId, async (id) => {
  if (!id) return;
  menuLoading.value = true;
  try {
    const res = await $fetch<{ success: boolean; data: Menu[] }>(`/api/public/stalls/${id}/menus`);
    menuData.value = res.data ?? [];
  } catch {
    menuData.value = [];
  } finally {
    menuLoading.value = false;
  }
});

// ─── Cart Drawer ─────────────────────────────────────────────────────
const showCartDrawer = ref(false);

// ─── Payment ─────────────────────────────────────────────────────────
const customerName = ref("");
const paymentMethod = ref<"cash" | "qris">("cash");
const orderLoading = ref(false);

// ─── Receipt ─────────────────────────────────────────────────────────
type OrderResult = {
  order: { id: number; customer_name: string; total_price: number; status: string; stall_name: string };
  items: { id: number; menu_name: string; qty: number; price: number }[];
  payment: { id: number; method: string; amount: number; status: string };
};
const orderResult = ref<OrderResult | null>(null);

async function submitOrder() {
  if (!customerName.value.trim()) {
    toast.add({ title: "Gagal", description: "Nama pelanggan harus diisi.", color: "error", icon: "i-lucide-x" });
    return;
  }
  orderLoading.value = true;
  try {
    const res = await $fetch<{ success: boolean; data: OrderResult }>("/api/public/orders", {
      method: "POST",
      body: {
        customer_name: customerName.value.trim(),
        stall_id: Number(cart.value.stallId),
        items: cart.value.items.map((i) => ({ menu_id: Number(i.menuId), qty: Number(i.qty) })),
        payment_method: paymentMethod.value,
      },
    });

    orderResult.value = res.data;
    clearCart();
    customerName.value = "";
    currentView.value = "receipt";

    toast.add({
      title: "Berhasil",
      description: "Pesanan berhasil dibuat!",
      color: "success",
      icon: "i-lucide-circle-check",
    });
  } catch (err: any) {
    toast.add({
      title: "Gagal",
      description: err?.data?.message ?? "Gagal membuat pesanan.",
      color: "error",
      icon: "i-lucide-x",
    });
  } finally {
    orderLoading.value = false;
  }
}

function goBackToStalls() {
  currentView.value = "stalls";
  selectedStallId.value = null;
  selectedStallName.value = "";
  orderResult.value = null;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
}

function qrCodeUrl(orderId: number) {
  const baseUrl = window.location.origin;
  const payUrl = `${baseUrl}/pay?order=${orderId}`;
  return `https://barcode.tec-it.com/barcode.ashx?data=${encodeURIComponent(payUrl)}&code=QRCode&translate-esc=on&dmsize=Default&eclevel=L&filetype=png&dpi=150&qunit=Mm&modulesize=4`;
}
</script>

<template>
  <div class="min-h-screen bg-default">
    <!-- Top Navigation Bar -->
    <header class="sticky top-0 z-50 bg-elevated border-b border-default px-4 py-3 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <UButton v-if="currentView !== 'stalls'" icon="i-lucide-arrow-left" color="neutral" variant="ghost"
          @click="currentView === 'menu' ? goBackToStalls() : currentView === 'payment' ? (currentView = 'menu') : goBackToStalls()" />
        <h1 class="text-lg font-bold">
          {{ currentView === 'stalls' ? 'Pilih Kios' : currentView === 'menu' ? selectedStallName : currentView ===
            'payment' ? 'Pembayaran' : 'Pesanan Berhasil' }}
        </h1>
      </div>
      <UButton icon="i-lucide-log-in" label="Masuk" variant="ghost" color="neutral" to="/" />
    </header>

    <!-- STALLS VIEW -->
    <div v-if="currentView === 'stalls'" class="max-w-4xl mx-auto p-6">
      <p class="text-muted text-sm mb-6">Pilih kios untuk melihat menu dan memesan makanan.</p>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <UCard v-for="stall in stalls" :key="stall.id"
          class="cursor-pointer hover:ring-2 hover:ring-primary transition-all" @click="selectStall(stall)">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <UIcon name="healthicons:market-stall-outline" class="text-primary size-6" />
            </div>
            <div>
              <p class="font-semibold">{{ stall.name }}</p>
              <p class="text-sm text-muted">Klik untuk melihat menu</p>
            </div>
          </div>
        </UCard>
      </div>
      <p v-if="stalls.length === 0" class="text-center text-muted py-12">Belum ada kios yang tersedia.</p>
    </div>

    <!-- MENU VIEW -->
    <div v-if="currentView === 'menu'" class="max-w-4xl mx-auto p-6 pb-24">
      <p class="text-muted text-sm mb-6">Pilih menu dari <strong>{{ selectedStallName }}</strong>.</p>

      <!-- Loading -->
      <div v-if="menuLoading" class="flex justify-center py-12">
        <UIcon name="eos-icons:loading" class="size-8 text-muted" />
      </div>

      <!-- Menu Grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <UCard v-for="menu in menuData" :key="menu.id">
          <div class="flex flex-col gap-2">
            <div class="flex justify-between items-start">
              <div>
                <p class="font-semibold">{{ menu.name }}</p>
                <p class="text-primary font-medium">{{ formatCurrency(menu.price) }}</p>
              </div>
              <UBadge :color="menu.stock > 0 ? 'success' : 'error'" variant="subtle" size="sm">
                Stok: {{ menu.stock }}
              </UBadge>
            </div>
            <div class="flex items-center justify-end gap-2 mt-2">
              <template v-if="getItemQty(menu.id) > 0">
                <UButton icon="i-lucide-minus" size="xs" color="neutral" variant="soft" @click="removeItem(menu.id)" />
                <span class="w-6 text-center font-medium">{{ getItemQty(menu.id) }}</span>
              </template>
              <UButton icon="i-lucide-plus" size="xs" color="primary" variant="soft"
                :disabled="menu.stock <= 0 || getItemQty(menu.id) >= menu.stock"
                @click="addItem(menu.id, menu.name, menu.price)" />
            </div>
          </div>
        </UCard>
      </div>
      <p v-if="!menuLoading && menuData.length === 0" class="text-center text-muted py-12">
        Belum ada menu di kios ini.
      </p>

      <!-- Floating Cart Bar -->
      <Transition enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="translate-y-full opacity-0" enter-to-class="translate-y-0 opacity-100"
        leave-active-class="transition-all duration-200 ease-in" leave-from-class="translate-y-0 opacity-100"
        leave-to-class="translate-y-full opacity-0">
        <div v-if="cartCount > 0"
          class="fixed bottom-0 left-0 right-0 bg-elevated border-t border-default p-4 flex items-center justify-between z-40">
          <div>
            <p class="font-semibold">{{ cartCount }} menu dipilih</p>
            <p class="text-sm text-primary font-medium">{{ formatCurrency(cartTotal) }}</p>
          </div>
          <UButton label="Lihat Keranjang" icon="i-lucide-shopping-cart" color="primary"
            @click="showCartDrawer = true" />
        </div>
      </Transition>
    </div>

    <!-- PAYMENT VIEW -->
    <div v-if="currentView === 'payment'" class="max-w-lg mx-auto p-6">
      <!-- Order Summary -->
      <UCard class="mb-6">
        <template #header>
          <p class="font-semibold">Ringkasan Pesanan</p>
        </template>
        <div class="flex flex-col gap-2">
          <div v-for="item in cart.items" :key="item.menuId" class="flex justify-between text-sm">
            <span>{{ item.name }} × {{ item.qty }}</span>
            <span class="font-medium">{{ formatCurrency(item.price * item.qty) }}</span>
          </div>
          <USeparator class="my-2" />
          <div class="flex justify-between font-semibold">
            <span>Total</span>
            <span class="text-primary">{{ formatCurrency(cartTotal) }}</span>
          </div>
        </div>
      </UCard>

      <!-- Customer Name -->
      <UFormField label="Nama Pelanggan" required class="mb-4">
        <UInput v-model="customerName" placeholder="Masukkan nama Anda" icon="i-lucide-user" class="w-full" />
      </UFormField>

      <!-- Payment Method -->
      <div class="mb-6">
        <p class="text-sm font-medium mb-2">Metode Pembayaran</p>
        <div class="gap-3">
          <UCard class="cursor-pointer transition-all" :class="paymentMethod === 'cash' ? 'ring-2 ring-primary' : ''"
            @click="paymentMethod = 'cash'">
            <div class="flex flex-col items-center gap-2 py-2">
              <UIcon name="i-lucide-banknote" class="size-8"
                :class="paymentMethod === 'cash' ? 'text-primary' : 'text-muted'" />
              <p class="text-sm font-medium">Tunai</p>
            </div>
          </UCard>
          <!-- <UCard class="cursor-pointer transition-all" :class="paymentMethod === 'qris' ? 'ring-2 ring-primary' : ''"
            @click="paymentMethod = 'qris'">
            <div class="flex flex-col items-center gap-2 py-2">
              <UIcon name="i-lucide-qr-code" class="size-8"
                :class="paymentMethod === 'qris' ? 'text-primary' : 'text-muted'" />
              <p class="text-sm font-medium">QRIS</p>
            </div>
          </UCard> -->
        </div>
      </div>

      <UButton label="Buat Pesanan" icon="i-lucide-check" color="primary" block size="lg" :loading="orderLoading"
        @click="submitOrder" />
    </div>

    <!-- RECEIPT VIEW -->
    <div v-if="currentView === 'receipt' && orderResult" class="max-w-lg mx-auto p-6">
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-circle-check" class="text-green-500 size-6" />
            <p class="font-semibold text-lg">Pesanan #{{ orderResult.order.id }}</p>
          </div>
        </template>

        <div class="flex flex-col gap-3">
          <div class="grid grid-cols-2 text-sm gap-y-1">
            <span class="text-muted">Pelanggan</span>
            <span class="font-medium">{{ orderResult.order.customer_name }}</span>
            <span class="text-muted">Kios</span>
            <span class="font-medium">{{ orderResult.order.stall_name }}</span>
            <span class="text-muted">Metode</span>
            <span class="font-medium uppercase">{{ orderResult.payment.method }}</span>
            <span class="text-muted">Status</span>
            <UBadge :color="orderResult.payment.status === 'paid' ? 'success' : 'warning'" variant="subtle" size="sm">
              {{ orderResult.payment.status === 'paid' ? 'Dibayar' : 'Menunggu' }}
            </UBadge>
          </div>

          <USeparator class="my-2" />

          <div v-for="item in orderResult.items" :key="item.id" class="flex justify-between text-sm">
            <span>{{ item.menu_name }} × {{ item.qty }}</span>
            <span class="font-medium">{{ formatCurrency(item.price * item.qty) }}</span>
          </div>

          <USeparator class="my-2" />

          <div class="flex justify-between font-semibold">
            <span>Total</span>
            <span class="text-primary">{{ formatCurrency(orderResult.order.total_price) }}</span>
          </div>
        </div>

        <!-- QRIS QR Code -->
        <div v-if="orderResult.payment.method === 'qris'" class="mt-6 flex flex-col items-center gap-3">
          <p class="text-sm text-muted text-center">Bayar Menggunakan QRIS untuk menyelesaikan pembayaran.</p>
          <img :src="qrCodeUrl(orderResult.order.id)" alt="QR Code Pembayaran" class="w-48 h-48 rounded-lg border" />
        </div>

        <!-- Cash Message -->
        <div v-if="orderResult.payment.method === 'cash'" class="mt-6 text-center">
          <div class="bg-warning-50 dark:bg-warning-950/30 rounded-lg p-4">
            <UIcon name="i-lucide-clock" class="size-8 text-warning mb-2" />
            <p class="text-sm font-medium">Menunggu persetujuan kasir</p>
            <p class="text-xs text-muted mt-1">Silahkan bayar di kasir kios {{ orderResult.order.stall_name }}</p>
          </div>
        </div>

        <template #footer>
          <UButton label="Pesan Lagi" icon="i-lucide-plus" color="primary" variant="outline" block
            @click="goBackToStalls" />
        </template>
      </UCard>
    </div>

    <!-- Cart Drawer -->
    <USlideover v-model:open="showCartDrawer">
      <template #content>
        <div class="flex flex-col h-full">
          <div class="flex items-center justify-between p-4 border-b border-default">
            <h3 class="text-lg font-semibold">Keranjang</h3>
            <UButton icon="i-lucide-x" color="neutral" variant="ghost" @click="showCartDrawer = false" />
          </div>

          <div class="flex-1 overflow-auto p-4">
            <div v-if="cart.items.length === 0" class="text-center text-muted py-12">
              Keranjang kosong
            </div>
            <div v-else class="flex flex-col gap-3">
              <div v-for="item in cart.items" :key="item.menuId" class="flex items-center justify-between">
                <div>
                  <p class="font-medium text-sm">{{ item.name }}</p>
                  <p class="text-xs text-muted">{{ formatCurrency(item.price) }}</p>
                </div>
                <div class="flex items-center gap-2">
                  <UButton icon="i-lucide-minus" size="xs" color="neutral" variant="soft"
                    @click="removeItem(item.menuId)" />
                  <span class="w-6 text-center text-sm font-medium">{{ item.qty }}</span>
                  <UButton icon="i-lucide-plus" size="xs" color="primary" variant="soft"
                    @click="addItem(item.menuId, item.name, item.price)" />
                </div>
              </div>
            </div>
          </div>

          <div v-if="cart.items.length > 0" class="p-4 border-t border-default flex flex-col gap-3">
            <div class="flex justify-between font-semibold">
              <span>Total</span>
              <span class="text-primary">{{ formatCurrency(cartTotal) }}</span>
            </div>
            <div class="flex gap-2">
              <UButton label="Kosongkan" color="error" variant="soft" class="flex-1"
                @click="clearCart(); showCartDrawer = false" />
              <UButton label="Lanjut Bayar" icon="i-lucide-arrow-right" color="primary" class="flex-1"
                @click="showCartDrawer = false; currentView = 'payment'" />
            </div>
          </div>
        </div>
      </template>
    </USlideover>
  </div>
</template>
