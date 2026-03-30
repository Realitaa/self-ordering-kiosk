<script setup lang="ts">
import type { FormSubmitEvent, AuthFormField } from "@nuxt/ui";
import { loginSchema } from "#shared/schemas/login.schema";
import type { LoginInput } from "#shared/schemas/login.schema";

definePageMeta({
  layout: false,
  middleware: "guest",
});

// composables
const { login, loading: isLoading } = useAuth();
const toast = useToast();
const route = useRoute();
const { fetch: refreshSession } = useUserSession();

// Carousel picture list
const carouselItems = [
  {
    src: "1-pet-pics-pexels-peng-louis-587527-1643457.jpg",
    position: "center",
  },
  {
    src: "2-pet-pics-pexels-shvetsa-4588455.jpg",
    position: "bottom",
  },
  {
    src: "3-pet-pics-pexels-valeriya-1805164.jpg",
    position: "bottom",
  },
  {
    src: "4-pet-pics-juliya-sidorova-FOxMZK1VQS8-unsplash.jpg",
    position: "center",
  },
  {
    src: "5-pet-pics-pexels-rutpratheep-6279101.jpg",
    position: "bottom",
  },
];

// Form state, schema and event handler
const fields = computed<AuthFormField[]>(() => [
  {
    name: "email",
    id: "email",
    type: "text",
    label: "Email",
    placeholder: "Masukkan email",
    required: true,
    disabled: isLoading.value,
  },
  {
    name: "password",
    id: "password",
    type: "password",
    label: "Password",
    placeholder: "Masukkan password",
    required: true,
    disabled: isLoading.value,
  },
]);

const schema = loginSchema;

const buttonSubmit = computed(() => ({
  label: isLoading.value ? "Loading..." : "Masuk",
  icon: isLoading.value ? "eos-icons:loading" : "fluent:arrow-right-24-regular",
  disabled: isLoading.value,
}));

async function onSubmit(payload: FormSubmitEvent<LoginInput>) {
  try {
    await login({
      email: payload.data.email,
      password: payload.data.password,
    });

    await refreshSession();

    toast.add({
      title: "Berhasil",
      description: "Anda berhasil masuk dan akan diarahkan ke halaman home",
      color: "success",
      icon: "material-symbols:check",
      duration: 1500,
    });

    setTimeout(() => {
      navigateTo("/home");
    }, 1500);
  } catch (err: any) {
    toast.add({
      title: "Gagal",
      description:
        err?.data?.message ?? "Password atau email salah, silahkan coba lagi.",
      color: "error",
      icon: "lucide:x",
      duration: 5000,
    });
  }
}

// Transition state
const isHydrating = ref(true);

onMounted(() => {
  setTimeout(() => {
    isHydrating.value = false;

    if (route.query.message === "session_expired") {
      toast.add({
        title: "Sesi Anda telah berakhir",
        description: "Silahkan masuk kembali.",
        color: "warning",
        icon: "material-symbols:warning",
        duration: 5000,
      });
    }
  }, 100);
});
</script>

<template>
  <div class="w-full h-screen flex overflow-hidden">
    <!-- LEFT: Carousel -->
    <div class="hidden md:block w-1/2 h-full">
      <UCarousel v-slot="{ item }" :items="carouselItems" loop fade dots :autoplay="{ delay: 3000 }"
        class="h-full w-full **:h-full">
        <!-- IMPORTANT: no flex here -->
        <div class="w-full h-full">
          <img :src="item.src" class="w-full h-full object-cover" :style="{ objectPosition: item.position }"
            loading="lazy" />
        </div>
      </UCarousel>
    </div>

    <!-- RIGHT: Login Form -->
    <div class="w-full md:w-1/2 h-full flex items-center justify-center p-6">
      <div class="loader" v-if="isHydrating"></div>

      <Transition enter-active-class="transition-opacity duration-500 ease-out" enter-from-class="opacity-0"
        enter-to-class="opacity-100">
        <div v-if="!isHydrating" class="w-full max-w-sm">
          <UAuthForm title="Sistem Penitipan Hewan" description="Masuk sebelum melanjutkan"
            icon="fluent:animal-cat-16-regular" :submit="buttonSubmit" :fields="fields" :schema="schema"
            @submit="onSubmit" />
        </div>
      </Transition>
    </div>
  </div>
</template>
