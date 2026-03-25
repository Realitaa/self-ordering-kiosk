<script setup lang="ts">
import type { FormSubmitEvent, AuthFormField } from "@nuxt/ui";
import * as z from "zod";

definePageMeta({
  layout: false,
});

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
const isLoading = ref(false);

const fields = computed<AuthFormField[]>(() => [
  {
    name: "username",
    id: "username",
    type: "text",
    label: "Username",
    placeholder: "Masukkan username",
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

const schema = z.object({
  username: z.string("Username dibutuhkan"),
  password: z.string("Password dibutuhkan"),
});

type Schema = z.output<typeof schema>;

const buttonSubmit = computed(() => ({
  label: isLoading.value ? "Loading..." : "Masuk",
  icon: isLoading.value ? "eos-icons:loading" : "fluent:arrow-right-24-regular",
  disabled: isLoading.value,
}));

const toast = useToast();

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  isLoading.value = true;
  // Mock login delay
  new Promise((resolve) => setTimeout(resolve, 1000)).then(() => {
    const isSuccess = Math.random() < 0.5;
    toast.add({
      title: isSuccess ? "Berhasil" : "Gagal",
      description: isSuccess
        ? "Anda berhasil masuk dan akan diarahkan ke halaman dashboard"
        : "Password atau username salah, silahkan coba lagi.",
      color: isSuccess ? "success" : "error",
      icon: isSuccess ? "material-symbols:check" : "lucide:x",
      duration: isSuccess ? 1500 : 5000,
    });

    if (isSuccess) {
      setTimeout(() => {
        navigateTo("/dashboard");
      }, 1500);
    } else {
      isLoading.value = false;
    }
  });
}

// Transition state
const isHydrating = ref(true);

onMounted(() => {
  setTimeout(() => {
    isHydrating.value = false;
  }, 100);
});
</script>

<template>
  <div class="w-full h-screen flex overflow-hidden">
    <!-- LEFT: Carousel -->
    <div class="hidden md:block w-1/2 h-full">
      <UCarousel
        v-slot="{ item }"
        :items="carouselItems"
        loop
        fade
        dots
        :autoplay="{ delay: 3000 }"
        class="h-full w-full **:h-full"
      >
        <!-- IMPORTANT: no flex here -->
        <div class="w-full h-full">
          <img
            :src="item.src"
            class="w-full h-full object-cover"
            :style="{ objectPosition: item.position }"
            loading="lazy"
          />
        </div>
      </UCarousel>
    </div>

    <!-- RIGHT: Login Form -->
    <div class="w-full md:w-1/2 h-full flex items-center justify-center p-6">
      <div class="loader" v-if="isHydrating"></div>

      <Transition
        enter-active-class="transition-opacity duration-500 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
      >
        <div v-if="!isHydrating" class="w-full max-w-sm">
          <UAuthForm
            title="Sistem Penitipan Hewan"
            description="Masuk sebelum melanjutkan"
            icon="fluent:animal-cat-16-regular"
            :submit="buttonSubmit"
            :fields="fields"
            :schema="schema"
            @submit="onSubmit"
          />
        </div>
      </Transition>
    </div>
  </div>
</template>
